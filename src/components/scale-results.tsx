import type { PollOptionResult } from "@/lib/types";

type ScaleResultsProps = {
  options: PollOptionResult[];
  totalVotes: number;
  large?: boolean;
};

export function ScaleResults({
  options,
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

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
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
        <div className="text-right text-xs text-[color:var(--cc-muted)]">
          <p>Opposition</p>
          <p>to Proposition</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {scaleOptions.map((option) => {
          const percentage =
            totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
          const height =
            totalVotes === 0 ? 8 : Math.min(100, Math.max(12, percentage * 1.6));

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
                  className="w-full rounded-[3px] bg-gradient-to-t from-[#c8a24a] to-[#f0d36a] transition-all duration-700"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="club-mono text-xs font-bold text-[color:var(--cc-gold-bright)]">
                {formatSignedValue(option.scale_value ?? 0)}
              </span>
              <span className="line-clamp-2 min-h-8 text-center text-[0.68rem] leading-4 text-[color:var(--cc-muted)]">
                {option.label}
              </span>
              <span className="club-mono text-[0.65rem] uppercase tracking-[0.12em] text-[color:var(--cc-faint)]">
                {option.votes}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function formatSignedValue(value: number) {
  if (value > 0) return `+${value}`;
  return String(value);
}
