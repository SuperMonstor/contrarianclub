import type { ReactNode } from "react";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Six slides announcing the first Open Floor Debate, and explaining the
// format. This deck is not an argument, it is an explainer, so it is built
// the opposite way round from the debate carousels: the job is not to move
// anyone, it is to answer the question that stops people coming.
//
// That question is "do I have to speak?". It is slide 2, not a footnote.
//
// The grammar, so the six slides feel like one object:
//
//   Masthead     every slide carries the same one: lockup at the left, the
//                slide's number at the right in gold against the total in
//                muted. It reads as a document you are working through, and
//                it tells a scroller there is more to swipe.
//
//   Picture      slides 1, 2 and 6. A painting full-bleed, type inside it.
//                These are the frame: the announcement, the reassurance, the
//                invite. Ceremonial.
//
//   Ledger       slides 3, 4 and 5. No image at all. Flat near-black, set
//                like a printed programme. These are the ones that have to be
//                READ, and a painting behind a numbered sequence fights the
//                reading. Going flat is the decision, not the shortcut.
//
// Accent: gold, everywhere, and only gold. The one place a second colour
// would be natural is slide 2, to tell speaking from watching apart. It is
// deliberately not used. The whole point of that slide is that the two
// options are equal, so they get identical weight, identical colour, and a
// symmetrical layout. The form carries the argument.

const GOLD = "var(--cc-gold)";
const TOTAL = 6;

const SHADOW =
  "0 1px 2px rgba(0,0,0,0.92), 0 2px 14px rgba(0,0,0,0.8), 0 5px 44px rgba(0,0,0,0.66)";

/** What every slide of this deck can say. */
export interface Copy {
  kicker?: string;
  title?: string;
  oneLiner?: string;
  closing?: string;
  image?: { src: string; position?: string };
}

/** The masthead, identical on all six. `n` is 1-based. */
function Masthead({ n, width = 176 }: { n: number; width?: number }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Lockup width={width} />
      <span
        style={{
          fontFamily: "var(--cc-font-ui)",
          fontWeight: 600,
          fontSize: 17,
          letterSpacing: "0.18em",
          color: "var(--cc-faint)",
        }}
      >
        <span style={{ color: GOLD }}>{String(n).padStart(2, "0")}</span>
        {" / "}
        {String(TOTAL).padStart(2, "0")}
      </span>
    </header>
  );
}

/** A hairline that starts solid gold at the left and fades out. */
function Rule({ width = "100%" }: { width?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", width }}>
      <span style={{ width: 46, height: 2, background: GOLD, flexShrink: 0 }} />
      <span
        style={{
          flex: 1,
          height: 1,
          background: `linear-gradient(90deg, ${GOLD}, transparent)`,
          opacity: 0.42,
        }}
      />
    </div>
  );
}

/** The shell every picture slide shares: art, wash, scrim, masthead, and a
 *  content block driven to the foot of the slide where the scrim is darkest. */
function Picture({
  n,
  image,
  scrim,
  imgClass = "ofd-art-lift",
  children,
}: {
  n: number;
  image: { src: string; position?: string };
  scrim: string;
  imgClass?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <img
        className={imgClass}
        src={image.src}
        alt=""
        style={{ objectPosition: image.position ?? "center 45%" }}
      />
      <div className="art-tone" />
      <div className={scrim} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          padding: "88px 84px 84px",
          textShadow: SHADOW,
        }}
      >
        <Masthead n={n} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** The shell every ledger slide shares. Flat black, generous margins, the
 *  same masthead, and a rule under the heading block. */
function Ledger({
  n,
  kicker,
  title,
  titleSize = 74,
  children,
  footer,
}: {
  n: number;
  kicker: string;
  title: string;
  titleSize?: number;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        padding: "88px 84px 84px",
      }}
    >
      <Masthead n={n} />

      <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 54 }}>
        <span className="kicker" style={{ fontSize: 18, letterSpacing: "0.34em" }}>
          {kicker}
        </span>
        <h1
          className="hero"
          style={{
            fontSize: titleSize,
            lineHeight: 1.04,
            letterSpacing: "-0.016em",
            margin: 0,
            maxWidth: "17ch",
          }}
        >
          {title}
        </h1>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {children}
      </div>

      {footer}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. The announcement.
// ---------------------------------------------------------------------------

