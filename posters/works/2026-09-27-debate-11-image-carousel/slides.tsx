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
//   8  the motion, blacked out                             come and find out
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
// Bruegel carnival as the poster's first panel, so the carousel starts and
// ends inside the thing people have already seen. Everything between is the
// real world.
//
// PHOTOGRAPHS FOR WHAT HAPPENED, CLIPPINGS FOR WHAT PEOPLE SAID. The middle six
// slides are photographs of the things the copy describes, under the same gold
// frame and the same warm treatment as the paintings, so they read as one
// printed object. What people posted is set as a cream clipping laid over the
// picture: the one light material in the deck, because it is the one thing on
// each slide that is somebody else talking.
//
// EVERY POST IS REAL AND QUOTED EXACTLY. None is invented or paraphrased. Each
// was found reproduced in the press, and the source sits under the rule.
// Private people's names and handles are struck out with the same hand-drawn
// bar that strikes the motion on slide 8; an official account (a city) keeps
// its name, because being quoted is its job.
//
// THE STRIKE IS ONE MARK, USED TWICE. Ink on the cream clippings, ivory on the
// dark motion page. It always means the same thing: something is being held
// back on purpose.
//
// THREE TYPEFACES. Oswald shouts once, the question on slide 1. Playfair does
// all the talking. Inter is the posts themselves, and the small gold utility:
// counter, sources, credits.
//
// ONE DIVISION, LOW ON THE PAGE, AT THE SAME HEIGHT EVERY TIME: a gold hairline
// with the source and the photo credit under it. Every photograph is credited
// on its own slide, which its licence requires.

const W = 1080;
const H = 1350;
const MARGIN = 92;

/** The division. Same height on every slide. */
const RULE = 1140;
/** Where the last line of narration lands, clear of the division. */
const TEXT_BASE = RULE - 58;
/** Where the clippings start, clear of the counter. */
const CARDS_TOP = 158;

/* --- Pictures ------------------------------------------------------------- */

/** A picture, its aspect, and the treatment it was tuned for. Photographs of
 *  a floodlit lake, a night courtyard and a noon memorial cannot share one
 *  filter, so each names its own. */
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
 *  edges so no two bars are the same shape. Defined once per slide, used by
 *  every <Strike>. */
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

/** Every slide: the picture, its scrim, the frame, then the content. */
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
      <div className="ic-frame" />
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

function Counter({ n, of }: { n: number; of: number }) {
  return (
    <div
      className="kicker ic-on-art"
      style={{
        position: "absolute",
        left: MARGIN,
        top: 92,
        fontSize: 15,
        letterSpacing: "0.3em",
        color: "var(--cc-gold)",
      }}
    >
      {String(n).padStart(2, "0")} <span style={{ opacity: 0.6 }}>/</span>{" "}
      {String(of).padStart(2, "0")}
    </div>
  );
}

/** The small gold label with its tick, as the poster sets "Theme". */
function Label({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      className="kicker ic-on-art"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        fontSize: 16,
        letterSpacing: "0.3em",
        ...style,
      }}
    >
      <span className="ic-tick" />
      {children}
    </div>
  );
}

/** Under the rule: where the facts and the posts came from, then who made
 *  the picture. Small, and subordinate to the talking by construction. */
function UnderRule({ source, credit }: { source?: string; credit: string }) {
  return (
    <div
      className="ic-on-art"
      style={{ position: "absolute", left: MARGIN, top: RULE + 34, width: W - MARGIN * 2 }}
    >
      {source && (
        <div
          className="kicker"
          style={{ fontSize: 15, letterSpacing: "0.08em", lineHeight: 1.65 }}
        >
          {source}
        </div>
      )}
      <div
        style={{
          marginTop: source ? 8 : 0,
          fontFamily: "var(--cc-font-ui)",
          fontSize: 13,
          letterSpacing: "0.02em",
          color: "var(--cc-muted)",
        }}
      >
        {credit}
      </div>
    </div>
  );
}

/* --- The strike ----------------------------------------------------------- */

/** Words behind a hand-drawn bar. The hidden words still set the width, so the
 *  bar is as long as what it hides and the letters can be counted. Ink on the
 *  cream clippings, ivory on the dark motion page. */
