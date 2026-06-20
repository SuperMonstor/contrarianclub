import { Check } from "lucide-react";
import type { PollOptionResult } from "@/lib/types";
import { formatSignedValue } from "@/components/scale-results";

type ScaleChoiceScaleProps = {
  options: PollOptionResult[];
  selectedOptionId?: string;
  disabled?: boolean;
  large?: boolean;
  onSelect?: (optionId: string) => void;
};

export function ScaleChoiceScale({
  options,
  selectedOptionId,
  disabled = false,
  large = false,
  onSelect,
}: ScaleChoiceScaleProps) {
  const scaleOptions = getScaleOptions(options);
  const leftLabel = getScaleSideLabel(scaleOptions, -2, "Opposition");
  const rightLabel = getScaleSideLabel(scaleOptions, 2, "Proposition");
  const centerLabel = getScaleSideLabel(scaleOptions, 0, "Too close to call");
  const selectedOption = scaleOptions.find((option) => option.id === selectedOptionId);

  return (
    <div className={large ? "club-panel-quiet max-w-5xl p-6" : "club-panel-quiet p-4"}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <ScaleSideLabel align="left" label={leftLabel} />
        <div className="text-center">
          <p className="club-label text-[0.58rem]">Neutral</p>
          <p className="max-w-24 text-[0.68rem] font-semibold leading-3 text-[color:var(--cc-muted)]">
            {centerLabel}
          </p>
        </div>
        <ScaleSideLabel align="right" label={rightLabel} />
      </div>

      <div className="relative mt-5">
        <div
          aria-hidden="true"
          className="absolute left-4 right-4 top-1/2 h-px -translate-y-1/2 bg-[color:var(--cc-line-strong)]"
        />
        <div className="relative grid grid-cols-7 gap-1.5">
          {scaleOptions.map((option) => {
            const selected = selectedOptionId === option.id;
            const buttonClass = large
              ? "min-h-20 text-2xl"
              : "min-h-14 text-base";

            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled || !onSelect}
                onClick={() => onSelect?.(option.id)}
                aria-pressed={selected}
                aria-label={option.label}
                className={`club-mono relative flex items-center justify-center rounded-sm border font-bold transition disabled:cursor-default disabled:opacity-70 ${buttonClass} ${
                  selected
                    ? "border-[color:var(--cc-gold-bright)] bg-[color:var(--cc-gold)] text-[color:var(--cc-black)] shadow-[0_0_0_2px_rgba(240,211,106,0.18)]"
                    : "border-[color:var(--cc-line)] bg-[color:var(--cc-black)] text-[color:var(--cc-gold-bright)] hover:border-[color:var(--cc-gold)]"
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

      {selectedOption && (
        <p className="mt-4 border-t border-[color:var(--cc-line)] pt-3 text-sm font-semibold text-[color:var(--cc-parchment)]">
          Selected:{" "}
          <span className="text-[color:var(--cc-gold-bright)]">
            {selectedOption.label}
          </span>
        </p>
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
  return (
    options.find((option) => option.scale_value === scaleValue)?.label ?? fallback
  );
}

function ScaleSideLabel({
  label,
  align,
}: {
  label: string;
  align: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <p className="club-label text-[0.58rem]">
        {align === "right" ? "Right side" : "Left side"}
      </p>
      <p className="club-display text-xl leading-none text-[color:var(--cc-ivory)]">
        {label}
      </p>
    </div>
  );
}
