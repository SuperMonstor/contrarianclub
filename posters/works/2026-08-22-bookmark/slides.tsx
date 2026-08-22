import type { CSSProperties, ReactNode } from "react";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Six bookmarks, six answers to the same question, so that one can be picked
// rather than assembled. This is not a carousel: the slides do not follow each
// other, they compete.
//
// What a bookmark has to do, which is not what a poster has to do:
//
//   It is held, not scrolled. Type can go small and reward a closer look.
//   Most of the time it is inside a book with only the top inch and a half
//   showing, so the top band carries identity and nothing that needs finishing.
//   It is kept for months, so it cannot name a date or an event.
//   It is cut by a machine with a tolerance, so nothing meaningful goes within
//   0.2in of the trim.
//
// The grammar the six share, so they read as one family:
//
//   Identity at the top.        The lockup or a gold mark, in the band that
//                               shows above the pages. Never the small print.
//   One voice line.             Exactly one sentence you are meant to remember.
//                               Where it sits is what changes between variations.
//   The address at the foot.    contrarian.club, in gold micro caps, always
//                               last, always the same size.
//   Gold is punctuation.        Rules, numerals and the address. Never a fill.
//
// The art is Renaissance and every painting is a person reading or arguing,
// because that is what the object is for. All public domain, via Wikimedia:
//
//   athens     Raphael, The School of Athens, 1511. Cropped to the two figures
//              at the centre, one pointing up and one pointing out. The whole
//              club in one gesture.
//   jerome     Antonello da Messina, Saint Jerome in His Study, c. 1475.
//   augustine  Botticelli, Saint Augustine in His Study, c. 1480. A man in the
//              middle of changing his mind, which is the club's best moment.

const GOLD = "var(--cc-gold)";
const IVORY = "var(--cc-ivory)";
const SHADOW =
  "0 1px 2px rgba(0,0,0,0.92), 0 2px 12px rgba(0,0,0,0.78), 0 6px 40px rgba(0,0,0,0.6)";

export interface Art {
  src: string;
  position?: string;
}

/** Gold micro caps. The smallest voice on the piece: the address, the kickers,
 *  the labels. 22px is 5.3pt, which is small but this is held in a hand. */
