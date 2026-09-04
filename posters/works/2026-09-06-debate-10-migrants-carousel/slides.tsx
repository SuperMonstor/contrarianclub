import type { CSSProperties, ReactNode } from "react";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #10, the second of the two motions. Nine slides, published two
// days before the night, to people who have already seen the first motion.
//
// ---------------------------------------------------------------------------
// The story first, the motion last
//
//   1  is Bengaluru's culture being erased?       the accusation, asked flat
//   2  it was never one place                     a fort, a palace, a garrison
//   3  then everyone came                         and never stopped
//   4  forty-two percent                          the number, alone, on black
//   5  you never have to learn it                 what that feels like
//   6  so the city asked for it back              signboards, and a jobs bill
//   7  but                                        the fact that cuts the other way
//   8  so which is it                             the real question, in gold
//   9  the motion, and the answer to slide 1      and come and argue it
//
// This is the mirror of the tech bubble deck and inverts it on purpose. That
// one led with its motion because it was the announcement and had to carry the
// date, the venue and the tickets on a frame that could stand alone. This one
// is the reveal: everybody reading it already knows the night exists, so the
// motion is the thing at the end of the argument rather than the thing on the
// front of the poster. The last slide is the poster and the back cover at
// once, which is why there is no tenth.
//
// Slide 1 and slide 9 are a pair and they are not the same sentence. Slide 1
// is the accusation the city already makes, that migrants are erasing the
// culture. Slide 9 is the club's motion, which claims the opposite right. The
// deck exists to get a reader from the first to the second, and the last line
// of slide 8 is the hinge: whether people who move to a city are meant to fit
// into it, or to change it.
//
// Slides 1 to 8 are one continuous voice, each opening on a connective and
// closing on something unfinished. Anyone editing a line should read the slide
// before it and the slide after it first. Nobody swipes because a slide was
// interesting, they swipe because the sentence has not landed yet.
//
// Slide 7 is the one that must not be softened. A motion this blunt is only
// worth debating if the deck arguing it also hands the room the best fact
// against it, and that fact is that the Kannada share of this city went up,
// not down, and that most of the people who moved here moved from inside
// Karnataka. If that slide ever gets cut, the deck stops being an argument and
// starts being a side.
//
// ---------------------------------------------------------------------------
// The grammar
//
// ONE MATERIAL, ONE PLACE. Every picture here is a coloured aquatint of
// Bangalore or the Mysore country, drawn between 1791 and 1805. The tech
// bubble deck ran five materials and no two neighbours alike, because its
// subject was a city that kept becoming something else. This one holds
// absolutely still, because its subject is a place people believe is being
// taken from them, and the pictures should look like the thing being defended.
//
// The catch is in the credits, and it is the deck's quietest argument: these
// were drawn by English officers who had just besieged the place, printed in
// London, and sold as souvenirs. The oldest surviving pictures of Bengaluru
// were made by outsiders. That is what the wall labels are for, and it is why
// they are on every picture slide and never mentioned in the copy.
//
//   1  East view of Bangalore, 1791                     the town, far off
//   2  West front of Tipu Sultan's palace, 1804          the city's finest house
//   3  Neel-Droog, 1794                                  riders crossing in
//   4  nothing at all                                    the number is the picture
//   5  Mausoleum of Hyder Ali at Laulbaug, 1805          tents pitched on the lawn
//   6  North view of Sewandroog, the attack of 1791      smoke, and a column
//   7  Neel-Droog again, close on the riders             the same people, nearer
//   8  the east view again, at dusk                      the town as a line
//   9  the east view again, in full light                the motion
//
// The east view is load bearing. It opens the deck on the question and closes
// it under the motion, so the last thing a reader sees is the same near-empty
// plain they started on: whatever anybody thinks is being erased, this is what
// was here, and there is almost nobody in it. Slide 5's plate is a mausoleum
// with a military camp pitched in front of it, which is the whole of slide 5's
// copy in one picture and is why that slide does not need a number.
//
// THREE TYPEFACES, AND OSWALD ONLY WHERE THE VOICE STOPS NARRATING. Playfair
// at reading size carries all the talking. Oswald condensed caps appear three
// times only: the accusation on slide 1, the number on slide 4, and the
// motion.
// Those are the three moments the deck stops telling you something.
//
// LINE BREAKS ARE COPY, NOT LAYOUT. Each slide is given its lines, not a
// paragraph, so the rhythm of the writing survives contact with the column. An
// empty string is a beat of silence and is used as punctuation.
//
// ONE DIVISION, LOW ON THE PAGE, AT THE SAME HEIGHT EVERY TIME, and at the
// same height as the tech bubble deck's. The two decks go out two days apart
// for the same night and scroll past each other in one feed, so they share the
// margin, the rule, the counter and the band. Everything above that line is
// this deck's own.
//
// FLUSH LEFT THROUGHOUT, to one margin at x=92, which is why the lockup takes
// its left cut. Nothing in this deck centres, including the last page: the
// tech bubble deck ended on a cream card because it needed a back cover, and
// this deck ends on the motion instead.
// ---------------------------------------------------------------------------

