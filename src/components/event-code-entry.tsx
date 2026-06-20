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
        <label className="text-sm font-bold" htmlFor="code">
          Event code
        </label>
        <input
          id="code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="mt-2 w-full border border-slate-950 bg-[#fdfaf1] px-4 py-4 font-mono text-3xl font-black uppercase tracking-[0.16em] outline-none focus:bg-amber-100"
          placeholder="ABC123"
          autoComplete="off"
          inputMode="text"
        />
      </div>
      {error && (
        <p className="border border-red-900 bg-red-100 px-3 py-3 text-sm font-bold text-red-950">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isChecking || !code.trim()}
        className="flex min-h-12 w-full items-center justify-center gap-2 border border-slate-950 bg-slate-950 px-4 py-3 font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isChecking ? <Loader2 className="animate-spin" size={18} /> : null}
        Join event
        <ArrowRight size={18} />
      </button>
    </form>
  );
}
