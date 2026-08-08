import { act, render, screen } from "@testing-library/react";
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
  topics: [
    {
      id: "topic-1",
      event_id: "event-1",
      motion: "A test motion",
      sort_order: 0,
      created_at: "2026-08-08T00:00:00.000Z",
    },
  ],
  activeTopic: {
    id: "topic-1",
    event_id: "event-1",
    motion: "A test motion",
    sort_order: 0,
    created_at: "2026-08-08T00:00:00.000Z",
  },
  activities: [],
  activity: {
    id: "activity-1",
    event_id: "event-1",
    topic_id: "topic-1",
    sort_order: 1,
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
    nextVotes: 1,
    eligibleCount: 6,
    thresholdCount: 3,
    thresholdReached: false,
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
        name: "Next-speaker requests are open.",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Current speaker")).not.toBeInTheDocument();
  });

  it("keeps a reset speaker activity on its ready stage", () => {
    render(
      <PresenterDisplay
        code="ROOM1"
        initialState={{
          ...state,
          mode: "join",
          activity: { ...state.activity!, status: "draft" },
          challenge: {
            ...state.challenge!,
            votingOpen: false,
            nextVotes: 0,
            thresholdReached: false,
          },
        }}
      />,
    );

    expect(screen.getByText("The Audience Section is ready.")).toBeInTheDocument();
    expect(
      screen.queryByText("Scan the code to cast your vote."),
    ).not.toBeInTheDocument();
  });

  it("opens requests locally when protected time reaches zero", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-08T00:00:00.000Z"));

    try {
      render(
        <PresenterDisplay
          code="ROOM1"
          initialState={{
            ...state,
            challenge: {
              ...state.challenge!,
              opensInSeconds: 1,
              votingOpen: false,
            },
          }}
        />,
      );

      expect(screen.getByText("0:01")).toBeInTheDocument();

      act(() => vi.advanceTimersByTime(1_250));

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Next-speaker requests are open.",
        }),
      ).toBeInTheDocument();
      expect(screen.getByText("Audience ballot live")).toBeInTheDocument();
      expect(screen.queryByText("Waiting for the next round.")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps the active topic motion visible on its swing reveal", () => {
    const swingState: EventState = {
      ...state,
      mode: "swing",
      activity: {
        ...state.activity!,
        id: "post-1",
        sort_order: 2,
        phase: "post_debate",
        prompt: "Closing vote",
        status: "closed",
        results_visibility: "revealed",
      },
      challenge: null,
      swing: {
        format: "multiple_choice",
        preActivityId: "pre-1",
        postActivityId: "post-1",
        matchedVotes: 4,
        changedVotes: 2,
        changedPercent: 50,
        crossedVotes: 0,
        crossedPercent: 0,
        movedTowardLeft: 0,
        movedTowardRight: 0,
        unchangedVotes: 0,
        averagePre: null,
        averagePost: null,
        netSwing: null,
        scaleLeftLabel: null,
        scaleRightLabel: null,
        swingWinnerLabel: null,
        finalLeaderLabel: null,
        optionTotals: [],
        transitions: [],
      },
    };

    render(<PresenterDisplay code="ROOM1" initialState={swingState} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "A test motion" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Topic 1 swing")).toBeInTheDocument();
  });
});
