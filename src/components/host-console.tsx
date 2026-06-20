"use client";

import type { ReactNode } from "react";
import { startTransition, useState } from "react";
import {
  Eye,
  EyeOff,
  Monitor,
  Play,
  QrCode,
  RotateCcw,
  Square,
} from "lucide-react";
import { controlActivity } from "@/app/actions";
import { ResultBars } from "@/components/result-bars";
import { useLiveEventState } from "@/components/use-live-event-state";
import type { ControlCommand, EventState } from "@/lib/types";

type HostConsoleProps = {
  code: string;
  initialState: EventState;
};

export function HostConsole({ code, initialState }: HostConsoleProps) {
  const { state, refreshSoon, isPending, lastSyncedAt } = useLiveEventState(
    code,
    initialState,
  );
  const [command, setCommand] = useState<ControlCommand | null>(null);

  const activity = state.activity;

  function runCommand(nextCommand: ControlCommand) {
    if (!activity) return;
    setCommand(nextCommand);

    startTransition(async () => {
      await controlActivity(code, activity.id, nextCommand);
      refreshSoon();
      setCommand(null);
    });
  }

  return (
    <div className="min-h-screen bg-[#f6f1e7] text-slate-950">
      <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-5 py-5 lg:grid-cols-[360px_1fr]">
        <aside className="border border-slate-950 bg-[#fdfaf1] p-5 shadow-[8px_8px_0_#111827]">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
            Host control
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight">
            {state.event.title}
          </h1>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="border border-slate-950 bg-white p-3">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
                code
              </p>
              <p className="mt-1 font-mono text-3xl font-black">
                {state.event.code}
              </p>
            </div>
            <div className="border border-slate-950 bg-white p-3">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
                votes
              </p>
              <p className="mt-1 font-mono text-3xl font-black">
                {state.totalVotes}
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-2 text-sm">
            <a
              href={`/present/${state.event.code}`}
              target="_blank"
              className="flex items-center justify-between border border-slate-950 bg-slate-950 px-3 py-3 font-bold text-white"
            >
              <span>Open presenter</span>
              <Monitor size={18} />
            </a>
            <a
              href={`/join/${state.event.code}`}
              target="_blank"
              className="flex items-center justify-between border border-slate-950 bg-white px-3 py-3 font-bold"
            >
              <span>Open audience join</span>
              <QrCode size={18} />
            </a>
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-600">
            Realtime is backed by Supabase. This screen also refreshes with the
            fallback poller so the host can recover after refreshes or missed
            events.
          </p>
        </aside>

        <section className="space-y-6">
          <div className="border border-slate-950 bg-white p-5 shadow-[8px_8px_0_#111827]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
                  Current poll
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  {activity?.prompt ?? "No poll configured"}
                </h2>
              </div>
              <div className="flex gap-2 font-mono text-xs uppercase tracking-[0.16em]">
                <span className="border border-slate-950 px-3 py-2">
                  {activity?.status ?? "missing"}
                </span>
                <span className="border border-slate-950 bg-amber-200 px-3 py-2">
                  {activity?.results_visibility ?? "hidden"}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <ControlButton
                icon={<Play size={18} />}
                label="Open"
                disabled={!activity || isPending}
                active={command === "open"}
                onClick={() => runCommand("open")}
              />
              <ControlButton
                icon={<Square size={18} />}
                label="Close"
                disabled={!activity || isPending}
                active={command === "close"}
                onClick={() => runCommand("close")}
              />
              <ControlButton
                icon={<Eye size={18} />}
                label="Reveal"
                disabled={!activity || isPending}
                active={command === "reveal"}
                onClick={() => runCommand("reveal")}
              />
              <ControlButton
                icon={<EyeOff size={18} />}
                label="Hide"
                disabled={!activity || isPending}
                active={command === "hide"}
                onClick={() => runCommand("hide")}
              />
              <ControlButton
                icon={<RotateCcw size={18} />}
                label="Reset"
                disabled={!activity || isPending}
                active={command === "reset"}
                onClick={() => runCommand("reset")}
              />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="border border-slate-950 bg-white p-5 shadow-[8px_8px_0_#111827]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="text-xl font-black">Live results</h3>
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
                  {state.totalVotes} responses
                </span>
              </div>
              <ResultBars options={state.options} totalVotes={state.totalVotes} />
            </div>
            <div className="border border-slate-950 bg-[#202c3a] p-5 text-white shadow-[8px_8px_0_#111827]">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/55">
                sync
              </p>
              <p className="mt-4 text-5xl font-black">
                {state.participantCount}
              </p>
              <p className="mt-1 text-sm text-white/70">
                joined participant{state.participantCount === 1 ? "" : "s"}
              </p>
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-white/55">
                Last sync
              </p>
              <p className="mt-2 text-sm">
                {lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : "waiting"}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ControlButton({
  icon,
  label,
  disabled,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  disabled: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex min-h-12 items-center justify-center gap-2 border border-slate-950 bg-[#fdfaf1] px-4 py-3 font-bold transition hover:-translate-y-0.5 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {icon}
      <span>{active ? "Working" : label}</span>
    </button>
  );
}
