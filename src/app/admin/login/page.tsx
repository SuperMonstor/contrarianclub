import { AdminLoginForm } from "@/components/admin-login-form";
import { Logo } from "@/components/logo";

export default function AdminLoginPage() {
  return (
    <main className="club-shell flex min-h-screen items-center justify-center px-5 py-10">
      <section className="club-panel club-rise w-full min-w-0 max-w-md p-8 sm:p-10">
        <Logo className="w-52 sm:w-56" />
        <div className="club-rule my-7 w-full" />
        <p className="club-kicker">Members&rsquo; Entrance</p>
        <h1 className="club-display club-d-title mt-4">Sign in</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[color:var(--cc-muted)]">
          Reserved for the house. Use the admin account provisioned in
          Supabase Auth.
        </p>
        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}
