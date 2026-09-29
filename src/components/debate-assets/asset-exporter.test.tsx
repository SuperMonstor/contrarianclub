import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JSZip from "jszip";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AssetExporter } from "@/components/debate-assets/asset-exporter";
import type { DebateAssetSet } from "@/lib/debate-assets-server";

vi.mock("html-to-image", () => ({
  toBlob: vi.fn(async () => new Blob(["image bytes"], { type: "image/png" })),
}));

const readyMotion = {
  topicId: "topic-1",
  motion: "A motion",
  order: 1,
  ready: true as const,
  matchedVoters: 3,
  fullBeforeVotes: 4,
  fullAfterVotes: 5,
  before: [1, 0, 0, 1, 0, 1, 0],
  after: [0, 1, 0, 0, 1, 0, 1],
  movedAgainst: 1,
  movedFor: 2,
  held: 0,
  averageBefore: -0.33,
  averageAfter: 0.67,
  averageShift: 1,
  leftLabel: "Against the motion",
  rightLabel: "For the motion",
};

const assets: DebateAssetSet = {
  event: { code: "ABC123", title: "A debate", status: "ended" },
  readAt: "2026-09-29T10:00:00.000Z",
  motions: [readyMotion, { ...readyMotion, topicId: "topic-2", motion: "Second motion", order: 2 }],
};

afterEach(() => vi.restoreAllMocks());

describe("debate asset export", () => {
  it("previews three cards per motion and downloads six PNGs in one ZIP", async () => {
    const user = userEvent.setup();
    let downloaded: Blob | null = null;
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      downloaded = blob as Blob;
      return "blob:debate-assets";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<AssetExporter assets={assets} />);

    expect(screen.getAllByRole("region", { name: /card for motion/i })).toHaveLength(6);
    await user.click(screen.getByRole("button", { name: /generate and download/i }));
    await waitFor(() => expect(downloaded).not.toBeNull());

    const archive = await JSZip.loadAsync(downloaded as unknown as Blob);
    expect(Object.keys(archive.files).sort()).toEqual([
      "ABC123-motion-01-after.png",
      "ABC123-motion-01-before.png",
      "ABC123-motion-01-swing.png",
      "ABC123-motion-02-after.png",
      "ABC123-motion-02-before.png",
      "ABC123-motion-02-swing.png",
    ]);
  });

  it("blocks the whole ZIP when one motion is not ready", () => {
    render(
      <AssetExporter
        assets={{
          ...assets,
          motions: [
            readyMotion,
            { topicId: "topic-2", motion: "Second motion", order: 2, ready: false, reason: "Poll is open." },
          ],
        }}
      />,
    );

    expect(screen.getByRole("button", { name: /generate and download/i })).toBeDisabled();
    expect(screen.getByText(/finish every motion/i)).toBeInTheDocument();
  });
});
