import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { isSameOrigin } from "@/lib/whatsapp/server/request";

function request(origin?: string, host = "admin.contrarian.club") {
  const headers = new Headers({ host });
  if (origin !== undefined) headers.set("origin", origin);
  return new Request("https://admin.contrarian.club/api/test", { headers });
}

describe("authenticated mutation origin checks", () => {
  it("accepts matching hosts including their port", () => {
    expect(isSameOrigin(request("https://admin.contrarian.club"))).toBe(true);
    expect(
      isSameOrigin(request("http://localhost:3000", "localhost:3000")),
    ).toBe(true);
  });

  it("rejects different, malformed, and wrong-port origins", () => {
    expect(isSameOrigin(request("https://evil.example"))).toBe(false);
    expect(isSameOrigin(request("not a url"))).toBe(false);
    expect(
      isSameOrigin(request("http://localhost:4000", "localhost:3000")),
    ).toBe(false);
  });

  it("allows requests without an Origin after authentication", () => {
    expect(isSameOrigin(request())).toBe(true);
  });
});
