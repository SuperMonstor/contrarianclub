"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Logo } from "@/components/logo";
import { ResultBars } from "@/components/result-bars";
import { ScaleChoiceScale } from "@/components/scale-choice-scale";
import { ScaleResults } from "@/components/scale-results";
import { useLiveEventState } from "@/components/use-live-event-state";
import type { EventState } from "@/lib/types";

type PresenterDisplayProps = {
  code: string;
  initialState: EventState;
};

export function PresenterDisplay({ code, initialState }: PresenterDisplayProps) {
  const { state } = useLiveEventState(code, initialState);
  const [joinUrl, setJoinUrl] = useState(initialState.joinUrl);
  const activity = state.activity;
  const showResults =
    activity?.results_visibility === "revealed" || state.mode === "results";
  const isScale = activity?.type === "scale";
  const isJoinMode = !activity || state.mode === "join";
  const isLive = isJoinMode || showResults || activity?.status === "open";
  const statusLabel = isJoinMode
    ? "Open to join"
    : showResults
      ? "Results live"
      : activity?.status === "open"
        ? "Voting open"
        : "Voting closed";

  useEffect(() => {
    window.queueMicrotask(() => {
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "::1";

      setJoinUrl(
        isLocalhost
          ? initialState.joinUrl
          : `${window.location.origin}/join/${code}`,
      );
    });
  }, [code, initialState.joinUrl]);

  return (
    <main className="club-shell flex min-h-screen">
      <section className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1fr_380px]">
        <div className="club-art-stage flex flex-col p-8 sm:p-12 lg:p-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/art/caravaggio-musicians.jpg"
            alt=""
            aria-hidden="true"
            className="club-art"
          />
          <div aria-hidden="true" className="club-art-scrim" />

          <header className="relative z-10 flex items-center justify-between gap-6">
            <Logo className="w-44 sm:w-52 lg:w-60" />
            <div className="club-tile club-mono shrink-0 px-3 py-2 text-base font-bold text-[color:var(--cc-gold-bright)] sm:px-5 sm:py-3 sm:text-xl">
              {state.event.code}
            </div>
          </header>

          <div className="relative z-10 flex flex-1 flex-col justify-center gap-8 py-8 sm:gap-12 sm:py-12">
            <div className="max-w-5xl">
              <span
                className={`club-chip ${isLive ? "club-chip-live club-chip-dot" : ""}`}
              >
                {statusLabel}
              </span>
              <h1 className="club-display mt-5 text-3xl leading-[1.04] sm:text-5xl sm:leading-[1.02] lg:text-6xl">
                {state.event.title}
              </h1>
            </div>

            <div className="max-w-5xl">
              {isJoinMode ? (
                <p className="club-display text-3xl leading-tight text-[color:var(--cc-gold-bright)] sm:text-4xl lg:text-5xl">
                  Scan the code to cast your vote.
                </p>
              ) : showResults ? (
                <>
                  <p className="text-lg leading-snug text-[color:var(--cc-parchment)] sm:text-2xl lg:text-3xl">
                    {activity.prompt}
                  </p>
                  <div className="mt-6 max-w-4xl sm:mt-8">
                    {isScale ? (
                      <ScaleResults
                        options={state.options}
                        totalVotes={state.totalVotes}
                        large
                      />
                    ) : (
                      <ResultBars
                        options={state.options}
                        totalVotes={state.totalVotes}
                        large
                      />
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-lg leading-snug text-[color:var(--cc-parchment)] sm:text-2xl lg:text-3xl">
                    {activity.prompt}
                  </p>
                  {isScale ? (
                    <div className="mt-6 sm:mt-8">
                      <ScaleChoiceScale options={state.options} disabled large />
                    </div>
                  ) : (
                    <div className="mt-6 grid max-w-4xl gap-3 sm:mt-8 sm:gap-4">
                      {state.options.map((option) => (
                        <div
                          key={option.id}
                          className="club-tile px-4 py-4 text-xl font-semibold text-[color:var(--cc-ivory)] sm:px-6 sm:py-5 sm:text-2xl lg:text-3xl"
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <footer className="club-mono relative z-10 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[color:var(--cc-muted)] sm:text-sm">
            <span>{state.participantCount} tracked</span>
            <span>{state.totalVotes} responses</span>
          </footer>
        </div>

        <aside className="club-panel flex flex-col border-x-0 border-b-0 p-8 sm:p-10 lg:border-y-0 lg:border-l lg:border-r-0">
          <p className="club-kicker">Audience link</p>
          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center">
            <p className="club-eyebrow text-[color:var(--cc-gold)]">Scan to join</p>
            <div className="w-full max-w-[300px] rounded-[3px] bg-[color:var(--cc-ivory)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <QRCodeCanvas
                value={joinUrl}
                size={290}
                marginSize={1}
                bgColor="#f4ead2"
                fgColor="#0b0907"
                className="h-auto w-full"
              />
            </div>
            <p className="club-mono max-w-[300px] break-words text-xs text-[color:var(--cc-muted)]">
              {joinUrl}
            </p>
          </div>
          <div>
            <div className="club-rule mb-5" />
            <p className="club-label text-[0.65rem]">Enter code</p>
            <p className="club-mono mt-2 text-5xl font-bold text-[color:var(--cc-gold-bright)] lg:text-6xl">
              {state.event.code}
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
