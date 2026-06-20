import type { PollOptionResult } from "@/lib/types";

type ResultBarsProps = {
  options: PollOptionResult[];
  totalVotes: number;
  large?: boolean;
};

export function ResultBars({ options, totalVotes, large = false }: ResultBarsProps) {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const percentage =
          totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);

        return (
          <div key={option.id} className="space-y-2">
            <div className="flex items-end justify-between gap-4">
              <span
                className={
                  large
                    ? "text-xl font-semibold text-white"
                    : "text-sm font-semibold text-[color:var(--cc-parchment)]"
                }
              >
                {option.label}
              </span>
              <span
                className={
                  large
                    ? "font-mono text-2xl text-[#f0d36a]"
                    : "club-mono text-sm font-semibold text-[color:var(--cc-gold-bright)]"
                }
              >
                {percentage}%
              </span>
            </div>
            <div
              className={
                  large
                    ? "h-7 overflow-hidden rounded-sm bg-white/10"
                    : "h-4 overflow-hidden rounded-sm border border-[color:var(--cc-line)] bg-[color:var(--cc-ivory)]/[0.06]"
              }
            >
              <div
                className={
                  large
                    ? "h-full rounded-sm bg-[#f0d36a] transition-all duration-700"
                    : "h-full rounded-[3px] bg-gradient-to-r from-[#c8a24a] to-[#f0d36a] transition-all duration-500"
                }
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div
              className={
                  large
                    ? "font-mono text-sm uppercase tracking-[0.18em] text-[#d8cfbd]/65"
                    : "club-mono text-xs uppercase tracking-[0.16em] text-[color:var(--cc-faint)]"
              }
            >
              {option.votes} {option.votes === 1 ? "vote" : "votes"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
