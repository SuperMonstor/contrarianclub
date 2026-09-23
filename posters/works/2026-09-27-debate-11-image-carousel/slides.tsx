import type { CSSProperties, ReactNode } from "react";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #11, the first motion. Eight slides that tell one story.
//
// ---------------------------------------------------------------------------
// The story
//
//   1  should Indians stop celebrating festivals abroad?   the hook
//   2  this month in Leicester                             it happened
//   3  and it wasn't the first clip                        it keeps happening
//   4  none of this stays local anymore                    and it spreads
//   5  so people back home have started asking             the ask
//   6  but would it even work?                             is it worth it
//   7  and even if it would, is it fair to ask?            is it fair
//   8  the motion, struck out                              come and find out
//
// It reads as one person talking, each slide picking up where the last one
// stopped. Anyone editing a line should read the slide before it and the one
// after it first. Slides 6 and 7 are the two halves of the crux, worth and
// fairness, one each and in that order.
//
// ---------------------------------------------------------------------------
// The grammar
//
// THE POSTER OPENS AND CLOSES THE DECK. Slides 1 and 8 sit on the same
// Bruegel carnival as the poster's first panel. Everything between is the
// real world, in photographs of the things the copy describes, left close to
// their own colour: only the painting carries the warm tone.
//
// NOTHING DECORATIVE. No frame drawn over the pictures, no ticks before
// labels, no glow behind type, no fading rules, no numerals. Every one of
// those was tried on this deck and every one of them made it look generated.
// The pictures run to the edge, the type sits on a plain dark fade, and the
// one division is a plain hairline.
//
// GOLD MEANS ONE THING PER SLIDE. The call to action, or the single line the
// slide exists for. Sources, credits, the counter and the labels are plain
// muted type in sentence case; only "Tickets out now" is set in tracked caps.
//
// WHAT PEOPLE SAID IS PAPER. Each post is a clipping of printed paper laid on
// the photograph: a torn foot, a slight tilt, a short real shadow, no avatar
// and no rounded card. It is a cut-out, not an interface. Every post is real,
// quoted exactly, found reproduced in the press, and sourced under the rule.
// Private people's names are struck out with the same hand-drawn bar that
// strikes the motion on slide 8, and are not in this repo either.
//
// NOT EVERY SLIDE IS THE SAME SLIDE. Most beats put the talking at the foot.
// Slide 4 opens on its line and sets the post large in the middle, because the
// post is the point. Slide 6 opens on its question and tucks the headline to
// one side, so the empty lit street is the picture.
//
// THE HOOK IS THE WHOLE FIRST SLIDE. The question is set as large as the page
// allows, so it reads at thumbnail size in the feed; the painting shows round
// the letters. The motion two deck opens the same way.
//
// THREE TYPEFACES. Oswald shouts once, the question on slide 1. Playfair does
// all the talking. Inter is the posts themselves and the small print.

const W = 1080;
const H = 1350;
const MARGIN = 92;

/** The division. Same height on every slide. */
const RULE = 1140;
/** Where the last line of narration lands, clear of the division. */
const TEXT_BASE = RULE - 58;
/** Where things start at the head of a slide, clear of the counter. */
const HEAD_TOP = 150;

/* --- Pictures ------------------------------------------------------------- */

/** A picture, its aspect, the treatment it was tuned for, and who made it. */
export interface Plate {
  src: string;
  ratio: number;
  art: string;
  /** who made it and under what licence, printed on the slide */
  credit: string;
}

/** Where in the picture to centre, and how far in. x and y are fractions of
 *  the picture; scale 1 means the picture is exactly one slide wide. A scale
 *  too small to cover the slide is raised until it does. */
export interface Crop {
  x: number;
  y: number;
  scale: number;
}

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
        position: "absolute",
        width: w,
        height: h,
        left: clamp(W / 2 - crop.x * w, W - w, 0),
        top: clamp(H / 2 - crop.y * h, H - h, 0),
        maxWidth: "none",
      }}
    />
  );
}

