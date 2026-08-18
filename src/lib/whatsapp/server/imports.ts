import "server-only";
import { createHash } from "node:crypto";
import { detectImportColumns, normalizeImportRows } from "@/lib/whatsapp/importer";
import { createServiceClient } from "@/lib/supabase/server";
import type {
  ImportColumnMapping,
  ImportCounts,
  NormalizedImportRow,
} from "@/lib/whatsapp/types";
import { parseImportWorkbook } from "@/lib/whatsapp/server/workbook";

type ExistingSubscriber = {
  phone_e164: string;
  is_active: boolean;
  preference_at: string;
};

export type ImportOptions = {
  mapping?: ImportColumnMapping;
  sourceDate: string | null;
};

export class ImportInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportInputError";
  }
}

export class ImportAlreadyAppliedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportAlreadyAppliedError";
  }
}

export function calculateImportCounts(
  rows: NormalizedImportRow[],
  existingSubscribers: ExistingSubscriber[],
  invalidCount: number,
): ImportCounts {
  const existingByPhone = new Map(
    existingSubscribers.map((subscriber) => [subscriber.phone_e164, subscriber]),
  );
  const counts: ImportCounts = {
    addedCount: 0,
    updatedCount: 0,
    deactivatedCount: 0,
    unchangedCount: 0,
    invalidCount,
  };

  for (const row of rows) {
    const existing = existingByPhone.get(row.phone_e164);
    if (!existing) {
      if (row.is_active) counts.addedCount += 1;
      else counts.unchangedCount += 1;
      continue;
    }

    if (Date.parse(row.preference_at) <= Date.parse(existing.preference_at)) {
      counts.unchangedCount += 1;
    } else if (existing.is_active && !row.is_active) {
      counts.deactivatedCount += 1;
    } else {
      counts.updatedCount += 1;
    }
  }

  return counts;
}

async function sha256(file: File): Promise<string> {
  return createHash("sha256")
    .update(Buffer.from(await file.arrayBuffer()))
    .digest("hex");
}

function headersFrom(rows: unknown[][]): string[] {
  return (rows[0] ?? []).map((value) =>
    value === null || value === undefined ? "" : String(value).trim(),
  );
}

function automaticMapping(
  detection: ReturnType<typeof detectImportColumns>,
): ImportColumnMapping | null {
  if (detection.ambiguous.length > 0 || detection.missing.length > 0) {
    return null;
  }
  const { name, phone, consent, preferenceTime } = detection.mapping;
  if (!name || !phone || !consent || preferenceTime === undefined) return null;
  return { name, phone, consent, preferenceTime };
}

function validateMapping(headers: string[], mapping: ImportColumnMapping) {
  const required = [mapping.name, mapping.phone, mapping.consent];
  if (required.some((heading) => !headers.includes(heading))) {
    throw new ImportInputError("The selected columns do not match this workbook.");
  }
  if (
    mapping.preferenceTime !== null &&
    !headers.includes(mapping.preferenceTime)
  ) {
    throw new ImportInputError("The selected time column does not match this workbook.");
  }
  const selected = [
    mapping.name,
    mapping.phone,
    mapping.consent,
    ...(mapping.preferenceTime ? [mapping.preferenceTime] : []),
  ];
  if (new Set(selected).size !== selected.length) {
    throw new ImportInputError("Each field must use a different workbook column.");
  }
}

async function findExistingSubscribers(
  supabase: ReturnType<typeof createServiceClient>,
  phoneNumbers: string[],
): Promise<ExistingSubscriber[]> {
  const subscribers: ExistingSubscriber[] = [];
  for (let index = 0; index < phoneNumbers.length; index += 200) {
    const chunk = phoneNumbers.slice(index, index + 200);
    const { data, error } = await supabase
      .from("whatsapp_subscribers")
      .select("phone_e164, is_active, preference_at")
      .in("phone_e164", chunk)
      .returns<ExistingSubscriber[]>();
    if (error) throw error;
    subscribers.push(...(data ?? []));
  }
  return subscribers;
}

async function prepareImport(
  file: File,
  options: ImportOptions,
  supabase: ReturnType<typeof createServiceClient>,
) {
  const [{ sheetName, rows }, fileSha256] = await Promise.all([
    parseImportWorkbook(file),
    sha256(file),
  ]);
  const headers = headersFrom(rows);
  const detection = detectImportColumns(headers);
  const mapping = options.mapping ?? automaticMapping(detection);
  const { data: priorImport, error: priorImportError } = await supabase
    .from("whatsapp_imports")
    .select("id")
    .eq("file_sha256", fileSha256)
    .maybeSingle<{ id: string }>();
  if (priorImportError) throw priorImportError;

  if (!mapping) {
    return {
      ready: false as const,
      sheetName,
      headers,
      detection,
      fileSha256,
      alreadyImported: Boolean(priorImport),
      sourceDateRequired: detection.mapping.preferenceTime === null,
    };
  }

  validateMapping(headers, mapping);
  if (mapping.preferenceTime === null && !options.sourceDate) {
    throw new ImportInputError(
      "Source date is required when no preference time column is selected.",
    );
  }

  const normalized = normalizeImportRows(rows, mapping, options.sourceDate);
  const existing = await findExistingSubscribers(
    supabase,
    normalized.rows.map((row) => row.phone_e164),
  );

  return {
    ready: true as const,
    sheetName,
    headers,
    detection,
    mapping,
    fileSha256,
    alreadyImported: Boolean(priorImport),
    sourceDateRequired: mapping.preferenceTime === null,
    totalRows: normalized.totalRows,
    validRows: normalized.rows.length,
    issues: normalized.issues,
    counts: calculateImportCounts(
      normalized.rows,
      existing,
      normalized.invalidCount,
    ),
    normalized,
  };
}

export async function previewWhatsAppImport(
  file: File,
  options: ImportOptions,
) {
  const prepared = await prepareImport(file, options, createServiceClient());
  if (!prepared.ready) return prepared;
  const { normalized: _normalized, ...safePreview } = prepared;
  return safePreview;
}

export async function confirmWhatsAppImport(
  file: File,
  options: ImportOptions,
  userId: string,
) {
  const supabase = createServiceClient();
  const prepared = await prepareImport(file, options, supabase);
  if (!prepared.ready) {
    throw new ImportInputError("Choose the workbook columns before importing.");
  }
  if (prepared.alreadyImported) {
    throw new ImportAlreadyAppliedError("This workbook was already imported.");
  }
  if (prepared.normalized.rows.length === 0) {
    throw new ImportInputError("The workbook has no valid subscriber rows.");
  }

  const { data, error } = await supabase.rpc("apply_whatsapp_import", {
    p_file_name: file.name,
    p_file_sha256: prepared.fileSha256,
    p_name_column: prepared.mapping.name,
    p_phone_column: prepared.mapping.phone,
    p_consent_column: prepared.mapping.consent,
    p_preference_time_column: prepared.mapping.preferenceTime,
    p_source_date: options.sourceDate,
    p_imported_by: userId,
    p_invalid_count: prepared.normalized.invalidCount,
    p_rows: prepared.normalized.rows,
  });
  if (error) {
    if (error.code === "23505") {
      throw new ImportAlreadyAppliedError("This workbook was already imported.");
    }
    throw error;
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result) throw new Error("Import transaction returned no result.");
  return {
    importId: result.import_id as string,
    addedCount: result.added_count as number,
    updatedCount: result.updated_count as number,
    deactivatedCount: result.deactivated_count as number,
    unchangedCount: result.unchanged_count as number,
    invalidCount: result.invalid_count as number,
  };
}
