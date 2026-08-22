import logoDark from "../brand/logo-dark.svg"; // gold + white, for dark bg
import logoDarkLeft from "../brand/logo-dark-left.svg"; // the left-aligned cut
import logoLight from "../brand/logo-light.svg"; // gold + black, for light bg

// The real brand lockup ("THE / CONTRARIAN / DEBATE CLUB"), rendered from the
// original SVG artwork. Dark variant is the default since posters sit on
// near-black.
//
// Two cuts of the artwork, and the brand guide is strict about which goes
// where: the centred cut stacks the three lines on a shared centre and carries
// the gold rule under them; the left cut sets all three on one left edge and
// drops the rule. A centred lockup in a left-aligned block is the club's most
// common logo misuse, so a piece that sets its type flush left asks for
// artwork="left". The left cut exists in the gold-and-white colourway only,
// which is the one posters use; a light-ground piece that wants it will have
// to add the file beside this one.
const RATIO_CENTERED = 745 / 346; // logo-dark viewBox
const RATIO_LEFT = 648.33 / 264.13; // logo-dark-left viewBox

export function Lockup({
  width = 300,
  variant = "dark",
  align = "start",
  artwork = "centered",
}: {
  /** rendered width in px */
  width?: number;
  variant?: "dark" | "light";
  /** where the image sits in its container */
  align?: "start" | "center";
  /** which cut of the lockup: centred stack, or all three lines flush left */
  artwork?: "centered" | "left";
}) {
  const left = artwork === "left";
  const src = left ? logoDarkLeft : variant === "light" ? logoLight : logoDark;

  return (
    <img
      src={src}
      alt="The Contrarian Debate Club"
      width={width}
      height={width / (left ? RATIO_LEFT : RATIO_CENTERED)}
      style={{
        display: "block",
        marginLeft: align === "center" ? "auto" : undefined,
        marginRight: align === "center" ? "auto" : undefined,
      }}
    />
  );
}
