type LogoProps = {
  className?: string;
};

/** The official Contrarian Debate Club wordmark (gold + ivory, on dark). */
export function Logo({ className = "" }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/contrarian-logo.svg"
      alt="The Contrarian Debate Club"
      className={className}
    />
  );
}
