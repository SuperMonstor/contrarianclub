import type { PollOptionResult } from "@/lib/types";

type ScaleResultsProps = {
  options: PollOptionResult[];
  totalVotes: number;
  large?: boolean;
  leftLabel?: string | null;
  rightLabel?: string | null;
};

export function ScaleResults({
  leftLabel,
  options,
  rightLabel,
  totalVotes,
  large = false,
}: ScaleResultsProps) {
  const scaleOptions = [...options].sort(
    (first, second) =>
      (first.scale_value ?? first.sort_order) -
      (second.scale_value ?? second.sort_order),
  );
  const weightedTotal = scaleOptions.reduce(
    (total, option) => total + (option.scale_value ?? 0) * option.votes,
    0,
  );
  const average =
    totalVotes === 0 ? null : Math.round((weightedTotal / totalVotes) * 10) / 10;
  const axisLeftLabel =
    leftLabel ?? getScaleResultSideLabel(scaleOptions, -2, "Opposition");
  const axisRightLabel =
    rightLabel ?? getScaleResultSideLabel(scaleOptions, 2, "Proposition");
  const maxVotes = scaleOptions.reduce(
    (top, option) => Math.max(top, option.votes),
    0,
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="club-label text-[0.65rem]">Average position</p>
        <p
          className={
            large
              ? "club-display mt-1 text-5xl text-[color:var(--cc-gold-bright)]"
              : "club-display mt-1 text-3xl text-[color:var(--cc-gold-bright)]"
          }
        >
          {average === null ? "No votes" : formatSignedValue(average)}
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {scaleOptions.map((option) => {
          // Scale each bar against the leading option so the tallest bar
          // fills its cell and distinct vote counts stay distinguishable
          // (a small floor keeps an empty option visible as a hairline).
          const height =
            maxVotes === 0
              ? 0
              : Math.max(option.votes === 0 ? 0 : 4, (option.votes / maxVotes) * 100);

          return (
            <div key={option.id} className="flex min-w-0 flex-col items-center gap-2">
              <div
                className={
                  large
                    ? "flex h-52 w-full items-end rounded-sm border border-[color:var(--cc-line)] bg-[color:var(--cc-ivory)]/[0.06] p-1.5"
                    : "flex h-32 w-full items-end rounded-sm border border-[color:var(--cc-line)] bg-[color:var(--cc-ivory)]/[0.06] p-1"
                }
              >
                <div
                  className="w-full rounded-[3px] bg-[color:var(--cc-gold)] transition-all duration-700"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="club-mono text-xs font-bold text-[color:var(--cc-gold-bright)]">
                {formatSignedValue(option.scale_value ?? 0)}
              </span>
              <span className="club-mono text-[0.65rem] uppercase tracking-[0.12em] text-[color:var(--cc-faint)]">
                {option.votes}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-start justify-between gap-6 text-xs text-[color:var(--cc-muted)]">
        <span className="max-w-[45%] leading-5">{axisLeftLabel}</span>
        <span className="max-w-[45%] text-right leading-5">{axisRightLabel}</span>
      </div>
    </div>
  );
}

export function formatSignedValue(value: number) {
  if (value > 0) return `+${value}`;
  return String(value);
}

function getScaleResultSideLabel(
  options: PollOptionResult[],
  scaleValue: number,
  fallback: string,
) {
  const label = options.find((option) => option.scale_value === scaleValue)?.label;
  if (!label) return fallback;
  return label
    .replace(/^Absolutely sure:\s*/i, "")
    .replace(/^Agree with\s+/i, "")
    .replace(/^Leaning towards\s+/i, "")
    .replace(/^Strongly\s+/i, "")
    .replace(/^Lean\s+/i, "")
    .trim();
}
