"use client";

import { useEffect, useState } from "react";

// Ticks a local countdown between state refreshes. The server recomputes
// opensInSeconds on every poll (~5s), so the deadline recalibrates each time a
// fresh value arrives and client clock drift never accumulates.
export function useChallengeCountdown(opensInSeconds: number) {
  const [remaining, setRemaining] = useState(opensInSeconds);
  const [syncedFrom, setSyncedFrom] = useState(opensInSeconds);

  // Re-anchor during render when a fresh server value arrives, instead of in
  // an effect (avoids a cascading render).
  if (syncedFrom !== opensInSeconds) {
    setSyncedFrom(opensInSeconds);
    setRemaining(opensInSeconds);
  }

  useEffect(() => {
    if (opensInSeconds <= 0) return;

    const deadline = Date.now() + opensInSeconds * 1000;
    const interval = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) window.clearInterval(interval);
    }, 250);

    return () => window.clearInterval(interval);
  }, [opensInSeconds]);

  return remaining;
}

export function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
