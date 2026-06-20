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
                    : "text-sm font-semibold text-[#08080d]"
                }
              >
                {option.label}
              </span>
              <span
                className={
                  large
                    ? "font-mono text-2xl text-[#f0d36a]"
                    : "font-mono text-sm text-[#7a6a42]"
                }
              >
                {percentage}%
              </span>
            </div>
            <div
              className={
                  large
                    ? "h-7 overflow-hidden rounded-sm bg-white/10"
                    : "h-4 overflow-hidden rounded-sm bg-[#e1d5bd]"
              }
            >
              <div
                className={
                  large
                    ? "h-full rounded-sm bg-[#f0d36a] transition-all duration-700"
                    : "h-full rounded-sm bg-[#08080d] transition-all duration-500"
                }
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div
              className={
                  large
                    ? "font-mono text-sm uppercase tracking-[0.18em] text-[#d8cfbd]/65"
                    : "font-mono text-xs uppercase tracking-[0.16em] text-[#7a6a42]/70"
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
