import type { ImportColumnMapping } from "@/lib/whatsapp/types";
import type { ImportOptions } from "@/lib/whatsapp/server/imports";

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export function importRequestData(formData: FormData): {
  file: File | null;
  options: ImportOptions;
} {
  const fileValue = formData.get("file");
  const name = optionalString(formData, "nameColumn");
  const phone = optionalString(formData, "phoneColumn");
  const consent = optionalString(formData, "consentColumn");
  const preferenceTime = optionalString(formData, "preferenceTimeColumn");
  let mapping: ImportColumnMapping | undefined;

  if (name && phone && consent) {
    mapping = { name, phone, consent, preferenceTime };
  }

  return {
    file: fileValue instanceof File ? fileValue : null,
    options: {
      mapping,
      sourceDate: optionalString(formData, "sourceDate"),
    },
  };
}
