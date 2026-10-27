"use client";

import { ImageUp, LoaderCircle } from "lucide-react";
import { useId, useState } from "react";
import { createWhatsAppPosterUpload } from "@/app/admin/whatsapp/actions";
import { createBrowserClient } from "@/lib/supabase/browser";

type UploadState =
  | { state: "empty" }
  | { state: "uploading" }
  | { state: "ready"; url: string }
  | { state: "error"; message: string };

const IMAGE_TYPES = ["image/jpeg", "image/png"];
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

// Uploads a template header image straight to the public poster bucket and
// submits its URL through a hidden field named `name`.
export function PosterUploadField({
  label,
  name,
  onUploaded,
}: {
  label: string;
  name: string;
  onUploaded: (url: string | null) => void;
}) {
  const inputId = useId();
  const [upload, setUpload] = useState<UploadState>({ state: "empty" });

  function fail(message: string) {
    setUpload({ state: "error", message });
    onUploaded(null);
  }

  async function uploadImage(file: File | null) {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) return fail("Choose a JPEG or PNG image.");
    if (file.size > IMAGE_MAX_BYTES) return fail("The image must be 5 MB or smaller.");

    setUpload({ state: "uploading" });
    onUploaded(null);
    try {
      const signed = await createWhatsAppPosterUpload(file.type, file.size);
      if (!signed.ok) throw new Error(signed.error);
      const supabase = createBrowserClient();
      if (!supabase) throw new Error("Supabase is not configured in this browser.");
      const { error } = await supabase.storage
        .from(signed.bucket)
        .uploadToSignedUrl(signed.path, signed.token, file, {
          contentType: file.type,
        });
      if (error) throw error;
      setUpload({ state: "ready", url: signed.publicUrl });
      onUploaded(signed.publicUrl);
    } catch (caught) {
      fail(caught instanceof Error ? caught.message : "The image could not be uploaded.");
    }
  }

  return (
    <div className="grid gap-2">
      <span className="club-label">{label}</span>
      <label
        htmlFor={inputId}
        className="club-panel-quiet flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition hover:border-[color:var(--cc-line-strong)]"
      >
        {upload.state === "uploading" ? (
          <LoaderCircle className="animate-spin text-[color:var(--cc-gold)]" size={18} />
        ) : (
          <ImageUp className="text-[color:var(--cc-gold)]" size={18} />
        )}
        {upload.state === "uploading"
          ? "Uploading image"
          : upload.state === "ready"
            ? "Image uploaded. Choose another to replace it."
            : "Choose a JPEG or PNG, up to 5 MB"}
      </label>
      <input
        id={inputId}
        className="sr-only"
        type="file"
        accept={IMAGE_TYPES.join(",")}
        aria-label={label}
        onChange={(event) => uploadImage(event.target.files?.[0] ?? null)}
      />
      {upload.state === "error" ? (
        <p className="text-sm text-[#f0c9c4]" role="alert">{upload.message}</p>
      ) : null}
      <input type="hidden" name={name} value={upload.state === "ready" ? upload.url : ""} />
    </div>
  );
}
