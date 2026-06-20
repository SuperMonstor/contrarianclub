type LogoProps = {
  className?: string;
  /** "left" = lines flush-left (for left-aligned layouts); "center" = original centered artwork. */
  variant?: "left" | "center";
};

/** The official Contrarian Debate Club wordmark (gold + ivory, on dark). */
export function Logo({ className = "", variant = "left" }: LogoProps) {
  const src =
    variant === "center" ? "/contrarian-logo.svg" : "/contrarian-logo-left.svg";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="The Contrarian Debate Club" className={className} />
  );
}
