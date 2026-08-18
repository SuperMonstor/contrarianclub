import { describe, expect, it } from "vitest";
import {
  detectImportColumns,
  normalizeImportRows,
} from "@/lib/whatsapp/importer";
import type { ImportColumnMapping, WorkbookCell } from "@/lib/whatsapp/types";

const mapping: ImportColumnMapping = {
  name: "Name",
  phone: "Phone",
  consent: "WhatsApp updates",
  preferenceTime: "Time of Purchase",
};

describe("WhatsApp workbook heading detection", () => {
  it("recognizes the supplied historical headings", () => {
    const headers = [
      "Name",
      "Phone",
      "Would you like to stay updated with future debates?",
      "Time of Purchase",
    ];

    expect(detectImportColumns(headers).mapping).toEqual({
      name: "Name",
      phone: "Phone",
      consent: "Would you like to stay updated with future debates?",
      preferenceTime: "Time of Purchase",
    });
  });

  it("requires a choice when more than one consent heading matches", () => {
    const detection = detectImportColumns([
      "Name",
      "Phone",
      "Updates",
      "WhatsApp updates",
    ]);

    expect(detection.ambiguous).toContain("consent");
    expect(detection.mapping.consent).toBeUndefined();
  });
});

describe("WhatsApp workbook row normalization", () => {
  it("normalizes consent, optional names, and Indian phone numbers", () => {
    const rows: WorkbookCell[][] = [
      ["Name", "Phone", "WhatsApp updates", "Time of Purchase"],
      [" Asha ", "98765 43210", "Yes", new Date("2026-08-18T10:00:00Z")],
      [null, "87654-32109", "No", new Date("2026-08-18T11:00:00Z")],
      ["Ignored", "7654321098", "", new Date("2026-08-18T12:00:00Z")],
    ];

    expect(normalizeImportRows(rows, mapping, null)).toEqual({
      rows: [
        {
          phone_e164: "+919876543210",
          name: "Asha",
          is_active: true,
          preference_at: "2026-08-18T10:00:00.000Z",
        },
        {
          phone_e164: "+918765432109",
          name: null,
          is_active: false,
          preference_at: "2026-08-18T11:00:00.000Z",
        },
      ],
      issues: [
        {
          rowNumber: 4,
          maskedPhone: "+91******1098",
          message: "Consent must be Yes or No.",
        },
      ],
      invalidCount: 1,
      totalRows: 3,
    });
  });

  it("keeps the newest preference for each normalized phone", () => {
    const rows: WorkbookCell[][] = [
      ["Name", "Phone", "WhatsApp updates", "Time of Purchase"],
      ["Ravi", "9876543210", "Yes", new Date("2026-08-17T09:00:00Z")],
      ["Ravi Kumar", "+91 98765 43210", "No", new Date("2026-08-18T09:00:00Z")],
    ];

    expect(normalizeImportRows(rows, mapping, null).rows).toEqual([
      {
        phone_e164: "+919876543210",
        name: "Ravi Kumar",
        is_active: false,
        preference_at: "2026-08-18T09:00:00.000Z",
      },
    ]);
  });

  it("uses the end of the source date in India when timestamps are absent", () => {
    const rows: WorkbookCell[][] = [
      ["Name", "Phone", "WhatsApp updates"],
      ["Asha", "9876543210", "Yes"],
    ];
    const noTimeMapping = { ...mapping, preferenceTime: null };

    expect(normalizeImportRows(rows, noTimeMapping, "2026-08-19").rows[0])
      .toMatchObject({ preference_at: "2026-08-19T18:29:59.999Z" });
  });

  it("invalidates conflicting preferences recorded at the same time", () => {
    const timestamp = new Date("2026-08-18T09:00:00Z");
    const rows: WorkbookCell[][] = [
      ["Name", "Phone", "WhatsApp updates", "Time of Purchase"],
      ["Ravi", "9876543210", "Yes", timestamp],
      ["Ravi", "9876543210", "No", timestamp],
    ];

    const result = normalizeImportRows(rows, mapping, null);

    expect(result.rows).toEqual([]);
    expect(result.invalidCount).toBe(2);
    expect(result.issues.map((issue) => issue.rowNumber)).toEqual([2, 3]);
  });
});
