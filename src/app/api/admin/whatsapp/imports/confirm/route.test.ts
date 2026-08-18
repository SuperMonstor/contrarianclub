// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth", () => ({ getAdminUser: vi.fn() }));
vi.mock("@/lib/whatsapp/server/request", () => ({ isSameOrigin: vi.fn() }));
vi.mock("@/lib/whatsapp/server/imports", () => ({
  confirmWhatsAppImport: vi.fn(),
  ImportInputError: class ImportInputError extends Error {},
  ImportAlreadyAppliedError: class ImportAlreadyAppliedError extends Error {},
}));

import { getAdminUser } from "@/lib/auth";
import { POST } from "@/app/api/admin/whatsapp/imports/confirm/route";
import {
  confirmWhatsAppImport,
  ImportAlreadyAppliedError,
} from "@/lib/whatsapp/server/imports";
import { isSameOrigin } from "@/lib/whatsapp/server/request";

function importRequest() {
  const formData = new FormData();
  formData.set("file", new File(["workbook"], "guests.xlsx"));
  return new Request("https://admin.example/api/admin/whatsapp/imports/confirm", {
    method: "POST",
    body: formData,
  });
}

describe("WhatsApp import confirmation route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getAdminUser).mockResolvedValue({ id: "admin-1" } as never);
    vi.mocked(isSameOrigin).mockReturnValue(true);
    vi.mocked(confirmWhatsAppImport).mockResolvedValue({
      importId: "import-1",
    } as never);
  });

  it("returns conflict when the same workbook was already imported", async () => {
    vi.mocked(confirmWhatsAppImport).mockRejectedValue(
      new ImportAlreadyAppliedError("Workbook already imported."),
    );
    const response = await POST(importRequest());
    expect(response.status).toBe(409);
  });

  it("passes the authenticated user to the confirmation service", async () => {
    const response = await POST(importRequest());
    expect(response.status).toBe(200);
    expect(confirmWhatsAppImport).toHaveBeenCalledWith(
      expect.any(File),
      expect.any(Object),
      "admin-1",
    );
  });
});
