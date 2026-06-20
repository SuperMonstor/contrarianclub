import type { CSSProperties } from "react";

type LockupSize = "sm" | "md" | "lg" | "xl";

const SIZES: Record<LockupSize, { top: string; main: string; gap: string }> = {
  sm: { top: "0.62rem", main: "1.35rem", gap: "0.3rem" },
  md: { top: "0.74rem", main: "2.1rem", gap: "0.4rem" },
  lg: { top: "0.92rem", main: "3.4rem", gap: "0.5rem" },
  xl: { top: "1.05rem", main: "clamp(3rem, 7vw, 5.25rem)", gap: "0.6rem" },
};

type BrandLockupProps = {
  size?: LockupSize;
  align?: "left" | "center";
  className?: string;
};

/**
 * THE CONTRARIAN / DEBATE CLUB — the recurring two-line brand mark.
 * Both lines in Playfair Display; the title rendered in gold leaf.
 */
export function BrandLockup({
  size = "md",
  align = "left",
  className = "",
}: BrandLockupProps) {
  const s = SIZES[size];
  const style = {
    "--mark-top": s.top,
    "--mark-main": s.main,
    "--mark-gap": s.gap,
    alignItems: align === "center" ? "center" : "flex-start",
    textAlign: align,
  } as CSSProperties;

  return (
    <span className={`club-mark ${className}`} style={style} aria-label="The Contrarian Debate Club">
      <span
        className="club-mark-top"
        style={{ fontSize: "var(--mark-top)", marginBottom: "var(--mark-gap)" }}
      >
        The Contrarian
      </span>
      <span className="club-mark-main" style={{ fontSize: "var(--mark-main)" }}>
        Debate Club
      </span>
    </span>
  );
}
