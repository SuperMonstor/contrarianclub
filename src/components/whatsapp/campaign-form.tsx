"use client";

import { ImageUp, LoaderCircle, Megaphone, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import {
  createWhatsAppCampaign,
  createWhatsAppPosterUpload,
} from "@/app/admin/whatsapp/actions";
import { AnnouncementPreview } from "@/components/whatsapp/message-preview";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { DebateOption } from "@/lib/whatsapp/server/debates";
import { DETAILS_URL_BASE } from "@/lib/whatsapp/template";

type Fields = {
  debateNumber: string;
  motionOne: string;
  motionTwo: string;
  location: string;
  time: string;
  detailsUrl: string;
};

type PosterState =
  | { state: "empty" }
  | { state: "uploading" }
  | { state: "ready"; url: string }
  | { state: "error"; message: string };

const initialFields: Fields = {
  debateNumber: "",
  motionOne: "",
  motionTwo: "",
  location: "",
  time: "",
  detailsUrl: "",
};

const POSTER_TYPES = ["image/jpeg", "image/png"];
const POSTER_MAX_BYTES = 5 * 1024 * 1024;

export function CampaignForm({
  activeSubscriberCount,
  debates = [],
}: {
  activeSubscriberCount: number;
  debates?: DebateOption[];
}) {
  const [fields, setFields] = useState(initialFields);
  const [debateId, setDebateId] = useState("");
  const [inviteOnly, setInviteOnly] = useState(false);
  const [poster, setPoster] = useState<PosterState>({ state: "empty" });
  const [chargesAccepted, setChargesAccepted] = useState(false);

  const detailsUrl = fields.detailsUrl.trim();
  const detailsUrlValid =
    detailsUrl.startsWith(DETAILS_URL_BASE) && detailsUrl.length > DETAILS_URL_BASE.length;
  const valid = useMemo(() => {
    if (!/^[1-9][0-9]{0,3}$/.test(fields.debateNumber.trim())) return false;
    return [fields.motionOne, fields.location, fields.time].every((value) => value.trim());
  }, [fields]);

  function update(name: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
  }

  // Fills the number and motions from a debate record. Everything stays
  // editable, and the other fields are left alone.
  function chooseDebate(id: string) {
    setDebateId(id);
    const debate = debates.find((option) => option.id === id);
    if (!debate) return;
    setFields((current) => ({
      ...current,
      debateNumber: debate.debateNumber ?? current.debateNumber,
      motionOne: debate.motions[0] ?? "",
      motionTwo: debate.motions[1] ?? "",
    }));
  }

  async function uploadPoster(file: File | null) {
    if (!file) return;
    if (!POSTER_TYPES.includes(file.type)) {
      setPoster({ state: "error", message: "Choose a JPEG or PNG image." });
      return;
    }
    if (file.size > POSTER_MAX_BYTES) {
      setPoster({ state: "error", message: "The poster must be 5 MB or smaller." });
      return;
    }

    setPoster({ state: "uploading" });
    try {
      const upload = await createWhatsAppPosterUpload(file.type, file.size);
      if (!upload.ok) throw new Error(upload.error);
      const supabase = createBrowserClient();
      if (!supabase) throw new Error("Supabase is not configured in this browser.");
      const { error } = await supabase.storage
        .from(upload.bucket)
        .uploadToSignedUrl(upload.path, upload.token, file, {
          contentType: file.type,
        });
      if (error) throw error;
      setPoster({ state: "ready", url: upload.publicUrl });
    } catch (caught) {
      setPoster({
        state: "error",
        message: caught instanceof Error ? caught.message : "The poster could not be uploaded.",
      });
    }
  }

  function input(
    name: keyof Fields,
    label: string,
    options: { maxLength: number; placeholder?: string; type?: string; inputMode?: "numeric" },
  ) {
    return (
      <label className="grid gap-2">
        <span className="club-label">{label}</span>
        <input
          className="club-input px-3 py-2.5"
          name={name}
          aria-label={label}
          required
          maxLength={options.maxLength}
          type={options.type ?? "text"}
          inputMode={options.inputMode}
          placeholder={options.placeholder}
          value={fields[name]}
          onChange={(event) => update(name, event.target.value)}
        />
      </label>
    );
  }

  function motion(name: "motionOne" | "motionTwo", label: string, required: boolean) {
    return (
      <label className="grid gap-2">
        <span className="club-label">{label}</span>
        <textarea
          className="club-input min-h-20 px-3 py-2.5"
          name="motion"
          aria-label={label}
          required={required}
          maxLength={400}
          value={fields[name]}
          onChange={(event) => update(name, event.target.value)}
        />
      </label>
    );
  }

  const posterUrl = poster.state === "ready" ? poster.url : null;

  return (
    <form action={createWhatsAppCampaign} className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <section className="club-panel p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="club-kicker">Campaign details</p>
            <h2 className="club-display club-d-card mt-2">The next debate</h2>
          </div>
          <span className="club-chip club-chip-live">
            {activeSubscriberCount.toLocaleString("en-IN")} active recipients
          </span>
        </div>
        <div className="mt-6 grid gap-4">
          {debates.length ? (
            <label className="grid gap-2">
              <span className="club-label">Fill from a debate</span>
              <select
                className="club-input px-3 py-2.5"
                aria-label="Fill from a debate"
                value={debateId}
                onChange={(event) => chooseDebate(event.target.value)}
              >
                <option value="">Type the details in</option>
                {debates.map((debate) => (
                  <option key={debate.id} value={debate.id}>
                    {debate.title} ({debate.code})
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            {input("debateNumber", "Debate number", {
              maxLength: 4,
              placeholder: "12",
              inputMode: "numeric",
            })}
            <label className="club-panel-quiet flex items-center gap-3 px-4 py-2.5 text-sm">
              <input
                type="checkbox"
                name="inviteOnly"
                value="yes"
                checked={inviteOnly}
                onChange={(event) => setInviteOnly(event.target.checked)}
                aria-label="Invite only"
              />
              Invite only
            </label>
          </div>
          {motion("motionOne", "Motion 1", true)}
          {motion("motionTwo", "Motion 2 (optional)", false)}
          {input("location", "Location", {
            maxLength: 160,
            placeholder: "Bangalore International Centre",
          })}
          {input("time", "Time", {
            maxLength: 120,
            placeholder: "Saturday, 8 November, 7:00 PM",
          })}
          {input("detailsUrl", "Offlyn event link", {
            maxLength: 2048,
            type: "url",
            placeholder: `${DETAILS_URL_BASE}e/...`,
          })}
          {detailsUrl && !detailsUrlValid ? (
            <p className="-mt-2 text-sm text-[#f0c9c4]" role="alert">
              View Details only opens Offlyn links, so this must start with {DETAILS_URL_BASE}
            </p>
          ) : null}

          <div className="grid gap-2">
            <span className="club-label">Poster</span>
            <label
              htmlFor="whatsapp-poster"
              className="club-panel-quiet flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition hover:border-[color:var(--cc-line-strong)]"
            >
              {poster.state === "uploading" ? (
                <LoaderCircle className="animate-spin text-[color:var(--cc-gold)]" size={18} />
              ) : (
                <ImageUp className="text-[color:var(--cc-gold)]" size={18} />
              )}
              {poster.state === "uploading"
                ? "Uploading poster"
                : poster.state === "ready"
                  ? "Poster uploaded. Choose another to replace it."
                  : "Choose a JPEG or PNG, up to 5 MB"}
            </label>
            <input
              id="whatsapp-poster"
              className="sr-only"
              type="file"
              accept={POSTER_TYPES.join(",")}
              aria-label="Poster"
              onChange={(event) => uploadPoster(event.target.files?.[0] ?? null)}
            />
            {poster.state === "error" ? (
              <p className="text-sm text-[#f0c9c4]" role="alert">{poster.message}</p>
            ) : null}
            <input type="hidden" name="posterUrl" value={posterUrl ?? ""} />
          </div>
        </div>

        <label className="club-panel-quiet mt-6 flex items-start gap-3 px-4 py-4 text-sm text-[color:var(--cc-muted)]">
          <input
            className="mt-1"
            type="checkbox"
            name="acknowledgeCharges"
            value="yes"
            checked={chargesAccepted}
            onChange={(event) => setChargesAccepted(event.target.checked)}
            aria-label="I understand Meta messaging charges may apply"
          />
          <span>
            I understand Meta messaging charges may apply. This creates a fixed
            snapshot of every active subscriber and starts sending immediately.
          </span>
        </label>
        <button
          type="submit"
          className="club-btn club-btn-primary mt-5 w-full px-5 py-3"
          disabled={
            !valid || !detailsUrlValid || !posterUrl || !chargesAccepted || activeSubscriberCount === 0
          }
        >
          <Megaphone size={18} />
          Create and send campaign
        </button>
      </section>

      <section className="club-panel-gold self-start p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-[color:var(--cc-gold)]" />
          <p className="club-kicker">Approved template preview</p>
        </div>
        <div className="mt-5">
          <AnnouncementPreview
            debateNumber={fields.debateNumber}
            inviteOnly={inviteOnly}
            motions={[fields.motionOne, fields.motionTwo]}
            location={fields.location}
            time={fields.time}
            posterUrl={posterUrl}
          />
        </div>
        <p className="mt-4 text-xs leading-5 text-[color:var(--cc-muted)]">
          The wording is fixed by the approved Meta template. View Details opens
          the Offlyn link above, and replying STOP or NO opts the subscriber out.
        </p>
      </section>
    </form>
  );
}
