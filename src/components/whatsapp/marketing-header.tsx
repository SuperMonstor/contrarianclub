import Link from "next/link";
import { ArrowLeft, FileUp, LayoutDashboard, Megaphone, Users } from "lucide-react";
import { Logo } from "@/components/logo";
import { adminPath, currentHostname, PUBLIC_HOST } from "@/lib/admin-routes";

const links = [
  { href: "/whatsapp", label: "Overview", icon: LayoutDashboard },
  { href: "/whatsapp/subscribers", label: "Subscribers", icon: Users },
  { href: "/whatsapp/import", label: "Import Excel", icon: FileUp },
  { href: "/whatsapp/campaigns/new", label: "New campaign", icon: Megaphone },
];

export async function MarketingHeader({
  eyebrow = "Audience dispatch",
  title = "WhatsApp marketing",
  description = "One verified list. One approved announcement. Every new debate.",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  const hostname = await currentHostname();
  return (
    <>
      <header className="club-panel overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-y-0 right-0 w-2/5 bg-[radial-gradient(circle_at_70%_25%,rgba(240,211,106,0.12),transparent_58%)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Logo className="w-40" />
            <div className="mt-5 flex items-center gap-3">
              <p className="club-kicker">{eyebrow}</p>
              <span className="club-rule w-16" />
            </div>
            <h1 className="club-display club-d-hero mt-3">{title}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[color:var(--cc-muted)]">
              {description}
            </p>
          </div>
          <Link href={adminPath("/", hostname)} className="club-btn px-4 py-3">
            <ArrowLeft size={17} />
            Events
          </Link>
        </div>
      </header>
      <nav className="mt-3 flex gap-2 overflow-x-auto pb-2" aria-label="WhatsApp marketing">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={adminPath(href, hostname)}
            className="club-btn shrink-0 px-3.5 py-2 text-xs"
          >
            <Icon size={15} className="text-[color:var(--cc-gold)]" />
            {label}
          </Link>
        ))}
        <Link
          href={`https://${PUBLIC_HOST}/privacy`}
          target="_blank"
          rel="noreferrer"
          className="club-btn ml-auto shrink-0 px-3.5 py-2 text-xs"
        >
          Privacy notice
        </Link>
      </nav>
    </>
  );
}
