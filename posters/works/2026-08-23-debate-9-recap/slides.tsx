import type { ReactNode } from "react";
import { ArtTone, Lockup } from "../../src/core/kit";
import "./slides.css";

// Eleven slides recapping Debate #9. The deck exists to land one comparison,
// so its grammar is built to make two rounds of the same poll directly
// legible against each other, and then to make the two motions legible
// against each other.
//
//   Cover      slide 1. The photograph of the actual night in a landscape
//              window across the top, flat ground below it carrying the type.
//              The other decks run their cover photograph full bleed; this
//              one cannot. The photograph is 883px wide and landscape, and a
//              portrait canvas would have to blow it up by two before the
//              export doubles it again. A window at the picture's own shape
//              keeps it sharp, and the flat ground under it is the same
//              ground the six result slides use, so the deck opens in the
//              material it is mostly made of.
//
//   Motion     slides 2 and 6. A crop of the painting that announced this
//              debate, and the motion set at the foot. The only slides where
//              the argument is stated rather than measured.
//
//   Result     slides 3, 4, 7, 8. Flat ground. The seven point distribution
//              from the live poll, drawn as the presenter display draws it on
//              the night: bars scaled against the tallest in their own round,
//              the signed scale value under each, the two sides named at the
//              foot. Every one of these slides puts the chart at the same
//              height on the page, so swiping from before to after changes
//              nothing except the shape of the room. Each bar carries its own
//              count, because a round normalised to its own tallest bar says
//              nothing about how many people were in it.
//
//   Swing      slides 5 and 9. Flat ground. The two averages as marks on one
//              axis, then how the room split three ways, then the reading.
//
//   Verdict    slide 10. Flat ground, no chart. The two motions side by side,
//              and the one sentence the night was actually about. It is the
//              payoff of the deck and it gets a slide to itself rather than a
//              paragraph on the close.
//
//   Close      slide 11. The painting entire. The deck opens in the real room
//              and ends in the painted one.
//
// Vote counts stay off the swing slides. Movement is given as a share of the
// people who voted in both rounds, which is the only denominator that
// survives an audience that changed between rounds.
//
// The art:
//
//   1      room      a photograph of the night itself, and the only one here.
//   2,6,11 bellelli  Degas, The Bellelli Family (1858-67), public domain via
//                    Wikimedia Commons. The same painting and the same two
//                    crops that announced this debate: motion one sits on the
//                    father, who has turned his chair away from his family,
//                    and motion two sits on the mother and her daughters.
//                    Whoever saw the announcement sees the same room again.

const GOLD = "var(--cc-gold)";
const GOLD_BRIGHT = "var(--cc-gold-bright)";
const WINE = "var(--cc-wine-bright)";

const SHADOW =
  "0 1px 2px rgba(0,0,0,0.92), 0 2px 14px rgba(0,0,0,0.8), 0 5px 44px rgba(0,0,0,0.66)";

/** The Degas, at its true pixel shape, so a crop can be positioned by the
 *  point in the picture it wants centred rather than by trial. */
const SRC_W = 3840;
const SRC_H = 3072;

export interface Focus {
  /** the point to centre, in fractions of the source picture */
  x: number;
  y: number;
  /** how many canvas widths the picture is blown up to */
  scale: number;
}

