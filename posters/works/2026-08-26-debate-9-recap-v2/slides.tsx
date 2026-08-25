import type { ReactNode } from "react";
import { ArtTone, Lockup } from "../../src/core/kit";
import "./slides.css";

// Ten slides recapping Debate #9, restructured from the twelve slide cut for
// the feed. The first deck was built like a report: state the night, then walk
// each motion through before, after, swing. This one is built like a swipe:
// the paradox goes first, every slide changes the visual, and the best
// sentence of the night gets a slide instead of a caption.
//
//   Cover      slide 1. The photograph of the night in a landscape window,
//              and the night's paradox as the headline, not the event's name.
//              A cover that only names itself gives a scroller no reason to
//              stop; a cover that sounds impossible gives them exactly one.
//
//   Motion     slides 2 and 5. A crop of the painting that announced this
//              debate, the motion at the foot, one line on the tension, one
//              checked fact about the world. Unchanged in role from the first
//              cut.
//
//   Vote       slides 3 and 6. The two rounds of the poll on ONE chart:
//              before as a ghost bar, after in gold, both scaled against the
//              tallest bar of either round. The first cut gave each round its
//              own slide and normalised each to itself, which read honestly
//              only if you swiped back and forth. Here the comparison is done
//              by the layout, one swipe earlier.
//
//   Swing      slides 4 and 7. The two averages on one axis, the three way
//              split, and the reading. Slide 4 ends in a one line tease for
//              the second motion, because the first motion's story is "nothing
//              moved" and the deck cannot afford for the reader to agree.
//
//   Verdict    slide 8. Both motions side by side and the sentence the night
//              was about. The payoff, kept from the first cut.
//
//   Numbers    slide 9. Three figures counted across the whole night. The
//              save-bait slide, and the only one allowed to be fun.
//
//   Close      slide 10. The painting entire, the thanks, and then a job for
//              the reader: score yourself on motion one in the comments, on
//              the same seven point scale the deck has spent nine slides
//              teaching. A recap that ends in a bow gets likes; one that ends
//              in a question gets a comment section.
//
// Every block of copy is one or two short sentences. These are read at a
// swipe, and a paragraph on a slide is a paragraph nobody reads.
//
// The art is the first cut's art, deliberately: the photograph of the room,
// and Degas, The Bellelli Family (1858-67), public domain via Wikimedia
// Commons, in the same two crops that announced the debate. Motion one sits
// on the father, who has turned his chair away from his family; motion two on
// the mother and her daughters.

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
      className="r9b-detail"
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

/** The quiet brand mark every interior slide carries. */
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

