import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("read-excel-file/node", () => ({ default: vi.fn() }));

import readWorkbook from "read-excel-file/node";
import {
  ImportFileError,
  MAX_WORKBOOK_BYTES,
  parseImportWorkbook,
} from "@/lib/whatsapp/server/workbook";

const mockedReadWorkbook = vi.mocked(readWorkbook);

describe("WhatsApp workbook parser", () => {
  beforeEach(() => mockedReadWorkbook.mockReset());

  it("rejects files outside the supported type and size", async () => {
    await expect(
      parseImportWorkbook(new File(["x"], "guests.csv")),
    ).rejects.toThrow("Only .xlsx workbooks are supported.");
    await expect(
      parseImportWorkbook(new File([], "guests.xlsx")),
    ).rejects.toThrow("Workbook must be between 1 byte and 4 MB.");
    await expect(
      parseImportWorkbook(
        new File([new Uint8Array(MAX_WORKBOOK_BYTES + 1)], "guests.xlsx"),
      ),
    ).rejects.toThrow("Workbook must be between 1 byte and 4 MB.");
    expect(ImportFileError).toBeDefined();
  });

  it("selects the first non-empty worksheet and preserves cell values", async () => {
    mockedReadWorkbook.mockResolvedValue([
      { sheet: "Empty", data: [[null]] },
      {
        sheet: "Guests",
        data: [["Name", "Formula"], ["Asha", "=SUM(A1:A2)"]],
      },
    ]);

    const result = await parseImportWorkbook(
      new File(["workbook"], "guests.XLSX"),
    );

    expect(result).toEqual({
      sheetName: "Guests",
      rows: [["Name", "Formula"], ["Asha", "=SUM(A1:A2)"]],
    });
  });

  it("rejects a workbook without a non-empty worksheet", async () => {
    mockedReadWorkbook.mockResolvedValue([
      { sheet: "One", data: [] },
      { sheet: "Two", data: [[null, null]] },
    ]);

    await expect(
      parseImportWorkbook(new File(["workbook"], "guests.xlsx")),
    ).rejects.toThrow("Workbook has no non-empty worksheet.");
  });
});
