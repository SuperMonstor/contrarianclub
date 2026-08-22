import { chromium, type Page } from "playwright";
import { createServer } from "vite";
import { mkdirSync } from "node:fs";
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

    const outDir = resolve("works", work.id, "out");
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
        const file = resolve(outDir, name);

        await page.locator("#poster").screenshot(
          lossless
            ? { path: file, type: "png" }
            : { path: file, type: "jpeg", quality: 92 },
        );
        console.log(
          `  ✓ ${name.padEnd(22)} ${fmt.width * SCALE}×${fmt.height * SCALE}  → ${file}`,
        );
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
