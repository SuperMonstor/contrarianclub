"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type PendingSubmitButtonProps = {
  children: ReactNode;
  className?: string;
};

// Shared submit button for server-action forms. React 19 form actions do not
// auto-disable their trigger, so a double-click can fire the action twice
// (e.g. minting two events). Reading useFormStatus lets us block the button
// for the life of the pending submission. Must be rendered INSIDE the <form>.
export function PendingSubmitButton({
  children,
  className = "",
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      {children}
    </button>
  );
}
