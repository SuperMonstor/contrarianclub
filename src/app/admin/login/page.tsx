import { AdminLoginForm } from "@/components/admin-login-form";
import { Logo } from "@/components/logo";

export default function AdminLoginPage() {
  return (
    <main className="club-shell grid min-h-screen place-items-center px-5 py-10">
      <section className="club-panel club-rise w-full max-w-md p-8 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <Logo className="w-56" />
          <div className="club-rule my-7 w-full" />
          <p className="club-kicker">Members&rsquo; Entrance</p>
          <h1 className="club-display mt-4 text-4xl">Sign in</h1>
          <p className="mt-3 max-w-xs text-sm leading-6 text-[color:var(--cc-muted)]">
            Reserved for the house. Use the admin account provisioned in
            Supabase Auth.
          </p>
        </div>
        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}
