import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/whatsapp/server/workbook", () => ({
  parseImportWorkbook: vi.fn(async () => ({
    sheetName: "Guests",
    rows: [
      ["Name", "Phone", "WhatsApp updates"],
      ["Asha", "9876543210", "Yes"],
    ],
  })),
}));
vi.mock("@/lib/supabase/server", () => {
  const query = {
    select: () => query,
    eq: () => query,
    in: () => query,
    maybeSingle: async () => ({ data: null, error: null }),
    returns: async () => ({ data: [], error: null }),
  };
  return { createServiceClient: () => ({ from: () => query }) };
});

import {
  calculateImportCounts,
  confirmWhatsAppImport,
  ImportInputError,
  previewWhatsAppImport,
} from "@/lib/whatsapp/server/imports";
import type { NormalizedImportRow } from "@/lib/whatsapp/types";

const rows: NormalizedImportRow[] = [
  {
    phone_e164: "+919000000001",
    name: "New active",
    is_active: true,
    preference_at: "2026-08-19T10:00:00.000Z",
  },
  {
    phone_e164: "+919000000002",
    name: "New inactive",
    is_active: false,
    preference_at: "2026-08-19T10:00:00.000Z",
  },
  {
    phone_e164: "+919000000003",
    name: "Deactivate",
    is_active: false,
    preference_at: "2026-08-19T10:00:00.000Z",
  },
  {
    phone_e164: "+919000000004",
    name: "Reactivate",
    is_active: true,
    preference_at: "2026-08-19T10:00:00.000Z",
  },
  {
    phone_e164: "+919000000005",
    name: "Older",
    is_active: false,
    preference_at: "2026-08-18T10:00:00.000Z",
  },
];

describe("WhatsApp import preview counts", () => {
  it("mirrors the transactional newest-preference rules", () => {
    expect(
      calculateImportCounts(
        rows,
        [
          {
            phone_e164: "+919000000003",
            is_active: true,
            preference_at: "2026-08-18T10:00:00.000Z",
          },
          {
            phone_e164: "+919000000004",
            is_active: false,
            preference_at: "2026-08-18T10:00:00.000Z",
          },
          {
            phone_e164: "+919000000005",
            is_active: true,
            preference_at: "2026-08-19T10:00:00.000Z",
          },
        ],
        2,
      ),
    ).toEqual({
      addedCount: 1,
      updatedCount: 1,
      deactivatedCount: 1,
      unchangedCount: 2,
      invalidCount: 2,
    });
  });
});

describe("WhatsApp import without a preference time column", () => {
  const file = () => new File(["workbook"], "guests.xlsx");

  it("returns the detected mapping and asks for the source date", async () => {
    await expect(
      previewWhatsAppImport(file(), { sourceDate: null }),
    ).resolves.toMatchObject({
      ready: false,
      sourceDateRequired: true,
      mapping: {
        name: "Name",
        phone: "Phone",
        consent: "WhatsApp updates",
        preferenceTime: null,
      },
    });
  });

  it("previews once the source date is supplied", async () => {
    await expect(
      previewWhatsAppImport(file(), { sourceDate: "2026-08-15" }),
    ).resolves.toMatchObject({ ready: true, validRows: 1 });
  });

  it("refuses to confirm without the source date", async () => {
    await expect(
      confirmWhatsAppImport(file(), { sourceDate: null }, "admin-1"),
    ).rejects.toBeInstanceOf(ImportInputError);
  });
});
