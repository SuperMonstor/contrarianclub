"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export function EventCodeEntry() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  async function submitCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) return;

    setIsChecking(true);
    setError("");

    const response = await fetch(`/api/events/${normalizedCode}/state`, {
      cache: "no-store",
    });

    if (!response.ok) {
      setError("No event found for that code.");
      setIsChecking(false);
      return;
    }

    router.push(`/join/${normalizedCode}`);
  }

  return (
    <form onSubmit={submitCode} className="space-y-4">
      <div>
        <label className="club-label" htmlFor="code">
          Event code
        </label>
        <input
          id="code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="club-input club-mono mt-2 px-4 py-4 text-3xl font-bold uppercase tracking-[0.18em] text-[color:var(--cc-gold-bright)] placeholder:text-[color:var(--cc-faint)]"
          placeholder="ABC123"
          autoComplete="off"
          inputMode="text"
        />
      </div>
      {error && (
        <p className="rounded-[2px] border border-[color:var(--cc-wine-bright)]/40 bg-[color:var(--cc-wine)]/20 px-3.5 py-3 text-sm font-medium text-[#f0c9c4]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isChecking || !code.trim()}
        className="club-btn club-btn-primary w-full px-4 py-3"
      >
        {isChecking ? <Loader2 className="animate-spin" size={18} /> : null}
        Join event
        <ArrowRight size={18} />
      </button>
    </form>
  );
}
