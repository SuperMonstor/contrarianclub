import type { CSSProperties, ReactNode } from "react";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate 10, both motions, as a matched pair of bookmarks. Handed out on the
// night and kept afterwards, which is the only reason to print a motion on a
// six inch strip of card rather than post it.
//
// These are event pieces, unlike the 2026-08-22 set. They name the night, the
// room and which motion is which, so they expire on 6 September and that is
// fine: what survives the evening is the argument written on the back of one.
//
// What a bookmark has to do, which is not what a poster has to do:
//
//   It is held, not scrolled. Type can go small and reward a closer look.
//   Most of the time it is inside a book with only the top inch and a half
//   showing, so the top band carries identity and nothing that needs
//   finishing.
//   It is cut by a machine with a tolerance, so nothing meaningful goes
//   within 0.2in of the trim, and a rule line goes further out still.
//
// THE GRAMMAR THE PAIR SHARES
//
//   The head.        The lockup, a hairline, then a gold roman numeral with
//                    the night and which motion it is. This is the inch and a
//                    half that shows above the pages, so it is the whole of
//                    what identifies the object at rest.
//   The plate.       One picture in a window, never full bleed, and a light
//                    window rather than a dark one because both pictures are
//                    engravings (the reasoning is in slides.css). Same width,
//                    same inset, same rule on both, which is what makes them
//                    read as a set. Only the height differs.
//   The caption.     What the picture is and when. Both engravings carry the
//                    city's name printed on the plate, so the caption only
//                    has to date it: the picture argues nothing on its own,
//                    it just says this is the same place.
//   The motion.      Verbatim, the wording the room votes on, under the
//                    club's own lead-in. Nothing on either piece is allowed
//                    to be larger.
//   The fact.        One line, and one only. Both are measured against 1991,
//                    so the pair asks the same question of the city twice.
//                    Sources are listed in spec.tsx; nothing goes in this
//                    slot that does not have one.
//   The foot.        The night, the room, the address. Always last, always
//                    the same size.
//
//   Gold is punctuation: the numeral, the lead-in, the rules and the address.
//   Never a fill. One word inside motion two is set in it, and it is the word
//   the motion turns on.
//
// THE ONE VARIABLE
//
// The motion is six words on one piece and twenty four on the other, and
// everything else moves to absorb that. Motion one is set at 58px and takes
// three lines; motion two at 38px and takes six. The plate takes what is
// left, which is why one window is 400px tall and the other 420px. That is
// the rule: the sentence is fixed and the picture yields, not the reverse.

/** Every horizontal inset on the piece, in px at 300ppi. 66px is 0.22in: the
 *  trim rule above says 0.2in and this clears it by a sixteenth, because a
 *  guillotine holds about a millimetre and the last thing wanted is type that
 *  is inside the rule on paper but not in the file. */
const SAFE = 66;

/** The floor for any type here. Trade printers spec 6pt for reversed type and
 *  26px is 6.2pt, so the smallest voice on the piece clears it. Gold on
 *  near-black is the worst case for ink gain closing up a counter. */
const MICRO = 26;

const GOLD = "var(--cc-gold)";

const WHEN = "Sunday, 6 September";
const WHERE = "Big Pitcher, Indiranagar";
const ADDRESS = "@thecontrarian.club";

/** Every piece takes the format's bleed and hands it to its sheet. The layout
 *  reads it back through --d10-bleed, so nothing inside a slide has to know
 *  whether it is being drawn at trim or with an eighth around it. */
function sheetStyle(bleed = 0): CSSProperties {
  return { ["--d10-bleed" as string]: `${bleed}px` } as CSSProperties;
}

/** Gold micro caps. The smallest voice on the piece: the labels, the address.
 *  Sized at MICRO by default and nothing here asks for less. */
function Micro({
  children,
  color = GOLD,
  tracking = 0.2,
  align,
}: {
  children: ReactNode;
  color?: string;
  tracking?: number;
  align?: "right";
}) {
  return (
    <span
      style={{
        display: "block",
        fontFamily: "var(--cc-font-ui)",
        fontWeight: 600,
        fontSize: MICRO,
        letterSpacing: `${tracking}em`,
        // tracking pushes the last letter out; pad the front to keep the
        // block sitting on the same left edge as everything above it
        paddingLeft: `${tracking}em`,
        textTransform: "uppercase",
        color,
        textAlign: align,
      }}
    >
      {children}
    </span>
  );
}

/** A rule that fades out to the right rather than both ends, because the
 *  whole piece hangs on one left edge and a centred fade would float. */
function Hairline({ opacity = 1 }: { opacity?: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: 1,
        opacity,
        background:
          "linear-gradient(90deg, var(--cc-line-strong), var(--cc-line-strong) 78%, transparent)",
      }}
    />
  );
}

function Gap({ h }: { h: number }) {
  return <div style={{ height: h }} />;
}

