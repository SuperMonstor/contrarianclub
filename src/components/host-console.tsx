"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { startTransition, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Gavel,
  Mic,
  Monitor,
  Pencil,
  PencilLine,
  Play,
  QrCode,
  RotateCcw,
  Square,
} from "lucide-react";
import {
  controlActivity,
  setActiveActivity,
  setPresenterMode,
  updateEventStatus,
} from "@/app/actions";
import { Logo } from "@/components/logo";
import { ResultBars } from "@/components/result-bars";
import {
  getScaleOptions,
  getScaleSideLabel,
} from "@/components/scale-choice-scale";
import { ScaleResults, formatSignedValue } from "@/components/scale-results";
import { useLiveEventState } from "@/components/use-live-event-state";
import type {
  ActivitySummary,
  ControlCommand,
  DebateSwingSummary,
  EventState,
  PollOptionResult,
} from "@/lib/types";

type HostConsoleProps = {
  code: string;
  editHref: string;
  initialState: EventState;
};

const PHASE_ORDER = {
  pre_debate: 0,
  post_debate: 1,
  general: 2,
} as const;

export function HostConsole({ code, editHref, initialState }: HostConsoleProps) {
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

  function showPresenterMode(nextMode: "swing" | "results") {
    if (!activity) return;

    startTransition(async () => {
      await setPresenterMode(code, activity.id, nextMode);
      refreshSoon();
    });
  }

  const isOpen = activity?.status === "open";
  const isRevealed = activity?.results_visibility === "revealed";
  const isScale = activity?.type === "scale";
  const isPostDebate = activity?.phase === "post_debate";
  const swingReady = (state.swing?.matchedVotes ?? 0) > 0;
  const canShowSwing = isPostDebate && isRevealed && swingReady;
  const swingActive = state.mode === "swing";

  return (
    <div className="club-shell min-h-screen">
      <main className="club-rise mx-auto grid min-h-screen w-full max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[360px_1fr]">
        <aside className="club-panel flex flex-col p-6">
          <Logo className="w-44" />
          <div className="mt-5 flex items-center gap-3">
            <p className="club-kicker">Host Control</p>
            <span className="club-rule flex-1" />
          </div>
          <h1 className="club-display club-d-title mt-4">
            {state.event.title}
          </h1>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="club-tile p-4">
              <p className="club-label text-[0.65rem]">code</p>
              <p className="club-mono mt-2 text-3xl font-bold text-[color:var(--cc-gold-bright)]">
                {state.event.code}
              </p>
            </div>
            <div className="club-tile p-4">
              <p className="club-label text-[0.65rem]">status</p>
              <p className="mt-2 font-[family-name:var(--cc-font-display)] text-3xl font-bold capitalize text-[color:var(--cc-ivory)]">
                {state.event.status}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <StatusButton
              label="Draft"
              icon={<PencilLine size={14} />}
              current={state.event.status === "draft"}
              disabled={statusCommand !== null}
              onClick={() => changeEventStatus("draft")}
            />
            <StatusButton
              label="Live"
              icon={<Mic size={14} />}
              gold
              current={state.event.status === "live"}
              disabled={statusCommand !== null}
              onClick={() => changeEventStatus("live")}
            />
            <StatusButton
              label="End"
              icon={<Gavel size={14} />}
              current={state.event.status === "ended"}
              disabled={statusCommand !== null}
              onClick={() => changeEventStatus("ended")}
            />
          </div>

          <div className="mt-6 space-y-2">
            <Link
              href={editHref}
              className="club-btn w-full justify-between px-4 py-3"
            >
              <span>Edit event</span>
              <Pencil size={18} />
            </Link>
            <a
              href={`/present/${state.event.code}`}
              target="_blank"
              className="club-btn club-btn-primary w-full justify-between px-4 py-3"
            >
              <span>Open presenter</span>
              <Monitor size={18} />
            </a>
            <a
              href={`/join/${state.event.code}`}
              target="_blank"
              className="club-btn w-full justify-between px-4 py-3"
            >
              <span>Open audience join</span>
              <QrCode size={18} />
            </a>
          </div>

          <p className="mt-6 text-xs leading-5 text-[color:var(--cc-faint)] lg:mt-auto lg:pt-8">
            Realtime is backed by Supabase. This screen also refreshes with the
            fallback poller so the host can recover after refreshes or missed
            events.
          </p>
        </aside>

        <section className="space-y-5">
          <div className="club-panel p-6">
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

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="club-kicker">Current poll</p>
                <h2 className="club-display club-d-title mt-3 max-w-3xl">
                  {activity?.prompt ?? "No poll configured"}
                </h2>
              </div>
              <div className="flex gap-2">
                <span className={`club-chip ${isOpen ? "club-chip-live club-chip-dot" : ""}`}>
                  {activity?.status ?? "missing"}
                </span>
                <span className={`club-chip ${isRevealed ? "club-chip-live" : ""}`}>
                  {activity?.results_visibility ?? "hidden"}
                </span>
              </div>
            </div>

            {isScale && (
              <ScaleMeaningKey activity={activity} options={state.options} />
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <ControlButton
                icon={isOpen ? <Square size={18} /> : <Play size={18} />}
                label={submissionCommand === "open" ? "Open voting" : "Close voting"}
                disabled={!activity || isPending}
                active={command === submissionCommand}
                primary={submissionCommand === "open"}
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

            {canShowSwing && (
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[color:var(--cc-line)] pt-4">
                <p className="club-eyebrow flex-1">
                  Post-debate reveal &middot; show the room the swing
                </p>
                {swingActive ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => showPresenterMode("results")}
                    className="club-btn px-4 py-2.5"
                  >
                    <ChevronLeft size={16} />
                    Back to results
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => showPresenterMode("swing")}
                    className="club-btn club-btn-primary px-4 py-2.5"
                  >
                    Next: the swing
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
            <div className="club-panel p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="club-display club-d-card">Live results</h3>
                <span className="club-mono text-xs uppercase tracking-[0.16em] text-[color:var(--cc-muted)]">
                  {state.totalVotes} responses
                </span>
              </div>
              {isScale ? (
                <ScaleResults
                  leftLabel={activity?.scale_left_label}
                  options={state.options}
                  rightLabel={activity?.scale_right_label}
                  totalVotes={state.totalVotes}
                />
              ) : (
                <ResultBars options={state.options} totalVotes={state.totalVotes} />
              )}
            </div>
            <div className="club-panel-gold self-start p-6">
              <p className="club-eyebrow">Sync</p>
              <p className="club-display mt-3 text-6xl text-[color:var(--cc-gold-bright)]">
                {state.participantCount}
              </p>
              <p className="mt-1 text-sm text-[color:var(--cc-parchment)]">
                tracked voter{state.participantCount === 1 ? "" : "s"}
              </p>
              <div className="club-rule my-5" />
              <p className="club-label text-[0.65rem]">Last sync</p>
              <p className="club-mono mt-2 text-sm text-[color:var(--cc-ivory)]">
                {lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : "waiting"}
              </p>
            </div>
          </div>

          {state.swing && (
            <div className="club-panel p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="club-kicker">Debate swing</p>
                  <h3 className="club-display club-d-title mt-2">
                    {state.swing.matchedVotes === 0
                      ? "No matched votes yet"
                      : state.swing.format === "scale"
                        ? state.swing.swingWinnerLabel
                          ? `${state.swing.swingWinnerLabel} won the swing`
                          : "No clear swing winner"
                        : `${state.swing.changedPercent}% changed their vote`}
                  </h3>
                  <p className="mt-2 text-sm text-[color:var(--cc-muted)]">
                    {state.swing.matchedVotes === 0
                      ? "Debate swing appears once the same voters have both pre and post votes."
                      : state.swing.format === "scale"
                        ? `${formatNetSwing(state.swing)} across ${state.swing.matchedVotes} matched voters. ${state.swing.crossedVotes} crossed sides.`
                        : `${state.swing.changedVotes} of ${state.swing.matchedVotes} matched voters moved between the pre and post vote.`}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div className="club-panel-quiet p-5">
                  {state.swing.format === "scale" ? (
                    <>
                      <h4 className="club-display club-d-card mb-4">Scale movement</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <ScaleMetric
                          label="Before"
                          value={state.swing.averagePre}
                        />
                        <ScaleMetric
                          label="After"
                          value={state.swing.averagePost}
                        />
                        <ScaleMetric label="Net" value={state.swing.netSwing} />
                        <div className="club-tile p-4">
                          <p className="club-label text-[0.65rem]">Crossed sides</p>
                          <p className="club-display mt-2 text-3xl text-[color:var(--cc-gold-bright)]">
                            {state.swing.crossedPercent}%
                          </p>
                          <p className="mt-1 text-xs text-[color:var(--cc-muted)]">
                            {state.swing.crossedVotes} voters
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className="club-display club-d-card mb-4">Net movement</h4>
                      <div className="space-y-3">
                        {state.swing.optionTotals.map((option) => (
                          <div
                            key={option.label}
                            className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 border-b border-[color:var(--cc-line)] pb-2.5 last:border-b-0 last:pb-0"
                          >
                            <span className="font-semibold text-[color:var(--cc-ivory)]">
                              {option.label}
                            </span>
                            <span
                              className={`club-mono font-bold ${
                                option.delta > 0
                                  ? "text-[color:var(--cc-gold-bright)]"
                                  : option.delta < 0
                                    ? "text-[color:var(--cc-wine-bright)]"
                                    : "text-[color:var(--cc-muted)]"
                              }`}
                            >
                              {option.delta > 0 ? "+" : ""}
                              {option.delta}
                            </span>
                            <span className="text-sm text-[color:var(--cc-faint)]">
                              before {option.preVotes}
                            </span>
                            <span className="text-right text-sm text-[color:var(--cc-faint)]">
                              after {option.postVotes}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="club-panel-quiet p-5">
                  {state.swing.format === "scale" ? (
                    <ScaleOutcomePanel swing={state.swing} />
                  ) : (
                    <>
                      <h4 className="club-display club-d-card mb-4">Changed paths</h4>
                      <div className="space-y-2">
                        {state.swing.transitions.length === 0 ? (
                          <p className="text-sm text-[color:var(--cc-muted)]">
                            No matched before/after votes yet.
                          </p>
                        ) : (
                          state.swing.transitions.map((transition) => (
                            <div
                              key={`${transition.from}-${transition.to}`}
                              className="grid grid-cols-[1fr_auto] gap-3 border-b border-[color:var(--cc-line)] pb-2 text-sm last:border-b-0 last:pb-0"
                            >
                              <span className="text-[color:var(--cc-parchment)]">
                                {transition.from} <span className="text-[color:var(--cc-gold)]">&rarr;</span> {transition.to}
                              </span>
                              <span className="club-mono font-bold text-[color:var(--cc-gold-bright)]">
                                {transition.count}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatusButton({
  label,
  icon,
  current,
  gold,
  disabled,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  current: boolean;
  gold?: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={current}
      className={`club-btn px-2 py-2 text-xs uppercase tracking-[0.12em] ${
        current ? (gold ? "club-btn-primary" : "border-[color:var(--cc-line-strong)] bg-[color:var(--cc-gold)]/12 text-[color:var(--cc-gold-bright)]") : ""
      }`}
    >
      {icon}
      {label}
    </button>
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
          ? "club-panel-gold"
          : "club-tile hover:border-[color:var(--cc-line-strong)]"
      }`}
    >
      <p className="club-eyebrow text-[color:var(--cc-gold)]">
        {phaseLabel(activity.phase)}
      </p>
      <h3 className="club-display club-d-item mt-2 line-clamp-2">
        {activity.prompt}
      </h3>
      <div className="mt-4 flex gap-2">
        <span className="club-chip">{activity.status}</span>
        <span className="club-chip">{activity.type === "scale" ? "scale" : "choice"}</span>
        <span className="club-chip">
          {active ? "active" : working ? "working" : "select"}
        </span>
      </div>
    </button>
  );
}

function ScaleMeaningKey({
  activity,
  options,
}: {
  activity: ActivitySummary | null;
  options: PollOptionResult[];
}) {
  const scaleOptions = getScaleOptions(options);
  const againstLabel =
    activity?.scale_left_label ?? getScaleSideLabel(scaleOptions, -2, "Opposition");
  const neutralLabel =
    activity?.scale_center_label ??
    getScaleSideLabel(scaleOptions, 0, "Too close to call");
  const forLabel =
    activity?.scale_right_label ?? getScaleSideLabel(scaleOptions, 2, "Proposition");

  return (
    <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_1fr]">
      <ScaleMeaningTile
        eyebrow="Left side"
        range="-3 to -1"
        label={againstLabel}
      />
      <ScaleMeaningTile eyebrow="Neutral" range="0" label={neutralLabel} center />
      <ScaleMeaningTile eyebrow="Right side" range="+1 to +3" label={forLabel} alignRight />
    </div>
  );
}

function ScaleMeaningTile({
  eyebrow,
  range,
  label,
  alignRight = false,
  center = false,
}: {
  eyebrow: string;
  range: string;
  label: string;
  alignRight?: boolean;
  center?: boolean;
}) {
  return (
    <div
      className={`club-tile p-4 ${
        alignRight ? "text-right" : center ? "text-center" : "text-left"
      }`}
    >
      <div
        className={`flex flex-wrap items-center gap-2 ${
          alignRight ? "justify-end" : center ? "justify-center" : ""
        }`}
      >
        <p className="club-label text-[0.62rem]">{eyebrow}</p>
        <span className="club-mono text-xs font-bold text-[color:var(--cc-gold-bright)]">
          {range}
        </span>
      </div>
      <p className="club-display club-d-card mt-2 text-[color:var(--cc-ivory)]">
        {label}
      </p>
    </div>
  );
}

function ScaleMetric({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="club-tile p-4">
      <p className="club-label text-[0.65rem]">{label}</p>
      <p className="club-display mt-2 text-3xl text-[color:var(--cc-gold-bright)]">
        {value === null ? "n/a" : formatSignedValue(value)}
      </p>
    </div>
  );
}

function ScaleOutcomePanel({ swing }: { swing: DebateSwingSummary }) {
  const leftLabel = swing.scaleLeftLabel ?? "Opposition";
  const rightLabel = swing.scaleRightLabel ?? "Proposition";

  return (
    <>
      <h4 className="club-display club-d-card mb-4">Debate outcome</h4>
      <div className="grid gap-3">
        <div className="club-tile p-4">
          <p className="club-label text-[0.65rem]">Swing winner</p>
          <p className="club-display mt-2 text-3xl text-[color:var(--cc-gold-bright)]">
            {swing.swingWinnerLabel ?? "No clear winner"}
          </p>
          <p className="mt-1 text-xs text-[color:var(--cc-muted)]">
            {formatNetSwing(swing)}
          </p>
        </div>
        <div className="club-tile p-4">
          <p className="club-label text-[0.65rem]">Final room lean</p>
          <p className="club-display mt-2 text-3xl text-[color:var(--cc-ivory)]">
            {swing.finalLeaderLabel ?? "Evenly split"}
          </p>
          <p className="mt-1 text-xs text-[color:var(--cc-muted)]">
            Final average {formatNullableSignedValue(swing.averagePost)}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <MovementRow
          label={`Toward ${rightLabel}`}
          count={swing.movedTowardRight}
          total={swing.matchedVotes}
          tone="gold"
        />
        <MovementRow
          label={`Toward ${leftLabel}`}
          count={swing.movedTowardLeft}
          total={swing.matchedVotes}
          tone="wine"
        />
        <MovementRow
          label="No movement"
          count={swing.unchangedVotes}
          total={swing.matchedVotes}
          tone="muted"
        />
      </div>
    </>
  );
}

function MovementRow({
  label,
  count,
  total,
  tone,
}: {
  label: string;
  count: number;
  total: number;
  tone: "gold" | "wine" | "muted";
}) {
  const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
  const fillClass =
    tone === "gold"
      ? "bg-[color:var(--cc-gold-bright)]"
      : tone === "wine"
        ? "bg-[color:var(--cc-wine-bright)]"
        : "bg-[color:var(--cc-muted)]";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-[color:var(--cc-parchment)]">
          {label}
        </span>
        <span className="club-mono text-[color:var(--cc-gold-bright)]">
          {count} / {total}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-sm border border-[color:var(--cc-line)] bg-[color:var(--cc-ivory)]/[0.06]">
        <div
          className={`h-full rounded-[3px] transition-all duration-700 ${fillClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function formatNetSwing(swing: DebateSwingSummary) {
  if (swing.netSwing === null) return "No matched scale votes yet.";
  if (swing.netSwing === 0) return "No net movement between before and after.";

  const direction =
    swing.netSwing > 0
      ? (swing.scaleRightLabel ?? "Proposition")
      : (swing.scaleLeftLabel ?? "Opposition");

  return `${formatSignedValue(swing.netSwing)} net swing toward ${direction}`;
}

function formatNullableSignedValue(value: number | null) {
  return value === null ? "n/a" : formatSignedValue(value);
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
  primary,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  disabled: boolean;
  active: boolean;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`club-btn min-h-12 px-4 py-3 ${primary ? "club-btn-primary" : ""} ${
        active ? "ring-2 ring-[color:var(--cc-gold-bright)]/40" : ""
      }`}
    >
      {icon}
      <span>{active ? "Working" : label}</span>
    </button>
  );
}
