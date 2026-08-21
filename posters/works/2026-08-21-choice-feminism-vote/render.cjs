// Re-export the two Choice Feminism vote slides from feminism.html.
//
//   cd posters && node works/2026-08-21-choice-feminism-vote/render.cjs
//
// feminism.html is self-contained (fonts and the logo are inlined as data
// URIs), so this needs nothing but Playwright from the studio's own
// dependencies. Each .slot is pinned to its native 1600x900 and shot at 2x,
// giving 3200x1800.

const path = require("path");
const { chromium } = require("playwright");

const DIR = __dirname;
const OUT = path.join(DIR, "out");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewportSize: { width: 1600, height: 900 },
    deviceScaleFactor: 2,
  });

  await page.goto("file://" + path.join(DIR, "feminism.html"));
  await page.waitForTimeout(1600);

  // The deck lays slides out scaled-to-fit for viewing. Undo that so each
  // frame exports at its true size instead of whatever the window implied.
  await page.addStyleTag({
    content: `
      .deck { padding: 0 !important; gap: 0 !important; }
      .slot { height: 900px !important; }
      .frame { transform: none !important; }
    `,
  });
  await page.waitForTimeout(400);

  const slots = await page.$$(".slot");
  for (let i = 0; i < slots.length; i++) {
    const name = await slots[i].getAttribute("data-name");
    const n = String(i + 1).padStart(2, "0");
    const frame = await slots[i].$(".frame");
    await frame.screenshot({ path: path.join(OUT, `${n}-${name}.png`) });
    console.log(`  ${n}-${name}.png`);
  }

  console.log(`${slots.length} slides written to out/`);
  await browser.close();
})();
