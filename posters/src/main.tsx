import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./core/brand/fonts";
import "./core/brand/tokens.css";
import "./core/brand/poster.css";
import "./core/studio.css";

import { Studio } from "./core/studio";
import { BareRender } from "./core/BareRender";

// Two modes on one app:
//   ?render=<posterId>&format=<formatId>  → just the poster at exact px (export)
//   (no params)                            → the interactive studio
const params = new URLSearchParams(window.location.search);
const renderId = params.get("render");
const formatId = params.get("format") ?? undefined;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {renderId ? (
      <BareRender posterId={renderId} formatId={formatId} />
    ) : (
      <Studio />
    )}
  </StrictMode>,
);
