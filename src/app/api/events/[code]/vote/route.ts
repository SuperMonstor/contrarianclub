import { NextResponse } from "next/server";
import { getEventState } from "@/lib/event-state";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type VoteBody = {
  deviceId?: string;
  displayName?: string;
  optionId?: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = (await request.json()) as VoteBody;
    const deviceId = body.deviceId?.trim();
    const optionId = body.optionId?.trim();
    const displayName = body.displayName?.trim() || null;

    if (!deviceId || !optionId) {
      return NextResponse.json(
        { error: "Device id and option id are required." },
        { status: 400 },
      );
    }

    const state = await getEventState(code);

    if (!state || !state.activity) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    if (state.activity.status !== "open") {
      return NextResponse.json(
        { error: "This poll is not open." },
        { status: 409 },
      );
    }

    const selectedOption = state.options.find((option) => option.id === optionId);

    if (!selectedOption) {
      return NextResponse.json(
        { error: "That option does not belong to this poll." },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .upsert(
        {
          event_id: state.event.id,
          device_id: deviceId,
          display_name: displayName,
        },
        { onConflict: "event_id,device_id" },
      )
      .select("id")
      .single<{ id: string }>();

    if (participantError) throw participantError;

    const { error: voteError } = await supabase.from("votes").insert({
      activity_id: state.activity.id,
      option_id: optionId,
      participant_id: participant.id,
      device_id: deviceId,
    });

    if (voteError) {
      if (voteError.code === "23505") {
        return NextResponse.json(
          { error: "You already voted in this poll." },
          { status: 409 },
        );
      }

      throw voteError;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to submit vote." },
      { status: 500 },
    );
  }
}
