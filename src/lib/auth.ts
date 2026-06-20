import { redirect } from "next/navigation";
import { currentAdminPath } from "@/lib/admin-routes";
import { createServerAuthClient } from "@/lib/supabase/server";

export async function getAdminUser() {
  const supabase = await createServerAuthClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

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
