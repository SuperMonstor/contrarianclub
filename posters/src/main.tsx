import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./brand/fonts";
import "./brand/tokens.css";
import "./brand/poster.css";
import "./studio.css";

import { Studio } from "./studio";
import { BareRender } from "./BareRender";

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
