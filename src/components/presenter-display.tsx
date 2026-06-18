"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { ResultBars } from "@/components/result-bars";
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

  useEffect(() => {
    window.queueMicrotask(() => {
      setJoinUrl(`${window.location.origin}/join/${code}`);
    });
  }, [code]);

  return (
    <main className="flex min-h-screen bg-[#10151c] text-white">
      <section className="grid min-h-screen w-full grid-cols-[1fr_360px]">
        <div className="flex flex-col justify-between p-12">
          <header className="flex items-start justify-between gap-8">
            <div>
              <p className="font-mono text-sm uppercase tracking-[0.3em] text-amber-200">
                Contrarian Club Live
              </p>
              <h1 className="mt-4 max-w-5xl text-7xl font-black leading-[0.95] tracking-tight">
                {state.event.title}
              </h1>
            </div>
            <div className="border border-white/20 px-4 py-3 font-mono text-xl font-black">
              {state.event.code}
            </div>
          </header>

          <div className="py-10">
            {!activity || state.mode === "join" ? (
              <div>
                <p className="font-mono text-lg uppercase tracking-[0.28em] text-white/45">
                  Join the room
                </p>
                <h2 className="mt-5 max-w-4xl text-8xl font-black leading-none">
                  Scan to vote
                </h2>
              </div>
            ) : showResults ? (
              <div>
                <p className="font-mono text-lg uppercase tracking-[0.28em] text-amber-200">
                  Results
                </p>
                <h2 className="mt-5 max-w-5xl text-6xl font-black leading-tight">
                  {activity.prompt}
                </h2>
                <div className="mt-10 max-w-4xl">
                  <ResultBars
                    options={state.options}
                    totalVotes={state.totalVotes}
                    large
                  />
                </div>
              </div>
            ) : (
              <div>
                <p className="font-mono text-lg uppercase tracking-[0.28em] text-amber-200">
                  {activity.status === "open" ? "Voting open" : "Voting closed"}
                </p>
                <h2 className="mt-5 max-w-5xl text-7xl font-black leading-tight">
                  {activity.prompt}
                </h2>
                <div className="mt-10 grid max-w-4xl gap-4">
                  {state.options.map((option) => (
                    <div
                      key={option.id}
                      className="border border-white/20 bg-white/8 px-6 py-5 text-3xl font-bold"
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <footer className="flex items-center justify-between font-mono text-sm uppercase tracking-[0.2em] text-white/45">
            <span>{state.participantCount} joined</span>
            <span>{state.totalVotes} responses</span>
          </footer>
        </div>

        <aside className="flex flex-col justify-between border-l border-white/15 bg-[#fdfaf1] p-8 text-slate-950">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
              Audience link
            </p>
            <div className="mt-5 border border-slate-950 bg-white p-5">
              <QRCodeCanvas value={joinUrl} size={270} marginSize={1} />
            </div>
            <p className="mt-5 break-all font-mono text-sm">{joinUrl}</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
              enter code
            </p>
            <p className="mt-2 font-mono text-6xl font-black">
              {state.event.code}
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
