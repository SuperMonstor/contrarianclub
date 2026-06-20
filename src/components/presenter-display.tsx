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
        <div className="club-art-stage flex flex-col justify-between gap-10 p-6 sm:p-10 lg:p-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/art/caravaggio-musicians.jpg"
            alt=""
            aria-hidden="true"
            className="club-art"
          />
          <div aria-hidden="true" className="club-art-scrim" />

          <header className="relative z-10 flex items-start justify-between gap-4 sm:gap-8">
            <div>
              <Logo className="w-44 sm:w-56 lg:w-72" />
              <h1 className="club-display mt-4 max-w-5xl text-4xl leading-[0.98] sm:mt-6 sm:text-6xl sm:leading-[0.95] lg:text-7xl">
                {state.event.title}
              </h1>
            </div>
            <div className="club-tile club-mono shrink-0 px-3 py-2 text-lg font-bold text-[color:var(--cc-gold-bright)] sm:px-5 sm:py-3 sm:text-xl">
              {state.event.code}
            </div>
          </header>

          <div className="relative z-10 py-4 sm:py-10">
            {!activity || state.mode === "join" ? (
              <div>
                <p className="club-eyebrow text-sm tracking-[0.28em] text-[color:var(--cc-gold)] sm:text-lg">
                  Join the room
                </p>
                <h2 className="club-display mt-3 max-w-4xl text-5xl leading-none sm:mt-5 sm:text-7xl lg:text-8xl">
                  Scan to vote
                </h2>
              </div>
            ) : showResults ? (
              <div>
                <p className="club-eyebrow text-sm tracking-[0.28em] text-[color:var(--cc-gold)] sm:text-lg">
                  Results
                </p>
                <h2 className="club-display mt-3 max-w-5xl text-3xl leading-tight sm:mt-5 sm:text-5xl lg:text-6xl">
                  {activity.prompt}
                </h2>
                <div className="mt-6 max-w-4xl sm:mt-10">
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
              </div>
            ) : (
              <div>
                <p className="club-eyebrow text-sm tracking-[0.28em] text-[color:var(--cc-gold)] sm:text-lg">
                  {activity.status === "open" ? "Voting open" : "Voting closed"}
                </p>
                <h2 className="club-display mt-3 max-w-5xl text-4xl leading-tight sm:mt-5 sm:text-6xl lg:text-7xl">
                  {activity.prompt}
                </h2>
                {isScale ? (
                  <div className="mt-6 max-w-5xl sm:mt-10">
                    <ScaleChoiceScale options={state.options} disabled large />
                  </div>
                ) : (
                  <div className="mt-6 grid max-w-4xl gap-3 sm:mt-10 sm:gap-4">
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
              </div>
            )}
          </div>

          <footer className="club-mono relative z-10 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[color:var(--cc-muted)] sm:text-sm">
            <span>{state.participantCount} tracked</span>
            <span>{state.totalVotes} responses</span>
          </footer>
        </div>

        <aside className="club-panel flex flex-col justify-between gap-8 border-x-0 border-b-0 p-6 sm:p-8 lg:border-y-0 lg:border-l lg:border-r-0">
          <div>
            <p className="club-kicker">Audience link</p>
            <div className="mt-5 w-full max-w-[300px] rounded-[3px] bg-[color:var(--cc-ivory)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <QRCodeCanvas
                value={joinUrl}
                size={290}
                marginSize={1}
                bgColor="#f4ead2"
                fgColor="#0b0907"
                className="h-auto w-full"
              />
            </div>
            <p className="club-mono mt-5 break-all text-sm text-[color:var(--cc-muted)]">
              {joinUrl}
            </p>
          </div>
          <div>
            <p className="club-kicker">Enter code</p>
            <p className="club-mono mt-2 text-5xl font-bold text-[color:var(--cc-gold-bright)] sm:text-6xl">
              {state.event.code}
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
