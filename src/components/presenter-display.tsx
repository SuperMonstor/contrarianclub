"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Logo } from "@/components/logo";
import { ResultBars } from "@/components/result-bars";
import { ScaleResults, formatSignedValue } from "@/components/scale-results";
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
  const scaleOptions = [...state.options].sort(
    (first, second) =>
      (first.scale_value ?? first.sort_order) -
      (second.scale_value ?? second.sort_order),
  );

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
      <section className="grid min-h-screen w-full grid-cols-[1fr_380px]">
        <div className="club-art-stage flex flex-col justify-between p-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/art/caravaggio-musicians.jpg"
            alt=""
            aria-hidden="true"
            className="club-art"
          />
          <div aria-hidden="true" className="club-art-scrim" />

          <header className="relative z-10 flex items-start justify-between gap-8">
            <div>
              <Logo className="w-72" />
              <h1 className="club-display mt-6 max-w-5xl text-7xl leading-[0.95]">
                {state.event.title}
              </h1>
            </div>
            <div className="club-tile club-mono px-5 py-3 text-xl font-bold text-[color:var(--cc-gold-bright)]">
              {state.event.code}
            </div>
          </header>

          <div className="relative z-10 py-10">
            {!activity || state.mode === "join" ? (
              <div>
                <p className="club-eyebrow text-lg tracking-[0.28em] text-[color:var(--cc-gold)]">
                  Join the room
                </p>
                <h2 className="club-display mt-5 max-w-4xl text-8xl leading-none">
                  Scan to vote
                </h2>
              </div>
            ) : showResults ? (
              <div>
                <p className="club-eyebrow text-lg tracking-[0.28em] text-[color:var(--cc-gold)]">
                  Results
                </p>
                <h2 className="club-display mt-5 max-w-5xl text-6xl leading-tight">
                  {activity.prompt}
                </h2>
                <div className="mt-10 max-w-4xl">
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
                <p className="club-eyebrow text-lg tracking-[0.28em] text-[color:var(--cc-gold)]">
                  {activity.status === "open" ? "Voting open" : "Voting closed"}
                </p>
                <h2 className="club-display mt-5 max-w-5xl text-7xl leading-tight">
                  {activity.prompt}
                </h2>
                {isScale ? (
                  <div className="mt-10 grid max-w-5xl grid-cols-7 gap-2">
                    {scaleOptions.map((option) => (
                      <div
                        key={option.id}
                        className="club-tile flex min-h-36 flex-col items-center justify-between px-3 py-5 text-center text-[color:var(--cc-ivory)]"
                      >
                        <span className="club-mono text-2xl font-bold text-[color:var(--cc-gold-bright)]">
                          {formatSignedValue(option.scale_value ?? 0)}
                        </span>
                        <span className="text-sm font-semibold leading-5">
                          {option.label}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-10 grid max-w-4xl gap-4">
                    {state.options.map((option) => (
                      <div
                        key={option.id}
                        className="club-tile px-6 py-5 text-3xl font-semibold text-[color:var(--cc-ivory)]"
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <footer className="club-mono relative z-10 flex items-center justify-between text-sm uppercase tracking-[0.2em] text-[color:var(--cc-muted)]">
            <span>{state.participantCount} tracked</span>
            <span>{state.totalVotes} responses</span>
          </footer>
        </div>

        <aside className="club-panel flex flex-col justify-between border-y-0 border-r-0 p-8">
          <div>
            <p className="club-kicker">Audience link</p>
            <div className="mt-5 rounded-[3px] bg-[color:var(--cc-ivory)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <QRCodeCanvas
                value={joinUrl}
                size={290}
                marginSize={1}
                bgColor="#f4ead2"
                fgColor="#0b0907"
              />
            </div>
            <p className="club-mono mt-5 break-all text-sm text-[color:var(--cc-muted)]">
              {joinUrl}
            </p>
          </div>
          <div>
            <p className="club-kicker">Enter code</p>
            <p className="club-mono mt-2 text-6xl font-bold text-[color:var(--cc-gold-bright)]">
              {state.event.code}
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
