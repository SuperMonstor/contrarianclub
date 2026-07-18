import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChallengeVote } from "@/components/challenge-vote";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { ActivitySummary, ChallengeSummary } from "@/lib/types";

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserClient: vi.fn(),
}));

const activity: ActivitySummary = {
  id: "activity-1",
  event_id: "event-1",
  type: "multiple_choice",
  phase: "speaker_challenge",
  prompt: "Current speaker",
  status: "open",
  results_visibility: "hidden",
  created_at: "2026-07-19T00:00:00.000Z",
};

const challenge: ChallengeSummary = {
  round: 3,
  bufferSeconds: 90,
  opensInSeconds: 0,
  paused: false,
  votingOpen: true,
  keepVotes: 2,
  nextVotes: 1,
  totalBallots: 3,
  leader: "keep",
};

function mockRpc(
  getChoice: "keep" | "next" | null,
  setError: { message: string } | null = null,
) {
  const rpc = vi.fn(async (name: string) => {
    if (name === "get_speaker_ballot") {
      return { data: [{ round: 3, choice: getChoice }], error: null };
    }
    return { data: null, error: setError };
  });
  vi.mocked(createBrowserClient).mockReturnValue({ rpc } as never);
  return rpc;
}

describe("ChallengeVote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("recovers and highlights the server-confirmed choice after refresh", async () => {
    mockRpc("keep");
    render(
      <ChallengeVote
        activity={activity}
        challenge={challenge}
        voteToken="token-1"
        refresh={vi.fn()}
      />,
    );

    expect(await screen.findByRole("button", { name: /Keep speaking/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("switches a ballot without a second participation step", async () => {
    const rpc = mockRpc("keep");
    const refresh = vi.fn(async () => undefined);
    const user = userEvent.setup();
    render(
      <ChallengeVote
        activity={activity}
        challenge={challenge}
        voteToken="token-1"
        refresh={refresh}
      />,
    );

    const next = await screen.findByRole("button", { name: /Next speaker/i });
    await user.click(next);

    expect(rpc).toHaveBeenCalledWith("set_speaker_ballot", {
      p_token: "token-1",
      p_activity_id: "activity-1",
      p_expected_round: 3,
      p_choice: "next",
    });
    expect(next).toHaveAttribute("aria-pressed", "true");
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("rolls optimistic selection back when the server rejects it", async () => {
    mockRpc("keep", { message: "speaker_paused" });
    const user = userEvent.setup();
    render(
      <ChallengeVote
        activity={activity}
        challenge={challenge}
        voteToken="token-1"
        refresh={vi.fn()}
      />,
    );

    const keep = await screen.findByRole("button", { name: /Keep speaking/i });
    const next = screen.getByRole("button", { name: /Next speaker/i });
    await user.click(next);

    await waitFor(() => expect(keep).toHaveAttribute("aria-pressed", "true"));
    expect(next).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(/host has paused/i)).toBeInTheDocument();
  });

  it("shows only the protected countdown before 90 seconds expires", () => {
    mockRpc(null);
    render(
      <ChallengeVote
        activity={activity}
        challenge={{ ...challenge, opensInSeconds: 90, votingOpen: false }}
        voteToken="token-1"
        refresh={vi.fn()}
      />,
    );

    expect(screen.getByText("1:30")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Keep speaking/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Join this round/i)).not.toBeInTheDocument();
  });

  it("keeps live totals visible while an unlocked ballot is paused", () => {
    mockRpc("next");
    render(
      <ChallengeVote
        activity={activity}
        challenge={{ ...challenge, paused: true, votingOpen: false }}
        voteToken="token-1"
        refresh={vi.fn()}
      />,
    );

    expect(screen.getByText("3 total ballots")).toBeInTheDocument();
    expect(screen.getByText("Speaker session paused")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Next speaker/i })).not.toBeInTheDocument();
  });

  it("does not re-enable a server-closed ballot from a zero local timer", () => {
    mockRpc("next");
    render(
      <ChallengeVote
        activity={activity}
        challenge={{ ...challenge, opensInSeconds: 0, votingOpen: false }}
        voteToken="token-1"
        refresh={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: /Next speaker/i })).not.toBeInTheDocument();
  });
});
