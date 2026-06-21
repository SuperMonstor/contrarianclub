import type { DebateSwingSummary } from "@/lib/types";
import { formatSignedValue } from "@/components/scale-results";

type SwingRevealProps = {
  swing: DebateSwingSummary;
};

// Map a -3..+3 scale position to a padded offset along the axis so markers
// at the extremes (+/-3) stay inside the track instead of clipping the edge.
function axisPercent(value: number) {
  const clamped = Math.max(-3, Math.min(3, value));
  return 6 + ((clamped + 3) / 6) * 88;
}

export function SwingReveal({ swing }: SwingRevealProps) {
  if (swing.matchedVotes === 0) {
    return (
      <div>
        <p className="club-display text-3xl leading-tight text-[color:var(--cc-parchment)] sm:text-5xl lg:text-6xl">
          Not enough matched votes to measure the swing yet.
        </p>
        <p className="mt-4 text-base text-[color:var(--cc-muted)] sm:text-lg">
          The swing appears once the same voters have cast both a pre and post
          vote.
        </p>
      </div>
    );
  }

  return swing.format === "scale" ? (
    <ScaleSwing swing={swing} />
  ) : (
    <ChoiceSwing swing={swing} />
  );
}

function ScaleSwing({ swing }: { swing: DebateSwingSummary }) {
  const leftLabel = swing.scaleLeftLabel ?? "Opposition";
  const rightLabel = swing.scaleRightLabel ?? "Proposition";

  const verdict =
    swing.netSwing === null || swing.netSwing === 0
      ? "The room held its ground."
      : `The room swung toward ${swing.swingWinnerLabel}.`;

  const hasAverages = swing.averagePre !== null && swing.averagePost !== null;

  return (
    <div>
      <h2 className="club-display mt-3 max-w-5xl text-4xl leading-[1.04] sm:mt-4 sm:text-6xl lg:text-7xl">
        {verdict}
      </h2>
      {swing.netSwing !== null && swing.netSwing !== 0 && (
        <p className="mt-3 text-lg text-[color:var(--cc-parchment)] sm:text-2xl">
          {formatSignedValue(swing.netSwing)} net shift across{" "}
          {swing.matchedVotes} matched{" "}
          {swing.matchedVotes === 1 ? "voter" : "voters"}.
        </p>
      )}

      {hasAverages && (
        <div className="mt-8 max-w-4xl sm:mt-12">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <span className="club-display text-lg text-[color:var(--cc-ivory)] sm:text-2xl">
              {leftLabel}
            </span>
            <span className="club-display text-lg text-[color:var(--cc-ivory)] sm:text-2xl">
              {rightLabel}
            </span>
          </div>
          <BeforeAfterAxis
            before={swing.averagePre as number}
            after={swing.averagePost as number}
          />
        </div>
      )}

      <div className="mt-8 grid max-w-4xl gap-3 sm:mt-12 sm:grid-cols-3">
        <MovementStat
          label={`Toward ${rightLabel}`}
          count={swing.movedTowardRight}
          total={swing.matchedVotes}
          tone="gold"
        />
        <MovementStat
          label={`Toward ${leftLabel}`}
          count={swing.movedTowardLeft}
          total={swing.matchedVotes}
          tone="wine"
        />
        <MovementStat
          label="Held"
          count={swing.unchangedVotes}
          total={swing.matchedVotes}
          tone="muted"
        />
      </div>

      <p className="mt-6 text-sm text-[color:var(--cc-muted)] sm:text-base">
        {swing.crossedVotes} crossed sides &middot; final lean{" "}
        <span className="text-[color:var(--cc-parchment)]">
          {swing.finalLeaderLabel ?? "evenly split"}
        </span>
      </p>
    </div>
  );
}

function BeforeAfterAxis({
  before,
  after,
}: {
  before: number;
  after: number;
}) {
  const beforePct = axisPercent(before);
  const afterPct = axisPercent(after);
  const left = Math.min(beforePct, afterPct);
  const width = Math.abs(afterPct - beforePct);

  return (
    <div className="relative h-24 sm:h-28">
      {/* track */}
      <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[color:var(--cc-ivory)]/[0.08]" />
      {/* center (neutral) tick */}
      <div className="absolute left-1/2 top-1/2 h-5 w-px -translate-x-1/2 -translate-y-1/2 bg-[color:var(--cc-line-strong)]" />
      {/* shift segment */}
      <div
        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#8a6c2c] to-[#f0d36a]"
        style={{ left: `${left}%`, width: `${width}%` }}
      />
      {/* before marker (label above the line) */}
      <AxisMarker pct={beforePct} value={before} label="Before" placement="above" muted />
      {/* after marker (label below the line) */}
      <AxisMarker pct={afterPct} value={after} label="After" placement="below" />
    </div>
  );
}

