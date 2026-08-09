import type { ReactNode } from "react";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Ten slides recapping Debate #8: two motions, and what each one did to the
// room. The whole deck exists to land one comparison, so the grammar is built
// around making the before and after slides directly comparable.
//
//   Bookends     slides 1 and 10. A painting, the co-brand, centred type. The
//                only two slides that carry Basecamp.
//
//   Motion       slides 2 and 6. A painting chosen for the motion, and the
//                motion itself set at the foot. These are the only slides
//                where the argument is stated rather than measured.
//
//   Result       slides 3, 4, 7, 8. Flat ground. The seven point distribution
//                from the live poll, drawn exactly as the presenter display
//                draws it on the night: bars scaled against the tallest, the
//                signed scale value under each, the two sides named at the
//                foot. Before and after use identical geometry and identical
//                bar scaling so the change is visible by eye alone.
//
//   Swing        slides 5 and 9. Flat ground. The before and after averages as
//                two markers on one axis, then how the room split three ways.
//
// Vote counts are deliberately absent. Movement is given as a share of the
// people who voted in both rounds, which is the honest denominator and the
// only one that survives an audience that grew between rounds.
//
// The art, all public domain via Wikimedia Commons:
//
//   1      room        a photograph of the actual night, and the only one in
//                      the deck. It opens in the real room; the close is
//                      painted, so the deck ends in the imagined one.
//   10     chamber     Hayter, The House of Commons 1833
//   2      cradle      Morisot, The Cradle
//   6      illmatched  Cranach the Elder, Ill-Matched Lovers. Five centuries
//                      old and still the exact stigma the motion is about,
//                      which is the point of putting it there.

const GOLD = "var(--cc-gold)";
const GOLD_BRIGHT = "var(--cc-gold-bright)";
const WINE = "var(--cc-wine-bright)";

const SHADOW =
  "0 1px 2px rgba(0,0,0,0.92), 0 2px 14px rgba(0,0,0,0.8), 0 5px 44px rgba(0,0,0,0.66)";

export interface Art {
  src: string;
  position?: string;
  /** dark canvases get lifted, pale ones get pushed down, the photograph gets
   *  most of its colour taken away */
  treatment?: "lift" | "bright" | "photo";
}

const ART_CLASS = {
  lift: "r8-art-lift",
  bright: "r8-art-bright",
  photo: "r8-art-photo",
} as const;

function Backdrop({ art }: { art: Art }) {
  return (
    <img
      className={ART_CLASS[art.treatment ?? "lift"]}
      src={art.src}
      alt=""
      style={{ objectPosition: art.position ?? "center 45%" }}
    />
  );
}

/** The quiet brand mark every interior slide carries, so a screenshot of any
 *  one of them still says who ran this. */
function Mark() {
  return (
    <div style={{ display: "flex" }}>
      <Lockup width={168} />
    </div>
  );
}

