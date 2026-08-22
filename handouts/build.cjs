// Build the debate handout.
//
//   node handouts/build.cjs <dir>               inline everything into handout.html
//   node handouts/build.cjs <dir> --pdf         and render out/handout.pdf
//
// One folder per motion, named <yyyy-mm-dd>-<slug>. A night with two motions
// is two folders. Nothing registers them: start the next one by copying the
// last, which is the only template there is.
//
// handout.src.html is the file you edit. This step inlines the fonts and the
// wordmark as data URIs so the result renders identically on any machine, at
// any print shop, with no network and no sibling asset folder. The built
// handout.html and out/handout.pdf land beside the source they came from.

const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const ROOT = path.join(DIR, "..");
const BRAND = path.join(ROOT, "posters", "src", "core", "brand");
const MODULES = path.join(ROOT, "posters", "node_modules", "@fontsource");

// The five faces the sheet actually uses. Every extra one is 30KB of base64
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

const target = process.argv.slice(2).find((a) => !a.startsWith("--"));

if (!target) {
  const folders = fs
    .readdirSync(DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(DIR, e.name, "handout.src.html")))
    .map((e) => e.name);
  console.error("Which handout? Pass its folder:\n" +
    folders.map((f) => "  node handouts/build.cjs handouts/" + f + " --pdf").join("\n"));
  process.exit(1);
}

const BASE = path.resolve(target);

const html = fs
  .readFileSync(path.join(BASE, "handout.src.html"), "utf8")
  .replace("__FONTS__", FACES.map(fontFace).join("\n"))
  .replace(/__LOGO_DARK__/g, dataUri(path.join(BRAND, "logo-dark.svg"), "image/svg+xml"))
  .replace(/__LOGO_LIGHT__/g, dataUri(path.join(BRAND, "logo-light.svg"), "image/svg+xml"));

const out = path.join(BASE, "handout.html");
fs.writeFileSync(out, html);
console.log("handout.html  " + Math.round(html.length / 1024) + "KB");

if (!process.argv.includes("--pdf")) return;

(async () => {
  // Playwright belongs to the poster studio, which is the only project here
  // that needs a browser. Borrow it rather than adding a second copy.
  const { chromium } = require(path.join(ROOT, "posters", "node_modules", "playwright"));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + out);
  await page.waitForTimeout(1200);
  fs.mkdirSync(path.join(BASE, "out"), { recursive: true });
  const pdf = path.join(BASE, "out", "handout.pdf");
  await page.pdf({ path: pdf, format: "A4", printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log(path.relative(ROOT, pdf));
})();
