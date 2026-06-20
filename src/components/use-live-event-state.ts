"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { EventState } from "@/lib/types";

// Realtime fires once per row change. During active voting that means a burst
// of events, so we coalesce them into a single refetch instead of one per vote.
const REALTIME_DEBOUNCE_MS = 500;
// Realtime is the primary liveness signal; the poll is just a backstop for any
// missed events, so it can run slowly.
const SAFETY_POLL_MS = 5000;

export function useLiveEventState(code: string, initialState: EventState) {
  const [state, setState] = useState(initialState);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/events/${code}/state`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return;
    }

    const nextState = (await response.json()) as EventState;
    setState(nextState);
    setLastSyncedAt(new Date());
  }, [code]);

  // Coalesce bursts of realtime events into a single trailing refetch.
  const scheduleRefresh = useCallback(() => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      debounceRef.current = null;
      void refresh();
    }, REALTIME_DEBOUNCE_MS);
  }, [refresh]);

  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refresh();
    }, SAFETY_POLL_MS);

    return () => window.clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    const supabase = createBrowserClient();

    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel(`event-state-${code}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activities" },
        () => scheduleRefresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        () => scheduleRefresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants" },
        () => scheduleRefresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "presentation_state" },
        () => scheduleRefresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [code, scheduleRefresh]);

  function refreshSoon() {
    startTransition(() => {
      void refresh();
    });
  }

  return {
    state,
    refresh,
    refreshSoon,
    isPending,
    lastSyncedAt,
  };
}
