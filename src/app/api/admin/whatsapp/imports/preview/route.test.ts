// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth", () => ({ getAdminUser: vi.fn() }));
vi.mock("@/lib/whatsapp/server/request", () => ({ isSameOrigin: vi.fn() }));
vi.mock("@/lib/whatsapp/server/imports", () => ({
  previewWhatsAppImport: vi.fn(),
  ImportInputError: class ImportInputError extends Error {},
}));

import { getAdminUser } from "@/lib/auth";
import { POST } from "@/app/api/admin/whatsapp/imports/preview/route";
import { previewWhatsAppImport } from "@/lib/whatsapp/server/imports";
import { isSameOrigin } from "@/lib/whatsapp/server/request";

const mockedUser = vi.mocked(getAdminUser);
const mockedSameOrigin = vi.mocked(isSameOrigin);
const mockedPreview = vi.mocked(previewWhatsAppImport);

function importRequest() {
  const formData = new FormData();
  formData.set("file", new File(["workbook"], "guests.xlsx"));
  return new Request("https://admin.example/api/admin/whatsapp/imports/preview", {
    method: "POST",
    body: formData,
  });
}

describe("WhatsApp import preview route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedUser.mockResolvedValue({ id: "admin-1" } as never);
    mockedSameOrigin.mockReturnValue(true);
    mockedPreview.mockResolvedValue({ ready: true } as never);
  });

  it("requires an authenticated admin", async () => {
    mockedUser.mockResolvedValue(null);
    const response = await POST(importRequest());
    expect(response.status).toBe(401);
  });

  it("rejects a cross-origin mutation", async () => {
    mockedSameOrigin.mockReturnValue(false);
    const response = await POST(importRequest());
    expect(response.status).toBe(403);
  });

  it("returns a no-store workbook preview", async () => {
    const response = await POST(importRequest());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ ready: true });
  });
});