/** Both marks at equal optical weight, meeting at a gold cross. */
function CoBrand({ partner, height = 108 }: { partner: string; height?: number }) {
  const PARTNER_RATIO = 935 / 701;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 44 }}>
      <Lockup width={height * (745 / 346) * 1.02} />
      <span
        style={{
          fontFamily: "var(--cc-font-display)",
          fontSize: 32,
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

function Kicker({ text, align = "left" }: { text: string; align?: "left" | "center" }) {
  return (
    <span
      className="kicker"
      style={{
        display: "block",
        fontSize: 17,
        letterSpacing: "0.34em",
        paddingLeft: align === "center" ? "0.34em" : 0,
        textAlign: align,
      }}
    >
      {text}
    </span>
  );
}

/** Pull a phrase out in gold. */
export function G({ children }: { children: ReactNode }) {
  return <span style={{ color: GOLD }}>{children}</span>;
}

// ---------------------------------------------------------------------------
// 1. The cover.
// ---------------------------------------------------------------------------

export function Cover({
  art,
  partner,
  title,
  subtitle,
  context,
  swipeHint,
}: {
  art: Art;
  partner: string;
  title: string;
  subtitle: string;
  /** how the night ran, one beat per line. It sits here rather than on the
   *  first motion slide, because a cover that only names itself gives a
   *  scroller no reason to stop, and because these mechanics belong to the
   *  whole evening rather than to one motion. Set as separate lines, not a
   *  paragraph: three facts in a block of justified serif read as something
   *  to get through rather than three facts. */
  context: string[];
  swipeHint: string;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Backdrop art={art} />
      <div className="art-tone" />
      <div className={art.treatment === "photo" ? "r8-photo-scrim" : "r8-cover-scrim"} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "88px 76px 78px",
          textShadow: SHADOW,
        }}
      >
        {/* The co-brand sits with the title rather than up in the corner: at
            the top of the slide it read as letterhead, and the two marks are
            the reason this night happened. Larger, and close enough to the
            wordmark that the eye takes all three in at once. */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ marginBottom: 54 }}>
            <CoBrand partner={partner} height={152} />
          </div>

          <h1
            style={{
              fontFamily: "var(--cc-font-condensed)",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: 168,
              lineHeight: 0.86,
              letterSpacing: "-0.01em",
              color: "var(--cc-ivory)",
              margin: 0,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontFamily: "var(--cc-font-display)",
              fontSize: 52,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              color: GOLD,
              margin: "18px 0 0",
            }}
          >
            {subtitle}
          </p>

          <span
            style={{
              width: 64,
              height: 1,
              background: "rgba(200,162,74,0.5)",
              margin: "40px auto 36px",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            {context.map((line, i) => (
              <p
                key={i}
                style={{
                  fontFamily: "var(--cc-font-display)",
                  fontSize: 31,
                  lineHeight: 1.3,
                  letterSpacing: "-0.006em",
                  color: "var(--cc-parchment)",
                  margin: 0,
                  maxWidth: "27ch",
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "11px 26px",
            border: "1px solid rgba(200,162,74,0.3)",
            borderRadius: 999,
            background: "rgba(11,9,7,0.35)",
            fontFamily: "var(--cc-font-ui)",
            fontWeight: 500,
            fontSize: 16,
            letterSpacing: "0.2em",
            paddingLeft: "calc(26px + 0.2em)",
            textTransform: "uppercase",
            color: "var(--cc-parchment)",
          }}
        >
          {swipeHint}
          <span style={{ color: GOLD, fontSize: 20, transform: "translateY(-1px)" }}>&rarr;</span>
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2, 6. The motion.
// ---------------------------------------------------------------------------

export function Motion({
  art,
  kicker,
  intro,
  motion,
  motionSize = 50,
  note,
}: {
  art: Art;
  kicker: string;
  /** only where this particular motion needs explaining. The mechanics of the
   *  night live on the cover. */
  intro?: ReactNode;
  motion: string;
  motionSize?: number;
  note?: ReactNode;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Backdrop art={art} />
      <div className="art-tone" />
      <div className="r8-motion-scrim" />

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
            gap: 26,
          }}
        >
          {intro && (
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
              {intro}
            </p>
          )}

          <div>
            <Kicker text={kicker} />
            {/* The motion is the only thing on this slide that has to be read
                word for word, so it gets the largest type in the deck after
                the cover, and a gold rule to mark it as quoted rather than
                said. */}
            <div style={{ display: "flex", gap: 26, marginTop: 20 }}>
              <span
                style={{ width: 2, background: "rgba(200,162,74,0.55)", flexShrink: 0 }}
              />
              <p
                style={{
                  fontFamily: "var(--cc-font-display)",
                  fontWeight: 500,
                  fontSize: motionSize,
                  lineHeight: 1.16,
                  letterSpacing: "-0.016em",
                  color: "var(--cc-ivory)",
                  margin: 0,
                  maxWidth: "20ch",
                }}
              >
                {motion}
              </p>
            </div>
          </div>

          {note && (
            <p
              style={{
                fontFamily: "var(--cc-font-ui)",
                fontSize: 24,
                lineHeight: 1.45,
                color: "var(--cc-muted)",
                margin: 0,
                maxWidth: "38ch",
              }}
            >
              {note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3, 4, 7, 8. The distribution, drawn as the room saw it on the night.
// ---------------------------------------------------------------------------

const SCALE_VALUES = [-3, -2, -1, 0, 1, 2, 3];

function signed(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

export function Distribution({
  kicker,
  headline,
  counts,
  leftLabel,
  rightLabel,
  average,
  fact,
}: {
  kicker: string;
  /** the reading of the chart. This slide's title, not a caption under it. */
  headline: string;
  /** seven bars, in scale order from -3 to +3 */
  counts: number[];
  leftLabel: string;
  rightLabel: string;
  average: number;
  /** one thing this particular chart shows that the title does not. It has to
   *  be readable off the bars above it: a fact about some other round would be
   *  a second slide's worth of thinking on this one. */
  fact?: ReactNode;
}) {
  const max = Math.max(...counts);
  const total = counts.reduce((sum, count) => sum + count, 0);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="r8-flat" />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          padding: "84px 78px 84px",
        }}
      >
        <Mark />

        {/* Which round, then what the chart says. The motion is not repeated
            here: the slide before it stated the motion, and repeating it made
            the reader parse a paragraph before reaching the only new thing on
            the slide. One sentence at the top, then the evidence for it. */}
        <div style={{ marginTop: 40 }}>
          <Kicker text={kicker} />
          <h2
            style={{
              fontFamily: "var(--cc-font-display)",
              fontWeight: 500,
              fontSize: 58,
              lineHeight: 1.1,
              letterSpacing: "-0.018em",
              color: "var(--cc-ivory)",
              margin: "20px 0 0",
              maxWidth: "16ch",
            }}
          >
            {headline}
          </h2>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {/* Bars scaled against the tallest, as the presenter display does it,
              so the shape of the room is legible rather than the arithmetic.
              Each bar carries its own count above the fill: without it a
              distribution is a picture of proportions and the reader has no way
              to tell twenty people from five. The tallest bar stops at 88% to
              leave that number somewhere to sit. */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            {counts.map((count, i) => {
              const height = max === 0 ? 0 : Math.max(count === 0 ? 0 : 4, (count / max) * 88);
              return (
                <div
                  key={SCALE_VALUES[i]}
                  style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div
                    style={{
                      height: 470,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      border: "1px solid var(--cc-line)",
                      borderRadius: 3,
                      background: "rgba(244,234,210,0.06)",
                      padding: 8,
                      boxSizing: "border-box",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--cc-font-display)",
                        fontSize: 30,
                        lineHeight: 1,
                        textAlign: "center",
                        paddingBottom: 12,
                        color: count === 0 ? "var(--cc-faint)" : "var(--cc-ivory)",
                      }}
                    >
                      {count}
                    </span>
                    <div
                      style={{
                        width: "100%",
                        height: `${height}%`,
                        borderRadius: 3,
                        background: GOLD,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--cc-font-ui)",
                      fontWeight: 700,
                      fontSize: 22,
                      textAlign: "center",
                      color: GOLD_BRIGHT,
                    }}
                  >
                    {signed(SCALE_VALUES[i])}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 40,
              marginTop: 22,
              fontFamily: "var(--cc-font-ui)",
              fontSize: 21,
              color: "var(--cc-muted)",
            }}
          >
            <span>{leftLabel}</span>
            <span style={{ textAlign: "right" }}>{rightLabel}</span>
          </div>
        </div>

        {/* The one detail in the bars worth pointing at, marked with a rule
            rather than a label so it reads as an aside and not as a second
            headline. */}
        {fact && (
          <div style={{ display: "flex", gap: 22, marginBottom: 34 }}>
            <span style={{ width: 2, background: "rgba(200,162,74,0.5)", flexShrink: 0 }} />
            <p
              style={{
                fontFamily: "var(--cc-font-display)",
                fontSize: 27,
                lineHeight: 1.4,
                letterSpacing: "-0.006em",
                color: "var(--cc-parchment)",
                margin: 0,
                maxWidth: "36ch",
              }}
            >
              {fact}
            </p>
          </div>
        )}

        {/* Everything the chart cannot say itself, on one line. The average was
            a display number in its own block, which made the foot of the slide
            compete with the top of it. */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 32,
            borderTop: "1px solid var(--cc-line)",
            paddingTop: 26,
            fontFamily: "var(--cc-font-ui)",
            fontSize: 21,
            letterSpacing: "0.03em",
            color: "var(--cc-muted)",
          }}
        >
          <span>{total} voted in this round</span>
          <span>
            Average position{" "}
            <span style={{ color: GOLD_BRIGHT, fontWeight: 700 }}>{signed(average)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5, 9. The swing.
// ---------------------------------------------------------------------------

/** Map a -3..+3 position to a padded offset so a marker at an extreme stays
 *  inside the track instead of clipping the edge. Same padding the presenter
 *  display uses. */
function axisPercent(value: number) {
  const clamped = Math.max(-3, Math.min(3, value));
  return 6 + ((clamped + 3) / 6) * 88;
}

export function Swing({
  kicker,
  verdict,
  before,
  after,
  leftLabel,
  rightLabel,
  movements,
  reading,
  footnote,
}: {
  kicker: string;
  verdict: string;
  before: number;
  after: number;
  leftLabel: string;
  rightLabel: string;
  movements: { label: string; percent: number; tone: "gold" | "wine" | "muted" }[];
  reading: ReactNode;
  footnote: string;
}) {
  const beforePct = axisPercent(before);
  const afterPct = axisPercent(after);
  const left = Math.min(beforePct, afterPct);
  const width = Math.abs(afterPct - beforePct);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="r8-flat" />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          padding: "84px 78px 84px",
        }}
      >
        <Mark />

        <div style={{ marginTop: 40 }}>
          <Kicker text={kicker} />
          <h2
            style={{
              fontFamily: "var(--cc-font-display)",
              fontWeight: 500,
              fontSize: 62,
              lineHeight: 1.08,
              letterSpacing: "-0.018em",
              color: "var(--cc-ivory)",
              margin: "20px 0 0",
              maxWidth: "15ch",
            }}
          >
            {verdict}
          </h2>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {/* One axis, two marks. The distance between them is the argument. */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 40,
              fontFamily: "var(--cc-font-display)",
              fontSize: 28,
              color: "var(--cc-ivory)",
            }}
          >
            <span>{leftLabel}</span>
            <span>{rightLabel}</span>
          </div>

          <div style={{ position: "relative", height: 190, marginTop: 16 }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                height: 4,
                transform: "translateY(-50%)",
                borderRadius: 999,
                background: "rgba(244,234,210,0.08)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 1,
                height: 26,
                transform: "translate(-50%,-50%)",
                background: "var(--cc-line-strong)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: `${left}%`,
                width: `${width}%`,
                height: 4,
                transform: "translateY(-50%)",
                borderRadius: 999,
                background: GOLD,
              }}
            />
            <Marker pct={beforePct} value={before} label="Before" placement="above" muted />
            <Marker pct={afterPct} value={after} label="After" placement="below" />
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 44 }}>
            {movements.map((m) => (
              <div
                key={m.label}
                style={{
                  flex: 1,
                  border: "1px solid var(--cc-line)",
                  borderRadius: 4,
                  background: "rgba(244,234,210,0.04)",
                  padding: "30px 24px 34px",
                }}
              >
                <span
                  className="kicker"
                  style={{ display: "block", fontSize: 13, letterSpacing: "0.2em" }}
                >
                  {m.label}
                </span>
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--cc-font-display)",
                    fontSize: 58,
                    lineHeight: 1,
                    marginTop: 14,
                    color:
                      m.tone === "gold"
                        ? GOLD_BRIGHT
                        : m.tone === "wine"
                          ? WINE
                          : "var(--cc-ivory)",
                  }}
                >
                  {m.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--cc-line)", paddingTop: 30 }}>
          <p
            style={{
              fontFamily: "var(--cc-font-display)",
              fontSize: 32,
              lineHeight: 1.36,
              letterSpacing: "-0.008em",
              color: "var(--cc-parchment)",
              margin: 0,
              maxWidth: "30ch",
            }}
          >
            {reading}
          </p>
          <p
            style={{
              fontFamily: "var(--cc-font-ui)",
              fontSize: 19,
              letterSpacing: "0.04em",
              color: "var(--cc-faint)",
              margin: "22px 0 0",
            }}
          >
            {footnote}
          </p>
        </div>
      </div>
    </div>
  );
}

function Marker({
  pct,
  value,
  label,
  placement,
  muted = false,
}: {
  pct: number;
  value: number;
  label: string;
  placement: "above" | "below";
  muted?: boolean;
}) {
  const text = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", whiteSpace: "nowrap" }}>
      <span
        className="kicker"
        style={{
          fontSize: 13,
          letterSpacing: "0.2em",
          color: muted ? "var(--cc-faint)" : GOLD,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--cc-font-display)",
          fontSize: 34,
          lineHeight: 1.1,
          marginTop: 4,
          color: muted ? "var(--cc-muted)" : GOLD_BRIGHT,
        }}
      >
        {signed(value)}
      </span>
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: `${pct}%`,
        transform: "translate(-50%,-50%)",
      }}
    >
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {placement === "above" && (
          <div style={{ position: "absolute", bottom: "100%", marginBottom: 12 }}>{text}</div>
        )}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: muted ? "2px solid var(--cc-muted)" : `2px solid ${GOLD_BRIGHT}`,
            background: muted ? "var(--cc-char)" : GOLD,
            boxShadow: muted ? "none" : "0 0 0 6px rgba(240,211,106,0.18)",
            boxSizing: "border-box",
          }}
        />
        {placement === "below" && (
          <div style={{ position: "absolute", top: "100%", marginTop: 12 }}>{text}</div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 10. The close, in the room the deck opened in.
// ---------------------------------------------------------------------------

export function Closing({
  art,
  partner,
  lead,
  rest,
  cta,
}: {
  art: Art;
  partner: string;
  lead: string;
  rest: ReactNode;
  cta: string;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Backdrop art={art} />
      <div className="art-tone" />
      <div className="r8-cover-scrim" />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "88px 76px 82px",
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
            gap: 26,
          }}
        >
          <p
            style={{
              fontFamily: "var(--cc-font-display)",
              fontWeight: 500,
              fontSize: 62,
              lineHeight: 1.14,
              letterSpacing: "-0.018em",
              color: "var(--cc-ivory)",
              margin: "0 auto",
              maxWidth: "16ch",
            }}
          >
            {lead}
          </p>
          <p
            style={{
              fontFamily: "var(--cc-font-display)",
              fontSize: 30,
              lineHeight: 1.44,
              color: "var(--cc-parchment)",
              margin: "0 auto",
              maxWidth: "30ch",
            }}
          >
            {rest}
          </p>
        </div>

        <span
          style={{
            fontFamily: "var(--cc-font-condensed)",
            fontWeight: 700,
            textTransform: "uppercase",
            fontSize: 27,
            letterSpacing: "0.22em",
            paddingLeft: "0.22em",
            color: GOLD,
          }}
        >
          {cta}
        </span>
      </div>
    </div>
  );
}
