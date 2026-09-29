import type { Ref } from "react";
import { Logo } from "@/components/logo";
import type { ReadyAssetMotion } from "@/lib/debate-assets";
import styles from "./asset-card.module.css";

export type AssetStage = "before" | "after" | "swing";

const DEGREES = ["−3", "−2", "−1", "0", "+1", "+2", "+3"];
const SMALL_NUMBERS = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
  "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
  "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty",
];

function countWord(value: number) {
  return SMALL_NUMBERS[value] ?? String(value);
}

function percent(count: number, total: number) {
  return `${Math.round((count / total) * 100)}%`;
}

function Standing({
  motion,
  counts,
}: {
  motion: ReadyAssetMotion;
  counts: number[];
}) {
  const left = counts.slice(0, 3).reduce((total, count) => total + count, 0);
  const right = counts.slice(4).reduce((total, count) => total + count, 0);
  const highest = Math.max(1, ...counts);

  return (
    <div className={styles.chart}>
      <div className={styles.totals}>
        <div className={`${styles.total} ${styles.leftTotal}`}>
          <strong>{percent(left, motion.matchedVoters)}</strong>
          <span>{motion.leftLabel}</span>
        </div>
        <span className={styles.neutralTotal}>
          {percent(counts[3], motion.matchedVoters)} too close to call
        </span>
        <div className={`${styles.total} ${styles.rightTotal}`}>
          <strong>{percent(right, motion.matchedVoters)}</strong>
          <span>{motion.rightLabel}</span>
        </div>
      </div>
      <div className={styles.distribution}>
        {counts.map((count, index) => (
          <div className={styles.column} key={DEGREES[index]}>
            {count > 0 && <span className={styles.columnCount}>{count}</span>}
            <div
              className={`${styles.bar} ${index < 3 ? styles.leftBar : index === 3 ? styles.neutralBar : styles.rightBar}`}
              style={{ height: `${(count / highest) * 182}px` }}
            />
          </div>
        ))}
      </div>
      <div className={styles.baseline} />
      <div className={styles.scale}>
        {DEGREES.map((degree) => <span key={degree}>{degree}</span>)}
      </div>
    </div>
  );
}

function Swing({ motion }: { motion: ReadyAssetMotion }) {
  const parts = [
    { count: motion.movedAgainst, label: "← Toward Against", tone: styles.leftSegment },
    { count: motion.held, label: "Held their ground", tone: styles.heldSegment },
    { count: motion.movedFor, label: "Toward For →", tone: styles.rightSegment },
  ];
  const shift = motion.averageShift;

  return (
    <>
      <div className={styles.swingTopic}>Motion {motion.order} · <b>The swing</b></div>
      <h2 className={styles.swingHeadline}>
        {countWord(motion.movedAgainst)} moved Against. {countWord(motion.movedFor)} moved For. {countWord(motion.held)} held.
      </h2>
      <p className={styles.swingSub}>
        {shift === 0
          ? "No net shift in the average"
          : `Average shift: ${Math.abs(shift).toFixed(2)} points toward ${shift < 0 ? "Against" : "For"}`}
      </p>
      <div className={styles.chart}>
        <div className={styles.movement}>
          {parts.map((part) => (
            <div
              key={part.label}
              className={`${styles.segment} ${part.tone}`}
              style={{ width: `${(part.count / motion.matchedVoters) * 100}%` }}
            >
              {part.count > 0 && <span>{part.count}</span>}
            </div>
          ))}
        </div>
        <div className={styles.movementLabels}>
          {parts.map((part) => (
            <span
              key={part.label}
              className={part.tone}
              style={{ width: `${(part.count / motion.matchedVoters) * 100}%` }}
            >
              {part.count > 0 ? part.label : ""}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

export function AssetCard({
  motion,
  stage,
  elementRef,
}: {
  motion: ReadyAssetMotion;
  stage: AssetStage;
  elementRef?: Ref<HTMLDivElement>;
}) {
  const counts = stage === "before" ? motion.before : motion.after;
  const motionClass = motion.motion.length > 160
    ? styles.motionVeryLong
    : motion.motion.length > 100
      ? styles.motionLong
      : "";
  return (
    <div
      ref={elementRef}
      className={styles.card}
      role="region"
      aria-label={`${stage === "swing" ? "Swing" : stage === "before" ? "Before" : "After"} card for motion ${motion.order}`}
    >
      <div className={styles.inset} />
      <div className={styles.body}>
        <Logo variant="center" className={styles.logo} />
        {stage === "swing" ? (
          <Swing motion={motion} />
        ) : (
          <>
            <h2 className={`${styles.motion} ${motionClass}`}>{motion.motion}</h2>
            <p className={styles.stage}>{stage === "before" ? "Before the debate" : "After the debate"}</p>
            <Standing motion={motion} counts={counts} />
          </>
        )}
        <p className={styles.caption}>
          {motion.matchedVoters} voters · same people, both rounds
        </p>
      </div>
    </div>
  );
}