/** The marker the strikes are drawn with: a turbulence filter that chews the
 *  edges so no two bars are the same shape. */
function InkFilter() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <filter id="ic-ink">
        <feTurbulence type="fractalNoise" baseFrequency="0.035 0.18" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="5" />
      </filter>
    </svg>
  );
}

/** Every slide: the picture, its fade, then the content. */
function Ground({
  plate,
  crop,
  scrim,
  children,
}: {
  plate: Plate;
  crop: Crop;
  scrim: string;
  children: ReactNode;
}) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <InkFilter />
      <CropArt plate={plate} crop={crop} />
      <div className={scrim} />
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
  );
}

/* --- Type ----------------------------------------------------------------- */

const CONDENSED: CSSProperties = {
  fontFamily: "var(--cc-font-condensed)",
  fontWeight: 700,
  textTransform: "uppercase",
  lineHeight: 0.94,
  letterSpacing: "-0.004em",
  color: "var(--cc-ivory)",
  margin: 0,
};

const SMALL: CSSProperties = {
  fontFamily: "var(--cc-font-ui)",
  fontWeight: 500,
  color: "var(--cc-muted)",
  margin: 0,
};

const TONES = {
  ivory: "var(--cc-ivory)",
  parchment: "var(--cc-parchment)",
  gold: "var(--cc-gold-bright)",
};

/** One line of the talking. An empty string is a beat of silence. */
export type Line = string | { text: string; size?: number; tone?: keyof typeof TONES };

