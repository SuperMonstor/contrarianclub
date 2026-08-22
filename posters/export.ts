import { chromium, type Page } from "playwright";
import { createServer } from "vite";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { crc32 } from "node:zlib";
import { resolve } from "node:path";
import { FORMATS, type FormatId } from "./src/core/formats";
import type { WorkManifestEntry } from "./src/core/registry";

// Usage: npm run poster <workId> [format...]
//
// Renders every slide of a work at exact pixel size (@2x for crispness) via a
// headless Chrome, and writes PNGs into that work's own folder:
// works/<workId>/out/. The work id is the folder name; any unambiguous
// substring of it will do.
//
// No Chromium download needed. Uses your installed Google Chrome (channel).

const SCALE = 2; // retina export; 1080-wide art ships at 2160-wide pixels

// Print canvases are drawn at 300px per inch (see formats.ts), so an export at
// SCALE lands at this many dots per inch on paper.
const PRINT_DPI = 300 * SCALE;

/** Stamp a PNG's physical size into its pHYs chunk.
 *
 *  A screenshot has no idea it is going to a press, so it ships tagged 72dpi
 *  and a printer placing it gets a 16 x 50 inch bookmark. The pixels are
 *  right either way, but the person on the other end should not have to know
 *  that: the file should say how big it is. */
function stampDpi(file: string, dpi: number) {
  const png = readFileSync(file);
  const perMetre = Math.round(dpi / 0.0254);

  const data = Buffer.alloc(9);
  data.writeUInt32BE(perMetre, 0);
  data.writeUInt32BE(perMetre, 4);
  data.writeUInt8(1, 8); // unit: metres

  const type = Buffer.from("pHYs", "latin1");
  const chunk = Buffer.concat([
    Buffer.from([0, 0, 0, 9]),
    type,
    data,
    (() => {
      const crc = Buffer.alloc(4);
      crc.writeUInt32BE(crc32(Buffer.concat([type, data])) >>> 0, 0);
      return crc;
    })(),
  ]);

  // IHDR is always first and always 13 bytes of data: 8 signature + 8 header
  // + 13 + 4 crc. pHYs goes after it, before the image data.
  const at = 8 + 8 + 13 + 4;
  writeFileSync(file, Buffer.concat([png.subarray(0, at), chunk, png.subarray(at)]));
}
const FALLBACK_FORMATS: FormatId[] = ["ig-portrait", "ig-square", "ig-story"];

/** The specs import images, which only Vite can resolve, so node cannot read
 *  them directly. The app publishes what the CLI needs on window instead. */
async function readManifest(page: Page, base: string): Promise<WorkManifestEntry[]> {
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  return page.evaluate(
    () =>
      (window as unknown as { __CONTRARIAN_WORKS__: WorkManifestEntry[] })
        .__CONTRARIAN_WORKS__,
  );
}

function resolveWork(manifest: WorkManifestEntry[], query: string) {
  const exact = manifest.find((w) => w.id === query);
  if (exact) return exact;
  const partial = manifest.filter((w) => w.id.includes(query));
  if (partial.length === 1) return partial[0];
  if (partial.length > 1) {
    console.error(
      `"${query}" matches several works:\n  ${partial.map((w) => w.id).join("\n  ")}`,
    );
    process.exit(1);
  }
  return undefined;
}

async function main() {
  const query = process.argv[2];

  const server = await createServer({
    configFile: resolve("vite.config.ts"),
    server: { port: 0 },
    logLevel: "warn",
  });
  await server.listen();
  const base = server.resolvedUrls!.local[0].replace(/\/$/, "");

  const browser = await chromium.launch({ channel: "chrome" });

  try {
    const probe = await browser.newPage();
    const manifest = await readManifest(probe, base);
    await probe.close();

    const work = query ? resolveWork(manifest, query) : undefined;
    if (!work) {
      console.error(
        `${query ? `Unknown work "${query}".` : "Which work?"} Available:\n  ${manifest
          .map(
            (w) =>
              `${w.id}  (${w.slides.length} slide${w.slides.length > 1 ? "s" : ""})`,
          )
          .join("\n  ")}`,
      );
      process.exit(1);
    }

    const asked = (process.argv.slice(3) as FormatId[]).filter((f) => FORMATS[f]);
    const formats: FormatId[] = asked.length
      ? asked
      : ((work.formats as FormatId[] | undefined) ?? FALLBACK_FORMATS);

    // The archive keeps the trim renders. Press-ready output (anything with
    // bleed, and every PDF) is derivable, an order of magnitude heavier, and
    // regenerated per print run, so it sits in its own folder and stays out
    // of git.
    const outDir = resolve("works", work.id, "out");
    const pressDir = resolve(outDir, "press");
    mkdirSync(outDir, { recursive: true });

    for (const fmtId of formats) {
      const fmt = FORMATS[fmtId];
      for (const [slide, { hasImage }] of work.slides.entries()) {
        const page = await browser.newPage({
          viewport: { width: fmt.width, height: fmt.height },
          deviceScaleFactor: SCALE,
        });
        await page.goto(
          `${base}/?render=${work.id}&slide=${slide}&format=${fmtId}`,
          { waitUntil: "networkidle" },
        );
        await page.waitForSelector('body[data-ready="true"]', { timeout: 15000 });

        // A poster is just <format>.<ext>. A carousel numbers its slides.
        // Print goes out lossless whatever it carries; on screen a painting
        // ships as JPEG, since a lossless PNG of one is four times the bytes.
        const lossless = fmt.print || !hasImage;
        const ext = lossless ? "png" : "jpg";
        const n = String(slide + 1).padStart(2, "0");
        const name =
          work.slides.length > 1 ? `${fmtId}-${n}.${ext}` : `${fmtId}.${ext}`;
        const dir = fmt.bleed ? pressDir : outDir;
        if (fmt.bleed) mkdirSync(pressDir, { recursive: true });
        const file = resolve(dir, name);

        await page.locator("#poster").screenshot(
          lossless
            ? { path: file, type: "png" }
            : { path: file, type: "jpeg", quality: 92 },
        );
        if (fmt.print) {
          stampDpi(file, PRINT_DPI);

          // Print also gets a PDF, which is what a press actually wants: the
          // type and the logo stay vector, and the page carries its physical
          // size so nobody has to scale anything. CSS pixels are 1/96in when
          // Chrome prints and a print canvas is drawn at 1/300in, so the page
          // is scaled by exactly 96/300 to land at true size.
          mkdirSync(pressDir, { recursive: true });
          await page.pdf({
            path: resolve(pressDir, name.replace(/\.png$/, ".pdf")),
            width: `${fmt.width / 300}in`,
            height: `${fmt.height / 300}in`,
            scale: 96 / 300,
            printBackground: true,
            margin: { top: "0", right: "0", bottom: "0", left: "0" },
            pageRanges: "1",
          });
        }

        const size = fmt.print
          ? `${fmt.width / 300} x ${fmt.height / 300}in @ ${PRINT_DPI}dpi`
          : `${fmt.width * SCALE}×${fmt.height * SCALE}`;
        console.log(`  ✓ ${name.padEnd(22)} ${size.padEnd(24)} → ${file}`);
        await page.close();
      }
    }
  } finally {
    await browser.close();
    await server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
