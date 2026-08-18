import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import {
  CampaignNotFoundError,
  isUuid,
  sendCampaignBatch,
} from "@/lib/whatsapp/server/campaigns";
import { isSameOrigin } from "@/lib/whatsapp/server/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid campaign ID." }, { status: 400 });
  }

  try {
    const result = await sendCampaignBatch(id);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof CampaignNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(
      "WhatsApp campaign batch failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "Unable to process this campaign." },
      { status: 500 },
    );
  }
}
