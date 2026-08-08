import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ChallengeProgress,
  ChallengeVote,
} from "@/components/challenge-vote";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { ActivitySummary, ChallengeSummary } from "@/lib/types";

vi.mock("@/lib/supabase/browser", () => ({ createBrowserClient: vi.fn() }));

const activity: ActivitySummary = {
  id: "activity-1",
  event_id: "event-1",
  topic_id: "topic-1",
  sort_order: 1,
  type: "multiple_choice",
  phase: "speaker_challenge",
  prompt: "Current speaker",
  status: "open",
  results_visibility: "hidden",
  created_at: "2026-08-08T00:00:00.000Z",
};

const challenge: ChallengeSummary = {
  round: 3,
  bufferSeconds: 90,
  opensInSeconds: 0,
  paused: false,
  votingOpen: true,
  nextVotes: 2,
  eligibleCount: 8,
  thresholdCount: 4,
  thresholdReached: false,
};

function mockRpc({
  joined = true,
  eligible = true,
  requested = false,
  requestError = null,
}: {
  joined?: boolean;
  eligible?: boolean;
  requested?: boolean;
  requestError?: { message: string } | null;
} = {}) {
  const rpc = vi.fn(async (name: string) => {
    if (name === "get_speaker_participation") {
      return {
        data: [{ round: 3, joined, eligible, requested }],
        error: null,
      };
    }
    if (name === "set_next_speaker_request") {
      return { data: null, error: requestError };
    }
    return { data: null, error: null };
  });
  vi.mocked(createBrowserClient).mockReturnValue({ rpc } as never);
  return rpc;
}

