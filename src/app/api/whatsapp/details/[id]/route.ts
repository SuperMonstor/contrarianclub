import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/whatsapp/server/campaigns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Target of the announcement's Details button. Meta URL buttons only allow a
// variable suffix on a fixed URL, so the button carries the campaign ID and
// this route forwards to whichever link that campaign announced.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isUuid(id)) return notFound();

  const { data, error } = await createServiceClient()
    .from("whatsapp_campaigns")
    .select("kind, parameters")
    .eq("id", id)
    .maybeSingle<{ kind: string; parameters: { detailsUrl?: unknown } }>();
  if (error) {
    console.error("WhatsApp details link lookup failed:", error.message);
    return NextResponse.json({ error: "Unable to open this link." }, { status: 500 });
  }

  const detailsUrl = data?.kind === "announcement" ? data.parameters.detailsUrl : null;
  if (typeof detailsUrl !== "string" || !detailsUrl.startsWith("https://")) {
    return notFound();
  }
  return NextResponse.redirect(detailsUrl, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}

function notFound() {
  return NextResponse.json({ error: "Link not found." }, { status: 404 });
}