export function Strike({ children, tone = "ink" }: { children: string; tone?: "ink" | "ivory" }) {
  const tilt = ((children.length % 3) - 1) * 0.45;
  return (
    <span
      className={`ic-strike ic-strike-${tone}`}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {children}
    </span>
  );
}

/* --- The clippings -------------------------------------------------------- */

/** One post, as it appeared, set on cream. `who` is either an official
 *  account, printed in full, or a private person, struck out. */
export interface Post {
  platform: string;
  who:
    | { kind: "official"; name: string; handle: string; initials: string }
    | { kind: "private"; name: string; handle: string };
  text: string;
  meta: string;
}

function PostCard({ post, width = W - MARGIN * 2, size = 25 }: { post: Post; width?: number; size?: number }) {
  const who = post.who;
  return (
    <div className="ic-clipping" style={{ width, padding: "26px 30px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div className="ic-avatar">{who.kind === "official" ? who.initials : ""}</div>
        <div style={{ flex: 1, lineHeight: 1.3 }}>
          <div style={{ fontWeight: 700, fontSize: 21 }}>
            {who.kind === "official" ? who.name : <Strike>{who.name}</Strike>}
          </div>
          <div style={{ fontSize: 18, color: "rgba(23, 18, 11, 0.55)", marginTop: 3 }}>
            {who.kind === "official" ? who.handle : <Strike>{who.handle}</Strike>}
          </div>
        </div>
      </div>
      <p style={{ margin: "18px 0 0", fontSize: size, lineHeight: 1.42 }}>{post.text}</p>
      <div className="ic-clipping-meta">
        {`${post.platform} \u00b7 ${post.meta}`}
      </div>
    </div>
  );
}

/** A one-line reply, the way a comment sits under a video. */
export interface Reply {
  name: string;
  text: string;
}

function ReplyCard({ reply }: { reply: Reply }) {
  return (
    <div
      className="ic-clipping"
      style={{ display: "inline-flex", alignItems: "center", gap: 16, padding: "18px 26px" }}
    >
      <div className="ic-avatar" style={{ width: 40, height: 40 }} />
      <div>
        <div style={{ fontWeight: 700, fontSize: 17, lineHeight: 1.2 }}>
          <Strike>{reply.name}</Strike>
        </div>
        <div style={{ fontSize: 28, lineHeight: 1.3, marginTop: 4 }}>{reply.text}</div>
      </div>
    </div>
  );
}

/** A newspaper headline, cut out. */
export interface Headline {
  masthead: string;
  headline: string;
  date: string;
}

function HeadlineCard({ item }: { item: Headline }) {
  return (
    <div className="ic-clipping ic-newsprint" style={{ width: 780, padding: "26px 34px 28px" }}>
      <div className="ic-masthead">{item.masthead}</div>
      <div
        style={{
          marginTop: 14,
          fontFamily: "var(--cc-font-display)",
          fontWeight: 700,
          fontSize: 44,
          lineHeight: 1.12,
          letterSpacing: "-0.01em",
        }}
      >
        {item.headline}
      </div>
      <div className="ic-clipping-meta" style={{ borderTop: "none", paddingTop: 0 }}>
        {item.date}
      </div>
    </div>
  );
}

/** What sits over the picture on a beat: posts, replies, or a headline. */
export type Clipping =
  | { kind: "posts"; posts: Post[]; size?: number }
  | { kind: "replies"; replies: Reply[] }
  | { kind: "headline"; item: Headline };

function Clippings({ clipping }: { clipping: Clipping }) {
  return (
    <div
      style={{
        position: "absolute",
        left: MARGIN,
        top: CARDS_TOP,
        width: W - MARGIN * 2,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {clipping.kind === "posts" &&
        clipping.posts.map((p) => <PostCard key={p.text} post={p} size={clipping.size} />)}
      {clipping.kind === "replies" &&
        clipping.replies.map((r, i) => (
          // the second reply steps in, the way a thread does
          <div key={r.text} style={{ marginLeft: i * 120 }}>
            <ReplyCard reply={r} />
          </div>
        ))}
      {clipping.kind === "headline" && <HeadlineCard item={clipping.item} />}
    </div>
  );
}

/* --- The slides ----------------------------------------------------------- */

/** 1. The hook, on the poster's carnival. */
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
    <Ground plate={plate} crop={crop} scrim="ic-scrim-cover">
      <div style={{ position: "absolute", left: MARGIN, top: 84 }}>
        <Lockup width={214} artwork="left" />
      </div>
      <div
        className="ic-on-art"
        style={{ position: "absolute", left: MARGIN, width: W - MARGIN * 2, bottom: H - TEXT_BASE }}
      >
        <Label style={{ marginBottom: 30 }}>{label}</Label>
        {question.map((l) => (
          <p key={l} style={{ ...CONDENSED, fontSize: size }}>
            {l}
          </p>
        ))}
      </div>
      <hr className="ic-rule" style={{ top: RULE }} />
      <UnderRule credit={plate.credit} />
    </Ground>
  );
}

/** 2 to 7. A beat of the story: the photograph, what people said about it laid
 *  over the top, and the talking at the foot, bottom-anchored so its last line
 *  lands on the division however long it runs. */
export function Beat({
  plate,
  crop,
  n,
  of,
  clipping,
  lines,
  size,
  source,
}: {
  plate: Plate;
  crop: Crop;
  n: number;
  of: number;
  clipping?: Clipping;
  lines: Line[];
  size?: number;
  source?: string;
}) {
  return (
    <Ground plate={plate} crop={crop} scrim="ic-scrim">
      <Counter n={n} of={of} />
      {clipping && <Clippings clipping={clipping} />}
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

/** The heart, drawn to read as the like button without being anybody's logo:
 *  an outline, in gold, sat on the baseline of the line it belongs to. */
function Heart({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ display: "inline-block", verticalAlign: "-0.12em", margin: "0 0.08em" }}
      aria-label="likes"
    >
      <path
        d="M12 20.3s-7.1-4.4-9.2-8.6C1.2 8.4 3 4.6 6.6 4.3c2.1-.2 3.9.9 5.4 2.8 1.5-1.9 3.3-3 5.4-2.8 3.6.3 5.4 4.1 3.8 7.4-2.1 4.2-9.2 8.6-9.2 8.6z"
        fill="none"
        stroke="var(--cc-gold-bright)"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 8. The motion, struck out, and the terms on which it will be read. It is
 *  the poster's carnival again, at dusk, with the poster's masthead: the deck
 *  ends where it began, one step closer to the room. */
export function Motion({
  plate,
  crop,
  label,
  motion,
  reveal,
  details,
  lines,
  cta,
}: {
  plate: Plate;
  crop: Crop;
  label: string;
  motion: ReactNode;
  /** the reveal terms, either side of the heart, then a second line */
  reveal: [string, string, string];
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
        <div className="kicker" style={{ fontSize: 15, letterSpacing: "0.3em" }}>
          Debate Club #11
        </div>
        {details.map((line, i) => (
          <p
            key={line}
            style={{
              margin: 0,
              marginTop: i === 0 ? 12 : 2,
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
        <Label style={{ marginBottom: 30 }}>{label}</Label>
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
            fontStyle: "italic",
            fontSize: 34,
            lineHeight: 1.3,
            color: "var(--cc-gold-bright)",
          }}
        >
          {reveal[0]}
          <Heart size={34} />
          {reveal[1]}
          <br />
          {reveal[2]}
        </p>
      </div>

      <hr className="ic-rule" style={{ top: RULE }} />
      <div
        className="ic-on-art"
        style={{
          position: "absolute",
          left: MARGIN,
          right: MARGIN,
          top: RULE + 34,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          {lines.map((l) => (
            <div
              key={l}
              className="label"
              style={{ fontSize: 14, letterSpacing: "0.12em", lineHeight: 1.7 }}
            >
              {l}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "right" }}>
          {cta.map((l) => (
            <div
              key={l}
              className="kicker"
              style={{ fontSize: 17, letterSpacing: "0.26em", lineHeight: 1.75 }}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </Ground>
  );
}
