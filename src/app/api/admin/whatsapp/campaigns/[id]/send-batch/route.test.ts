// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth", () => ({ getAdminUser: vi.fn() }));
vi.mock("@/lib/whatsapp/server/request", () => ({ isSameOrigin: vi.fn() }));
vi.mock("@/lib/whatsapp/server/campaigns", () => ({
  sendCampaignBatch: vi.fn(),
  isUuid: (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    ),
  CampaignNotFoundError: class CampaignNotFoundError extends Error {},
}));

import { POST } from "@/app/api/admin/whatsapp/campaigns/[id]/send-batch/route";
import { getAdminUser } from "@/lib/auth";
import {
  CampaignNotFoundError,
  sendCampaignBatch,
} from "@/lib/whatsapp/server/campaigns";
import { isSameOrigin } from "@/lib/whatsapp/server/request";

const campaignId = "b4a27957-4d44-42d5-b643-821576114b52";
const context = { params: Promise.resolve({ id: campaignId }) };

describe("WhatsApp campaign batch route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getAdminUser).mockResolvedValue({ id: "admin-1" } as never);
    vi.mocked(isSameOrigin).mockReturnValue(true);
    vi.mocked(sendCampaignBatch).mockResolvedValue({
      claimed: 1,
      sent: 1,
      retryable: 0,
      failed: 0,
      unknown: 0,
      hasMore: false,
      retryAfterMs: 0,
    });
  });

  it("requires admin authentication and same origin", async () => {
    vi.mocked(getAdminUser).mockResolvedValue(null);
    expect(
      (await POST(new Request("https://club.test", { method: "POST" }), context))
        .status,
    ).toBe(401);

    vi.mocked(getAdminUser).mockResolvedValue({ id: "admin-1" } as never);
    vi.mocked(isSameOrigin).mockReturnValue(false);
    expect(
      (await POST(new Request("https://club.test", { method: "POST" }), context))
        .status,
    ).toBe(403);
  });

  it("rejects malformed campaign IDs", async () => {
    const response = await POST(
      new Request("https://club.test", { method: "POST" }),
      { params: Promise.resolve({ id: "not-a-uuid" }) },
    );
    expect(response.status).toBe(400);
  });

  it("returns a no-store batch result", async () => {
    const response = await POST(
      new Request("https://club.test", { method: "POST" }),
      context,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("returns 404 for an unknown campaign", async () => {
    vi.mocked(sendCampaignBatch).mockRejectedValue(
      new CampaignNotFoundError("Campaign not found."),
    );
    const response = await POST(
      new Request("https://club.test", { method: "POST" }),
      context,
    );
    expect(response.status).toBe(404);
  });
});
