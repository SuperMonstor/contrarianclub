// The brand lockup — "THE CONTRARIAN / DEBATE CLUB" — built from live type so
// it stays crisp at any size and matches the website's .club-mark exactly.

export function Lockup({
  size = 1,
  align = "start",
}: {
  /** multiplier on the base sizes */
  size?: number;
  align?: "start" | "center";
}) {
  return (
    <div
      className="lockup"
      style={{ alignItems: align === "center" ? "center" : "flex-start" }}
    >
      <span className="lockup-top" style={{ fontSize: 22 * size }}>
        The Contrarian
      </span>
      <span
        className="lockup-main"
        style={{ fontSize: 34 * size, marginTop: 6 * size }}
      >
        Debate Club
      </span>
    </div>
  );
}
