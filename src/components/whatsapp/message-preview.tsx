import { ExternalLink, ImageIcon, Reply } from "lucide-react";
import type { ReactNode } from "react";
import {
  ANNOUNCEMENT_TEMPLATE_BODY,
  ANNOUNCEMENT_TEMPLATE_FOOTER,
  WELCOME_TEMPLATE_BODY,
  formatDebateNumber,
  formatMotions,
  renderTemplateBody,
} from "@/lib/whatsapp/template";

type Button = { label: string; kind: "link" | "reply" };

export const ANNOUNCEMENT_BUTTONS: Button[] = [{ label: "View Details", kind: "link" }];

export const WELCOME_BUTTONS: Button[] = [{ label: "Stop updates", kind: "reply" }];

// WhatsApp renders *text* as bold. The preview does the same so the admin sees
// what subscribers will see.
function formatLine(line: string): ReactNode[] {
  return line.split(/(\*[^*\n]+\*)/g).map((part, index) =>
    part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
      <strong key={index}>{part.slice(1, -1)}</strong>
    ) : (
      part
    ),
  );
}

export function MessagePreview({
  body,
  footer,
  buttons,
  posterUrl,
  showPosterSlot = false,
}: {
  body: string;
  footer?: string;
  buttons: Button[];
  posterUrl?: string | null;
  showPosterSlot?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-sm border border-[color:var(--cc-line)] bg-[#efe6d1] text-[15px] leading-7 text-[#201a12] shadow-inner">
      {posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- previews an uploaded Supabase image
        <img src={posterUrl} alt="Poster preview" className="block max-h-96 w-full object-cover" />
      ) : showPosterSlot ? (
        <div className="flex h-40 items-center justify-center gap-2 bg-[#ddd2b8] text-sm text-[#655741]">
          <ImageIcon size={18} /> Poster
        </div>
      ) : null}
      <div className="break-words px-5 py-5">
        {body.split("\n").map((line, index) =>
          line ? <p key={index}>{formatLine(line)}</p> : <div key={index} className="h-4" />,
        )}
        {footer ? <p className="mt-3 text-xs leading-5 text-[#655741]">{footer}</p> : null}
      </div>
      {buttons.length ? <div className="grid border-t border-[#d6c9ab]">
        {buttons.map((button) => (
          <span
            key={button.label}
            className="flex items-center justify-center gap-2 border-b border-[#d6c9ab] px-4 py-2 text-sm font-semibold text-[#1f6b5a] last:border-b-0"
          >
            {button.kind === "link" ? <ExternalLink size={15} /> : <Reply size={15} />}
            {button.label}
          </span>
        ))}
      </div> : null}
    </div>
  );
}

export function AnnouncementPreview({
  debateNumber,
  inviteOnly,
  motions,
  location,
  time,
  posterUrl,
}: {
  debateNumber: string;
  inviteOnly: boolean;
  motions: string[];
  location: string;
  time: string;
  posterUrl?: string | null;
}) {
  const filledMotions = motions.map((motion) => motion.trim()).filter(Boolean);
  const body = renderTemplateBody(ANNOUNCEMENT_TEMPLATE_BODY, [
    formatDebateNumber(debateNumber.trim() || "12", inviteOnly),
    formatMotions(filledMotions.length ? filledMotions : ["The motion"]),
    location.trim() || "Location",
    time.trim() || "Date and time",
  ]);
  return (
    <MessagePreview
      body={body}
      footer={ANNOUNCEMENT_TEMPLATE_FOOTER}
      buttons={ANNOUNCEMENT_BUTTONS}
      posterUrl={posterUrl}
      showPosterSlot
    />
  );
}

export function WelcomePreview() {
  return <MessagePreview body={WELCOME_TEMPLATE_BODY} buttons={WELCOME_BUTTONS} />;
}
