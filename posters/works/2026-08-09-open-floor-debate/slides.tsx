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
  image?: {
    src: string;
    position?: string;
    /** Which way this painting has to be pushed to sit in the palette. The
     *  candlelit ones are already dark and need lifting; the fresco is pale
     *  plaster and needs the standard darkening. It travels with the image
     *  rather than the slide, so the two can be swapped freely. */
    treatment?: "lift" | "bright";
  };
}

/** The treated painting, full-bleed behind a slide. */
function Backdrop({ image }: { image: NonNullable<Copy["image"]> }) {
  return (
    <img
      className={image.treatment === "bright" ? "ofd-art-bright" : "ofd-art-lift"}
      src={image.src}
      alt=""
      style={{ objectPosition: image.position ?? "center 45%" }}
    />
  );
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
  children,
}: {
  n: number;
  image: NonNullable<Copy["image"]>;
  scrim: string;
  children: ReactNode;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Backdrop image={image} />
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
// 6. The poster. This one also ships on its own, away from the carousel, so
//    it cannot lean on any slide before it: the sell, the mechanic, the way
//    out for people who do not want to speak, and the logistics all have to
//    land here at a glance.
//
//    It is the one slide with no counter in its masthead. A standalone poster
//    carrying "06 / 06" would be advertising that you are seeing part of
//    something else.
// ---------------------------------------------------------------------------

/** The collaboration lockup: both marks at equal optical weight, meeting at a
 *  gold cross. Sized off a shared height rather than a shared width, since one
 *  mark is wide and the other nearly square. */
function CoBrand({ partner, height = 116 }: { partner: string; height?: number }) {
  const PARTNER_RATIO = 935 / 701;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 46 }}>
      <Lockup width={height * (745 / 346) * 1.02} />
      <span
        style={{
          fontFamily: "var(--cc-font-display)",
          fontSize: 34,
          color: GOLD,
          opacity: 0.75,
          transform: "translateY(-2px)",
        }}
      >
        &times;
      </span>
      <img
        src={partner}
        alt="Basecamp"
        height={height * 0.84}
        width={height * 0.84 * PARTNER_RATIO}
        style={{ display: "block" }}
      />
    </div>
  );
}

/** The three marks in the format block's left column.
 *
 *  Drawn rather than numbered: these three points are not a sequence, they are
 *  three separate things that are true about the night, and numbering them
 *  implied an order that does not exist. Thin gold strokes on an open
 *  counter, so they sit with the engraved hairlines rather than looking like
 *  UI dropped onto a poster.
 *
 *  seal    the topic, sealed until the night
 *  scales  a question with two sides worth arguing
 *  voices  more than one person talking */
export type IconName = "seal" | "scales" | "voices";

function Icon({ name, size = 46 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: GOLD,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: { display: "block", opacity: 0.9 },
  };

  if (name === "seal") {
    return (
      <svg {...common}>
        <rect x="3" y="8" width="26" height="17" rx="1.5" />
        <path d="M3 8.6 L16 18 L29 8.6" />
        <circle cx="16" cy="18" r="3.1" />
      </svg>
    );
  }

  if (name === "scales") {
    return (
      <svg {...common}>
        <path d="M16 7.5 V25.5" />
        <path d="M6 11 H26" />
        <path d="M11 25.8 H21" />
        <circle cx="16" cy="6" r="1.4" />
        <path d="M6 11 L2.8 17 M6 11 L9.2 17" />
        <path d="M2.4 17 A3.9 3.9 0 0 0 9.6 17" />
        <path d="M26 11 L22.8 17 M26 11 L29.2 17" />
        <path d="M22.4 17 A3.9 3.9 0 0 0 29.6 17" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="11" y="5" width="18" height="12.5" rx="3" />
      <rect x="3" y="13" width="18" height="12.5" rx="3" />
      <path d="M8.5 25.5 V29 L12.5 25.5" />
    </svg>
  );
}

/** One line of the format, hung off its mark in the left column.
 *
 *  The spine is the point of this block: someone who reads only the marks and
 *  the headings still comes away with when topics appear, what they are like,
 *  and that speaking is optional. The body copy is for the person who has
 *  already decided to care. */

/** One line of the checklist. Icon and words on the same centred line, so the
 *  three read as a run of credits rather than three little articles.
 *
 *  There is no body copy under these any more, and that is the point: nobody
 *  reads three paragraphs on a poster, they scan it. Each line has to survive
 *  on its own or it does not belong here. */
function Beat({ icon, label }: { icon: IconName; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <Icon name={icon} size={34} />
      <span
        style={{
          fontFamily: "var(--cc-font-condensed)",
          fontWeight: 700,
          textTransform: "uppercase",
          fontSize: 33,
          letterSpacing: "0.055em",
          lineHeight: 1.02,
          color: "var(--cc-ivory)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function Poster({
  copy,
  partner,
  beats,
  when,
  cta,
}: {
  copy: Copy;
  partner: string;
  beats: { icon: IconName; label: string }[];
  /** the date and the hours, set on one line and separated by a gold point */
  when: string[];
  cta: string;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Backdrop image={copy.image!} />
      <div className="art-tone" />
      <div className="ofd-poster-scrim" />

      {/* No rules, no plates, no boxes. The composition is carried by
          typography and the space around it, which is also what lets the
          chamber stay visible: every device removed is more painting. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "84px 76px 82px",
          textShadow: SHADOW,
        }}
      >
        <CoBrand partner={partner} />

        <div style={{ marginTop: 76 }}>
          <span
            className="kicker"
            style={{
              fontSize: 17,
              letterSpacing: "0.44em",
              paddingLeft: "0.44em",
              display: "block",
            }}
          >
            {copy.kicker}
          </span>

          <h1
            style={{
              fontFamily: "var(--cc-font-condensed)",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: 126,
              lineHeight: 0.88,
              letterSpacing: "-0.008em",
              color: "var(--cc-ivory)",
              margin: "22px 0 0",
            }}
          >
            {copy.title}
          </h1>

          <p
            style={{
              fontFamily: "var(--cc-font-display)",
              fontWeight: 400,
              fontSize: 34,
              lineHeight: 1.34,
              letterSpacing: "-0.008em",
              color: "var(--cc-ivory)",
              margin: "26px auto 0",
              maxWidth: "29ch",
            }}
          >
            {copy.oneLiner}
          </p>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 34,
          }}
        >
          {beats.map((b, i) => (
            <Beat key={i} {...b} />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontFamily: "var(--cc-font-display)",
              fontSize: 35,
              letterSpacing: "-0.006em",
              color: "var(--cc-ivory)",
            }}
          >
            {when.map((w, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {i > 0 && (
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      background: GOLD,
                      transform: "rotate(45deg)",
                    }}
                  />
                )}
                {w}
              </span>
            ))}
          </div>

          <span
            style={{
              fontFamily: "var(--cc-font-condensed)",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: 25,
              letterSpacing: "0.24em",
              paddingLeft: "0.24em",
              color: GOLD,
            }}
          >
            {cta}
          </span>
        </div>
      </div>
    </div>
  );
}
