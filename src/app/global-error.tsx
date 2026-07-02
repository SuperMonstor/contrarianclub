"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    // global-error replaces the root layout, so it must supply html/body.
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <title>Something went wrong · The Contrarian Debate Club</title>
        <main className="club-shell grid min-h-screen place-items-center px-5">
          <div className="club-panel club-rise max-w-sm p-8 text-center">
            <p className="club-kicker">The Contrarian Debate Club</p>
            <div className="club-rule mx-auto my-6 w-16" />
            <h1 className="club-display club-d-title">Something went wrong</h1>
            <p className="mt-3 text-sm leading-6 text-[color:var(--cc-muted)]">
              An unexpected fault stopped the room. Try again, or return in a
              moment.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="club-btn club-btn-primary mt-6 inline-flex px-5 py-3"
            >
              <RotateCcw size={18} />
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