function Narration({ lines, size = 40 }: { lines: Line[]; size?: number }) {
  return (
    <>
      {lines.map((line, i) => {
        const l = typeof line === "string" ? { text: line } : line;
        if (!l.text) return <div key={i} style={{ height: Math.round(size * 0.55) }} />;
        return (
          <p
            key={i}
            style={{
              margin: 0,
              fontFamily: "var(--cc-font-display)",
              fontWeight: 400,
              fontSize: l.size ?? size,
              lineHeight: 1.28,
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

/** Where the reader is. Small and plain: a page number, not a feature. */
function Counter({ n, of }: { n: number; of: number }) {
  return (
    <div
      className="ic-on-art"
      style={{
        ...SMALL,
        position: "absolute",
        left: MARGIN,
        top: 88,
        fontSize: 17,
        color: "var(--cc-parchment)",
        textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
      }}
    >
      {n} of {of}
    </div>
  );
}

/** Under the rule: where the facts and the posts came from, then who made
 *  the picture. The smallest, quietest type on the slide. */
function UnderRule({ source, credit }: { source?: string; credit: string }) {
  return (
    <div
      className="ic-on-art"
      style={{ position: "absolute", left: MARGIN, top: RULE + 30, width: W - MARGIN * 2 }}
    >
      {source && <p style={{ ...SMALL, fontSize: 16, lineHeight: 1.5 }}>{source}</p>}
      <p style={{ ...SMALL, marginTop: source ? 6 : 0, fontSize: 13, fontWeight: 400 }}>
        {credit}
      </p>
    </div>
  );
}

/* --- The strike ----------------------------------------------------------- */

/** Words behind a hand-drawn bar. The hidden words still set the width, so the
 *  bar is as long as what it hides. Ink on paper, ivory on the dark page. */
export function Strike({ children, tone = "ink" }: { children: string; tone?: "ink" | "ivory" }) {
  const tilt = ((children.length % 3) - 1) * 0.45;
  return (
    <span className={`ic-strike ic-strike-${tone}`} style={{ transform: `rotate(${tilt}deg)` }}>
      {children}
    </span>
  );
}

/* --- The clippings -------------------------------------------------------- */

/** A torn foot for a piece of paper, as a clip-path. Deterministic, so a
 *  re-export does not re-tear it: the same seed gives the same edge. The top
 *  is a scissor cut, very slightly off true; the bottom is torn. */
function tornEdge(seed: number) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const top: string[] = [`0 ${(rnd() * 2).toFixed(1)}px`, `100% ${(rnd() * 2).toFixed(1)}px`];
  const bottom: string[] = [];
  const steps = 34;
  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * 100;
    const y = 2 + rnd() * 9;
    bottom.push(`${x.toFixed(2)}% calc(100% - ${y.toFixed(1)}px)`);
  }
  return `polygon(${[...top, ...bottom].join(", ")})`;
}

/** A piece of paper on the photograph: the torn edge, the tilt, and a short
 *  real shadow. The shadow is on the wrapper because a clip-path would cut a
 *  box-shadow off with the paper. */
function Paper({
  seed,
  tilt,
  width,
  newsprint,
  padding,
  children,
}: {
  seed: number;
  tilt: number;
  width?: number;
  newsprint?: boolean;
  padding: string;
  children: ReactNode;
}) {
  return (
    <div className="ic-paper-shadow" style={{ transform: `rotate(${tilt}deg)`, width }}>
      <div
        className={newsprint ? "ic-paper ic-newsprint" : "ic-paper"}
        style={{ clipPath: tornEdge(seed), padding }}
      >
        {children}
      </div>
    </div>
  );
}

/** One post, as it appeared. An official account keeps its name; a private
 *  person's is struck out. */
export interface Post {
  platform: string;
  who: { kind: "official" | "private"; name: string; handle: string };
  text: string;
  date: string;
}

function PostPaper({
  post,
  seed,
  tilt,
  width,
  size = 25,
}: {
  post: Post;
  seed: number;
  tilt: number;
  width: number;
  size?: number;
}) {
  const official = post.who.kind === "official";
  return (
    <Paper seed={seed} tilt={tilt} width={width} padding="26px 32px 34px">
      <div style={{ fontSize: Math.round(size * 0.78), lineHeight: 1.3 }}>
        <span style={{ fontWeight: 700 }}>
          {official ? post.who.name : <Strike>{post.who.name}</Strike>}
        </span>{" "}
        <span style={{ color: "rgba(23, 18, 11, 0.55)" }}>
          {official ? post.who.handle : <Strike>{post.who.handle}</Strike>}
        </span>
      </div>
      <p style={{ margin: "12px 0 0", fontSize: size, lineHeight: 1.4 }}>{post.text}</p>
      <p style={{ margin: "14px 0 0", fontSize: 16, color: "rgba(23, 18, 11, 0.55)" }}>
        {`${post.platform}, ${post.date}`}
      </p>
    </Paper>
  );
}

/** A one-line reply, torn off the bottom of a thread. */
export interface Reply {
  name: string;
  text: string;
}

function ReplyPaper({ reply, seed, tilt }: { reply: Reply; seed: number; tilt: number }) {
  return (
    <Paper seed={seed} tilt={tilt} padding="16px 26px 24px">
      <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
        <Strike>{reply.name}</Strike>
      </div>
      <div style={{ fontSize: 30, lineHeight: 1.3, marginTop: 6, whiteSpace: "nowrap" }}>
        {reply.text}
      </div>
    </Paper>
  );
}

/** A newspaper headline, cut out. */
export interface Headline {
  masthead: string;
  headline: string;
  date: string;
}

function HeadlinePaper({
  item,
  seed,
  tilt,
  width,
}: {
  item: Headline;
  seed: number;
  tilt: number;
  width: number;
}) {
  return (
    <Paper seed={seed} tilt={tilt} width={width} newsprint padding="22px 30px 34px">
      <div
        style={{
          fontFamily: "var(--cc-font-display)",
          fontWeight: 700,
          fontSize: 18,
          paddingBottom: 10,
          borderBottom: "2px solid rgba(23, 18, 11, 0.75)",
        }}
      >
        {item.masthead}
      </div>
      <div
        style={{
          marginTop: 12,
          fontFamily: "var(--cc-font-display)",
          fontWeight: 700,
          fontSize: 38,
          lineHeight: 1.12,
          letterSpacing: "-0.01em",
        }}
      >
        {item.headline}
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 15, color: "rgba(23, 18, 11, 0.6)" }}>
        {item.date}
      </p>
    </Paper>
  );
}

/** What sits on the picture on a beat, and where. */
export type Clipping =
  | { kind: "posts"; posts: Post[]; size?: number; width?: number }
  | { kind: "replies"; replies: Reply[] }
  | { kind: "headline"; item: Headline; width?: number };

function Clippings({
  clipping,
  top,
  align,
}: {
  clipping: Clipping;
  top: number;
  align: "left" | "right" | "center";
}) {
  const justify = { left: "flex-start", right: "flex-end", center: "center" }[align];
  // the papers do not all sit square, and no two sit at the same angle
  const tilts = [-1.4, 0.9, -0.6];
  return (
    <div
      style={{
        position: "absolute",
        left: MARGIN - 8,
        right: MARGIN - 8,
        top,
        display: "flex",
        flexDirection: "column",
        alignItems: justify,
        gap: 22,
      }}
    >
      {clipping.kind === "posts" &&
        clipping.posts.map((p, i) => (
          <PostPaper
            key={p.text}
            post={p}
            seed={17 + i * 11}
            tilt={tilts[i % tilts.length]}
            width={clipping.width ?? W - MARGIN * 2}
            size={clipping.size}
          />
        ))}
      {clipping.kind === "replies" &&
        clipping.replies.map((r, i) => (
          <div key={r.text} style={{ marginLeft: i * 110 }}>
            <ReplyPaper reply={r} seed={5 + i * 7} tilt={tilts[i % tilts.length]} />
          </div>
        ))}
      {clipping.kind === "headline" && (
        <HeadlinePaper item={clipping.item} seed={29} tilt={1.1} width={clipping.width ?? 760} />
      )}
    </div>
  );
}

/* --- The slides ----------------------------------------------------------- */

/** 1. The hook, on the poster's carnival. The question is the slide: set as
 *  large as the page allows, centred in the space between the lockup and the
 *  rule, with the painting showing round the letters. */
export function Hook({
  plate,
  crop,
  label,
  question,
  size,
}: {
  plate: Plate;
  crop: Crop;
  label: string;
  question: string[];
  size: number;
}) {
  return (
    <Ground plate={plate} crop={crop} scrim="ic-scrim-hook">
      <div style={{ position: "absolute", left: MARGIN, top: 84 }}>
        <Lockup width={200} artwork="left" />
      </div>
      <div
        className="ic-on-art"
        style={{
          position: "absolute",
          left: MARGIN,
          right: MARGIN - 20,
          top: 220,
          bottom: H - RULE + 40,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {question.map((l) => (
          <p key={l} style={{ ...CONDENSED, fontSize: size, lineHeight: 0.9 }}>
            {l}
          </p>
        ))}
        <p style={{ ...SMALL, fontSize: 24, color: "var(--cc-parchment)", marginTop: 36 }}>
          {label}
        </p>
      </div>
      <hr className="ic-rule" style={{ top: RULE }} />
      <UnderRule credit={plate.credit} />
    </Ground>
  );
}

/** 2 to 7. A beat of the story. By default the clippings sit at the head and
 *  the talking at the foot. A beat can also open on a line of its own at the
 *  head (`head`), and put its clippings anywhere down the page. */
export function Beat({
  plate,
  crop,
  n,
  of,
  head,
  headSize,
  clipping,
  clippingTop = HEAD_TOP,
  clippingAlign = "left",
  lines,
  size,
  source,
}: {
  plate: Plate;
  crop: Crop;
  n: number;
  of: number;
  head?: Line[];
  headSize?: number;
  clipping?: Clipping;
  clippingTop?: number;
  clippingAlign?: "left" | "right" | "center";
  lines: Line[];
  size?: number;
  source?: string;
}) {
  return (
    <Ground plate={plate} crop={crop} scrim={head ? "ic-scrim-both" : "ic-scrim"}>
      <Counter n={n} of={of} />
      {head && (
        <div
          className="ic-on-art"
          style={{ position: "absolute", left: MARGIN, width: 876, top: HEAD_TOP }}
        >
          <Narration lines={head} size={headSize} />
        </div>
      )}
      {clipping && <Clippings clipping={clipping} top={clippingTop} align={clippingAlign} />}
      <div
        className="ic-on-art"
        style={{ position: "absolute", left: MARGIN, width: 876, bottom: H - TEXT_BASE }}
      >
        <Narration lines={lines} size={size} />
      </div>
      <hr className="ic-rule" style={{ top: RULE }} />
      <UnderRule source={source} credit={plate.credit} />
    </Ground>
  );
}

/** 8. The motion, struck out, and the terms on which it will be read, on the
 *  poster's carnival again: the deck ends where it began. */
export function Motion({
  plate,
  crop,
  label,
  motion,
  notice,
  details,
  lines,
  cta,
}: {
  plate: Plate;
  crop: Crop;
  label: string;
  motion: ReactNode;
  /** the line that says when it will be read */
  notice: string;
  details: string[];
  lines: string[];
  cta: string[];
}) {
  return (
    <Ground plate={plate} crop={crop} scrim="ic-scrim-motion">
      <div style={{ position: "absolute", left: MARGIN, top: 84 }}>
        <Lockup width={214} artwork="left" />
      </div>
      <div
        className="ic-on-art"
        style={{ position: "absolute", right: MARGIN, top: 88, textAlign: "right" }}
      >
        <p style={{ ...SMALL, fontSize: 17 }}>Debate Club #11</p>
        {details.map((line, i) => (
          <p
            key={line}
            style={{
              margin: 0,
              marginTop: i === 0 ? 10 : 2,
              fontFamily: "var(--cc-font-display)",
              fontSize: i === 0 ? 26 : 21,
              lineHeight: 1.3,
              color: i === 0 ? "var(--cc-ivory)" : "var(--cc-parchment)",
            }}
          >
            {line}
          </p>
        ))}
      </div>

      <div
        className="ic-on-art"
        style={{ position: "absolute", left: MARGIN, width: W - MARGIN * 2, bottom: H - TEXT_BASE }}
      >
        <p style={{ ...SMALL, fontSize: 22, color: "var(--cc-parchment)", marginBottom: 24 }}>
          {label}
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--cc-font-display)",
            fontSize: 54,
            lineHeight: 1.42,
            letterSpacing: "-0.01em",
            color: "var(--cc-ivory)",
          }}
        >
          {motion}
        </p>
        <p
          style={{
            margin: 0,
            marginTop: 44,
            fontFamily: "var(--cc-font-display)",
            fontSize: 32,
            lineHeight: 1.3,
            color: "var(--cc-parchment)",
          }}
        >
          {notice}
        </p>
      </div>

      <hr className="ic-rule" style={{ top: RULE }} />
      <div
        className="ic-on-art"
        style={{
          position: "absolute",
          left: MARGIN,
          right: MARGIN,
          top: RULE + 30,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          {lines.map((l) => (
            <p key={l} style={{ ...SMALL, fontSize: 16, lineHeight: 1.6 }}>
              {l}
            </p>
          ))}
        </div>
        <div style={{ textAlign: "right" }}>
          {cta.map((l, i) => (
            <div
              key={l}
              className={i === 0 ? "kicker" : undefined}
              style={
                i === 0
                  ? { fontSize: 18, letterSpacing: "0.22em", lineHeight: 1.6 }
                  : { ...SMALL, fontSize: 16, lineHeight: 1.8 }
              }
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </Ground>
  );
}
