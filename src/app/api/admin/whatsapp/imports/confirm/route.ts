import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import {
  confirmWhatsAppImport,
  ImportAlreadyAppliedError,
  ImportInputError,
} from "@/lib/whatsapp/server/imports";
import { isSameOrigin } from "@/lib/whatsapp/server/request";
import { ImportFileError } from "@/lib/whatsapp/server/workbook";
import { importRequestData } from "@/app/api/admin/whatsapp/imports/shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const { file, options } = importRequestData(await request.formData());
    if (!file) {
      return NextResponse.json(
        { error: "Choose an .xlsx workbook." },
        { status: 400 },
      );
    }
    const result = await confirmWhatsAppImport(file, options, user.id);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof ImportAlreadyAppliedError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof ImportFileError || error instanceof ImportInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(
      "WhatsApp import confirmation failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "Unable to import this workbook." },
      { status: 500 },
    );
  }
}
