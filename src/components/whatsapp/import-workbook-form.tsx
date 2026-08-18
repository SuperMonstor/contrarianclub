"use client";

import { FileSpreadsheet, LoaderCircle, Upload } from "lucide-react";
import { useState } from "react";
import type { ImportColumnMapping, ImportCounts } from "@/lib/whatsapp/types";

type Preview = {
  ready: boolean;
  sheetName: string;
  headers: string[];
  detection: {
    mapping: Partial<ImportColumnMapping>;
    ambiguous: string[];
    missing: string[];
  };
  mapping?: ImportColumnMapping;
  alreadyImported: boolean;
  sourceDateRequired: boolean;
  totalRows?: number;
  validRows?: number;
  counts?: ImportCounts;
};

type Completed = ImportCounts & { importId: string };
type FormState =
  | "idle"
  | "previewing"
  | "mapping"
  | "ready"
  | "confirming"
  | "complete"
  | "error";

function responseMessage(value: unknown, fallback: string): string {
  if (
    value &&
    typeof value === "object" &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }
  return fallback;
}

function addOptions(formData: FormData, mapping: Partial<ImportColumnMapping>, sourceDate: string) {
  if (mapping.name) formData.set("nameColumn", mapping.name);
  if (mapping.phone) formData.set("phoneColumn", mapping.phone);
  if (mapping.consent) formData.set("consentColumn", mapping.consent);
  if (mapping.preferenceTime) {
    formData.set("preferenceTimeColumn", mapping.preferenceTime);
  }
  if (sourceDate) formData.set("sourceDate", sourceDate);
}

