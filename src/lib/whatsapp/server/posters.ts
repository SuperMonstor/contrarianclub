import "server-only";
import { randomUUID } from "node:crypto";
import { createServiceClient, getSupabaseUrl } from "@/lib/supabase/server";

// Posters upload straight from the browser with a signed URL, because Server
// Actions cap request bodies at 1MB and WhatsApp accepts header images up to
// 5MB. Meta then fetches each poster from its public URL.
export const POSTER_BUCKET = "whatsapp-posters";
export const POSTER_MAX_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

export function posterPublicUrlPrefix(): string {
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) throw new Error("Missing Supabase URL.");
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${POSTER_BUCKET}/`;
}

export function isWhatsAppPosterUrl(value: string): boolean {
  const prefix = posterPublicUrlPrefix();
  return (
    value.startsWith(prefix) &&
    /^[0-9a-f-]{36}\.(jpg|png)$/.test(value.slice(prefix.length))
  );
}

export async function createPosterUpload(contentType: string, size: number) {
  const extension = EXTENSIONS[contentType];
  if (!extension) throw new Error("The poster must be a JPEG or PNG image.");
  if (!Number.isFinite(size) || size <= 0 || size > POSTER_MAX_BYTES) {
    throw new Error("The poster must be 5 MB or smaller.");
  }

  const path = `${randomUUID()}.${extension}`;
  const { data, error } = await createServiceClient()
    .storage.from(POSTER_BUCKET)
    .createSignedUploadUrl(path);
  if (error) throw error;
  return {
    bucket: POSTER_BUCKET,
    path: data.path,
    token: data.token,
    publicUrl: `${posterPublicUrlPrefix()}${data.path}`,
  };
}
