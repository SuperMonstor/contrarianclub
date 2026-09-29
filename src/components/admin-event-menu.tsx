"use client";

import Link from "next/link";
import { Download, Menu } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

type Props = {
  eventTitle: string;
  assetsHref: string;
};

export function AdminEventMenu({ eventTitle, assetsHref }: Props) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        className="club-btn min-h-10 px-3 py-2 text-xs"
        aria-label={`Actions for ${eventTitle}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
      >
        <Menu size={17} className="text-[color:var(--cc-gold)]" />
      </button>
      {open && (
        <div
          id={id}
          className="club-panel absolute right-0 top-[calc(100%+8px)] z-30 min-w-48 p-1.5 shadow-2xl"
        >
          <Link
            href={assetsHref}
            className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm text-[color:var(--cc-parchment)] transition hover:bg-[color:var(--cc-gold)]/10 hover:text-[color:var(--cc-gold-bright)]"
            onClick={() => setOpen(false)}
          >
            <Download size={16} />
            Generate assets
          </Link>
        </div>
      )}
    </div>
  );
}