export function Cover({ copy }: { copy: Copy }) {
  return (
    <Picture n={1} image={copy.image!} scrim="ofd-cover-scrim">
      <span
        className="kicker"
        style={{ fontSize: 20, letterSpacing: "0.44em", paddingLeft: "0.44em" }}
      >
        {copy.kicker}
      </span>

      <h1
        style={{
          fontFamily: "var(--cc-font-condensed)",
          fontWeight: 700,
          textTransform: "uppercase",
          fontSize: 132,
          lineHeight: 0.9,
          letterSpacing: "-0.008em",
          color: "var(--cc-ivory)",
          margin: "26px 0 0",
          maxWidth: "9ch",
        }}
      >
        {copy.title}
      </h1>

      <div style={{ marginTop: 34, marginBottom: 26 }}>
        <Rule width="320px" />
      </div>

      <p
        className="one-liner"
        style={{ fontSize: 30, lineHeight: 1.46, margin: 0, maxWidth: "26ch" }}
      >
        {copy.oneLiner}
      </p>
    </Picture>
  );
}

// ---------------------------------------------------------------------------
// 2. The answer. The slide this deck exists for.
// ---------------------------------------------------------------------------

/** One of the two ways to be in the room. Both are rendered identically on
 *  purpose: any difference in weight would answer the question for you. */
