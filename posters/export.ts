import { chromium } from "playwright";
import { createServer } from "vite";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { FORMATS, type FormatId } from "./src/core/formats";
import { POSTERS } from "./src/posters";

// Usage: npm run poster <posterId> [format...]
// Renders the poster at exact pixel size (@2x for crispness) via a headless
// Chrome and writes PNGs to out/<posterId>/.
//
// No Chromium download needed — uses your installed Google Chrome (channel).

const SCALE = 2; // retina export; 1080-wide art ships at 2160-wide pixels
const DEFAULT_FORMATS: FormatId[] = ["ig-portrait", "ig-square", "ig-story"];

async function main() {
  const posterId = process.argv[2];
  if (!posterId || !POSTERS[posterId]) {
    console.error(
      `Unknown poster "${posterId ?? ""}". Available: ${Object.keys(POSTERS).join(", ")}`,
    );
    process.exit(1);
  }

  const wanted = (process.argv.slice(3) as FormatId[]).filter((f) => FORMATS[f]);
  const formats = wanted.length ? wanted : DEFAULT_FORMATS;

  const outDir = resolve("out", posterId);
  mkdirSync(outDir, { recursive: true });

  const server = await createServer({
    configFile: resolve("vite.config.ts"),
    server: { port: 0 },
    logLevel: "warn",
  });
  await server.listen();
  const base = server.resolvedUrls!.local[0].replace(/\/$/, "");

  const browser = await chromium.launch({ channel: "chrome" });

  try {
    for (const fmtId of formats) {
      const fmt = FORMATS[fmtId];
      const page = await browser.newPage({
        viewport: { width: fmt.width, height: fmt.height },
        deviceScaleFactor: SCALE,
      });
      await page.goto(`${base}/?render=${posterId}&format=${fmtId}`, {
        waitUntil: "networkidle",
      });
      await page.waitForSelector('body[data-ready="true"]', { timeout: 15000 });
      const file = resolve(outDir, `${fmtId}.png`);
      await page.locator("#poster").screenshot({ path: file });
      console.log(
        `  ✓ ${fmtId.padEnd(14)} ${fmt.width * SCALE}×${fmt.height * SCALE}  → ${file}`,
      );
      await page.close();
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
