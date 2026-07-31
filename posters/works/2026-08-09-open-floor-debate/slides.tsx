import type { ReactNode } from "react";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Seven slides for the first Open Floor Debate. The poster leads and a second
// poster closes, and the five slides between them explain the night in the
// club's own words.
//
// The grammar, deliberately looser than the debate carousels:
//
//   Posters      slides 1 and 7. Centred, ceremonial, the co-brand up top.
//                Slide 1 carries a swipe cue; slide 7 carries the call to
//                action. Same room behind both, so the deck bookends.
//
//   Statements   slides 2, 3, 5. A painting, and one block of talking ranged
//                left at the foot of the slide. Nothing above it, no label
//                introducing it, no line closing it off.
//
//   Black        slides 4 and 6. The mechanics and the reassurance. Flat
//                ground, because these two get read rather than looked at.
//
// What is deliberately absent, having been tried and cut: kickers over the
// headings, ceremonial closing lines under them, and a slide counter. Each was
// a frame around the content rather than the content, and together they made
// the deck read as filled in rather than written. The copy is the club's own
// phrasing, contractions included. It is not to be tidied.

const GOLD = "var(--cc-gold)";

const SHADOW =
  "0 1px 2px rgba(0,0,0,0.92), 0 2px 14px rgba(0,0,0,0.8), 0 5px 44px rgba(0,0,0,0.66)";

export interface Art {
  src: string;
  position?: string;
  /** dark canvases get lifted, pale ones get pushed down */
  treatment?: "lift" | "bright";
}

function Backdrop({ art }: { art: Art }) {
  return (
    <img
      className={art.treatment === "bright" ? "ofd-art-bright" : "ofd-art-lift"}
      src={art.src}
      alt=""
      style={{ objectPosition: art.position ?? "center 45%" }}
    />
  );
}

/** The quiet brand mark the interior slides carry, so a screenshot of any one
 *  of them still says who is running this. */
function Mark() {
  return (
    <div style={{ display: "flex" }}>
      <Lockup width={168} />
    </div>
  );
}

/** The cue at the foot of every slide but the last, naming what is coming so
 *  a reader has a reason to keep going rather than deciding they have the gist
 *  three slides in. */
function NextCue({ text, align = "flex-start" }: { text: string; align?: "flex-start" | "center" }) {
  return (
    <div style={{ display: "flex", justifyContent: align }}>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: "var(--cc-font-ui)",
          fontWeight: 500,
          fontSize: 18,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--cc-muted)",
        }}
      >
        {text}
        <span style={{ color: GOLD, fontSize: 21 }}>&rarr;</span>
      </span>
    </div>
  );
}

/** Pull a phrase out in gold, for naming things inside a sentence. */
export function G({ children }: { children: ReactNode }) {
  return <span style={{ color: GOLD }}>{children}</span>;
}

// ---------------------------------------------------------------------------
// Marks used on the posters
// ---------------------------------------------------------------------------

export type IconName = "seal" | "scales" | "voices";