function signed(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

// ---------------------------------------------------------------------------
// 1. The cover: the paradox, not the programme.
// ---------------------------------------------------------------------------

export function Cover({
  photo,
  hookTop,
  hookBottom,
  lead,
  tease,
  swipeHint,
}: {
  photo: string;
  /** the paradox, in two registers: a shout and its answer */
  hookTop: string;
  hookBottom: string;
  /** the precise claim behind the shout, scoped so it is true */
  lead: string;
  /** the second curiosity gap: what the back half of the deck holds */
  tease: string;
  swipeHint: string;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="r9b-flat" />

      <div className="r9b-window">
        <img className="r9b-photo" src={photo} alt="" />
        <ArtTone />
        <div className="r9b-window-scrim" />
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
          <Kicker text="Debate #9 · Recapped" align="center" />

          <h1
            style={{
              fontFamily: "var(--cc-font-condensed)",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: 148,
              lineHeight: 0.86,
              letterSpacing: "-0.012em",
              color: "var(--cc-ivory)",
              margin: "26px 0 0",
            }}
          >
            {hookTop}
          </h1>
          <p
            style={{
              fontFamily: "var(--cc-font-display)",
              fontSize: 62,
              lineHeight: 1.08,
              letterSpacing: "-0.012em",
              color: GOLD,
              margin: "18px 0 0",
            }}
          >
            {hookBottom}
          </p>

          <span
            style={{
              width: 64,
              height: 1,
              background: "rgba(200,162,74,0.5)",
              margin: "38px auto 32px",
            }}
          />

          <p
            style={{
              fontFamily: "var(--cc-font-display)",
              fontSize: 35,
              lineHeight: 1.3,
              letterSpacing: "-0.008em",
              color: "var(--cc-ivory)",
              margin: "0 auto",
              maxWidth: "26ch",
            }}
          >
            {lead}
          </p>

          <p
            style={{
              fontFamily: "var(--cc-font-ui)",
              fontSize: 24,
              lineHeight: 1.42,
              color: "var(--cc-muted)",
              margin: "26px auto 0",
              maxWidth: "36ch",
            }}
          >
            {tease}
          </p>
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
// 2, 5. The motion.
// ---------------------------------------------------------------------------

export function Motion({
  src,
  focus,
  lift,
  kicker,
  motion,
  note,
  fact,
}: {
  src: string;
  focus: Focus;
  lift?: boolean;
  kicker: string;
  motion: string;
  /** the question under the motion, in the club's own words from the night */
  note?: ReactNode;
  /** something true about the world the motion argues over, which the reader
   *  almost certainly does not know */
  fact?: ReactNode;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="r9b-field">
        <Detail src={src} focus={focus} />
        <ArtTone />
        <div className={lift ? "r9b-motion-scrim r9b-lift" : "r9b-motion-scrim"} />
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
            <div style={{ display: "flex", gap: 26, marginTop: 20 }}>
              <span style={{ width: 2, background: "rgba(200,162,74,0.55)", flexShrink: 0 }} />
              <p
                style={{
                  fontFamily: "var(--cc-font-display)",
                  fontWeight: 500,
                  fontSize: 52,
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
                fontFamily: "var(--cc-font-display)",
                fontSize: 30,
                lineHeight: 1.4,
                letterSpacing: "-0.006em",
                color: "var(--cc-parchment)",
                margin: 0,
                maxWidth: "32ch",
              }}
            >
              {note}
            </p>
          )}

          {fact && (
            <div style={{ borderTop: "1px solid var(--cc-line)", paddingTop: 24 }}>
              <Kicker text="For the record" />
              <p
                style={{
                  fontFamily: "var(--cc-font-ui)",
                  fontSize: 23,
                  lineHeight: 1.5,
                  color: "var(--cc-muted)",
                  margin: "16px 0 0",
                  maxWidth: "42ch",
                }}
              >
                {fact}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3, 6. Both rounds of the poll on one chart.
// ---------------------------------------------------------------------------

const SCALE_VALUES = [-3, -2, -1, 0, 1, 2, 3];

export function PairedDistribution({
  kicker,
  headline,
  before,
  after,
  beforeAvg,
  afterAvg,
  leftLabel,
  rightLabel,
  fact,
}: {
  kicker: string;
  headline: string;
  /** seven counts each, in scale order from -3 to +3 */
  before: number[];
  after: number[];
  beforeAvg: number;
  afterAvg: number;
  leftLabel: string;
  rightLabel: string;
  /** the one thing in the bars the headline does not say */
  fact?: ReactNode;
}) {
  // One scale across both rounds, so a bar that grew reads as grown and a bar
  // that shrank reads as shrunk. Normalising each round to itself, as the
  // presenter display does, is honest inside a round and misleading across
  // two of them on one chart.
  const max = Math.max(...before, ...after);
  const beforeTotal = before.reduce((sum, count) => sum + count, 0);
  const afterTotal = after.reduce((sum, count) => sum + count, 0);
  const barHeight = (count: number) =>
    max === 0 ? 0 : Math.max(count === 0 ? 0 : 3, (count / max) * 86);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="r9b-flat" />

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
              fontSize: 58,
              lineHeight: 1.1,
              letterSpacing: "-0.018em",
              color: "var(--cc-ivory)",
              margin: "20px 0 0",
              minHeight: 128,
              maxWidth: "17ch",
            }}
          >
            {headline}
          </h2>
        </div>

        {/* The legend before the chart, because a ghost bar with no name is a
            rendering mistake, not a round. */}
        <div
          style={{
            display: "flex",
            gap: 36,
            marginTop: 34,
            fontFamily: "var(--cc-font-ui)",
            fontSize: 21,
            color: "var(--cc-muted)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 3,
                background: "rgba(244,234,210,0.22)",
                border: "1px solid rgba(244,234,210,0.3)",
                boxSizing: "border-box",
              }}
            />
            Before the debate
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 22, height: 22, borderRadius: 3, background: GOLD }} />
            After
          </span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {/* Seven tracks, two bars in each. Each bar carries its own count,
              because a distribution without counts is a picture of proportions
              and twenty people look like five. */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            {SCALE_VALUES.map((value, i) => (
              <div key={value} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                <div
                  style={{
                    height: 440,
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 6,
                    border: "1px solid var(--cc-line)",
                    borderRadius: 3,
                    background: "rgba(244,234,210,0.05)",
                    padding: 7,
                    boxSizing: "border-box",
                  }}
                >
                  <Bar count={before[i]} height={barHeight(before[i])} ghost />
                  <Bar count={after[i]} height={barHeight(after[i])} />
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
                  {signed(value)}
                </span>
              </div>
            ))}
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
          <span>
            {beforeTotal} voted before, {afterTotal} after
          </span>
          <span>
            Average <span style={{ color: "var(--cc-parchment)" }}>{signed(beforeAvg)}</span>
            <span style={{ color: GOLD, padding: "0 10px" }}>&rarr;</span>
            <span style={{ color: GOLD_BRIGHT, fontWeight: 700 }}>{signed(afterAvg)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function Bar({ count, height, ghost = false }: { count: number; height: number; ghost?: boolean }) {
  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <span
        style={{
          fontFamily: "var(--cc-font-display)",
          fontSize: 25,
          lineHeight: 1,
          textAlign: "center",
          paddingBottom: 10,
          color: count === 0 ? "var(--cc-faint)" : ghost ? "var(--cc-muted)" : "var(--cc-ivory)",
        }}
      >
        {count}
      </span>
      <div
        style={{
          width: "100%",
          height: `${height}%`,
          borderRadius: 3,
          background: ghost ? "rgba(244,234,210,0.22)" : GOLD,
          border: ghost ? "1px solid rgba(244,234,210,0.3)" : "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4, 7. The swing, and what to make of it.
// ---------------------------------------------------------------------------

/** Map a -3..+3 position to a padded offset so a marker at an extreme stays
 *  inside the track instead of clipping the edge. */
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
  tease,
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
  /** one gold line pointing at the back half of the deck. Only the first
   *  swing slide carries one: its story is "nothing moved", and the deck
   *  cannot afford for the reader to take that as the ending. */
  tease?: string;
}) {
  const beforePct = axisPercent(before);
  const afterPct = axisPercent(after);
  const left = Math.min(beforePct, afterPct);
  const width = Math.abs(afterPct - beforePct);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="r9b-flat" />

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
              maxWidth: "38ch",
            }}
          >
            {reading}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 32,
              margin: "22px 0 0",
            }}
          >
            <p
              style={{
                fontFamily: "var(--cc-font-ui)",
                fontSize: 19,
                letterSpacing: "0.04em",
                color: "var(--cc-faint)",
                margin: 0,
              }}
            >
              {footnote}
            </p>
            {tease && (
              <p
                style={{
                  fontFamily: "var(--cc-font-ui)",
                  fontWeight: 500,
                  fontSize: 19,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: GOLD,
                  margin: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {tease} <span style={{ fontSize: 22 }}>&rarr;</span>
              </p>
            )}
          </div>
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
// 8. The verdict: both motions on one page.
// ---------------------------------------------------------------------------

export function Verdict({
  kicker,
  headline,
  columns,
  reading,
  footnote,
}: {
  kicker: string;
  headline: string;
  columns: { label: string; summary: string; before: number; after: number; note: string }[];
  reading: ReactNode;
  footnote?: ReactNode;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="r9b-flat" />

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
              maxWidth: "41ch",
            }}
          >
            {reading}
          </p>
          {footnote && (
            <p
              style={{
                fontFamily: "var(--cc-font-ui)",
                fontSize: 22,
                lineHeight: 1.45,
                color: "var(--cc-muted)",
                margin: "20px 0 0",
                maxWidth: "52ch",
              }}
            >
              {footnote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 9. Three figures from the whole night.
// ---------------------------------------------------------------------------

export function Numbers({
  kicker,
  headline,
  rows,
}: {
  kicker: string;
  headline: string;
  rows: { figure: string; line: ReactNode }[];
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="r9b-flat" />

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

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {rows.map((r, i) => (
            <div
              key={r.figure}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 40,
                padding: "38px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--cc-line)",
              }}
            >
              <span
                style={{
                  flex: "0 0 190px",
                  fontFamily: "var(--cc-font-display)",
                  fontSize: 82,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  color: GOLD_BRIGHT,
                }}
              >
                {r.figure}
              </span>
              <p
                style={{
                  fontFamily: "var(--cc-font-display)",
                  fontSize: 29,
                  lineHeight: 1.38,
                  letterSpacing: "-0.006em",
                  color: "var(--cc-parchment)",
                  margin: 0,
                }}
              >
                {r.line}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 10. The close: the thanks, and then a job for the reader.
// ---------------------------------------------------------------------------

export function Closing({
  src,
  focus,
  lead,
  rest,
  promptKicker,
  prompt,
  cta,
}: {
  src: string;
  focus: Focus;
  lead: string;
  rest: ReactNode;
  promptKicker: string;
  /** the ask. It reuses the seven point scale the deck has been teaching, so
   *  the row of values under it reads as an answer sheet, not decoration. */
  prompt: ReactNode;
  cta: string;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="r9b-field">
        <Detail src={src} focus={focus} />
        <ArtTone />
        <div className="r9b-close-scrim" />
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
              fontSize: 50,
              lineHeight: 1.16,
              letterSpacing: "-0.014em",
              color: "var(--cc-ivory)",
              margin: "0 auto",
              maxWidth: "18ch",
            }}
          >
            {lead}
          </p>

          <p
            style={{
              fontFamily: "var(--cc-font-ui)",
              fontSize: 23,
              lineHeight: 1.5,
              color: "var(--cc-parchment)",
              margin: "30px auto 0",
              maxWidth: "36ch",
            }}
          >
            {rest}
          </p>

          <span
            style={{
              width: 64,
              height: 1,
              background: "rgba(200,162,74,0.5)",
              margin: "36px auto",
            }}
          />

          <Kicker text={promptKicker} align="center" />
          <p
            style={{
              fontFamily: "var(--cc-font-display)",
              fontSize: 33,
              lineHeight: 1.3,
              letterSpacing: "-0.008em",
              color: "var(--cc-ivory)",
              margin: "18px auto 0",
              maxWidth: "26ch",
            }}
          >
            {prompt}
          </p>

          {/* The answer sheet: the deck's scale one last time, small. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              marginTop: 26,
              fontFamily: "var(--cc-font-ui)",
              fontWeight: 700,
              fontSize: 21,
              color: GOLD_BRIGHT,
            }}
          >
            <span
              style={{
                fontWeight: 400,
                fontSize: 18,
                letterSpacing: "0.06em",
                color: "var(--cc-muted)",
              }}
            >
              Against
            </span>
            {SCALE_VALUES.map((v) => (
              <span key={v}>{signed(v)}</span>
            ))}
            <span
              style={{
                fontWeight: 400,
                fontSize: 18,
                letterSpacing: "0.06em",
                color: "var(--cc-muted)",
              }}
            >
              For
            </span>
          </div>
        </div>

        <span
          style={{
            display: "block",
            marginTop: 42,
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
