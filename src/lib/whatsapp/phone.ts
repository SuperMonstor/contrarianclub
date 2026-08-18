export function normalizeIndianPhone(value: unknown): string | null {
  let digits: string;

  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) return null;
    digits = String(value);
  } else if (typeof value === "string") {
    digits = value.replace(/\D/g, "");
  } else {
    return null;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  } else if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }

  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return `+91${digits}`;
}

export function maskIndianPhone(phoneE164: string): string {
  const normalized = normalizeIndianPhone(phoneE164);
  if (!normalized) return "Invalid number";
  return `${normalized.slice(0, 3)}******${normalized.slice(-4)}`;
}
