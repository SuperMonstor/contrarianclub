"use client";

import { Megaphone, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { createWhatsAppCampaign } from "@/app/admin/whatsapp/actions";

type Fields = {
  title: string;
  date: string;
  time: string;
  venue: string;
  ticketUrl: string;
};

const initialFields: Fields = {
  title: "",
  date: "",
  time: "",
  venue: "",
  ticketUrl: "",
};

export function CampaignForm({
  activeSubscriberCount,
}: {
  activeSubscriberCount: number;
}) {
  const [fields, setFields] = useState(initialFields);
  const [chargesAccepted, setChargesAccepted] = useState(false);
  const valid = useMemo(() => {
    if (Object.values(fields).some((value) => !value.trim())) return false;
    try {
      return new URL(fields.ticketUrl).protocol === "https:";
    } catch {
      return false;
    }
  }, [fields]);

  function field(name: keyof Fields, label: string, maxLength: number) {
    return (
      <label className="grid gap-2">
        <span className="club-label">{label}</span>
        <input
          className="club-input px-3 py-2.5"
          name={name}
          aria-label={label}
          required
          maxLength={maxLength}
          type={name === "ticketUrl" ? "url" : "text"}
          placeholder={
            name === "ticketUrl" ? "https://tickets.example/debate" : undefined
          }
          value={fields[name]}
          onChange={(event) =>
            setFields((current) => ({ ...current, [name]: event.target.value }))
          }
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
          {field("title", "Debate title", 240)}
          <div className="grid gap-4 sm:grid-cols-2">
            {field("date", "Date", 120)}
            {field("time", "Time", 120)}
          </div>
          {field("venue", "Venue", 120)}
          {field("ticketUrl", "Ticket URL", 2048)}
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
          disabled={!valid || !chargesAccepted || activeSubscriberCount === 0}
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
        <div className="mt-5 whitespace-pre-line rounded-sm border border-[color:var(--cc-line)] bg-[#efe6d1] px-5 py-5 text-[15px] leading-7 text-[#201a12] shadow-inner">
          <p>Hi there, bookings are open for the next Contrarian Club debate.</p>
          <p className="mt-4 font-semibold">{fields.title || "Your debate title"}</p>
          <p className="mt-4">
            {fields.date || "Date"} at {fields.time || "Time"}<br />
            {fields.venue || "Venue"}
          </p>
          <p className="mt-4 break-all">
            Book your seat: {fields.ticketUrl || "https://ticket-link"}
          </p>
          <p className="mt-4 text-[#655741]">
            Reply STOP to stop receiving debate announcements.
          </p>
        </div>
        <p className="mt-4 text-xs leading-5 text-[color:var(--cc-muted)]">
          Each recipient sees their name in place of “there”. The wording is fixed
          by the approved Meta template.
        </p>
      </section>
    </form>
  );
}