function AxisMarker({
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
    <div className="flex flex-col items-center whitespace-nowrap">
      <span
        className={`club-label text-[0.55rem] ${
          muted ? "text-[color:var(--cc-faint)]" : "text-[color:var(--cc-gold)]"
        }`}
      >
        {label}
      </span>
      <span
        className={`club-mono text-sm font-bold sm:text-base ${
          muted
            ? "text-[color:var(--cc-muted)]"
            : "text-[color:var(--cc-gold-bright)]"
        }`}
      >
        {formatSignedValue(value)}
      </span>
    </div>
  );

  return (
    <div
      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${pct}%` }}
    >
      <div className="relative flex items-center justify-center">
        {placement === "above" && (
          <div className="absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2">
            {text}
          </div>
        )}
        <div
          className={`h-6 w-6 rounded-full border-2 sm:h-7 sm:w-7 ${
            muted
              ? "border-[color:var(--cc-muted)] bg-[color:var(--cc-char)]"
              : "border-[color:var(--cc-gold-bright)] bg-[color:var(--cc-gold)] shadow-[0_0_0_4px_rgba(240,211,106,0.18)]"
          }`}
        />
        {placement === "below" && (
          <div className="absolute top-full left-1/2 mt-1.5 -translate-x-1/2">
            {text}
          </div>
        )}
      </div>
    </div>
  );
}

function ChoiceSwing({ swing }: { swing: DebateSwingSummary }) {
  const maxVotes = Math.max(
    1,
    ...swing.optionTotals.flatMap((option) => [option.preVotes, option.postVotes]),
  );

  return (
    <div>
      <h2 className="club-display mt-3 max-w-5xl text-4xl leading-[1.04] sm:mt-4 sm:text-6xl lg:text-7xl">
        {swing.changedPercent}% changed their vote.
      </h2>
      <p className="mt-3 text-lg text-[color:var(--cc-parchment)] sm:text-2xl">
        {swing.changedVotes} of {swing.matchedVotes} matched{" "}
        {swing.matchedVotes === 1 ? "voter" : "voters"} moved between rounds.
      </p>

      <div className="mt-8 max-w-4xl space-y-5 sm:mt-12">
        {swing.optionTotals.map((option) => (
          <div key={option.label}>
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <span className="text-lg font-semibold text-[color:var(--cc-ivory)] sm:text-2xl">
                {option.label}
              </span>
              <span
                className={`club-mono text-base font-bold sm:text-xl ${
                  option.delta > 0
                    ? "text-[color:var(--cc-gold-bright)]"
                    : option.delta < 0
                      ? "text-[color:var(--cc-wine-bright)]"
                      : "text-[color:var(--cc-muted)]"
                }`}
              >
                {option.delta > 0 ? "+" : ""}
                {option.delta}
              </span>
            </div>
            <div className="space-y-1.5">
              <BeforeAfterBar
                label="Before"
                votes={option.preVotes}
                max={maxVotes}
                muted
              />
              <BeforeAfterBar
                label="After"
                votes={option.postVotes}
                max={maxVotes}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BeforeAfterBar({
  label,
  votes,
  max,
  muted = false,
}: {
  label: string;
  votes: number;
  max: number;
  muted?: boolean;
}) {
  const percent = Math.round((votes / max) * 100);

  return (
    <div className="flex items-center gap-3">
      <span className="club-label w-14 shrink-0 text-[0.55rem] text-[color:var(--cc-faint)]">
        {label}
      </span>
      <div className="h-4 flex-1 overflow-hidden rounded-sm border border-[color:var(--cc-line)] bg-[color:var(--cc-ivory)]/[0.06] sm:h-5">
        <div
          className={`h-full rounded-[3px] transition-all duration-700 ${
            muted
              ? "bg-[color:var(--cc-muted)]/60"
              : "bg-gradient-to-r from-[#c8a24a] to-[#f0d36a]"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="club-mono w-8 shrink-0 text-right text-sm font-bold text-[color:var(--cc-gold-bright)]">
        {votes}
      </span>
    </div>
  );
}

function MovementStat({
  label,
  count,
  total,
  tone,
}: {
  label: string;
  count: number;
  total: number;
  tone: "gold" | "wine" | "muted";
}) {
  const percent = total === 0 ? 0 : Math.round((count / total) * 100);
  const valueClass =
    tone === "gold"
      ? "text-[color:var(--cc-gold-bright)]"
      : tone === "wine"
        ? "text-[color:var(--cc-wine-bright)]"
        : "text-[color:var(--cc-ivory)]";

  return (
    <div className="club-tile p-4 sm:p-5">
      <p className="club-label text-[0.6rem]">{label}</p>
      <p className={`club-display mt-2 text-3xl sm:text-4xl ${valueClass}`}>
        {percent}%
      </p>
      <p className="mt-1 text-xs text-[color:var(--cc-muted)] sm:text-sm">
        {count} {count === 1 ? "voter" : "voters"}
      </p>
    </div>
  );
}
