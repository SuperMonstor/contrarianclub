"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { EventState } from "@/lib/types";

export function useLiveEventState(code: string, initialState: EventState) {
  const [state, setState] = useState(initialState);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isPending, startTransition] = useTransition();

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

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refresh();
    }, 2500);

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
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants" },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "presentation_state" },
        () => void refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [code, refresh]);

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
