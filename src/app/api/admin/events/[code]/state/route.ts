import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { getEventState } from "@/lib/event-state";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { code } = await params;
    const state = await getEventState(code);

    if (!state) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    return NextResponse.json(state, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to load event state." },
      { status: 500 },
    );
  }
}
