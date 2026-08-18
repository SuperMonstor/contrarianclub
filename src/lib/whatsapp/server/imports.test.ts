import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { calculateImportCounts } from "@/lib/whatsapp/server/imports";
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
