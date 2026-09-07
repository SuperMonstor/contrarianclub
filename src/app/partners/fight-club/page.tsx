import type { Metadata } from "next";

import { FightClubBrief } from "./fight-club-brief";

// A co-branded deck, so it is its own route rather than an entry in
// src/content/partner-decks.ts. This static segment shadows [partner] for the
// "fight-club" slug, and no generic partner brief is generated for it.
export const metadata: Metadata = {
  title: "Contrarian x Fight Club Bengaluru | Partnership brief",
  description:
    "A co-branded night for a sponsor that wants Bengaluru's sharpest minds and most trained bodies in one room.",
};

export default function FightClubDeckPage() {
  return <FightClubBrief />;
}