// This work ships one format, so the canvas is a constant rather than a set of
// ratios.
const W = 1080;
const H = 1350;
const MARGIN = 92;

/** The division. Same height on every slide, and on the sibling deck. */
const RULE = 1150;
/** Where the last line of narration lands, clear of the division. */
const TEXT_BASE = RULE - 62;

/* --- Plates ---------------------------------------------------------------- */

/** A picture, plus what the layout needs to know about it: its aspect, so a
 *  crop can be positioned, the treatment it was tuned for, and the label it is
 *  credited under. */
export interface Plate {
  src: string;
  ratio: number;
  art: string;
  scrim: string;
  /** what it is, and who made it, for the wall label */
  label: [string, string];
}

/** Where in the picture to centre, and how far in. x and y are fractions of
 *  the picture; scale 1 means the picture is exactly one slide wide. */
export interface Crop {
  x: number;
  y: number;
  scale: number;
}

/** Keep the picture over the whole canvas.
 *
 *  A crop centre near an edge cannot be a slide centre: ask for the horizon at
 *  y=0.12 and the canvas runs out above it, leaving a band of bare black with
 *  a hard seam across it. Clamping means a crop says where the eye should go
 *  and the frame stays covered regardless, so these can be tuned by eye
 *  without a class of silent breakage. */
function CropArt({ plate, crop }: { plate: Plate; crop: Crop }) {
  const minScale = (H / W) * plate.ratio;
  const w = W * Math.max(crop.scale, minScale);
  const h = w / plate.ratio;
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
  return (
    <img
      className={plate.art}
      src={plate.src}
      alt=""
      style={{
        width: w,
        height: h,
        left: clamp(W / 2 - crop.x * w, W - w, 0),
        top: clamp(H / 2 - crop.y * h, H - h, 0),
        maxWidth: "none",
      }}
    />
  );
}

/** Every slide: the picture, its scrim, then the content. */
function Ground({ plate, crop, children }: { plate?: Plate; crop?: Crop; children: ReactNode }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {plate && crop && (
        <>
          <CropArt plate={plate} crop={crop} />
          <div className={plate.scrim} />
        </>
      )}
      <div style={{ position: "absolute", inset: 0, zIndex: 4 }}>{children}</div>
    </div>
  );
}

/* --- Type roles this deck defines for itself ------------------------------ */

/** The three moments the voice stops narrating: the question, the number, the
 *  motion. Nothing else in the deck is allowed to shout. */
const CONDENSED: CSSProperties = {
  fontFamily: "var(--cc-font-condensed)",
  fontWeight: 700,
  textTransform: "uppercase",
  lineHeight: 0.94,
  letterSpacing: "-0.004em",
  color: "var(--cc-ivory)",
  margin: 0,
};

const TONES = {
  ivory: "var(--cc-ivory)",
  parchment: "var(--cc-parchment)",
  gold: "var(--cc-gold-bright)",
  muted: "var(--cc-muted)",
};

/** One line of the talking. An empty string is a beat of silence, which the
 *  copy uses as punctuation and which a paragraph could not express. */
export type Line =
  | string
  | { text: string; size?: number; tone?: keyof typeof TONES; italic?: boolean };

