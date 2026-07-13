import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./core/brand/fonts";
import "./core/brand/tokens.css";
import "./core/brand/poster.css";
import "./core/studio.css";

import { Studio } from "./core/studio";
import { BareRender } from "./core/BareRender";
import { MANIFEST } from "./core/registry";

// The export CLI runs in node and cannot import a spec (specs import images,
// which only Vite resolves), so the app publishes what it knows here and the
// CLI reads it off the page.
declare global {
  interface Window {
    __CONTRARIAN_WORKS__: typeof MANIFEST;
  }
}
window.__CONTRARIAN_WORKS__ = MANIFEST;

// Two modes on one app:
//   ?render=<workId>&slide=<n>&format=<formatId>  → one slide at exact px (export)
//   (no params)                                    → the interactive studio
const params = new URLSearchParams(window.location.search);
const renderId = params.get("render");
const slide = Number(params.get("slide") ?? 0);
const formatId = params.get("format") ?? undefined;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {renderId ? (
      <BareRender workId={renderId} slide={slide} formatId={formatId} />
    ) : (
      <Studio />
    )}
  </StrictMode>,
);
