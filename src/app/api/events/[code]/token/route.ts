import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Mints a device token when a phone first joins. The device id is assigned
// server-side and sealed in the token row, so the client can't forge its own
// identity — casting N votes now requires N minted tokens rather than N
// fabricated device ids. Runs on the service role because device_tokens is
// unreadable/unwritable under RLS.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const normalizedCode = code.trim().toUpperCase();
    const supabase = createServiceClient();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("code", normalizedCode)
      .maybeSingle<{ id: string }>();

    if (eventError) throw eventError;

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const { data: token, error: tokenError } = await supabase
      .from("device_tokens")
      .insert({ event_id: event.id })
      .select("token")
      .single<{ token: string }>();

    if (tokenError) throw tokenError;

    return NextResponse.json(
      { token: token.token },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to join." }, { status: 500 });
  }
}
