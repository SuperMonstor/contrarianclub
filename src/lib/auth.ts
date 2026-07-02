import { redirect } from "next/navigation";
import { currentAdminPath } from "@/lib/admin-routes";
import { createServerAuthClient } from "@/lib/supabase/server";

function isAdmin(user: { app_metadata?: Record<string, unknown> }) {
  // `app_metadata` can only be written by the service role, so this claim
  // cannot be forged from the client with the public anon key. A valid
  // session alone is NOT sufficient to be treated as an admin.
  return user.app_metadata?.role === "admin";
}

export async function getAdminUser() {
  const supabase = await createServerAuthClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !isAdmin(user)) {
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
