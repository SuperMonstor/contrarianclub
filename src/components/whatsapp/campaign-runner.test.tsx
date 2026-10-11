import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CampaignRunner } from "@/components/whatsapp/campaign-runner";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

function batch(overrides: Record<string, unknown>) {
  return new Response(
    JSON.stringify({
      claimed: 0,
      sent: 0,
      retryable: 0,
      failed: 0,
      unknown: 0,
      hasMore: false,
      inFlight: 0,
      needsReview: 0,
      retryAfterMs: 0,
      ...overrides,
    }),
    { status: 200 },
  );
}

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("WhatsApp campaign runner", () => {
  it("continues through resumable batches", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            claimed: 20,
            sent: 20,
            retryable: 0,
            failed: 0,
            unknown: 0,
            hasMore: true,
            inFlight: 0,
            needsReview: 0,
            retryAfterMs: 0,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            claimed: 5,
            sent: 5,
            retryable: 0,
            failed: 0,
            unknown: 0,
            hasMore: false,
            inFlight: 0,
            needsReview: 0,
            retryAfterMs: 0,
          }),
          { status: 200 },
        ),
      );

    render(<CampaignRunner campaignId="campaign-1" autoStart />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("25 accepted by Meta")).toBeInTheDocument();
    expect(screen.getByText("Campaign queue complete")).toBeInTheDocument();
  });

  it("stops on unknown outcomes and allows a manual resume", async () => {
    const user = userEvent.setup();
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            claimed: 1,
            sent: 0,
            retryable: 0,
            failed: 0,
            unknown: 1,
            hasMore: true,
            inFlight: 0,
            needsReview: 1,
            retryAfterMs: 0,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            claimed: 1,
            sent: 1,
            retryable: 0,
            failed: 0,
            unknown: 0,
            hasMore: false,
            inFlight: 0,
            needsReview: 0,
            retryAfterMs: 0,
          }),
          { status: 200 },
        ),
      );

    render(<CampaignRunner campaignId="campaign-1" autoStart />);
    expect(await screen.findByText("1 outcome needs review")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Resume sending" }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  });

  it("does not report completion while an interrupted batch is in flight", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce(batch({ inFlight: 4 }));

    render(<CampaignRunner campaignId="campaign-1" autoStart />);
    expect(await screen.findByText("Waiting for sends in flight")).toBeInTheDocument();
    expect(screen.queryByText("Campaign queue complete")).not.toBeInTheDocument();
    expect(screen.getByText(/4 sends are still in flight/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resume sending" })).toBeEnabled();
  });

  it("asks for review when earlier uncertain outcomes remain", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(batch({ claimed: 2, sent: 2, needsReview: 3 }));

    render(<CampaignRunner campaignId="campaign-1" autoStart />);
    expect(await screen.findByText("3 outcomes need review")).toBeInTheDocument();
    expect(screen.queryByText("Campaign queue complete")).not.toBeInTheDocument();
  });

  it("refreshes the server counters when sending stops", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce(batch({ claimed: 1, sent: 1 }));

    render(<CampaignRunner campaignId="campaign-1" autoStart />);
    expect(await screen.findByText("Campaign queue complete")).toBeInTheDocument();
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });
});
