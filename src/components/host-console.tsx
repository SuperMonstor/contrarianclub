"use client";

import type { ReactNode } from "react";
import { startTransition, useState } from "react";
import {
  Eye,
  EyeOff,
  Flag,
  Monitor,
  Play,
  QrCode,
  RotateCcw,
  Square,
} from "lucide-react";
import {
  controlActivity,
  setActiveActivity,
  updateEventStatus,
} from "@/app/actions";
import { ResultBars } from "@/components/result-bars";
import { useLiveEventState } from "@/components/use-live-event-state";
import type { ActivitySummary, ControlCommand, EventState } from "@/lib/types";

type HostConsoleProps = {
  code: string;
  initialState: EventState;
};

const PHASE_ORDER = {
  pre_debate: 0,
  post_debate: 1,
  general: 2,
} as const;

export function HostConsole({ code, initialState }: HostConsoleProps) {
  const { state, refreshSoon, isPending, lastSyncedAt } = useLiveEventState(
    code,
    initialState,
  );
  const [command, setCommand] = useState<ControlCommand | null>(null);
  const [statusCommand, setStatusCommand] = useState<string | null>(null);
  const [activeCommand, setActiveCommand] = useState<string | null>(null);

  const activity = state.activity;
  const submissionCommand: ControlCommand =
    activity?.status === "open" ? "close" : "open";
  const visibilityCommand: ControlCommand =
    activity?.results_visibility === "revealed" ? "hide" : "reveal";

  function runCommand(nextCommand: ControlCommand) {
    if (!activity) return;

    if (nextCommand === "reset") {
      const resetScope = getResetScope(state.activities, activity.id);
      if (resetScope.length > 1) {
        const [, ...futureSteps] = resetScope;
        const futureLabels = futureSteps.map((item) => phaseLabel(item.phase)).join(", ");
        const confirmed = window.confirm(
          `Resetting this step will also clear later step data: ${futureLabels}. Debate swing results will be recalculated from the remaining votes. Continue?`,
        );

        if (!confirmed) return;
      }
    }

    setCommand(nextCommand);

    startTransition(async () => {
      await controlActivity(code, activity.id, nextCommand);
      refreshSoon();
      setCommand(null);
    });
  }

  function changeEventStatus(nextStatus: typeof state.event.status) {
    setStatusCommand(nextStatus);

    startTransition(async () => {
      await updateEventStatus(code, nextStatus);
      refreshSoon();
      setStatusCommand(null);
    });
  }

  function makeActive(activityId: string) {
    setActiveCommand(activityId);

    startTransition(async () => {
      await setActiveActivity(code, activityId);
      refreshSoon();
      setActiveCommand(null);
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
                status
              </p>
              <p className="mt-1 font-mono text-3xl font-black">
                {state.event.status}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => changeEventStatus("draft")}
              disabled={statusCommand !== null}
              className="flex items-center justify-center gap-1 border border-slate-950 bg-white px-2 py-2 text-xs font-black uppercase tracking-[0.12em] disabled:opacity-50"
            >
              <Flag size={14} />
              Draft
            </button>
            <button
              type="button"
              onClick={() => changeEventStatus("live")}
              disabled={statusCommand !== null}
              className="flex items-center justify-center gap-1 border border-slate-950 bg-emerald-200 px-2 py-2 text-xs font-black uppercase tracking-[0.12em] disabled:opacity-50"
            >
              <Flag size={14} />
              Live
            </button>
            <button
              type="button"
              onClick={() => changeEventStatus("ended")}
              disabled={statusCommand !== null}
              className="flex items-center justify-center gap-1 border border-slate-950 bg-amber-200 px-2 py-2 text-xs font-black uppercase tracking-[0.12em] disabled:opacity-50"
            >
              <Flag size={14} />
              End
            </button>
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
            <div className="mb-6 grid gap-3 md:grid-cols-2">
              {state.activities.map((item) => (
                <ActivityCard
                  key={item.id}
                  activity={item}
                  active={activity?.id === item.id}
                  working={activeCommand === item.id}
                  onSelect={() => makeActive(item.id)}
                />
              ))}
            </div>

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

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <ControlButton
                icon={
                  submissionCommand === "open" ? (
                    <Play size={18} />
                  ) : (
                    <Square size={18} />
                  )
                }
                label={submissionCommand === "open" ? "Open voting" : "Close voting"}
                disabled={!activity || isPending}
                active={command === submissionCommand}
                onClick={() => runCommand(submissionCommand)}
              />
              <ControlButton
                icon={
                  visibilityCommand === "reveal" ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )
                }
                label={visibilityCommand === "reveal" ? "Reveal results" : "Hide results"}
                disabled={!activity || isPending}
                active={command === visibilityCommand}
                onClick={() => runCommand(visibilityCommand)}
              />
              <ControlButton
                icon={<RotateCcw size={18} />}
                label="Reset step"
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
                tracked voter{state.participantCount === 1 ? "" : "s"}
              </p>
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-white/55">
                Last sync
              </p>
              <p className="mt-2 text-sm">
                {lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : "waiting"}
              </p>
            </div>
          </div>

          {state.swing && (
            <div className="border border-slate-950 bg-white p-5 shadow-[8px_8px_0_#111827]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
                    Debate swing
                  </p>
                  <h3 className="mt-2 text-3xl font-black">
                    {state.swing.matchedVotes === 0
                      ? "No matched votes yet"
                      : `${state.swing.changedPercent}% changed their vote`}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {state.swing.matchedVotes === 0
                      ? "Debate swing appears once the same voters have both pre and post votes."
                      : `${state.swing.changedVotes} of ${state.swing.matchedVotes} matched voters moved between the pre and post vote.`}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div className="border border-slate-950 bg-[#fdfaf1] p-4">
                  <h4 className="mb-4 font-black">Net movement</h4>
                  <div className="space-y-3">
                    {state.swing.optionTotals.map((option) => (
                      <div
                        key={option.label}
                        className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-300 pb-2 last:border-b-0 last:pb-0"
                      >
                        <span className="font-bold">{option.label}</span>
                        <span className="font-mono font-black">
                          {option.delta > 0 ? "+" : ""}
                          {option.delta}
                        </span>
                        <span className="text-sm text-slate-600">
                          before {option.preVotes}
                        </span>
                        <span className="text-sm text-slate-600">
                          after {option.postVotes}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-slate-950 bg-[#202c3a] p-4 text-white">
                  <h4 className="mb-4 font-black">Changed paths</h4>
                  <div className="space-y-2">
                    {state.swing.transitions.length === 0 ? (
                      <p className="text-sm text-white/65">
                        No matched before/after votes yet.
                      </p>
                    ) : (
                      state.swing.transitions.map((transition) => (
                        <div
                          key={`${transition.from}-${transition.to}`}
                          className="grid grid-cols-[1fr_auto] gap-3 border-b border-white/15 pb-2 text-sm last:border-b-0 last:pb-0"
                        >
                          <span>
                            {transition.from} → {transition.to}
                          </span>
                          <span className="font-mono font-black">
                            {transition.count}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ActivityCard({
  activity,
  active,
  working,
  onSelect,
}: {
  activity: ActivitySummary;
  active: boolean;
  working: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={active || working}
      className={`border border-slate-950 p-4 text-left transition hover:-translate-y-0.5 disabled:cursor-default ${
        active ? "bg-amber-200" : "bg-[#fdfaf1]"
      }`}
    >
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
        {phaseLabel(activity.phase)}
      </p>
      <h3 className="mt-2 line-clamp-2 font-black">{activity.prompt}</h3>
      <div className="mt-4 flex gap-2 font-mono text-xs uppercase tracking-[0.14em]">
        <span className="border border-slate-950 bg-white px-2 py-1">
          {activity.status}
        </span>
        <span className="border border-slate-950 bg-white px-2 py-1">
          {active ? "active" : working ? "working" : "select"}
        </span>
      </div>
    </button>
  );
}

function phaseLabel(phase: ActivitySummary["phase"]) {
  if (phase === "pre_debate") return "pre-vote";
  if (phase === "post_debate") return "post-vote";
  return "poll";
}

function getResetScope(activities: ActivitySummary[], activityId: string) {
  const orderedActivities = [...activities].sort(
    (first, second) =>
      PHASE_ORDER[first.phase] - PHASE_ORDER[second.phase] ||
      first.created_at.localeCompare(second.created_at),
  );
  const currentIndex = orderedActivities.findIndex(
    (activity) => activity.id === activityId,
  );
  if (currentIndex === -1) return [];
  return orderedActivities.slice(currentIndex);
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