function Micro({
  children,
  color = GOLD,
  size = 22,
  tracking = 0.3,
  style,
}: {
  children: ReactNode;
  color?: string;
  size?: number;
  tracking?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        fontFamily: "var(--cc-font-ui)",
        fontWeight: 600,
        fontSize: size,
        letterSpacing: `${tracking}em`,
        // tracking pushes the last letter out; pad the front to keep it centred
        paddingLeft: `${tracking}em`,
        textTransform: "uppercase",
        color,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function Hairline({ width = "100%", opacity = 1 }: { width?: number | string; opacity?: number }) {
  return (
    <div
      style={{
        width,
        height: 1,
        opacity,
        background:
          "linear-gradient(90deg, transparent, var(--cc-line-strong) 20%, var(--cc-line-strong) 80%, transparent)",
      }}
    />
  );
}

/** A short gold tick. Opens a block without the ceremony of a full rule. */
function Tick({ width = 78 }: { width?: number }) {
  return <div style={{ width, height: 2, background: GOLD }} />;
}

const ADDRESS = "contrarian.club";

// ---------------------------------------------------------------------------
// 1. The Column
// The painting runs the whole 6 inches and the type stands out of the way at
// both ends. The loudest of the six, and the one that still reads as the club
// from across a table.
// ---------------------------------------------------------------------------

export function Column({ art }: { art: Art }) {
  return (
    <div className="bm-sheet">
      <img className="bm-art bm-art--fresco" src={art.src} alt="" style={{ objectPosition: art.position }} />
      <div className="bm-scrim bm-scrim--column" />

      <div
        className="bm-body"
        style={{ padding: "96px 54px 82px", alignItems: "center", textShadow: SHADOW }}
      >
        <Lockup width={296} align="center" />

        <div style={{ flex: 1 }} />

        <h1
          className="hero"
          style={{ fontSize: 76, lineHeight: 1.06, textAlign: "center", margin: 0 }}
        >
          Read it.
          <br />
          Then argue
          <br />
          with it.
        </h1>

        <div style={{ height: 40 }} />
        <Tick />
        <div style={{ height: 34 }} />
        <Micro color="var(--cc-parchment)">{ADDRESS}</Micro>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. The Plate
// A page out of an exhibition catalogue: engraved frame, a plate with its
// caption, then the house rules set as a numbered list. The quietest, and the
// only one with something to read twice.
// ---------------------------------------------------------------------------

export interface Rule {
  numeral: string;
  text: string;
}

export function Plate({
  art,
  caption,
  kicker,
  rules,
  closing,
}: {
  art: Art;
  caption: string;
  kicker: string;
  rules: Rule[];
  closing: string;
}) {
  return (
    <div className="bm-sheet">
      <div className="bm-frame" />

      <div className="bm-body" style={{ padding: "88px 62px 74px", alignItems: "center" }}>
        <Lockup width={264} align="center" />

        <div style={{ height: 34 }} />
        <Hairline />
        <div style={{ height: 30 }} />

        <div className="bm-plate" style={{ height: 552 }}>
          <img src={art.src} alt="" style={{ objectPosition: art.position }} className="bm-art--study" />
          <div className="bm-plate-wash" />
        </div>

        <div
          className="closing"
          style={{
            fontSize: 20,
            lineHeight: 1.35,
            textAlign: "center",
            textWrap: "balance",
            marginTop: 18,
            color: "var(--cc-muted)",
            fontStyle: "italic",
          }}
        >
          {caption}
        </div>

        <div style={{ height: 34 }} />
        <Micro>{kicker}</Micro>
        <div style={{ height: 26 }} />

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 36 }}>
          {rules.map((rule, i) => (
            <div key={rule.numeral} style={{ display: "flex", flexDirection: "column", gap: 36 }}>
              {i > 0 && <Hairline opacity={0.6} />}
              <div style={{ display: "flex", gap: 18, alignItems: "baseline" }}>
                <span
                  style={{
                    fontFamily: "var(--cc-font-display)",
                    fontStyle: "italic",
                    fontSize: 26,
                    color: GOLD,
                    minWidth: 38,
                  }}
                >
                  {rule.numeral}
                </span>
                <span
                  className="value"
                  style={{ fontSize: 33, lineHeight: 1.28, color: IVORY }}
                >
                  {rule.text}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, minHeight: 40 }} />
        <Hairline />
        <div style={{ height: 28 }} />
        <span className="closing" style={{ fontSize: 25, textAlign: "center", lineHeight: 1.4 }}>
          {closing}
        </span>
        <div style={{ height: 24 }} />
        <Micro color="var(--cc-gold-deep)">{ADDRESS}</Micro>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. The Manifesto
// No painting at all. One sentence, set large, on black. The cheapest of the
// six to print and the one that survives being photocopied.
// ---------------------------------------------------------------------------

export function Manifesto({
  lead,
  accent,
  tail,
  kicker,
  closing,
}: {
  lead: string;
  accent: string;
  tail: string;
  kicker: string;
  closing: string;
}) {
  return (
    <div className="bm-sheet">
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 470,
          left: 22,
          zIndex: 1,
          fontFamily: "var(--cc-font-display)",
          fontSize: 360,
          lineHeight: 1,
          color: GOLD,
          opacity: 0.1,
        }}
      >
        &ldquo;
      </span>

      <div className="bm-body" style={{ padding: "150px 62px 86px" }}>
        <Tick width={92} />
        <div style={{ height: 26 }} />
        <Micro size={21} tracking={0.34}>
          {kicker}
        </Micro>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 className="hero" style={{ fontSize: 60, lineHeight: 1.2, margin: 0 }}>
            {lead} <span style={{ color: GOLD }}>{accent}</span> {tail}
          </h1>
          <div style={{ height: 40 }} />
          <span className="closing" style={{ fontSize: 27, lineHeight: 1.4 }}>
            {closing}
          </span>
        </div>

        <Hairline />
        <div style={{ height: 40 }} />
        <Lockup width={252} />
        <div style={{ height: 32 }} />
        <Micro color="var(--cc-muted)" size={21}>
          {ADDRESS}
        </Micro>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. The Ticket
// The bookmark as an admission stub: a picture above the perforation, the
// terms below it. The details are the club's actual format, so it stays true
// however long someone keeps it.
// ---------------------------------------------------------------------------

export interface Term {
  label: string;
  value: string;
}

export function Ticket({
  art,
  kicker,
  line,
  terms,
  closing,
}: {
  art: Art;
  kicker: string;
  line: ReactNode;
  terms: Term[];
  closing: string;
}) {
  return (
    <div className="bm-sheet">
      <div style={{ position: "absolute", inset: "0 0 auto 0", height: 700, zIndex: 0 }}>
        <img
          className="bm-art bm-art--figure"
          src={art.src}
          alt=""
          style={{ objectPosition: art.position }}
        />
        <div className="bm-scrim bm-scrim--ticket" />
      </div>

      <div className="bm-body" style={{ padding: "78px 56px 74px" }}>
        <Micro size={23} tracking={0.36} style={{ textShadow: SHADOW }}>
          {kicker}
        </Micro>

        <div style={{ height: 356 }} />

        <h1
          className="hero"
          style={{ fontSize: 54, lineHeight: 1.12, margin: 0, textShadow: SHADOW }}
        >
          {line}
        </h1>

        <div style={{ height: 74 }} />
        <div className="bm-perf" style={{ width: "calc(100% + 112px)", marginLeft: -56 }} />
        <div style={{ height: 62 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 46 }}>
          {terms.map((term, i) => (
            <div key={term.label} style={{ display: "flex", flexDirection: "column", gap: 46 }}>
              {i > 0 && <Hairline opacity={0.55} />}
              <div>
                <div className="label" style={{ fontSize: 21, letterSpacing: "0.28em" }}>
                  {term.label}
                </div>
                <div className="value" style={{ fontSize: 34, lineHeight: 1.24, marginTop: 10 }}>
                  {term.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, minHeight: 44 }} />
        <span className="closing" style={{ fontSize: 26, lineHeight: 1.4 }}>
          {closing}
        </span>
        <div style={{ height: 40 }} />
        <Hairline />
        <div style={{ height: 40 }} />
        <Lockup width={244} />
        <div style={{ height: 28 }} />
        <Micro color="var(--cc-gold-deep)" size={21}>
          {ADDRESS}
        </Micro>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. The Index
// What the club actually argues, listed. The painting is held back until it is
// wallpaper. This is the one that answers "so what happens there" while
// someone is holding it.
// ---------------------------------------------------------------------------

export function Index({
  art,
  kicker,
  motions,
  foot,
}: {
  art: Art;
  kicker: string;
  motions: { numeral: string; text: string }[];
  foot: string;
}) {
  return (
    <div className="bm-sheet">
      <img
        className="bm-art bm-art--ghost"
        src={art.src}
        alt=""
        style={{ objectPosition: art.position }}
      />
      <div className="bm-scrim bm-scrim--index" />

      <div className="bm-body" style={{ padding: "100px 54px 78px", alignItems: "center" }}>
        <Lockup width={258} align="center" />

        <div style={{ height: 44 }} />
        <Micro size={21} tracking={0.3}>
          {kicker}
        </Micro>
        <div style={{ height: 20 }} />
        <Hairline />

        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 40,
            marginTop: 34,
          }}
        >
          {motions.map((motion, i) => (
            <div key={motion.numeral} style={{ display: "flex", flexDirection: "column", gap: 40 }}>
              {i > 0 && <Hairline opacity={0.5} />}
              <div>
                <div
                  style={{
                    fontFamily: "var(--cc-font-display)",
                    fontStyle: "italic",
                    fontSize: 24,
                    color: GOLD,
                    marginBottom: 12,
                  }}
                >
                  {motion.numeral}
                </div>
                <div className="value" style={{ fontSize: 35, lineHeight: 1.26 }}>
                  {motion.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, minHeight: 40 }} />
        <Hairline />
        <div style={{ height: 30 }} />
        <span
          className="closing"
          style={{ fontSize: 26, textAlign: "center", lineHeight: 1.4 }}
        >
          {foot}
        </span>
        <div style={{ height: 22 }} />
        <Micro size={21}>{ADDRESS}</Micro>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. The Spine
// A gallery label. One figure, one line, and the address set vertically up the
// left edge where a bookmark's own spine would be. The most restrained of the
// six and the best of them at small sizes.
// ---------------------------------------------------------------------------

export function Spine({ art, line }: { art: Art; line: ReactNode }) {
  return (
    <div className="bm-sheet">
      <img
        className="bm-art bm-art--figure"
        src={art.src}
        alt=""
        style={{ objectPosition: art.position }}
      />
      <div className="bm-scrim bm-scrim--spine" />

      <div className="bm-spine-strip">{ADDRESS}</div>

      <div
        className="bm-body"
        style={{ padding: "104px 58px 82px 100px", textShadow: SHADOW }}
      >
        <Tick width={70} />
        <div style={{ height: 34 }} />
        <h1 className="hero" style={{ fontSize: 58, lineHeight: 1.14, margin: 0 }}>
          {line}
        </h1>

        <div style={{ flex: 1 }} />

        <Lockup width={236} />
        <div style={{ height: 26 }} />
        <Micro color="var(--cc-muted)" size={20} tracking={0.26}>
          Bangalore
        </Micro>
      </div>
    </div>
  );
}
