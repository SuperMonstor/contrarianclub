import { describe, expect, it } from "vitest";
import { maskIndianPhone, normalizeIndianPhone } from "@/lib/whatsapp/phone";

describe("Indian WhatsApp phone numbers", () => {
  it.each([
    ["98765 43210", "+919876543210"],
    ["09876543210", "+919876543210"],
    ["+91-98765-43210", "+919876543210"],
    [9876543210, "+919876543210"],
  ])("normalizes %j to E.164", (input, expected) => {
    expect(normalizeIndianPhone(input)).toBe(expected);
  });

  it.each(["5876543210", "98765", 98.765])(
    "rejects invalid value %j",
    (input) => {
      expect(normalizeIndianPhone(input)).toBeNull();
    },
  );

  it("masks all but the country code and last four digits", () => {
    expect(maskIndianPhone("+919876543210")).toBe("+91******3210");
  });
});
