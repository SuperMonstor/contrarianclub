import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useChallengeCountdown } from "@/components/use-challenge-countdown";

function Countdown({
  opensInSeconds,
  paused,
}: {
  opensInSeconds: number;
  paused: boolean;
}) {
  const remaining = useChallengeCountdown(opensInSeconds, paused);
  return <output>{remaining}</output>;
}

describe("useChallengeCountdown", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("freezes protected time while paused and continues after resume", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <Countdown opensInSeconds={10} paused={false} />,
    );

    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText("8")).toBeInTheDocument();

    rerender(<Countdown opensInSeconds={8} paused />);
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText("8")).toBeInTheDocument();

    rerender(<Countdown opensInSeconds={8} paused={false} />);
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("keeps an already-unlocked paused ballot at zero", () => {
    vi.useFakeTimers();
    render(<Countdown opensInSeconds={0} paused />);

    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