function Detail({ src, focus }: { src: string; focus: Focus }) {
  const w = Math.round(1080 * focus.scale);
  const h = Math.round((w * SRC_H) / SRC_W);
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  return (
    <img
      className="r9-detail"
      src={src}
      alt=""
      width={w}
      height={h}
      style={{
        left: clamp(540 - focus.x * w, 1080 - w, 0),
        top: clamp(675 - focus.y * h, 1350 - h, 0),
      }}
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
  photo,
  title,
  subtitle,
  lead,
  context,
  swipeHint,
}: {
  photo: string;
  title: string;
  subtitle: string;
  /** what the night was, in one line. The largest reading type on the slide,
   *  because a cover that only names itself gives a scroller no reason to
   *  stop. */
  lead: string;
  /** and what this post is, one beat per line */
  context: string[];
  swipeHint: string;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="r9-flat" />

      {/* The window. Full width, cropped only a little from a landscape
          picture, and faded into the ground at its foot rather than cut, so
          the room does not sit in a box on the page. */}
      <div className="r9-window">
        <img className="r9-photo" src={photo} alt="" />
        <ArtTone />
        <div className="r9-window-scrim" />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "72px 76px 74px",
        }}
      >
        <div style={{ textShadow: SHADOW }}>
          <Lockup width={286} align="center" />
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--cc-font-condensed)",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: 176,
              lineHeight: 0.84,
              letterSpacing: "-0.012em",
              color: "var(--cc-ivory)",
              margin: 0,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontFamily: "var(--cc-font-display)",
              fontSize: 54,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              color: GOLD,
              margin: "16px 0 0",
            }}
          >
            {subtitle}
          </p>

          <span
            style={{
              width: 64,
              height: 1,
              background: "rgba(200,162,74,0.5)",
              margin: "36px auto 32px",
            }}
          />

          <p
            style={{
              fontFamily: "var(--cc-font-display)",
              fontSize: 37,
              lineHeight: 1.28,
              letterSpacing: "-0.008em",
              color: "var(--cc-ivory)",
              margin: "0 auto",
              maxWidth: "23ch",
            }}
          >
            {lead}
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              marginTop: 30,
            }}
          >
            {context.map((line, i) => (
              <p
                key={i}
                style={{
                  fontFamily: "var(--cc-font-ui)",
                  fontSize: 24,
                  lineHeight: 1.42,
                  color: "var(--cc-muted)",
                  margin: 0,
                  maxWidth: "40ch",
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
            marginTop: 44,
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
// 2, 7. The motion.
// ---------------------------------------------------------------------------

export function Motion({
  src,
  focus,
  lift,
  kicker,
  motion,
  motionSize = 52,
  note,
}: {
  src: string;
  focus: Focus;
  /** this crop of the canvas is dark to begin with and needs a lift rather
   *  than a darkening */
  lift?: boolean;
  kicker: string;
  motion: string;
  motionSize?: number;
  /** the question under the motion, in the club's own words from the night.
   *  Not a fact about the vote: the vote gets the next two slides. */
  note?: ReactNode;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="r9-field">
        <Detail src={src} focus={focus} />
        <ArtTone />
        <div className={lift ? "r9-motion-scrim r9-lift" : "r9-motion-scrim"} />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
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
            gap: 30,
          }}
        >
          <div>
            <Kicker text={kicker} />
            {/* The motion is the only thing on this slide that has to be read
                word for word, so it takes the largest type after the cover and
                a gold rule to mark it as quoted rather than said. */}
            <div style={{ display: "flex", gap: 26, marginTop: 20 }}>
              <span style={{ width: 2, background: "rgba(200,162,74,0.55)", flexShrink: 0 }} />
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
                fontSize: 25,
                lineHeight: 1.45,
                color: "var(--cc-muted)",
                margin: 0,
                maxWidth: "36ch",
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
// 3, 4, 8, 9. The distribution, drawn as the room saw it on the night.
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
  /** the one thing in these bars the headline does not say, and it has to be
   *  readable off the bars above it. */
  fact?: ReactNode;
}) {
  const max = Math.max(...counts);
  const total = counts.reduce((sum, count) => sum + count, 0);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="r9-flat" />

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

        {/* Which round, then what the chart says. The motion is not repeated:
            the slide before it stated the motion, and a reader who has to
            parse it again reaches the new thing on this slide last.

            The headline block is held at three lines whether it fills them or
            not. These slides are read in pairs by swiping between them, and a
            two line headline on the before slide against a three line one on
            the after slide moves the whole chart down the page, which reads as
            a change in the data. */}
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
              minHeight: 192,
              maxWidth: "16ch",
            }}
          >
            {headline}
          </h2>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {/* Bars scaled against the tallest, as the presenter display does
              it, so the shape of the room is legible rather than the
              arithmetic. Each bar carries its own count above the fill:
              without it a distribution is a picture of proportions and twenty
              people look like five. The tallest bar stops at 88% to leave that
              number somewhere to sit. */}
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

        {/* The one detail in the bars worth pointing at, marked with a rule so
            it reads as an aside and not as a second headline. */}
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
// 5, 10. The swing, and what to make of it.
// ---------------------------------------------------------------------------

/** Map a -3..+3 position to a padded offset so a marker at an extreme stays
 *  inside the track instead of clipping the edge. The same padding the
 *  presenter display uses. */
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
      <div className="r9-flat" />

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
          {/* One axis, two marks. The distance between them is the argument,
              and on the first motion there is almost none: the two marks land
              on top of each other, which is the slide. */}
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
                      m.tone === "gold" ? GOLD_BRIGHT : m.tone === "wine" ? WINE : "var(--cc-ivory)",
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        whiteSpace: "nowrap",
      }}
    >
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
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
// 10. The verdict: both motions on one page.
// ---------------------------------------------------------------------------