function Narration({ lines, size = 46 }: { lines: Line[]; size?: number }) {
  return (
    <>
      {lines.map((line, i) => {
        const l = typeof line === "string" ? { text: line } : line;
        if (!l.text) return <div key={i} style={{ height: Math.round(size * 0.62) }} />;
        return (
          <p
            key={i}
            style={{
              margin: 0,
              marginTop: i === 0 ? 0 : Math.round((l.size ?? size) * 0.3),
              fontFamily: "var(--cc-font-display)",
              fontWeight: 400,
              fontStyle: l.italic ? "italic" : "normal",
              fontSize: l.size ?? size,
              lineHeight: 1.3,
              letterSpacing: "-0.005em",
              color: TONES[l.tone ?? "ivory"],
            }}
          >
            {l.text}
          </p>
        );
      })}
    </>
  );
}

/** Where the reader is, and how far to the motion. It counts to nine even
 *  though the ninth page carries no counter of its own: on slide 8 a reader
 *  needs to know there is one page left, not that they have reached the end. */
function Counter({ n, of }: { n: number; of: number }) {
  return (
    <div
      className="kicker ce-on-art"
      style={{
        position: "absolute",
        left: MARGIN,
        top: 92,
        fontSize: 15,
        letterSpacing: "0.3em",
        color: "var(--cc-gold-deep)",
      }}
    >
      {String(n).padStart(2, "0")} <span style={{ opacity: 0.6 }}>/</span>{" "}
      {String(of).padStart(2, "0")}
    </div>
  );
}

/** The sourced number, under the rule, subordinate to the talking above it by
 *  construction: small, gold, set in caps, never more than two lines. */
function Footnote({ children }: { children: ReactNode }) {
  return (
    <div
      className="ce-on-art"
      style={{
        position: "absolute",
        left: MARGIN,
        top: RULE + 44,
        width: 780,
        fontFamily: "var(--cc-font-ui)",
        fontWeight: 600,
        fontSize: 19,
        letterSpacing: "0.09em",
        lineHeight: 1.75,
        textTransform: "uppercase",
        color: "var(--cc-gold)",
      }}
    >
      {children}
    </div>
  );
}

/** The credit for the plate, bottom right, at the smallest size in the deck.
 *  See .ce-label in slides.css for why every picture carries one. */
function WallLabel({ plate }: { plate: Plate }) {
  return (
    <div className="ce-label ce-on-art">
      <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: "0.13em", lineHeight: 1.5 }}>
        {plate.label[0]}
      </div>
      <div style={{ fontWeight: 500, fontSize: 13, letterSpacing: "0.1em", opacity: 0.78 }}>
        {plate.label[1]}
      </div>
    </div>
  );
}

/* --- The slides ----------------------------------------------------------- */

/** 1 to 8. A beat of the case: the talking, and the sourced number under the
 *  rule if there is one. The block is bottom-anchored so its last line lands
 *  on the division however long it runs. */
export function Beat({
  plate,
  crop,
  n,
  of,
  lines,
  size,
  shout,
  footnote,
  cta,
}: {
  plate?: Plate;
  crop?: Crop;
  n: number;
  of: number;
  lines: Line[];
  size?: number;
  /** the words this beat is allowed to shout, set above the lines */
  shout?: { lines: string[]; size: number };
  footnote?: ReactNode;
  /** the swipe instruction, under the rule. Unlike the sibling deck it sits on
   *  slide 1, because slide 1 here is a question rather than an offer, and a
   *  question has to promise that an answer is coming. Only one beat has it. */
  cta?: string;
}) {
  return (
    <Ground plate={plate} crop={crop}>
      <Counter n={n} of={of} />
      <div
        className="ce-on-art"
        style={{ position: "absolute", left: MARGIN, width: 856, bottom: H - TEXT_BASE }}
      >
        {shout && (
          <div style={{ marginBottom: 34 }}>
            {shout.lines.map((line) => (
              <div key={line} style={{ ...CONDENSED, fontSize: shout.size }}>
                {line}
              </div>
            ))}
          </div>
        )}
        <Narration lines={lines} size={size} />
      </div>
      <hr className="ce-rule" style={{ top: RULE }} />
      {footnote && <Footnote>{footnote}</Footnote>}
      {cta && (
        <div
          className="kicker ce-on-art"
          style={{
            position: "absolute",
            left: MARGIN,
            top: RULE + 44,
            fontSize: 19,
            letterSpacing: "0.2em",
          }}
        >
          {cta}
        </div>
      )}
      {plate && <WallLabel plate={plate} />}
    </Ground>
  );
}

