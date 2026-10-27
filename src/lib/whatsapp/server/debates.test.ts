// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { debateNumberFromTitle } from "@/lib/whatsapp/server/debates";

describe("debate numbers from titles", () => {
  it.each([
    ["Debate #12", "12"],
    ["Contrarian Debate Club # 9: Tech bubble", "9"],
    ["Debate 10", "10"],
    ["debate #011", "11"],
  ])("reads %s as %s", (title, expected) => {
    expect(debateNumberFromTitle(title)).toBe(expected);
  });

  it("returns null when the title has no number", () => {
    expect(debateNumberFromTitle("Should AI replace engineers?")).toBeNull();
    expect(debateNumberFromTitle("Top 5 debates")).toBeNull();
  });
});
