// Build what the club prints.
//
//   node handouts/build.cjs <folder>          inline everything
//   node handouts/build.cjs <folder> --pdf    and render the PDFs
//
// Two kinds of folder. A motion folder holds a debate.js and no layout of its
// own: every sheet type in sheets/ is built against that motion's copy. Any
// other folder holds its own .src.html files, which are one-offs, and they are
// built where they sit. Either way the results land in the folder: .html to
// open and print, out/*.pdf for the print shop.
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
const read = (file) => fs.readFileSync(path.join(DIR, file), "utf8");
const fonts = FACES.map(fontFace).join("\n");

// A motion folder is copy without a layout. Anything else is a one-off that
// brought its own.
const motion = fs.existsSync(path.join(BASE, "debate.js"));
const from = motion ? SHEETS : BASE;
const debate = motion ? fs.readFileSync(path.join(BASE, "debate.js"), "utf8") : "";

const built = fs
  .readdirSync(from)
  .filter((f) => f.endsWith(".src.html"))
  .map((file) => {
    const html = fs
      .readFileSync(path.join(from, file), "utf8")
      .replace("__BASE__", fonts + "\n\n" + read("tokens.css"))
      .replace("__SHEET__", () => read("sheet.css"))
      .replace("__CARD__", () => read("card.css"))
      .replace("__DEBATE__", () => debate)
      .replace("__RENDER__", () => read("render.js"))
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
    // preferCSSPageSize means each sheet's own @page decides the paper, so an
    // A4 handout and an A6 card come out of the same call at their true size.
    await page.pdf({ path: pdf, printBackground: true, preferCSSPageSize: true });
    console.log("  " + path.relative(ROOT, pdf));
  }

  await browser.close();
})();
