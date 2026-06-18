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
                    : "text-sm font-semibold text-slate-950"
                }
              >
                {option.label}
              </span>
              <span
                className={
                  large
                    ? "font-mono text-2xl text-amber-200"
                    : "font-mono text-sm text-slate-500"
                }
              >
                {percentage}%
              </span>
            </div>
            <div
              className={
                large
                  ? "h-7 overflow-hidden rounded-sm bg-white/10"
                  : "h-4 overflow-hidden rounded-sm bg-slate-200"
              }
            >
              <div
                className={
                  large
                    ? "h-full rounded-sm bg-amber-300 transition-all duration-700"
                    : "h-full rounded-sm bg-slate-950 transition-all duration-500"
                }
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div
              className={
                large
                  ? "font-mono text-sm uppercase tracking-[0.18em] text-white/55"
                  : "font-mono text-xs uppercase tracking-[0.16em] text-slate-400"
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
