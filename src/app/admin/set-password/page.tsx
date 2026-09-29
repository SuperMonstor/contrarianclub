import { AdminSetPasswordForm } from "@/components/admin-set-password-form";
import { Logo } from "@/components/logo";

export default function AdminSetPasswordPage() {
  return (
    <main className="club-shell flex min-h-screen items-center justify-center px-5 py-10">
      <section className="club-panel club-rise w-full min-w-0 max-w-md p-8 sm:p-10">
        <Logo className="w-52 sm:w-56" />
        <div className="club-rule my-7 w-full" />
        <p className="club-kicker">Members&rsquo; Entrance</p>
        <h1 className="club-display club-d-title mt-4">Set your password</h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--cc-muted)]">
          Choose a password for your invited admin account. You will sign in
          with it after this step.
        </p>
        <div className="mt-8"><AdminSetPasswordForm /></div>
      </section>
    </main>
  );
}
