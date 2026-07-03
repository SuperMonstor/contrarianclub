import { redirect } from "next/navigation";
import { currentAdminPath } from "@/lib/admin-routes";
import { createServerAuthClient } from "@/lib/supabase/server";

export async function getAdminUser() {
  const supabase = await createServerAuthClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // This app currently treats every Supabase Auth user as an admin because
  // self-service signups are disabled and users are dashboard-provisioned.
  // Reintroduce an explicit allowlist before adding attendee/user auth.
  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireAdminUser() {
  const user = await getAdminUser();

  if (!user) {
    redirect(await currentAdminPath("/login"));
  }

  return user;
}
