// Single source of truth for scale-label logic shared across the poll UI,
// results views, event-state aggregation, and the admin edit form. Keep this
// module client-safe (no server-only imports) so components can import it too.

export type ScaleSideLabels = {
  leftLabel: string;
  centerLabel: string;
  rightLabel: string;
};

// A minimal shape for options that carry an optional scale value and label.
// Both PollOptionResult and the raw poll-option rows satisfy this structurally.
type ScaleLabelledOption = {
  scale_value: number | null;
  label: string;
};

// The seven fixed scale positions, ordered opposition -> neutral -> proposition.
export const SCALE_VALUES = [-3, -2, -1, 0, 1, 2, 3] as const;

// Prefixes used both to GENERATE scale-option labels and (via cleanScaleSideLabel)
// to STRIP back to the bare side label. Kept together so the two stay in sync.
const ABSOLUTELY_SURE_PREFIX = "Absolutely sure:";
const AGREE_WITH_PREFIX = "Agree with";
const LEANING_TOWARDS_PREFIX = "Leaning towards";

// Build the canonical label for a single scale value. Returns null for any value
// outside the fixed -3..3 range so callers can fall back to a stored label.
export function buildScaleOptionLabel(
  scaleValue: number,
  labels: ScaleSideLabels,
): string | null {
  switch (scaleValue) {
    case -3:
      return `${ABSOLUTELY_SURE_PREFIX} ${labels.leftLabel}`;
    case -2:
      return `${AGREE_WITH_PREFIX} ${labels.leftLabel}`;
    case -1:
      return `${LEANING_TOWARDS_PREFIX} ${labels.leftLabel}`;
    case 0:
      return labels.centerLabel;
    case 1:
      return `${LEANING_TOWARDS_PREFIX} ${labels.rightLabel}`;
    case 2:
      return `${AGREE_WITH_PREFIX} ${labels.rightLabel}`;
    case 3:
      return `${ABSOLUTELY_SURE_PREFIX} ${labels.rightLabel}`;
    default:
      return null;
  }
}

// Full set of scale options (label + scale_value) for the fixed -3..3 range.
export function buildScaleOptions(labels: ScaleSideLabels) {
  return SCALE_VALUES.map((scale_value) => ({
    label: buildScaleOptionLabel(scale_value, labels) as string,
    scale_value,
  }));
}

// Strip the generated prefixes (and the legacy "Strongly"/"Lean" ones) back to
// the bare side label. Behavior must stay byte-identical to the previous inline
// copies scattered across the codebase.
export function cleanScaleSideLabel(label: string) {
  return label
    .replace(/^Absolutely sure:\s*/i, "")
    .replace(/^Agree with\s+/i, "")
    .replace(/^Leaning towards\s+/i, "")
    .replace(/^Strongly\s+/i, "")
    .replace(/^Lean\s+/i, "")
    .trim();
}

// Find the option matching a scale value and return its cleaned label, falling
// back to the provided default when no such option exists.
export function scaleSideLabel(
  options: ScaleLabelledOption[],
  scaleValue: number,
  fallback: string,
) {
  const label = options.find((option) => option.scale_value === scaleValue)?.label;
  if (!label) return fallback;
  return cleanScaleSideLabel(label);
}

// Round a scale average to a single decimal place.
export function roundScaleAverage(value: number) {
  return Math.round(value * 10) / 10;
}
