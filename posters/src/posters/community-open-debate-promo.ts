import type { PosterSpec } from "../types";

// Image-forward promo for the Community Open Debate — full-bleed statement
// layout (ref post 16) over a treated public-domain painting of the Roman
// senate mid-debate (Maccari, "Cicero Denounces Catiline", public domain).
export const communityOpenDebatePromo: PosterSpec = {
  id: "community-open-debate-promo",
  template: "statement",

  kicker: "Invite Only",
  title: "Community Open Debate",
  oneLiner:
    "Two or three topics, picked on the spot — the floor open to everyone in the room.",

  details: [
    { label: "Date", value: "Sunday, 12 July" },
    { label: "Time", value: "1:00 pm onwards" },
  ],

  closing: "Our house. Open floor.",

  image: { src: "/hero-assembly.jpg", treatment: "full" },
};
