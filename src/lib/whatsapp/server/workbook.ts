import "server-only";
import readWorkbook from "read-excel-file/node";
import type { WorkbookCell } from "@/lib/whatsapp/types";

export const MAX_WORKBOOK_BYTES = 4 * 1024 * 1024;

export class ImportFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportFileError";
  }
}

function hasValue(value: unknown): boolean {
  return value !== null && value !== undefined && value !== "";
}

export async function parseImportWorkbook(file: File): Promise<{
  sheetName: string;
  rows: WorkbookCell[][];
}> {
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    throw new ImportFileError("Only .xlsx workbooks are supported.");
  }
  if (file.size === 0 || file.size > MAX_WORKBOOK_BYTES) {
    throw new ImportFileError("Workbook must be between 1 byte and 4 MB.");
  }

  const sheets = await readWorkbook(Buffer.from(await file.arrayBuffer()));
  const sheet = sheets.find(({ data }) =>
    data.some((row) => row.some((cell) => hasValue(cell))),
  );

  if (!sheet) {
    throw new ImportFileError("Workbook has no non-empty worksheet.");
  }

  return {
    sheetName: sheet.sheet,
    rows: sheet.data as WorkbookCell[][],
  };
}