function Icon({ name, size = 34 }: { name: IconName; size?: number }) {
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

/** Both marks at equal optical weight, meeting at a gold cross. Not equal
 *  size: the partner is a heavy sans and ours is a thin serif, so matched
 *  heights let theirs dominate. */
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

/** The date and the hours on one line, with the ticket line under it. Shared
 *  by both posters so they close the same way. */
function Footer({
  when,
  cta,
  ctaSize = 25,
  children,
}: {
  when: string[];
  cta: string;
  ctaSize?: number;
  children?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
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
              <span style={{ width: 5, height: 5, background: GOLD, transform: "rotate(45deg)" }} />
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
          fontSize: ctaSize,
          letterSpacing: "0.22em",
          paddingLeft: "0.22em",
          color: GOLD,
        }}
      >
        {cta}
      </span>

      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. The poster, which also ships on its own.
// ---------------------------------------------------------------------------

export function Poster({
  art,
  partner,
  title,
  tagline,
  checklist,
  when,
  cta,
  swipeHint,
}: {
  art: Art;
  partner: string;
  title: string;
  tagline: string;
  checklist: { icon: IconName; label: string }[];
  when: string[];
  cta: string;
  /** the cue that there is more to swipe. Carousel only. */
  swipeHint?: string;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Backdrop art={art} />
      <div className="art-tone" />
      <div className="ofd-poster-scrim" />

      {/* No rules, no plates, no boxes. Typography and the space around it,
          which is also what keeps the chamber visible. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "84px 76px 74px",
          textShadow: SHADOW,
        }}
      >
        <CoBrand partner={partner} />

        <div style={{ marginTop: 66 }}>
          <span
            className="kicker"
            style={{
              fontSize: 17,
              letterSpacing: "0.44em",
              paddingLeft: "0.44em",
              display: "block",
            }}
          >
            Presents
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
            {title}
          </h1>

          <p
            style={{
              fontFamily: "var(--cc-font-display)",
              fontSize: 34,
              lineHeight: 1.34,
              letterSpacing: "-0.008em",
              color: "var(--cc-ivory)",
              margin: "16px auto 0",
              maxWidth: "29ch",
            }}
          >
            {tagline}
          </p>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 32,
          }}
        >
          {checklist.map((it, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}
            >
              <Icon name={it.icon} />
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
                {it.label}
              </span>
            </div>
          ))}
        </div>

        <Footer when={when} cta={cta}>
          {swipeHint && (
            <span
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontFamily: "var(--cc-font-ui)",
                fontWeight: 500,
                fontSize: 18,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--cc-muted)",
              }}
            >
              {swipeHint}
              <span style={{ color: GOLD, fontSize: 21 }}>&rarr;</span>
            </span>
          )}
        </Footer>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2, 3, 5. Talking, over a painting.
// ---------------------------------------------------------------------------

/** One block of speech at the foot of a painting. The lead sentence is set
 *  large, anything after it drops to a reading size. Nothing labels it and
 *  nothing closes it off: it is just someone telling you how the night works. */
export function Statement({
  art,
  lead,
  rest,
  next,
  leadSize = 58,
}: {
  art: Art;
  lead: ReactNode;
  rest?: ReactNode;
  next?: string;
  leadSize?: number;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Backdrop art={art} />
      <div className="art-tone" />
      <div className="ofd-statement-scrim" />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          padding: "84px 78px 84px",
          textShadow: SHADOW,
        }}
      >
        <Mark />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 28,
          }}
        >
          <p
            style={{
              fontFamily: "var(--cc-font-display)",
              fontWeight: 500,
              fontSize: leadSize,
              lineHeight: 1.14,
              letterSpacing: "-0.016em",
              color: "var(--cc-ivory)",
              margin: 0,
              maxWidth: "19ch",
            }}
          >
            {lead}
          </p>

          {rest && (
            <p
              style={{
                fontFamily: "var(--cc-font-display)",
                fontSize: 30,
                lineHeight: 1.42,
                letterSpacing: "-0.006em",
                color: "var(--cc-parchment)",
                margin: 0,
                maxWidth: "32ch",
              }}
            >
              {rest}
            </p>
          )}
        </div>

        {next && (
          <div style={{ marginTop: 34 }}>
            <NextCue text={next} />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. How the night runs.
// ---------------------------------------------------------------------------

export function Sequence({
  art,
  lead,
  steps,
  note,
  next,
}: {
  art: Art;
  lead: string;
  steps: string[];
  note: ReactNode;
  next?: string;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Backdrop art={art} />
      <div className="art-tone" />
      <div className="ofd-sequence-scrim" />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          padding: "84px 78px 84px",
          textShadow: SHADOW,
        }}
      >
        <Mark />

        <p
          style={{
            fontFamily: "var(--cc-font-display)",
            fontWeight: 500,
            fontSize: 56,
            lineHeight: 1.12,
            letterSpacing: "-0.016em",
            color: "var(--cc-ivory)",
            margin: "40px 0 0",
            maxWidth: "17ch",
          }}
        >
          {lead}
        </p>

        {/* The run of the night as one continuous thread rather than a bulleted
            list. The numeral sits inside the spine, so the eye follows a single
            gold line from the announcement to the open floor: the shape of the
            evening is the graphic. */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", paddingTop: 26 }}>
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "stretch", gap: 26 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: 42,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 42,
                      height: 42,
                      flexShrink: 0,
                      borderRadius: "50%",
                      border: `1px solid ${GOLD}`,
                      background: "rgba(11,9,7,0.72)",
                      fontFamily: "var(--cc-font-condensed)",
                      fontWeight: 700,
                      fontSize: 19,
                      color: GOLD,
                      boxSizing: "border-box",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {i < steps.length - 1 && (
                    <span style={{ flex: 1, width: 1, background: "rgba(200,162,74,0.5)" }} />
                  )}
                </div>
                <span
                  style={{
                    fontFamily: "var(--cc-font-display)",
                    fontSize: 32,
                    lineHeight: 1.2,
                    color: "var(--cc-ivory)",
                    paddingTop: 4,
                    paddingBottom: i < steps.length - 1 ? 30 : 0,
                  }}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p
          style={{
            fontFamily: "var(--cc-font-display)",
            fontSize: 30,
            lineHeight: 1.42,
            color: "var(--cc-parchment)",
            margin: "0 0 34px",
            maxWidth: "34ch",
          }}
        >
          {note}
        </p>

        {next && <NextCue text={next} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. The close. Same room as slide 1, so the deck ends where it started.
// ---------------------------------------------------------------------------

export function Closing({
  art,
  partner,
  pitch,
  when,
  cta,
}: {
  art: Art;
  partner: string;
  pitch: ReactNode;
  when: string[];
  cta: string;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Backdrop art={art} />
      <div className="art-tone" />
      <div className="ofd-poster-scrim" />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "84px 76px 78px",
          textShadow: SHADOW,
        }}
      >
        <CoBrand partner={partner} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--cc-font-display)",
              fontWeight: 500,
              fontSize: 47,
              lineHeight: 1.24,
              letterSpacing: "-0.014em",
              color: "var(--cc-ivory)",
              margin: "0 auto",
              maxWidth: "22ch",
            }}
          >
            {pitch}
          </p>
        </div>

        <Footer when={when} cta={cta} ctaSize={29} />
      </div>
    </div>
  );
}