describe("ChallengeVote", () => {
  beforeEach(() => vi.clearAllMocks());

  it("recovers event enrollment and the current request", async () => {
    mockRpc({ requested: true });
    render(
      <ChallengeVote
        activity={activity}
        challenge={challenge}
        voteToken="token-1"
        refresh={vi.fn()}
      />,
    );

    expect(await screen.findByText(/Enrolled once/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Withdraw next-speaker request/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("enrolls once through the event-level electorate", async () => {
    const rpc = mockRpc({ joined: false, eligible: false });
    const user = userEvent.setup();
    render(
      <ChallengeVote
        activity={{ ...activity, status: "draft" }}
        challenge={{ ...challenge, votingOpen: false }}
        voteToken="token-1"
        refresh={vi.fn(async () => undefined)}
      />,
    );

    await user.click(
      await screen.findByRole("button", { name: /Join audience speaker requests/i }),
    );
    expect(rpc).toHaveBeenCalledWith("join_speaker_electorate", {
      p_token: "token-1",
    });
  });

  it("makes a late enrollee eligible for the current speaker", async () => {
    let joined = false;
    const rpc = vi.fn(async (name: string) => {
      if (name === "get_speaker_participation") {
        return {
          data: [
            {
              round: 3,
              joined,
              eligible: joined,
              requested: false,
            },
          ],
          error: null,
        };
      }
      if (name === "join_speaker_electorate") {
        joined = true;
      }
      return { data: null, error: null };
    });
    vi.mocked(createBrowserClient).mockReturnValue({ rpc } as never);
    const user = userEvent.setup();

    render(
      <ChallengeVote
        activity={activity}
        challenge={challenge}
        voteToken="token-1"
        refresh={vi.fn(async () => undefined)}
      />,
    );

    await user.click(
      await screen.findByRole("button", { name: /Join audience speaker requests/i }),
    );

    expect(
      await screen.findByRole("button", { name: "Request next speaker" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You can now vote on the current speaker."),
    ).toBeInTheDocument();
  });

  it("submits one next-speaker request for the expected round", async () => {
    const rpc = mockRpc();
    const user = userEvent.setup();
    render(
      <ChallengeVote
        activity={activity}
        challenge={challenge}
        voteToken="token-1"
        refresh={vi.fn(async () => undefined)}
      />,
    );

    await user.click(
      await screen.findByRole("button", { name: "Request next speaker" }),
    );
    expect(rpc).toHaveBeenCalledWith("set_next_speaker_request", {
      p_token: "token-1",
      p_activity_id: "activity-1",
      p_expected_round: 3,
      p_requested: true,
    });
  });

  it("keeps new requests available past the threshold", async () => {
    mockRpc();
    render(
      <ChallengeVote
        activity={activity}
        challenge={{ ...challenge, thresholdReached: true }}
        voteToken="token-1"
        refresh={vi.fn(async () => undefined)}
      />,
    );

    expect(
      await screen.findByRole("button", { name: "Request next speaker" }),
    ).toBeInTheDocument();
  });

  it("keeps withdrawals available past the threshold", async () => {
    mockRpc({ requested: true });
    render(
      <ChallengeVote
        activity={activity}
        challenge={{ ...challenge, thresholdReached: true }}
        voteToken="token-1"
        refresh={vi.fn(async () => undefined)}
      />,
    );

    expect(
      await screen.findByRole("button", {
        name: "Withdraw next-speaker request",
      }),
    ).toBeInTheDocument();
  });

  it("rolls the optimistic request back on rejection", async () => {
    mockRpc({ requestError: { message: "speaker_paused" } });
    const user = userEvent.setup();
    render(
      <ChallengeVote
        activity={activity}
        challenge={challenge}
        voteToken="token-1"
        refresh={vi.fn()}
      />,
    );

    const button = await screen.findByRole("button", {
      name: "Request next speaker",
    });
    await user.click(button);
    await waitFor(() => expect(button).toHaveAttribute("aria-pressed", "false"));
    expect(screen.getByText(/host has paused/i)).toBeInTheDocument();
  });

  it("shows anonymous live vote and enrollment totals", async () => {
    mockRpc();
    render(
      <ChallengeVote
        activity={activity}
        challenge={challenge}
        voteToken="token-1"
        refresh={vi.fn()}
      />,
    );
    await screen.findByText(/Enrolled once/i);
    expect(screen.getByText("2 voted")).toBeInTheDocument();
    expect(screen.getByText("8 joined")).toBeInTheDocument();
    const progressbar = screen.getByRole("progressbar", {
      name: "Next-speaker vote progress",
    });
    expect(progressbar).toHaveAttribute("aria-valuenow", "2");
    expect(progressbar.firstElementChild).toHaveStyle({ width: "25%" });
    expect(progressbar.firstElementChild).toHaveClass(
      "bg-[color:var(--cc-gold-bright)]",
    );
  });

  it("turns the audience progress bar red at the threshold", async () => {
    mockRpc();
    render(
      <ChallengeVote
        activity={activity}
        challenge={{
          ...challenge,
          nextVotes: 4,
          thresholdReached: true,
        }}
        voteToken="token-1"
        refresh={vi.fn()}
      />,
    );

    const progressbar = await screen.findByRole("progressbar", {
      name: "Next-speaker vote progress",
    });
    expect(progressbar.firstElementChild).toHaveClass(
      "bg-[color:var(--cc-wine-bright)]",
    );
    expect(progressbar.firstElementChild).toHaveStyle({ width: "50%" });
  });

  it("recovers cleanly when participation lookup loses the connection", async () => {
    const rpc = vi.fn(async () => {
      throw new Error("network_failed");
    });
    vi.mocked(createBrowserClient).mockReturnValue({ rpc } as never);

    render(
      <ChallengeVote
        activity={activity}
        challenge={challenge}
        voteToken="token-1"
        refresh={vi.fn(async () => undefined)}
      />,
    );

    expect(
      await screen.findByText(/Couldn't recover your enrollment/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Recovering enrollment/i)).not.toBeInTheDocument();
  });

  it("does not claim zero more requests when a round has no electorate", () => {
    render(
      <ChallengeProgress
        challenge={{
          ...challenge,
          nextVotes: 0,
          eligibleCount: 0,
          thresholdCount: 0,
        }}
      />,
    );

    expect(screen.getByText("No eligible voters in this round")).toBeInTheDocument();
    expect(screen.queryByText("0 more needed")).not.toBeInTheDocument();
  });
});
