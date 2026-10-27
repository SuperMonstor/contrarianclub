"use client";

import { Megaphone, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { createWhatsAppCampaign } from "@/app/admin/whatsapp/actions";
import { AnnouncementPreview } from "@/components/whatsapp/message-preview";
import { PosterUploadField } from "@/components/whatsapp/poster-upload-field";
import type { DebateOption } from "@/lib/whatsapp/server/debates";
import { DETAILS_URL_BASE } from "@/lib/whatsapp/template";

type Fields = {
  debateNumber: string;
  price: string;
  location: string;
  time: string;
  detailsUrl: string;
};

const initialFields: Fields = {
  debateNumber: "",
  price: "",
  location: "",
  time: "",
  detailsUrl: "",
};

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
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [chargesAccepted, setChargesAccepted] = useState(false);

  const detailsUrl = fields.detailsUrl.trim();
  const detailsUrlValid =
    detailsUrl.startsWith(DETAILS_URL_BASE) && detailsUrl.length > DETAILS_URL_BASE.length;
  const valid = useMemo(() => {
    if (!/^[1-9][0-9]{0,3}$/.test(fields.debateNumber.trim())) return false;
    if (!/^[1-9][0-9]{0,4}$/.test(fields.price.trim())) return false;
    return [fields.location, fields.time].every((value) => value.trim());
  }, [fields]);

  function update(name: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
  }

  // Fills the number from a debate record. It stays editable, and the other
  // fields are left alone.
  function chooseDebate(id: string) {
    setDebateId(id);
    const debate = debates.find((option) => option.id === id);
    if (!debate) return;
    setFields((current) => ({
      ...current,
      debateNumber: debate.debateNumber ?? current.debateNumber,
    }));
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
          {input("price", "Early access price (₹)", {
            maxLength: 5,
            placeholder: "599",
            inputMode: "numeric",
          })}
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
              Book Now only opens Offlyn links, so this must start with {DETAILS_URL_BASE}
            </p>
          ) : null}

          <PosterUploadField label="Poster" name="posterUrl" onUploaded={setPosterUrl} />
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
            price={fields.price}
            location={fields.location}
            time={fields.time}
            posterUrl={posterUrl}
          />
        </div>
        <p className="mt-4 text-xs leading-5 text-[color:var(--cc-muted)]">
          The wording is fixed by the approved Meta template. Book Now opens
          the Offlyn link above, and replying STOP or NO opts the subscriber out.
        </p>
      </section>
    </form>
  );
}
