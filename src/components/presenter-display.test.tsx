import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PresenterDisplay } from "@/components/presenter-display";
import type { EventState } from "@/lib/types";

vi.mock("qrcode.react", () => ({
  QRCodeCanvas: () => <div data-testid="qr-code" />,
}));

vi.mock("@/components/use-live-event-state", () => ({
  useLiveEventState: (_code: string, initialState: EventState) => ({
    state: initialState,
  }),
}));

const state: EventState = {
  event: {
    id: "event-1",
    code: "ROOM1",
    title: "A test motion",
    status: "live",
    created_at: "2026-07-19T00:00:00.000Z",
  },
  activities: [],
  activity: {
    id: "activity-1",
    event_id: "event-1",
    type: "multiple_choice",
    phase: "speaker_challenge",
    prompt: "Current speaker",
    status: "open",
    results_visibility: "hidden",
    created_at: "2026-07-19T00:00:00.000Z",
  },
  mode: "poll",
  options: [],
  totalVotes: 0,
  participantCount: 0,
  swing: null,
  challenge: {
    round: 1,
    bufferSeconds: 90,
    opensInSeconds: 0,
    paused: false,
    votingOpen: true,
    keepVotes: 1,
    nextVotes: 0,
    totalBallots: 1,
    leader: "keep",
  },
  joinUrl: "https://example.com/join/ROOM1",
  presenterUrl: "https://example.com/present/ROOM1",
};

describe("PresenterDisplay", () => {
  it("uses the audience ballot question as the single stage headline", () => {
    render(<PresenterDisplay code="ROOM1" initialState={state} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Keep speaking or next speaker?",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Current speaker")).not.toBeInTheDocument();
  });
});
