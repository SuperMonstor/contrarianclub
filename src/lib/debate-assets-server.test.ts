import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminUser, createServiceClient } = vi.hoisted(() => ({
  requireAdminUser: vi.fn(),
  createServiceClient: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ requireAdminUser }));
vi.mock("@/lib/supabase/server", () => ({ createServiceClient }));

import { getDebateAssets } from "@/lib/debate-assets-server";

const rows: Record<string, Record<string, unknown>[]> = {
  events: [{ id: "event-1", code: "ABC123", title: "A debate", status: "draft" }],
  debate_topics: [{ id: "topic-1", event_id: "event-1", motion: "A motion", sort_order: 0 }],
  activities: [
    {
      id: "before",
      event_id: "event-1",
      topic_id: "topic-1",
      phase: "pre_debate",
      type: "scale",
      status: "closed",
      results_visibility: "revealed",
      scale_left_label: "Against",
      scale_right_label: "For",
    },
    {
      id: "after",
      event_id: "event-1",
      topic_id: "topic-1",
      phase: "post_debate",
      type: "scale",
      status: "closed",
      results_visibility: "revealed",
      scale_left_label: "Against",
      scale_right_label: "For",
    },
  ],
  poll_options: ["before", "after"].flatMap((activityId) =>
    [-3, -2, -1, 0, 1, 2, 3].map((value) => ({
      id: `${activityId}-${value}`,
      activity_id: activityId,
      label: String(value),
      scale_value: value,
    })),
  ),
  votes: [
    { activity_id: "before", option_id: "before--2", device_id: "private-device" },
    { activity_id: "after", option_id: "after-1", device_id: "private-device" },
  ],
};

function fakeQuery(table: string) {
  let selected = rows[table];
  const query = {
    select: () => query,
    eq: (field: string, value: string) => {
      selected = selected.filter((row) => row[field] === value);
      return query;
    },
    in: (field: string, values: string[]) => {
      selected = selected.filter((row) => values.includes(String(row[field])));
      return query;
    },
    order: () => query,
    range: (first: number, last: number) => {
      selected = selected.slice(first, last + 1);
      return query;
    },
    maybeSingle: async () => ({ data: selected[0] ?? null, error: null }),
    returns: async () => ({ data: selected, error: null }),
  };
  return query;
}

describe("debate asset loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminUser.mockResolvedValue({ id: "admin" });
    createServiceClient.mockReturnValue({ from: fakeQuery });
  });

  it("returns only aggregate card data from a normalized event code", async () => {
    const result = await getDebateAssets("abc123");

    expect(result).toMatchObject({
      event: { code: "ABC123", title: "A debate" },
      motions: [{ ready: true, matchedVoters: 1, movedFor: 1 }],
    });
    expect(JSON.stringify(result)).not.toContain("private-device");
  });

  it("checks admin authentication before opening the service client", async () => {
    requireAdminUser.mockRejectedValue(new Error("login required"));

    await expect(getDebateAssets("ABC123")).rejects.toThrow("login required");
    expect(createServiceClient).not.toHaveBeenCalled();
  });
});
