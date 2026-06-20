import { Check } from "lucide-react";
import type { PollOptionResult } from "@/lib/types";
import { formatSignedValue } from "@/components/scale-results";

type ScaleChoiceScaleProps = {
  options: PollOptionResult[];
  selectedOptionId?: string;
  disabled?: boolean;
  centerLabel?: string | null;
  large?: boolean;
  legendOnly?: boolean;
  leftLabel?: string | null;
  onSelect?: (optionId: string) => void;
  rightLabel?: string | null;
};

export function ScaleChoiceScale({
  centerLabel: providedCenterLabel,
  options,
  selectedOptionId,
  disabled = false,
  large = false,
  legendOnly = false,
  leftLabel: providedLeftLabel,
  onSelect,
  rightLabel: providedRightLabel,
}: ScaleChoiceScaleProps) {
  const scaleOptions = getScaleOptions(options);
  const leftLabel =
    providedLeftLabel ?? getScaleSideLabel(scaleOptions, -2, "Opposition");
  const rightLabel =
    providedRightLabel ?? getScaleSideLabel(scaleOptions, 2, "Proposition");
  const centerLabel =
    providedCenterLabel ??
    getScaleSideLabel(scaleOptions, 0, "Too close to call");
  const selectedOption = scaleOptions.find((option) => option.id === selectedOptionId);
  const selectedLabel = selectedOption
    ? formatScaleSelection(selectedOption.scale_value, {
        centerLabel,
        leftLabel,
        optionLabel: selectedOption.label,
        rightLabel,
      })
    : null;

  return (
    <div className={large ? "club-panel-quiet p-6 lg:p-8" : "club-panel-quiet p-4"}>
      <div
        className={`grid ${
          large
            ? "grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-5 lg:gap-8"
            : "grid-cols-3 items-start gap-3 sm:gap-4"
        }`}
      >
        <ScaleSideLabel align="left" label={leftLabel} large={large} />
        <div className="text-center">
          <p className={`club-label ${large ? "text-xs" : "text-[0.58rem]"}`}>
            Neutral
          </p>
          <p
            className={
              large
                ? "mx-auto mt-1 max-w-40 text-sm font-semibold leading-snug text-[color:var(--cc-muted)]"
                : "mx-auto mt-1 max-w-24 text-[0.7rem] font-semibold leading-snug text-[color:var(--cc-muted)]"
            }
          >
            {centerLabel}
          </p>
        </div>
        <ScaleSideLabel align="right" label={rightLabel} large={large} />
      </div>

      {legendOnly ? (
        <div className={large ? "mt-6 flex items-center gap-3 lg:mt-8" : "mt-5 flex items-center gap-3"}>
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[color:var(--cc-gold)]" />
          <span className="club-rule flex-1" />
          <span className="h-2 w-2 shrink-0 rounded-full bg-[color:var(--cc-muted)]" />
          <span className="club-rule flex-1" />
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[color:var(--cc-gold)]" />
        </div>
      ) : (
        <>
      <div className={large ? "mt-6 lg:mt-8" : "mt-5"}>
        <div
          className={`grid grid-cols-7 ${
            large ? "gap-1.5 sm:gap-2 lg:gap-3" : "gap-1.5 sm:gap-2"
          }`}
        >
          {scaleOptions.map((option) => {
            const selected = selectedOptionId === option.id;
            const buttonClass = large
              ? "min-h-16 text-xl sm:min-h-24 sm:text-3xl lg:min-h-28 lg:text-4xl"
              : "min-h-16 text-base sm:text-lg";
            const restingClass = large
              ? "border-[color:var(--cc-line-strong)] bg-[color:var(--cc-ivory)]/[0.05] text-[color:var(--cc-gold-bright)]"
              : "border-[color:var(--cc-line)] bg-[color:var(--cc-black)] text-[color:var(--cc-gold-bright)] hover:border-[color:var(--cc-gold)]";

            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled || !onSelect}
                onClick={() => onSelect?.(option.id)}
                aria-pressed={selected}
                aria-label={option.label}
                className={`club-mono relative flex items-center justify-center rounded-sm border font-bold transition disabled:cursor-default disabled:opacity-100 ${buttonClass} ${
                  selected
                    ? "border-[color:var(--cc-gold-bright)] bg-[color:var(--cc-gold)] text-[color:var(--cc-black)] shadow-[0_0_0_2px_rgba(240,211,106,0.18)]"
                    : restingClass
                }`}
              >
                {formatSignedValue(option.scale_value ?? 0)}
                {selected && (
                  <Check
                    size={large ? 20 : 16}
                    className="absolute right-1.5 top-1.5"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedLabel && (
        <p className="mt-4 border-t border-[color:var(--cc-line)] pt-3 text-sm font-semibold text-[color:var(--cc-parchment)]">
          Selected:{" "}
          <span className="text-[color:var(--cc-gold-bright)]">
            {selectedLabel}
          </span>
        </p>
      )}
        </>
      )}
    </div>
  );
}

export function getScaleOptions(options: PollOptionResult[]) {
  return [...options].sort(
    (first, second) =>
      (first.scale_value ?? first.sort_order) -
      (second.scale_value ?? second.sort_order),
  );
}

export function getScaleSideLabel(
  options: PollOptionResult[],
  scaleValue: number,
  fallback: string,
) {
  const label = options.find((option) => option.scale_value === scaleValue)?.label;
  if (!label) return fallback;
  return cleanScaleSideLabel(label);
}

function cleanScaleSideLabel(label: string) {
  return label
    .replace(/^Absolutely sure:\s*/i, "")
    .replace(/^Agree with\s+/i, "")
    .replace(/^Leaning towards\s+/i, "")
    .replace(/^Strongly\s+/i, "")
    .replace(/^Lean\s+/i, "")
    .trim();
}

function formatScaleSelection(
  scaleValue: number | null,
  {
    centerLabel,
    leftLabel,
    optionLabel,
    rightLabel,
  }: {
    centerLabel: string;
    leftLabel: string;
    optionLabel: string;
    rightLabel: string;
  },
) {
  if (scaleValue === -3) return `Absolutely sure: ${leftLabel}`;
  if (scaleValue === -2) return `Agree with ${leftLabel}`;
  if (scaleValue === -1) return `Leaning towards ${leftLabel}`;
  if (scaleValue === 0) return centerLabel;
  if (scaleValue === 1) return `Leaning towards ${rightLabel}`;
  if (scaleValue === 2) return `Agree with ${rightLabel}`;
  if (scaleValue === 3) return `Absolutely sure: ${rightLabel}`;
  return optionLabel;
}

function ScaleSideLabel({
  label,
  align,
  large = false,
}: {
  label: string;
  align: "left" | "right";
  large?: boolean;
}) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <p
        className={`club-label ${
          large ? "text-xs text-[color:var(--cc-gold)]" : "text-[0.58rem]"
        }`}
      >
        {align === "right" ? "Right side" : "Left side"}
      </p>
      <p
        className={`club-display leading-tight text-[color:var(--cc-ivory)] [overflow-wrap:anywhere] ${
          large ? "mt-1 text-base sm:text-2xl lg:text-3xl" : "mt-1 text-sm leading-snug sm:text-base"
        }`}
      >
        {label}
      </p>
    </div>
  );
}
