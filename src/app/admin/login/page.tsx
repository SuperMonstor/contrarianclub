import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="salon-stage grid min-h-screen place-items-center px-5 text-[#08080d]">
      <section className="salon-panel w-full max-w-md p-6">
        <p className="brand-kicker text-[#7a6a42]">
          Admin
        </p>
        <h1 className="brand-display mt-3 text-4xl">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-[#4d5561]">
          Use the admin account created in Supabase Auth.
        </p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}
