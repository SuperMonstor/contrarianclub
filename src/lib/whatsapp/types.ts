export type WorkbookCell = string | number | boolean | Date | null;

export type ImportColumnField =
  | "name"
  | "phone"
  | "consent"
  | "preferenceTime";

export type ImportColumnMapping = {
  name: string;
  phone: string;
  consent: string;
  preferenceTime: string | null;
};

export type ImportColumnDetection = {
  mapping: Partial<ImportColumnMapping>;
  candidates: Record<ImportColumnField, string[]>;
  ambiguous: ImportColumnField[];
  missing: ImportColumnField[];
};

export type ImportIssue = {
  rowNumber: number;
  maskedPhone: string | null;
  message: string;
};

export type NormalizedImportRow = {
  phone_e164: string;
  name: string | null;
  is_active: boolean;
  preference_at: string;
};

export type NormalizedImport = {
  rows: NormalizedImportRow[];
  issues: ImportIssue[];
  invalidCount: number;
  totalRows: number;
};

export type ImportCounts = {
  addedCount: number;
  updatedCount: number;
  deactivatedCount: number;
  unchangedCount: number;
  invalidCount: number;
};

export type CampaignParameters = {
  title: string;
  date: string;
  time: string;
  venue: string;
  ticketUrl: string;
};

export type WhatsAppDeliveryStatus =
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "retryable_failed"
  | "unknown"
  | "failed";
