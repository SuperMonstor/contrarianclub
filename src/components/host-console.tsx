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
    <div className="salon-stage min-h-screen text-[#08080d]">
      <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-5 px-5 py-5 lg:grid-cols-[340px_1fr]">
        <aside className="salon-panel-dark p-6 text-[#fff8e8]">
          <p className="brand-kicker text-[#c8a24a]">
            Host control
          </p>
          <h1 className="brand-display mt-4 text-4xl leading-tight text-[#fff8e8]">
            {state.event.title}
          </h1>
          <div className="salon-hairline my-6" />
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#fff8e8]/8 p-4 ring-1 ring-[#f0d36a]/15">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#d8cfbd]/70">
                code
              </p>
              <p className="mt-2 font-mono text-3xl font-black text-[#fff8e8]">
                {state.event.code}
              </p>
            </div>
            <div className="bg-[#fff8e8]/8 p-4 ring-1 ring-[#f0d36a]/15">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#d8cfbd]/70">
                status
              </p>
              <p className="mt-2 font-mono text-3xl font-black text-[#fff8e8]">
                {state.event.status}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => changeEventStatus("draft")}
              disabled={statusCommand !== null}
              className="salon-button px-2 py-2 text-xs uppercase tracking-[0.12em]"
            >
              <Flag size={14} />
              Draft
            </button>
            <button
              type="button"
              onClick={() => changeEventStatus("live")}
              disabled={statusCommand !== null}
              className="salon-button salon-button-gold px-2 py-2 text-xs uppercase tracking-[0.12em]"
            >
              <Flag size={14} />
              Live
            </button>
            <button
              type="button"
              onClick={() => changeEventStatus("ended")}
              disabled={statusCommand !== null}
              className="salon-button px-2 py-2 text-xs uppercase tracking-[0.12em]"
            >
              <Flag size={14} />
              End
            </button>
          </div>
          <div className="mt-6 space-y-2 text-sm">
            <a
              href={`/present/${state.event.code}`}
              target="_blank"
              className="salon-button salon-button-primary w-full justify-between px-4 py-3"
            >
              <span>Open presenter</span>
              <Monitor size={18} />
            </a>
            <a
              href={`/join/${state.event.code}`}
              target="_blank"
              className="salon-button w-full justify-between px-4 py-3"
            >
              <span>Open audience join</span>
              <QrCode size={18} />
            </a>
          </div>
          <p className="mt-6 text-xs leading-5 text-[#d8cfbd]/70">
            Realtime is backed by Supabase. This screen also refreshes with the
            fallback poller so the host can recover after refreshes or missed
            events.
          </p>
        </aside>

        <section className="space-y-6">
          <div className="salon-panel p-6">
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
                <p className="brand-kicker text-[#7a6a42]">
                  Current poll
                </p>
                <h2 className="brand-display mt-3 max-w-4xl text-4xl leading-tight">
                  {activity?.prompt ?? "No poll configured"}
                </h2>
              </div>
              <div className="flex gap-2">
                <span className="salon-chip">
                  {activity?.status ?? "missing"}
                </span>
                <span className="salon-chip bg-[#f0d36a]/70 text-[#08080d]">
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
                label="Reset"
                disabled={!activity || isPending}
                active={command === "reset"}
                onClick={() => runCommand("reset")}
              />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="salon-panel p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="brand-display text-2xl">Live results</h3>
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#7a6a42]">
                  {state.totalVotes} responses
                </span>
              </div>
              <ResultBars options={state.options} totalVotes={state.totalVotes} />
            </div>
            <div className="salon-panel-dark p-6 text-[#fff8e8]">
              <p className="brand-kicker text-[#d8cfbd]/65">
                sync
              </p>
              <p className="brand-display mt-4 text-6xl">
                {state.participantCount}
              </p>
              <p className="mt-1 text-sm text-[#d8cfbd]">
                joined participant{state.participantCount === 1 ? "" : "s"}
              </p>
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-[#d8cfbd]/65">
                Last sync
              </p>
              <p className="mt-2 text-sm">
                {lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : "waiting"}
              </p>
            </div>
          </div>

          {state.swing && (
            <div className="salon-panel p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="brand-kicker text-[#7a6a42]">
                    Debate swing
                  </p>
                  <h3 className="brand-display mt-2 text-4xl">
                    {state.swing.changedPercent}% changed their vote
                  </h3>
                  <p className="mt-2 text-sm text-[#4d5561]">
                    {state.swing.changedVotes} of {state.swing.matchedVotes} matched
                    voters moved between the pre and post vote.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div className="bg-[#eadbc0]/50 p-5 ring-1 ring-[#7a6a42]/18">
                  <h4 className="brand-display mb-4 text-2xl">Net movement</h4>
                  <div className="space-y-3">
                    {state.swing.optionTotals.map((option) => (
                      <div
                        key={option.label}
                        className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#cbbd9b] pb-2 last:border-b-0 last:pb-0"
                      >
                        <span className="font-bold">{option.label}</span>
                        <span className="font-mono font-black">
                          {option.delta > 0 ? "+" : ""}
                          {option.delta}
                        </span>
                        <span className="text-sm text-[#4d5561]">
                          before {option.preVotes}
                        </span>
                        <span className="text-sm text-[#4d5561]">
                          after {option.postVotes}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1e2a35] p-5 text-[#fff8e8] ring-1 ring-[#f0d36a]/15">
                  <h4 className="brand-display mb-4 text-2xl">Changed paths</h4>
                  <div className="space-y-2">
                    {state.swing.transitions.length === 0 ? (
                      <p className="text-sm text-[#d8cfbd]">
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
      className={`p-5 text-left transition hover:-translate-y-0.5 disabled:cursor-default ${
        active
          ? "salon-panel-gold"
          : "bg-[#efe4cf]/70 ring-1 ring-[#7a6a42]/18 hover:bg-[#fff9ed]/80"
      }`}
    >
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#7a6a42]">
        {phaseLabel(activity.phase)}
      </p>
      <h3 className="brand-display mt-2 line-clamp-2 text-xl leading-tight">
        {activity.prompt}
      </h3>
      <div className="mt-4 flex gap-2 font-mono text-xs uppercase tracking-[0.14em]">
        <span className="salon-chip">
          {activity.status}
        </span>
        <span className="salon-chip">
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
      className="salon-button min-h-12 px-4 py-3"
    >
      {icon}
      <span>{active ? "Working" : label}</span>
    </button>
  );
}
