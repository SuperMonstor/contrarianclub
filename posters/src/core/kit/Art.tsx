import type { CSSProperties } from "react";

// A painting, treated to sit in the gallery-at-night palette: desaturated a
// little, warmed, and knocked back so type can live on top of it. The filter
// itself is `.art` in brand/poster.css, next to the tokens it belongs with.
//
// This is the standard treatment, not the only one. A piece whose painting is
// dark to begin with (an ink landscape) needs a lift rather than a darkening,
// and should pass its own className and own that rule in its work folder.
export function Art({
  src,
  /** CSS object-position. Every painting wants its own band, and the default
   *  middle crop is a starting point, not an answer. */
  position = "center 45%",
  className = "art",
  style,
}: {
  src: string;
  position?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <img
      className={className}
      src={src}
      alt=""
      style={{ objectPosition: position, ...style }}
    />
  );
}

/** The warm wash that pulls a cool canvas toward gold. Sits directly on the
 *  art, under any legibility scrim the piece defines for itself. */
export function ArtTone() {
  return <div className="art-tone" />;
}