export function Verdict({
  kicker,
  headline,
  columns,
  reading,
}: {
  kicker: string;
  headline: string;
  /** one per motion, in the order they were argued */
  columns: { label: string; summary: string; before: number; after: number; note: string }[];
  reading: ReactNode;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="r9-flat" />

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
              fontSize: 60,
              lineHeight: 1.08,
              letterSpacing: "-0.018em",
              color: "var(--cc-ivory)",
              margin: "20px 0 0",
              maxWidth: "16ch",
            }}
          >
            {headline}
          </h2>
        </div>

        {/* Two columns, identical in every way except the numbers, so the
            comparison is made by the layout and not by the copy. They size to
            the taller of the two and sit centred in what is left. */}
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "stretch", gap: 34, width: "100%" }}>
            {columns.map((c) => (
            <div
              key={c.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                border: "1px solid var(--cc-line)",
                borderRadius: 4,
                background: "rgba(244,234,210,0.04)",
                padding: "36px 32px 34px",
              }}
            >
              <span
                className="kicker"
                style={{ display: "block", fontSize: 13, letterSpacing: "0.2em" }}
              >
                {c.label}
              </span>
              <p
                style={{
                  fontFamily: "var(--cc-font-display)",
                  fontSize: 30,
                  lineHeight: 1.28,
                  letterSpacing: "-0.008em",
                  color: "var(--cc-ivory)",
                  margin: "18px 0 0",
                }}
              >
                {c.summary}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 16,
                  margin: "auto 0 0",
                  paddingTop: 34,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--cc-font-display)",
                    fontSize: 52,
                    lineHeight: 1,
                    color: "var(--cc-muted)",
                  }}
                >
                  {signed(c.before)}
                </span>
                <span style={{ color: GOLD, fontSize: 30, transform: "translateY(-3px)" }}>
                  &rarr;
                </span>
                <span
                  style={{
                    fontFamily: "var(--cc-font-display)",
                    fontSize: 52,
                    lineHeight: 1,
                    color: GOLD_BRIGHT,
                  }}
                >
                  {signed(c.after)}
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--cc-font-ui)",
                  fontSize: 21,
                  lineHeight: 1.4,
                  color: "var(--cc-muted)",
                  margin: "18px 0 0",
                }}
              >
                {c.note}
              </p>
            </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--cc-line)", paddingTop: 30 }}>
          <p
            style={{
              fontFamily: "var(--cc-font-display)",
              fontSize: 34,
              lineHeight: 1.34,
              letterSpacing: "-0.008em",
              color: "var(--cc-parchment)",
              margin: 0,
              maxWidth: "30ch",
            }}
          >
            {reading}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 11. The close, in the painted room.
// ---------------------------------------------------------------------------

export function Closing({
  src,
  focus,
  lead,
  rest,
  cta,
}: {
  src: string;
  focus: Focus;
  lead: string;
  rest: ReactNode;
  cta: string;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="r9-field">
        <Detail src={src} focus={focus} />
        <ArtTone />
        <div className="r9-close-scrim" />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "84px 76px 82px",
          textShadow: SHADOW,
        }}
      >
        <Lockup width={286} align="center" />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <p
            style={{
              fontFamily: "var(--cc-font-display)",
              fontSize: 52,
              lineHeight: 1.16,
              letterSpacing: "-0.014em",
              color: "var(--cc-ivory)",
              margin: "0 auto",
              maxWidth: "18ch",
            }}
          >
            {lead}
          </p>

          <span
            style={{
              width: 64,
              height: 1,
              background: "rgba(200,162,74,0.5)",
              margin: "38px auto 34px",
            }}
          />

          <p
            style={{
              fontFamily: "var(--cc-font-ui)",
              fontSize: 25,
              lineHeight: 1.5,
              color: "var(--cc-parchment)",
              margin: "0 auto",
              maxWidth: "34ch",
            }}
          >
            {rest}
          </p>
        </div>

        <span
          style={{
            display: "block",
            marginTop: 46,
            padding: "13px 30px",
            border: "1px solid rgba(200,162,74,0.36)",
            borderRadius: 999,
            fontFamily: "var(--cc-font-ui)",
            fontWeight: 500,
            fontSize: 17,
            letterSpacing: "0.2em",
            paddingLeft: "calc(30px + 0.2em)",
            textTransform: "uppercase",
            color: GOLD,
          }}
        >
          {cta}
        </span>
      </div>
    </div>
  );
}
