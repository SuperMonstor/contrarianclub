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
    <form onSubmit={signIn} className="space-y-4">
      <div>
        <label className="text-sm font-bold" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="brand-input mt-2 w-full px-3 py-3"
        />
      </div>
      <div>
        <label className="text-sm font-bold" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="brand-input mt-2 w-full px-3 py-3"
        />
      </div>
      {error && (
        <p className="border border-red-900 bg-red-100 px-3 py-3 text-sm font-bold text-red-950">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex min-h-12 w-full items-center justify-center gap-2 border border-[#08080d] bg-[#08080d] px-4 py-3 font-black text-[#fff8e8] transition hover:-translate-y-0.5 hover:bg-[#1e2a35] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
        Sign in
        <LogIn size={18} />
      </button>
    </form>
  );
}