// ---------------------------------------------------------------------------
// The shared parts. Both bookmarks are the same object with one variable, so
// the head, the plate, the fact and the foot are written once here rather
// than twice in two near-identical components.
// ---------------------------------------------------------------------------

function Head({ numeral, motionLabel }: { numeral: string; motionLabel: string }) {
  return (
    <>
      {/* the left cut of the artwork: this piece sets every line on one left
          edge, and a centred lockup in a left-aligned block is the club's
          most common logo misuse */}
      <Lockup width={300} artwork="left" />
      <Gap h={30} />
      <Hairline />
      <Gap h={26} />
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <span
          style={{
            flex: "none",
            fontFamily: "var(--cc-font-display)",
            fontStyle: "italic",
            fontSize: 64,
            lineHeight: 0.9,
            color: GOLD,
          }}
        >
          {numeral}
        </span>
        <div style={{ flex: 1 }}>
          <Micro color="var(--cc-parchment)" tracking={0.22}>
            Debate Club #10
          </Micro>
          <Gap h={10} />
          <Micro tracking={0.22}>{motionLabel}</Micro>
        </div>
      </div>
    </>
  );
}

export interface Plate {
  src: string;
  /** the work-local treatment class. Both pictures take the same one, since
   *  both are engravings off a printed page, and neither wants the kit's
   *  standard darken-and-warm, which is tuned for a painting. */
  art: string;
  height: number;
  position?: string;
  /** how far to push into the picture, and around what point. Panning inside
   *  what object-fit already shows is not enough when the subject is a crowd
   *  and the window is 2in wide. */
  zoom?: number;
  focus?: string;
  /** what the picture is, and when */
  caption: string;
}

function PlateWindow({ plate }: { plate: Plate }) {
  return (
    <>
      <div className="d10-plate" style={{ height: plate.height }}>
        <img
          className={plate.art}
          src={plate.src}
          alt=""
          style={
            {
              objectPosition: plate.position,
              ["--d10-zoom" as string]: plate.zoom,
              ["--d10-focus" as string]: plate.focus,
            } as CSSProperties
          }
        />
        <div className="d10-plate-wash" />
      </div>
      <Gap h={20} />
      <div
        className="closing"
        style={{
          fontSize: 24,
          lineHeight: 1.4,
          color: "var(--cc-muted)",
          fontStyle: "italic",
        }}
      >
        {plate.caption}
      </div>
    </>
  );
}

function Fact({ children }: { children: ReactNode }) {
  return (
    <>
      <Hairline />
      <Gap h={26} />
      <Micro color="var(--cc-muted)" tracking={0.28}>
        On the table
      </Micro>
      <Gap h={22} />
      <div className="value" style={{ fontSize: 30, lineHeight: 1.36 }}>
        {children}
      </div>
    </>
  );
}

function Foot() {
  return (
    <>
      <Hairline />
      <Gap h={26} />
      <div className="value" style={{ fontSize: 30, lineHeight: 1.32 }}>
        {WHEN}
        <br />
        {WHERE}
      </div>
      <Gap h={24} />
      <Micro>{ADDRESS}</Micro>
    </>
  );
}

// ---------------------------------------------------------------------------
// The bookmark. One component, because the two pieces are one design and the
// only things that differ between them are arguments.
// ---------------------------------------------------------------------------

export function MotionBookmark({
  numeral,
  motionLabel,
  plate,
  motion,
  motionSize,
  fact,
  bleed,
}: {
  numeral: string;
  motionLabel: string;
  plate: Plate;
  /** the claim, worded exactly as the room will vote on it. Line breaks are
   *  the work's, not the browser's: a motion that wraps where it likes reads
   *  as a paragraph rather than as something being put to a vote. */
  motion: ReactNode;
  motionSize: number;
  /** one line, and it has a source in spec.tsx */
  fact: string;
  bleed?: number;
}) {
  return (
    <div className="d10-sheet" style={sheetStyle(bleed)}>
      <div className="d10-body" style={{ padding: `84px ${SAFE}px 78px` }}>
        <Head numeral={numeral} motionLabel={motionLabel} />

        <Gap h={36} />
        <PlateWindow plate={plate} />

        <Gap h={36} />
        <div className="closing" style={{ fontSize: 30, lineHeight: 1.3 }}>
          This Club Believes that
        </div>
        <Gap h={16} />
        <h1
          className="hero"
          style={{ fontSize: motionSize, lineHeight: motionSize > 50 ? 1.12 : 1.22, margin: 0 }}
        >
          {motion}
        </h1>

        {/* the air lands here, between the claim and what is known about it,
            so the two pieces breathe differently and for a stated reason */}
        <div style={{ flex: 1, minHeight: 40 }} />

        <Fact>{fact}</Fact>
        <Gap h={34} />
        <Foot />
      </div>
    </div>
  );
}
