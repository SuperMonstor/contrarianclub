import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PARTNER_DECKS, getPartnerDeck } from "@/content/partner-decks";

import { PartnerBrief } from "../partner-brief";

// Only the partners we have written a deck for exist. Anything else is a 404,
// so a guessed URL cannot serve someone else's pitch.
export const dynamicParams = false;

export function generateStaticParams() {
  return PARTNER_DECKS.map((deck) => ({ partner: deck.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ partner: string }>;
}): Promise<Metadata> {
  const { partner } = await params;
  const deck = getPartnerDeck(partner);
  if (!deck) return {};

  return {
    title: `Partnership brief for ${deck.name} | Contrarian Debate Club`,
    description:
      "A partnership brief for brands that want to reach Bengaluru's curious, high-agency young professionals.",
  };
}

export default async function PartnerDeckPage({
  params,
}: {
  params: Promise<{ partner: string }>;
}) {
  const { partner } = await params;
  const deck = getPartnerDeck(partner);
  if (!deck) notFound();

  return <PartnerBrief partner={deck} />;
}
