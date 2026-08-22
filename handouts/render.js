// Draws the parts of a sheet that come from the motion. Shared by every sheet
// type: a sheet that has no rebuttal grid simply has no node to fill, and
// set() on nothing is a no-op.

const $ = (name) => document.querySelectorAll('[data-bind="' + name + '"]');
const set = (name, html) => $(name).forEach((el) => (el.innerHTML = html));

for (const key of ["number", "when", "formula", "motion", "poleAgainst", "poleFor", "agreed", "split"]) {
  set(key, DEBATE[key] || "");
}

set("terms", DEBATE.terms.map(([term, meaning]) =>
  "<div><dt>" + term + "</dt><dd>" + meaning + "</dd></div>").join(""));

set("benches", (DEBATE.benches || []).map(([side, line]) =>
  "<div><b>" + side + "</b><p>" + line + "</p></div>").join(""));