function Option({ heading, body }: { heading: string; body: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <span
        style={{
          fontFamily: "var(--cc-font-condensed)",
          fontWeight: 700,
          textTransform: "uppercase",
          fontSize: 40,
          letterSpacing: "0.01em",
          lineHeight: 1.05,
          color: GOLD,
        }}
      >
        {heading}
      </span>
      <p
        style={{
          fontFamily: "var(--cc-font-ui)",
          fontSize: 24,
          lineHeight: 1.48,
          color: "var(--cc-parchment)",
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  );
}

export function Answer({
  copy,
  options,
}: {
  copy: Copy;
  options: { heading: string; body: string }[];
}) {
  const [left, right] = options;

  return (
    <Picture n={2} image={copy.image!} scrim="ofd-answer-scrim">
      <span className="kicker" style={{ fontSize: 18, letterSpacing: "0.36em" }}>
        {copy.kicker}
      </span>

      <h1
        className="hero"
        style={{
          fontSize: 82,
          lineHeight: 1.02,
          letterSpacing: "-0.02em",
          margin: "22px 0 0",
          maxWidth: "15ch",
        }}
      >
        {copy.title}
      </h1>

      {/* The two ways in, side by side and symmetrical. The seam is the whole
          idea: neither column is the recommended one. */}
      <div
        style={{
          marginTop: 52,
          display: "grid",
          gridTemplateColumns: "1fr 1px 1fr",
          gap: 40,
          alignItems: "start",
        }}
      >
        {left && <Option {...left} />}
        <div
          style={{
            alignSelf: "stretch",
            width: 1,
            background:
              "linear-gradient(180deg, transparent, rgba(200,162,74,0.55) 18%, rgba(200,162,74,0.55) 82%, transparent)",
          }}
        />
        {right && <Option {...right} />}
      </div>

      <span className="closing" style={{ fontSize: 26, marginTop: 46 }}>
        {copy.closing}
      </span>
    </Picture>
  );
}

// ---------------------------------------------------------------------------
// 3. What actually gets argued. The past motions do this better than a list
//    of categories would: they show the register, not just the subject.
// ---------------------------------------------------------------------------

export function Motions({
  copy,
  motions,
  footnote,
}: {
  copy: Copy;
  motions: string[];
  footnote: string;
}) {
  return (
    <Ledger
      n={3}
      kicker={copy.kicker!}
      title={copy.title!}
      // the footnote is anchored to the foot rather than trailing the list, so
      // the slide does not end in a band of dead space
      footer={
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Rule width="260px" />
          <p
            className="one-liner"
            style={{ fontSize: 26, lineHeight: 1.5, margin: 0, maxWidth: "34ch" }}
          >
            {footnote}
          </p>
        </div>
      }
    >
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 34,
        }}
      >
        {motions.map((m, i) => (
          <li key={i} style={{ display: "flex", gap: 26, alignItems: "flex-start" }}>
            <span
              style={{
                fontFamily: "var(--cc-font-display)",
                fontSize: 22,
                fontWeight: 600,
                color: GOLD,
                paddingTop: 8,
                minWidth: "2ch",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              style={{
                fontFamily: "var(--cc-font-display)",
                fontSize: 33,
                lineHeight: 1.3,
                letterSpacing: "-0.008em",
                color: "var(--cc-ivory)",
              }}
            >
              {m}
            </span>
          </li>
        ))}
      </ul>
    </Ledger>
  );
}

// ---------------------------------------------------------------------------
// 4. The format, as a sequence. Numbered because it happens in an order and
//    the order is the thing people are unsure about.
// ---------------------------------------------------------------------------

export function Format({
  copy,
  steps,
}: {
  copy: Copy;
  steps: { label: string; body: string }[];
}) {
  return (
    <Ledger
      n={4}
      kicker={copy.kicker!}
      title={copy.title!}
      titleSize={66}
      footer={
        <span className="closing" style={{ fontSize: 25 }}>
          {copy.closing}
        </span>
      }
    >
      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        {steps.map((s, i) => (
          <li
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "62px 1fr",
              gap: 22,
              alignItems: "baseline",
              paddingBottom: 24,
              borderBottom:
                i === steps.length - 1 ? "none" : "1px solid rgba(200,162,74,0.16)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--cc-font-condensed)",
                fontWeight: 700,
                fontSize: 34,
                color: GOLD,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span
                style={{
                  fontFamily: "var(--cc-font-display)",
                  fontWeight: 700,
                  fontSize: 31,
                  lineHeight: 1.16,
                  letterSpacing: "-0.01em",
                  color: "var(--cc-ivory)",
                }}
              >
                {s.label}
              </span>
              <span
                style={{
                  fontFamily: "var(--cc-font-ui)",
                  fontSize: 23,
                  lineHeight: 1.46,
                  color: "var(--cc-parchment)",
                }}
              >
                {s.body}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </Ledger>
  );
}

// ---------------------------------------------------------------------------
// 5. The second worry, after "must I speak": am I going to be out of my
//    depth. One word answers it, so one word gets the whole slide.
// ---------------------------------------------------------------------------

export function Bring({ copy, points }: { copy: Copy; points: string[] }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        padding: "88px 84px 84px",
      }}
    >
      <Masthead n={5} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 40,
        }}
      >
        <span className="kicker" style={{ fontSize: 18, letterSpacing: "0.34em" }}>
          {copy.kicker}
        </span>

        <h1
          style={{
            fontFamily: "var(--cc-font-condensed)",
            fontWeight: 700,
            textTransform: "uppercase",
            fontSize: 200,
            lineHeight: 0.84,
            letterSpacing: "-0.01em",
            color: "var(--cc-ivory)",
            margin: 0,
          }}
        >
          {copy.title}
        </h1>

        <Rule width="300px" />

        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {points.map((p, i) => (
            <li
              key={i}
              style={{
                fontFamily: "var(--cc-font-ui)",
                fontSize: 27,
                lineHeight: 1.4,
                color: "var(--cc-parchment)",
              }}
            >
              {p}
            </li>
          ))}
        </ul>

        {/* kept inside the centred group rather than pinned to the foot: this
            slide's content is short, and anchoring it low would leave a hole
            in the middle of the slide */}
        <p
          className="one-liner"
          style={{ fontSize: 26, lineHeight: 1.5, margin: "18px 0 0", maxWidth: "32ch" }}
        >
          {copy.oneLiner}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. The invite. Closes on the same two options slide 2 opened with.
// ---------------------------------------------------------------------------

export function Invite({
  copy,
  details,
}: {
  copy: Copy;
  details: { label: string; value: string }[];
}) {
  return (
    <Picture
      n={6}
      image={copy.image!}
      scrim="ofd-invite-scrim"
      imgClass="ofd-art-bright"
    >
      <span
        className="kicker"
        style={{ fontSize: 18, letterSpacing: "0.4em", paddingLeft: "0.4em" }}
      >
        {copy.kicker}
      </span>

      <h1
        style={{
          fontFamily: "var(--cc-font-condensed)",
          fontWeight: 700,
          textTransform: "uppercase",
          fontSize: 112,
          lineHeight: 0.92,
          letterSpacing: "-0.006em",
          color: "var(--cc-ivory)",
          margin: "22px 0 0",
          maxWidth: "10ch",
        }}
      >
        {copy.title}
      </h1>

      {/* the details on a plate, so the slide reads as an invitation card */}
      <div
        style={{
          marginTop: 40,
          padding: "32px 40px",
          border: "1px solid rgba(200,162,74,0.34)",
          background: "rgba(11,9,7,0.52)",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 22,
        }}
      >
        {details.map((d, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <span className="label" style={{ fontSize: 13, letterSpacing: "0.22em" }}>
              {d.label}
            </span>
            <span className="value" style={{ fontSize: 26, lineHeight: 1.2 }}>
              {d.value}
            </span>
          </div>
        ))}
      </div>

      <span className="closing" style={{ fontSize: 28, marginTop: 36 }}>
        {copy.closing}
      </span>
    </Picture>
  );
}
