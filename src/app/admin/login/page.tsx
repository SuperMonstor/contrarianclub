import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f1e7] px-5 text-slate-950">
      <section className="w-full max-w-md border border-slate-950 bg-white p-6 shadow-[8px_8px_0_#111827]">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
          Admin
        </p>
        <h1 className="mt-3 text-3xl font-black">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Use the admin account created in Supabase Auth.
        </p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}
