"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_ADMIN_HOST } from "@/lib/admin-routes";

type State = "checking" | "ready" | "invalid";

export function AdminSetPasswordForm() {
  const router = useRouter();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const client = useRef<SupabaseClient | null>(null);
  const [state, setState] = useState<State>(url && key ? "checking" : "invalid");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!url || !key) return;

    const supabase = client.current ?? createClient(url, key, {
      auth: {
        flowType: "implicit",
        detectSessionInUrl: true,
        persistSession: false,
        autoRefreshToken: false,
        storageKey: `cc-admin-invite-${Math.random().toString(36).slice(2)}`,
      },
    });
    client.current = supabase;
    let active = true;
    void supabase.auth.getUser().then(({ data, error: authError }) => {
      if (!active) return;
      if (authError || !data.user?.email) {
        setState("invalid");
        return;
      }
      setEmail(data.user.email);
      setState("ready");
    }).catch(() => {
      if (active) setState("invalid");
    });
    return () => { active = false; };
  }, [url, key]);

  async function setAdminPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 12) {
      setError("Use at least 12 characters.");
      return;
    }
    if (!client.current || state !== "ready") {
      setState("invalid");
      return;
    }

    setBusy(true);
    try {
      const { error: updateError } = await client.current.auth.updateUser({ password });
      if (updateError) throw updateError;
      setPassword("");
      setConfirmation("");
      await client.current.auth.signOut();
      const adminHost = process.env.NEXT_PUBLIC_ADMIN_HOST || DEFAULT_ADMIN_HOST;
      router.replace(window.location.hostname === adminHost ? "/login" : "/admin/login");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not set your password.");
      setBusy(false);
    }
  }

  if (state === "checking") {
    return <p role="status" className="text-sm text-[color:var(--cc-muted)]">Checking your invitation...</p>;
  }
  if (state === "invalid") {
    return (
      <p role="alert" className="text-sm leading-6 text-[#f0c9c4]">
        This invitation link is invalid or expired. Ask the event owner for a new invitation.
      </p>
    );
  }

  return (
    <form onSubmit={setAdminPassword} className="space-y-5">
      <p className="text-sm text-[color:var(--cc-muted)]">
        Setting up access for <span className="text-[color:var(--cc-parchment)]">{email}</span>.
      </p>
      <div>
        <label className="club-label" htmlFor="new-password">New password</label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="club-input mt-2 px-3.5 py-3"
        />
      </div>
      <div>
        <label className="club-label" htmlFor="confirm-password">Confirm password</label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          className="club-input mt-2 px-3.5 py-3"
        />
      </div>
      {error && <p role="alert" className="text-sm text-[#f0c9c4]">{error}</p>}
      <button type="submit" disabled={busy} className="club-btn club-btn-primary w-full px-4 py-3">
        {busy ? "Saving password..." : "Set password"}
      </button>
    </form>
  );
}
