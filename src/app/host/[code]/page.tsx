import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HostPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  redirect(`/admin/events/${code}`);
}
