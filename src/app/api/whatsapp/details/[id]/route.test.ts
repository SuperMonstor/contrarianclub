// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle }) }),
    }),
  }),
}));

import { GET } from "@/app/api/whatsapp/details/[id]/route";

const campaignId = "7d1f1c1e-3b7a-4c3e-9f1a-2b3c4d5e6f70";

function open(id: string) {
  return GET(new Request(`https://thecontrarian.club/api/whatsapp/details/${id}`), {
    params: Promise.resolve({ id }),
  });
}

beforeEach(() => maybeSingle.mockReset());

describe("WhatsApp details link", () => {
  it("redirects to the link the announcement carried", async () => {
    maybeSingle.mockResolvedValue({
      data: {
        kind: "announcement",
        parameters: { detailsUrl: "https://tickets.example/debate-12" },
      },
      error: null,
    });
    const response = await open(campaignId);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://tickets.example/debate-12");
  });

  it("returns 404 for malformed IDs, welcome campaigns, and unsafe links", async () => {
    expect((await open("not-a-uuid")).status).toBe(404);
    expect(maybeSingle).not.toHaveBeenCalled();

    maybeSingle.mockResolvedValueOnce({
      data: { kind: "welcome", parameters: {} },
      error: null,
    });
    expect((await open(campaignId)).status).toBe(404);

    maybeSingle.mockResolvedValueOnce({
      data: { kind: "announcement", parameters: { detailsUrl: "javascript:alert(1)" } },
      error: null,
    });
    expect((await open(campaignId)).status).toBe(404);
  });
});
