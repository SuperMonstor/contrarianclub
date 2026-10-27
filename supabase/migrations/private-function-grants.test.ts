// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const directory = new URL("./", import.meta.url);
const migrations = readdirSync(directory)
  .filter((name) => name.endsWith(".sql"))
  .sort()
  .map((name) => readFileSync(new URL(name, directory), "utf8"))
  .join("\n");

const normalized = migrations.replace(/\s+/g, " ");

function signaturesGrantedTo(role: string): string[] {
  const pattern = new RegExp(
    `grant execute on function (public\\.[a-z_]+\\([^)]*\\)) to ${role};`,
    "g",
  );
  return [...new Set([...normalized.matchAll(pattern)].map((match) => match[1]))];
}

const audienceFunctions = [
  "public.cast_vote(uuid, uuid, uuid, text)",
  "public.join_speaker_electorate(uuid)",
  "public.get_speaker_participation(uuid, uuid)",
  "public.set_next_speaker_request(uuid, uuid, integer, boolean)",
];

describe("private function grants", () => {
  it("revokes direct anon and authenticated grants from every service role function", () => {
    const privateFunctions = signaturesGrantedTo("service_role");
    expect(privateFunctions.length).toBeGreaterThan(0);
    for (const signature of privateFunctions) {
      expect(normalized).toContain(
        `revoke all on function ${signature} from public, anon, authenticated;`,
      );
    }
  });

  it("revokes direct grants from internal helpers", () => {
    for (const signature of [
      "public.snapshot_speaker_round(uuid, integer)",
      "public.refresh_speaker_round_threshold(uuid, integer)",
      "public.touch_whatsapp_updated_at()",
      "public.join_challenge_round(uuid, uuid)",
    ]) {
      expect(normalized).toContain(
        `revoke all on function ${signature} from public, anon, authenticated;`,
      );
    }
  });

  it("keeps the audience voting functions public", () => {
    for (const signature of audienceFunctions) {
      expect(normalized).toContain(
        `grant execute on function ${signature} to anon, authenticated;`,
      );
      expect(normalized).not.toContain(
        `revoke all on function ${signature} from public, anon, authenticated;`,
      );
    }
  });
});
