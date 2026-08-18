import { NextResponse } from "next/server";
import { getWhatsAppConfig } from "@/lib/whatsapp/server/config";
import { processWhatsAppWebhookEvents } from "@/lib/whatsapp/server/webhooks";
import {
  extractWebhookEvents,
  verifyWebhookSignature,
} from "@/lib/whatsapp/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const config = getWhatsAppConfig();
  const valid =
    url.searchParams.get("hub.mode") === "subscribe" &&
    url.searchParams.get("hub.verify_token") === config.webhookVerifyToken;
  const challenge = url.searchParams.get("hub.challenge");

  if (!valid || challenge === null) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  return new NextResponse(challenge, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const config = getWhatsAppConfig();
  if (
    !verifyWebhookSignature(
      rawBody,
      request.headers.get("x-hub-signature-256"),
      config.appSecret,
    )
  ) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  try {
    await processWhatsAppWebhookEvents(extractWebhookEvents(payload));
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(
      "WhatsApp webhook processing failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 },
    );
  }
}