/** 9. THE MOTION, AND THE INVITATION.
 *
 *  The last page of the argument and the only printed one: the motion in full,
 *  verbatim, over the plate the deck opened on, and a cream band under it
 *  carrying the night. It is the page that has to work alone if somebody
 *  screenshots it or it goes out as a single image, so it repeats the venue
 *  and the tickets rather than assuming anybody swiped from the start.
 *
 *  The band says "this Sunday" and prints the date underneath it. The phrase
 *  is what makes the deck an invitation instead of a conclusion; the date is
 *  what makes it useful to somebody who finds it on Saturday. */
export function Motion({
  plate,
  crop,
  badge,
  motion,
  note,
  invitation,
  when,
  lines,
  cta,
}: {
  plate: Plate;
  crop: Crop;
  badge: string;
  motion: string[];
  note: string;
  invitation: string;
  when: string;
  lines: string[];
  /** the closing call, one line per instruction. "Link in bio" is the second
   *  of them because a carousel cannot carry a link: the page has to say where
   *  the link is, and it says it last, under everything it is a link to. */
  cta: string[];
}) {
  const BAND = 404;
  return (
    <Ground plate={plate} crop={crop}>
      <div style={{ position: "absolute", left: MARGIN, top: 88 }}>
        <Lockup width={248} artwork="left" />
        <div
          className="kicker ce-on-art"
          style={{ marginTop: 28, fontSize: 15, letterSpacing: "0.32em" }}
        >
          Debate Club #10
        </div>
      </div>

      <div
        className="ce-on-art"
        style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: BAND + 72 }}
      >
        <div
          className="kicker"
          style={{ fontSize: 15, letterSpacing: "0.32em", marginBottom: 22 }}
        >
          This club believes
        </div>
        {motion.map((line) => (
          // The motion is set in the display serif, not in the condensed caps
          // the rest of the deck shouts in, and this is the one place this deck
          // departs from its sibling.
          //
          // The first motion is six words. Poster caps are built for six words:
          // three lines at 92px and it reads as a hit. This one is sixteen, and
          // sixteen words of bold condensed uppercase stop being a headline and
          // become a paragraph delivered at a shout. It is also a sentence with
          // a clause in it, "rather than merely adapt to it", and caps flatten
          // exactly the kind of grammar that clause depends on.
          //
          // So it is set the way the deck says everything else it means: 64px
          // Playfair, sentence case, as written. Bigger per line than the caps
          // were, easier to read, and still the loudest thing on the page.
          <div
            key={line}
            style={{
              margin: 0,
              fontFamily: "var(--cc-font-display)",
              fontWeight: 600,
              fontSize: 64,
              lineHeight: 1.16,
              letterSpacing: "-0.015em",
              color: "var(--cc-ivory)",
            }}
          >
            {line}
          </div>
        ))}
        <div
          style={{
            marginTop: 24,
            fontFamily: "var(--cc-font-ui)",
            fontSize: 20,
            color: "var(--cc-muted)",
          }}
        >
          {note}
        </div>
      </div>

      <div
        className="ce-band"
        style={{
          height: BAND,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: MARGIN,
          paddingRight: MARGIN,
          boxSizing: "border-box",
        }}
      >
        <div>
          <div style={{ fontFamily: "var(--cc-font-display)", fontSize: 44, lineHeight: 1.24 }}>
            {invitation}
          </div>
          <div
            className="ce-band-meta"
            style={{ marginTop: 14, fontSize: 15, letterSpacing: "0.11em" }}
          >
            {when}
          </div>
          <hr className="ce-band-line" style={{ margin: "26px 0 22px", width: 460 }} />
          {lines.map((line) => (
            <div
              key={line}
              className="ce-band-meta"
              style={{ fontSize: 15, letterSpacing: "0.11em", lineHeight: 1.72 }}
            >
              {line}
            </div>
          ))}
          <div className="ce-band-cta" style={{ marginTop: 20 }}>
            {cta.map((line) => (
              <div key={line} style={{ fontSize: 18, letterSpacing: "0.26em", lineHeight: 1.5 }}>
                {line}
              </div>
            ))}
          </div>
        </div>
        <img
          className="ce-badge"
          src={badge}
          alt="Bengaluru Tech Week 2026, official member event"
          width={300}
        />
      </div>
    </Ground>
  );
}
