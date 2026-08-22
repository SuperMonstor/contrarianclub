// Build a motion's handouts.
//
//   node handouts/build.cjs <motion-folder>          inline everything
//   node handouts/build.cjs <motion-folder> --pdf    and render the PDFs
//
// A sheet is a layout (sheets/*.src.html) plus a motion's copy
// (<motion-folder>/debate.js). Every sheet type is built for the motion you
// name, and the results land in that motion's folder: handout.html to open
// and print, out/*.pdf for the print shop.
//
// The fonts, the wordmark, the shared stylesheet and the shared renderers are
// all inlined as data URIs or text, so a built file renders identically on any
// machine and at any print shop, with no network and no sibling assets.

const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const ROOT = path.join(DIR, "..");
const BRAND = path.join(ROOT, "posters", "src", "core", "brand");
const MODULES = path.join(ROOT, "posters", "node_modules", "@fontsource");
const SHEETS = path.join(DIR, "sheets");

// The five faces the sheets actually use. Every extra one is 30KB of base64
// carried around for nothing.
const FACES = [
  ["Playfair Display", 400, "playfair-display/files/playfair-display-latin-400-normal.woff2"],
  ["Playfair Display", 700, "playfair-display/files/playfair-display-latin-700-normal.woff2"],
  ["Inter", 400, "inter/files/inter-latin-400-normal.woff2"],
  ["Inter", 600, "inter/files/inter-latin-600-normal.woff2"],
  ["Oswald", 500, "oswald/files/oswald-latin-500-normal.woff2"],
  ["Oswald", 600, "oswald/files/oswald-latin-600-normal.woff2"],
];

const dataUri = (file, mime) =>
  "data:" + mime + ";base64," + fs.readFileSync(file).toString("base64");

const fontFace = ([family, weight, file]) =>
  "@font-face{font-family:'" + family + "';font-style:normal;font-weight:" + weight +
  ";font-display:block;src:url(" + dataUri(path.join(MODULES, file), "font/woff2") +
  ") format('woff2');}";

const motions = () =>
  fs
    .readdirSync(DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(DIR, e.name, "debate.js")))
    .map((e) => e.name);

const target = process.argv.slice(2).find((a) => !a.startsWith("--"));

if (!target) {
  console.error("Which motion? Pass its folder:\n" +
    motions().map((f) => "  node handouts/build.cjs handouts/" + f + " --pdf").join("\n"));
  process.exit(1);
}

const BASE = path.resolve(target);
const fonts = FACES.map(fontFace).join("\n");
const css = fs.readFileSync(path.join(DIR, "sheet.css"), "utf8");
const render = fs.readFileSync(path.join(DIR, "render.js"), "utf8");
const debate = fs.readFileSync(path.join(BASE, "debate.js"), "utf8");

const built = fs
  .readdirSync(SHEETS)
  .filter((f) => f.endsWith(".src.html"))
  .map((file) => {
    const html = fs
      .readFileSync(path.join(SHEETS, file), "utf8")
      .replace("__SHEET_CSS__", fonts + "\n\n" + css)
      .replace("__DEBATE__", debate)
      .replace("__RENDER__", render)
      .replace(/__LOGO_DARK__/g, dataUri(path.join(BRAND, "logo-dark.svg"), "image/svg+xml"))
      .replace(/__LOGO_LIGHT__/g, dataUri(path.join(BRAND, "logo-light.svg"), "image/svg+xml"));

    const name = file.replace(".src.html", "");
    fs.writeFileSync(path.join(BASE, name + ".html"), html);
    console.log("  " + name + ".html  " + Math.round(html.length / 1024) + "KB");
    return name;
  });

if (!process.argv.includes("--pdf")) return;

(async () => {
  // Playwright belongs to the poster studio, which is the only project here
  // that needs a browser. Borrow it rather than adding a second copy.
  const { chromium } = require(path.join(ROOT, "posters", "node_modules", "playwright"));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  fs.mkdirSync(path.join(BASE, "out"), { recursive: true });

  for (const name of built) {
    await page.goto("file://" + path.join(BASE, name + ".html"));
    await page.waitForTimeout(1200);
    const pdf = path.join(BASE, "out", name + ".pdf");
    await page.pdf({ path: pdf, format: "A4", printBackground: true, preferCSSPageSize: true });
    console.log("  " + path.relative(ROOT, pdf));
  }

  await browser.close();
})();
