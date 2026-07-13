import logoDark from "../brand/logo-dark.svg"; // gold + white, for dark bg
import logoLight from "../brand/logo-light.svg"; // gold + black, for light bg

// The real brand lockup ("THE / CONTRARIAN / DEBATE CLUB" with a gold rule),
// rendered from the original SVG artwork. Dark variant is the default since
// posters sit on near-black.
const NATURAL_RATIO = 745 / 346; // dark logo viewBox

export function Lockup({
  width = 300,
  variant = "dark",
  align = "start",
}: {
  /** rendered width in px */
  width?: number;
  variant?: "dark" | "light";
  align?: "start" | "center";
}) {
  return (
    <img
      src={variant === "light" ? logoLight : logoDark}
      alt="The Contrarian Debate Club"
      width={width}
      height={width / NATURAL_RATIO}
      style={{
        display: "block",
        marginLeft: align === "center" ? "auto" : undefined,
        marginRight: align === "center" ? "auto" : undefined,
      }}
    />
  );
}
