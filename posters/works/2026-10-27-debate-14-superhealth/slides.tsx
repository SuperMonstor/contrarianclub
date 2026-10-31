import type { CSSProperties } from "react";
import type { Format } from "../../src/core/formats";
import { ArtTone, Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #14, with Superhealth. One poster, in three formats: the
// painting, the motion as the title, and who is arguing against it. Class
// names are prefixed sp-.
//
// ---------------------------------------------------------------------------
// The argument the layout is making
//
// The night asks whether a hospital can chase profit and still put the
// patient first, and the CEO of a for-profit hospital has agreed to defend
// the answer in front of the room. Two things have to land: the motion, and
// the fact that someone with skin in it is turning up to argue.
//
// THE SURGEON FIRST, THEN THE MOTION. Eakins's Dr Gross turns from the
// table with the knife still in his hand, lit from above, while a tier of
// students watches from the dark. It is medicine as performance, in front of
// a room, which is the night exactly. His face sits in the open top of the
// page; the motion sits in the dark under him.
//
// TWO NAMES ACROSS THE TOP. The club's lockup, a multiplication sign, and
// Superhealth's own white wordmark, set at the height of one line of the
// lockup so neither shouts over the other. The edition stays opposite.
//
// THE MOTION IS THE TITLE. In Oswald condensed caps, ivory, printed
// verbatim with TCBT spelled out. "This Club Believes that" sits small on a
// line of its own, the formula every motion shares; the claim under it is
// the big type, broken at phrase boundaries. It is not repeated underneath.
// Then, as #11 to #13 do it, a hairline, a small Inter label, and the guest
// in ivory Playfair, set larger than the series' blocks because a named
// opponent with Apollo behind him is the hook. No gold: the series keeps it
// for a call to action. Nothing under him: the ₹599 cap and the questions
// live in the carousel and the caption.
//
// THREE FORMATS. Portrait for the feed, story for stories, and square for
// WhatsApp, where a portrait image is shown narrow on desktop. Each has its
// own metrics and its own placement of the painting.
//
// ---------------------------------------------------------------------------
// The art, public domain via Wikimedia Commons:
//
//   gross   Thomas Eakins, Portrait of Dr. Samuel D. Gross (The Gross
//           Clinic), 1875, Philadelphia Museum of Art. Google Art Project
//           scan, scaled to 3600px on the long edge.

const MARGIN = 84;

/* --- Copy this poster defines for itself ---------------------------------- */

/** Where the picture sits on one format, and where the type takes over. */
export interface Placement {
  /** where the face lands on the page */
  x: number;
  y: number;
  /** how wide the picture is drawn */
  w: number;
  /** the scrim: open until clearEnd, near-black by darkAt */
  clearEnd: number;
  darkAt: number;
}

export interface Picture {
  src: string;
  ratio: number;
  /** the face, as fractions of the picture */
  face: { x: number; y: number };
  place: { portrait: Placement; story: Placement; square: Placement };
}

/** Who argues against the motion: a small label, then who he is, one line
 *  per entry, broken at phrase boundaries. */
export interface Guest {
  label: string;
  lines: string[];
}

/** The motion as the title. Its formula ("This Club Believes that") sits
 *  small on one line; the claim itself is the big type. */
export interface Title {
  lead: string;
  /** the claim, one line per entry, broken at phrase boundaries */
  lines: string[];
}

export interface Copy {
  edition: string;
  /** the partner's wordmark, white, for a dark ground */
  partner: { src: string; ratio: number; name: string };
  title: Title;
  guest: Guest;
  art: Picture;
}

/* --- Metrics -------------------------------------------------------------- */

// The type stack is set from the foot of the page up, so the blocks decide
// how high the title sits and the painting keeps whatever is left.
interface Metrics {
  family: "portrait" | "story" | "square";
  lockupTop: number;
  lockupW: number;
  partnerW: number;
  editionSize: number;
  leadSize: number;
  titleSize: number;
  /** where the near-black ground is fully down, for the scrim */
  textTop: number;
  /** space either side of each hairline */
  gap: number;
  labelSize: number;
  guestSize: number;
  foot: number;
}

const PORTRAIT: Metrics = {
  family: "portrait",
  lockupTop: 76,
  lockupW: 214,
  partnerW: 178,
  editionSize: 30,
  leadSize: 46,
  titleSize: 95,
  textTop: 720,
  gap: 26,
  labelSize: 15,
  guestSize: 40,
  foot: 84,
};

const STORY: Metrics = {
  family: "story",
  lockupTop: 132,
  lockupW: 236,
  partnerW: 196,
  editionSize: 34,
  leadSize: 48,
  titleSize: 95,
  textTop: 1080,
  gap: 40,
  labelSize: 18,
  guestSize: 46,
  foot: 170,
};

/** WhatsApp's: the whole stack scaled down so the painting keeps its share
 *  of a shorter page. */
const SQUARE: Metrics = {
  family: "square",
  lockupTop: 60,
  lockupW: 190,
  partnerW: 158,
  editionSize: 26,
  leadSize: 38,
  titleSize: 84,
  textTop: 560,
  gap: 18,
  labelSize: 14,
  guestSize: 34,
  foot: 62,
};

const metrics = (format: Format): Metrics =>
  format.height >= 1700 ? STORY : format.height <= format.width ? SQUARE : PORTRAIT;

/* --- Type ----------------------------------------------------------------- */

const CONDENSED: CSSProperties = {
  fontFamily: "var(--cc-font-condensed)",
  fontWeight: 700,
  textTransform: "uppercase",
  lineHeight: 0.94,
  letterSpacing: "-0.004em",
  color: "var(--cc-ivory)",
  margin: 0,
  whiteSpace: "nowrap",
};

const SERIF: CSSProperties = {
  fontFamily: "var(--cc-font-display)",
  fontWeight: 400,
  margin: 0,
};

const SMALL: CSSProperties = {
  fontFamily: "var(--cc-font-ui)",
  fontWeight: 500,
  color: "var(--cc-muted)",
  margin: 0,
};

/* --- The ground ----------------------------------------------------------- */

/** The painting, warmed, and where type may sit on it: soft under the
 *  names, open over his face, then near-black from the title down. */
function Ground({ art, p, m }: { art: Picture; p: Placement; m: Metrics }) {
  const h = p.w / art.ratio;
  return (
    <>
      <img
        className="sp-art"
        src={art.src}
        alt=""
        style={{
          position: "absolute",
          width: p.w,
          height: h,
          left: p.x - art.face.x * p.w,
          top: p.y - art.face.y * h,
          maxWidth: "none",
        }}
      />
      <ArtTone />
      <div
        className="sp-scrim"
        style={{
          background: `linear-gradient(180deg,
            rgba(11, 9, 7, 0.62) 0px,
            rgba(11, 9, 7, 0.18) ${m.lockupTop + 150}px,
            rgba(11, 9, 7, 0.06) ${p.clearEnd}px,
            rgba(11, 9, 7, 0.9) ${p.darkAt}px,
            rgba(9, 7, 5, 0.96) ${m.textTop}px,
            rgba(8, 6, 4, 0.97) 100%)`,
        }}
      />
    </>
  );
}

/* --- The poster ----------------------------------------------------------- */

/** A plain hairline in the type stack. */
function Rule({ gap }: { gap: number }) {
  return <div className="sp-rule" style={{ margin: `${gap}px 0` }} />;
}

/** The club and the partner, side by side, centred on each other. */
function Names({ copy, m }: { copy: Copy; m: Metrics }) {
  return (
    <div
      style={{
        position: "absolute",
        zIndex: 2,
        left: MARGIN,
        top: m.lockupTop,
        display: "flex",
        alignItems: "center",
        gap: Math.round(m.lockupW * 0.11),
      }}
    >
      <Lockup width={m.lockupW} artwork="left" />
      <span
        className="sp-on-art"
        style={{ ...SERIF, fontSize: m.editionSize, lineHeight: 1, color: "var(--cc-parchment)" }}
      >
        ×
      </span>
      <img
        src={copy.partner.src}
        alt={copy.partner.name}
        width={m.partnerW}
        height={m.partnerW / copy.partner.ratio}
        style={{ display: "block" }}
      />
    </div>
  );
}

export function Poster({ copy, format }: { copy: Copy; format: Format }) {
  const m = metrics(format);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Ground art={copy.art} p={copy.art.place[m.family]} m={m} />

      <Names copy={copy} m={m} />
      <p
        className="sp-on-art"
        style={{
          ...SERIF,
          position: "absolute",
          zIndex: 2,
          right: MARGIN,
          top: m.lockupTop - 4,
          fontSize: m.editionSize,
          lineHeight: 1.2,
          color: "var(--cc-ivory)",
        }}
      >
        {copy.edition}
      </p>

      {/* from the foot up: the guest, then the motion as the title */}
      <div style={{ position: "absolute", zIndex: 2, left: MARGIN, right: MARGIN, bottom: m.foot }}>
        <p style={{ ...CONDENSED, fontSize: m.leadSize, marginBottom: m.leadSize * 0.22 }}>{copy.title.lead}</p>
        {copy.title.lines.map((line) => (
          <p key={line} style={{ ...CONDENSED, fontSize: m.titleSize }}>
            {line}
          </p>
        ))}

        <Rule gap={m.gap} />
        <p style={{ ...SMALL, fontSize: m.labelSize, lineHeight: 1.2, marginBottom: m.labelSize * 0.7 }}>
          {copy.guest.label}
        </p>
        {copy.guest.lines.map((line) => (
          <p key={line} style={{ ...SERIF, fontSize: m.guestSize, lineHeight: 1.24, color: "var(--cc-ivory)" }}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