export function ImportWorkbookForm() {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<FormState>("idle");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [mapping, setMapping] = useState<Partial<ImportColumnMapping>>({});
  const [sourceDate, setSourceDate] = useState("");
  const [completed, setCompleted] = useState<Completed | null>(null);
  const [error, setError] = useState<string | null>(null);

  function chooseFile(nextFile: File | null) {
    setFile(nextFile);
    setState("idle");
    setPreview(null);
    setMapping({});
    setSourceDate("");
    setCompleted(null);
    setError(null);
  }

  async function submit(endpoint: "preview" | "confirm") {
    if (!file) return;
    setState(endpoint === "preview" ? "previewing" : "confirming");
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    addOptions(formData, mapping, sourceDate);

    try {
      const response = await fetch(
        `/api/admin/whatsapp/imports/${endpoint}`,
        { method: "POST", body: formData },
      );
      const body: unknown = await response.json();
      if (!response.ok) {
        throw new Error(responseMessage(body, "The workbook could not be processed."));
      }

      if (endpoint === "preview") {
        const nextPreview = body as Preview;
        setPreview(nextPreview);
        const detected = nextPreview.mapping ?? nextPreview.detection.mapping;
        setMapping({
          ...detected,
          preferenceTime: detected.preferenceTime ?? null,
        });
        setState(nextPreview.ready ? "ready" : "mapping");
      } else {
        setCompleted(body as Completed);
        setState("complete");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The request failed.");
      setState("error");
    }
  }

  const mappingComplete = Boolean(
    mapping.name &&
      mapping.phone &&
      mapping.consent &&
      (!preview?.sourceDateRequired || sourceDate),
  );
  const busy = state === "previewing" || state === "confirming";

  return (
    <div className="grid gap-5">
      <section className="club-panel p-5 sm:p-7">
        <label className="club-label" htmlFor="whatsapp-workbook">
          Excel workbook
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <label
            htmlFor="whatsapp-workbook"
            className="club-panel-quiet flex min-h-24 cursor-pointer items-center gap-4 px-5 py-4 transition hover:border-[color:var(--cc-line-strong)]"
          >
            <FileSpreadsheet className="text-[color:var(--cc-gold)]" />
            <span>
              <span className="block font-semibold text-[color:var(--cc-parchment)]">
                {file?.name ?? "Choose a guest list"}
              </span>
              <span className="mt-1 block text-xs text-[color:var(--cc-muted)]">
                .xlsx only, up to 4 MB
              </span>
            </span>
          </label>
          <input
            id="whatsapp-workbook"
            className="sr-only"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            className="club-btn club-btn-primary px-5 py-3"
            disabled={!file || busy}
            onClick={() => submit("preview")}
          >
            {state === "previewing" ? (
              <LoaderCircle className="animate-spin" size={18} />
            ) : (
              <Upload size={18} />
            )}
            Preview import
          </button>
        </div>
      </section>

      {preview && !preview.ready ? (
        <section className="club-panel p-5 sm:p-7">
          <p className="club-kicker">Column mapping</p>
          <h2 className="club-display club-d-card mt-2">
            Match this sheet to the subscriber list
          </h2>
          <p className="mt-2 text-sm text-[color:var(--cc-muted)]">
            Worksheet: {preview.sheetName}. Each field must use a different column.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ColumnSelect
              label="Name column"
              value={mapping.name ?? ""}
              headers={preview.headers}
              onChange={(value) => setMapping((current) => ({ ...current, name: value }))}
            />
            <ColumnSelect
              label="Phone column"
              value={mapping.phone ?? ""}
              headers={preview.headers}
              onChange={(value) => setMapping((current) => ({ ...current, phone: value }))}
            />
            <ColumnSelect
              label="Consent column"
              value={mapping.consent ?? ""}
              headers={preview.headers}
              onChange={(value) => setMapping((current) => ({ ...current, consent: value }))}
            />
            <ColumnSelect
              label="Preference time column"
              value={mapping.preferenceTime ?? ""}
              headers={preview.headers}
              optional
              onChange={(value) =>
                setMapping((current) => ({
                  ...current,
                  preferenceTime: value || null,
                }))
              }
            />
            {preview.sourceDateRequired ? (
              <label className="grid gap-2">
                <span className="club-label">Source debate date</span>
                <input
                  className="club-input px-3 py-2.5"
                  type="date"
                  required
                  value={sourceDate}
                  onChange={(event) => setSourceDate(event.target.value)}
                />
              </label>
            ) : null}
          </div>
          <button
            type="button"
            className="club-btn club-btn-primary mt-5 px-5 py-3"
            disabled={!mappingComplete || busy}
            onClick={() => submit("preview")}
          >
            Preview with mapping
          </button>
        </section>
      ) : null}

      {preview?.ready && preview.counts && state !== "complete" ? (
        <section className="club-panel-gold p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="club-kicker">Import preview</p>
              <h2 className="club-display club-d-card mt-2">
                {preview.validRows} valid rows in {preview.sheetName}
              </h2>
            </div>
            {preview.alreadyImported ? (
              <span className="club-chip border-[color:var(--cc-wine-bright)]/50 text-[#f0c9c4]">
                already imported
              </span>
            ) : null}
          </div>
          <CountGrid counts={preview.counts} />
          <button
            type="button"
            className="club-btn club-btn-primary mt-6 px-5 py-3"
            disabled={preview.alreadyImported || busy}
            onClick={() => submit("confirm")}
          >
            {state === "confirming" ? (
              <LoaderCircle className="animate-spin" size={18} />
            ) : null}
            Confirm import
          </button>
        </section>
      ) : null}

      {state === "complete" && completed ? (
        <section className="club-panel-gold p-5 sm:p-7" aria-live="polite">
          <p className="club-kicker">Import complete</p>
          <h2 className="club-display club-d-card mt-2">
            The master list has been updated
          </h2>
          <CountGrid counts={completed} />
        </section>
      ) : null}

      {error ? (
        <p className="club-panel-quiet border-[color:var(--cc-wine-bright)]/40 px-4 py-3 text-sm text-[#f0c9c4]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ColumnSelect({
  label,
  value,
  headers,
  optional = false,
  onChange,
}: {
  label: string;
  value: string;
  headers: string[];
  optional?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="club-label">{label}</span>
      <select
        className="club-input px-3 py-2.5"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{optional ? "Use source date" : "Choose column"}</option>
        {headers.filter(Boolean).map((header) => (
          <option key={header} value={header}>{header}</option>
        ))}
      </select>
    </label>
  );
}

function CountGrid({ counts }: { counts: ImportCounts }) {
  const items = [
    [counts.addedCount, "will be added", "added"],
    [counts.updatedCount, "will be updated", "updated"],
    [counts.deactivatedCount, "will be deactivated", "deactivated"],
    [counts.unchangedCount, "unchanged", "unchanged"],
    [counts.invalidCount, "invalid", "invalid"],
  ] as const;
  return (
    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
      {items.map(([count, previewLabel, finalLabel]) => (
        <div className="club-tile px-3 py-4" key={finalLabel}>
          <strong className="club-display text-2xl text-[color:var(--cc-gold-bright)]">
            {count}
          </strong>
          <span className="mt-1 block text-xs text-[color:var(--cc-muted)]">
            {count} {previewLabel}
          </span>
        </div>
      ))}
    </div>
  );
}
