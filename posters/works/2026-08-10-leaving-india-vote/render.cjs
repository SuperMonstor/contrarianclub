const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const workDir = __dirname;
const outDir = path.join(workDir, "out");

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewportSize: { width: 1600, height: 900 },
    deviceScaleFactor: 2,
  });

  await page.goto("file://" + path.join(workDir, "vote.html"));
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({
    content: `
      .deck { padding: 0 !important; gap: 0 !important; }
      .slot { height: 900px !important; }
      .frame { transform: none !important; }
    `,
  });

  const slots = await page.$$(".slot");
  for (const slot of slots) {
    const name = await slot.getAttribute("data-name");
    const frame = await slot.$(".frame");
    await frame.screenshot({ path: path.join(outDir, `${name}.png`) });
    console.log(`${name}.png`);
  }

  await browser.close();
})();

