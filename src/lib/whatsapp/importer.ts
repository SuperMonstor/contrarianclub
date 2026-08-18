import { maskIndianPhone, normalizeIndianPhone } from "@/lib/whatsapp/phone";
import type {
  ImportColumnDetection,
  ImportColumnField,
  ImportColumnMapping,
  ImportIssue,
  NormalizedImport,
  NormalizedImportRow,
  WorkbookCell,
} from "@/lib/whatsapp/types";

const ALIASES: Record<ImportColumnField, string[]> = {
  name: ["name", "full name", "attendee name", "guest name"],
  phone: [
    "phone",
    "phone number",
    "mobile",
    "mobile number",
    "whatsapp number",
    "whatsapp phone",
    "whatsapp phone number",
  ],
  consent: [
    "updates",
    "whatsapp updates",
    "whatsapp opt in",
    "receive whatsapp updates",
    "would you like to stay updated with future debates",
  ],
  preferenceTime: [
    "time of purchase",
    "timestamp",
    "submitted at",
    "submission time",
    "booking time",
    "response date",
  ],
};

function normalizeHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function matchesHeading(field: ImportColumnField, normalized: string): boolean {
  if (ALIASES[field].includes(normalized)) return true;

  if (field === "name") return /\bname\b/.test(normalized);
  if (field === "phone") {
    return /\b(phone|mobile)\b/.test(normalized);
  }
  if (field === "consent") {
    return (
      /\b(whatsapp|update|notify|notification|contact)\b/.test(normalized) &&
      !/\btime\b/.test(normalized)
    );
  }
  return /\b(time|timestamp|submitted|purchase|booking|date)\b/.test(
    normalized,
  );
}

export function detectImportColumns(headers: string[]): ImportColumnDetection {
  const fields: ImportColumnField[] = [
    "name",
    "phone",
    "consent",
    "preferenceTime",
  ];
  const candidates = Object.fromEntries(
    fields.map((field) => [
      field,
      headers.filter((header) => matchesHeading(field, normalizeHeading(header))),
    ]),
  ) as Record<ImportColumnField, string[]>;
  const mapping: Partial<ImportColumnMapping> = {};
  const ambiguous: ImportColumnField[] = [];
  const missing: ImportColumnField[] = [];

  for (const field of fields) {
    if (candidates[field].length === 1) {
      mapping[field] = candidates[field][0];
    } else if (candidates[field].length > 1) {
      ambiguous.push(field);
    } else if (field !== "preferenceTime") {
      missing.push(field);
    }
  }

  if (candidates.preferenceTime.length === 0) {
    mapping.preferenceTime = null;
  }

  return { mapping, candidates, ambiguous, missing };
}

function cellText(value: WorkbookCell | undefined): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

function parseConsent(value: WorkbookCell | undefined): boolean | null {
  if (typeof value === "boolean") return value;
  const normalized = cellText(value)?.toLowerCase();
  if (normalized === "yes" || normalized === "y") return true;
  if (normalized === "no" || normalized === "n") return false;
  return null;
}

function sourceDateEnd(sourceDate: string | null): Date | null {
  if (!sourceDate || !/^\d{4}-\d{2}-\d{2}$/.test(sourceDate)) return null;
  const parsed = new Date(`${sourceDate}T23:59:59.999+05:30`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parsePreferenceTime(
  value: WorkbookCell | undefined,
  fallback: Date | null,
): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value.trim());
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return fallback;
}

function maskedCellPhone(value: WorkbookCell | undefined): string | null {
  const normalized = normalizeIndianPhone(value);
  if (normalized) return maskIndianPhone(normalized);
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }
  const digits = String(value).replace(/\D/g, "");
  return digits.length >= 4 ? `******${digits.slice(-4)}` : "Invalid number";
}

function headerIndex(headers: string[], heading: string | null): number {
  return heading === null ? -1 : headers.indexOf(heading);
}

export function normalizeImportRows(
  workbookRows: WorkbookCell[][],
  mapping: ImportColumnMapping,
  sourceDate: string | null,
): NormalizedImport {
  const headers = (workbookRows[0] ?? []).map((cell) => cellText(cell) ?? "");
  const indexes = {
    name: headerIndex(headers, mapping.name),
    phone: headerIndex(headers, mapping.phone),
    consent: headerIndex(headers, mapping.consent),
    preferenceTime: headerIndex(headers, mapping.preferenceTime),
  };

  if (indexes.name < 0 || indexes.phone < 0 || indexes.consent < 0) {
    throw new Error("The selected column mapping does not match this workbook.");
  }
  if (mapping.preferenceTime !== null && indexes.preferenceTime < 0) {
    throw new Error("The selected time column does not match this workbook.");
  }

  const fallbackTime = sourceDateEnd(sourceDate);
  const issues: ImportIssue[] = [];
  const byPhone = new Map<
    string,
    { row: NormalizedImportRow; rowNumber: number }
  >();
  const conflictedPhones = new Set<string>();
  const bodyRows = workbookRows.slice(1).filter((row) =>
    row.some((cell) => cell !== null && cellText(cell) !== null),
  );

  for (const [offset, row] of bodyRows.entries()) {
    const rowNumber = offset + 2;
    const phoneCell = row[indexes.phone];
    const phoneE164 = normalizeIndianPhone(phoneCell);
    const maskedPhone = maskedCellPhone(phoneCell);
    const consent = parseConsent(row[indexes.consent]);
    const preferenceTime = parsePreferenceTime(
      indexes.preferenceTime >= 0 ? row[indexes.preferenceTime] : undefined,
      fallbackTime,
    );

    if (!phoneE164) {
      issues.push({
        rowNumber,
        maskedPhone,
        message: "Phone must be a valid Indian mobile number.",
      });
      continue;
    }
    if (consent === null) {
      issues.push({
        rowNumber,
        maskedPhone,
        message: "Consent must be Yes or No.",
      });
      continue;
    }
    if (!preferenceTime) {
      issues.push({
        rowNumber,
        maskedPhone,
        message: "A preference time or source date is required.",
      });
      continue;
    }
    if (conflictedPhones.has(phoneE164)) continue;

    const normalizedRow: NormalizedImportRow = {
      phone_e164: phoneE164,
      name: cellText(row[indexes.name]),
      is_active: consent,
      preference_at: preferenceTime.toISOString(),
    };
    const existing = byPhone.get(phoneE164);

    if (!existing) {
      byPhone.set(phoneE164, { row: normalizedRow, rowNumber });
      continue;
    }

    const currentTime = Date.parse(existing.row.preference_at);
    const nextTime = preferenceTime.getTime();
    if (nextTime > currentTime) {
      byPhone.set(phoneE164, { row: normalizedRow, rowNumber });
    } else if (
      nextTime === currentTime &&
      normalizedRow.is_active !== existing.row.is_active
    ) {
      const message = "Conflicting preferences have the same timestamp.";
      issues.push({
        rowNumber: existing.rowNumber,
        maskedPhone,
        message,
      });
      issues.push({ rowNumber, maskedPhone, message });
      byPhone.delete(phoneE164);
      conflictedPhones.add(phoneE164);
    }
  }

  issues.sort((left, right) => left.rowNumber - right.rowNumber);
  return {
    rows: [...byPhone.values()].map(({ row }) => row),
    issues,
    invalidCount: issues.length,
    totalRows: bodyRows.length,
  };
}
