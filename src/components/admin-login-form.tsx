"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/browser";

export function AdminLoginForm() {
  const router = useRouter();
  const adminHost =
    process.env.NEXT_PUBLIC_ADMIN_HOST || "admin.thecontrarian.club";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const supabase = createBrowserClient();
    if (!supabase) {
      setError("Supabase public env vars are missing.");
      setIsSubmitting(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    const nextPath =
      window.location.hostname === adminHost ? "/" : "/admin";
    router.replace(nextPath);
    router.refresh();
  }

  return (
    <form onSubmit={signIn} className="space-y-5">
      <div>
        <label className="club-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="club-input mt-2 px-3.5 py-3"
        />
      </div>
      <div>
        <label className="club-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="club-input mt-2 px-3.5 py-3"
        />
      </div>
      {error && (
        <p className="rounded-[2px] border border-[color:var(--cc-wine-bright)]/40 bg-[color:var(--cc-wine)]/20 px-3.5 py-3 text-sm font-medium text-[#f0c9c4]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="club-btn club-btn-primary w-full px-4 py-3"
      >
        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
        Sign in
        <LogIn size={18} />
      </button>
    </form>
  );
}
