import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CampaignRunner } from "@/components/whatsapp/campaign-runner";

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
});
