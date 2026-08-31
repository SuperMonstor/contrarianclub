// The partnership brief is one deck with one variable part: the two bespoke
// pages we add for a given partner. Everything else (the story, the traction,
// the audience, the room) is the same whoever we are talking to.
//
// A new partner is a new entry here. Nothing else needs touching, and
// /partners/<slug> starts working.

/**
 * A bespoke page comes in one of two shapes, and the shape decides the layout.
 * Both fill the page rather than floating a paragraph in the middle of it.
 */
export type DeckPage =
  /** evidence: a headline, a line of proof, and a full-bleed band of specifics */
  | {
      kind: "band";
      label: string;
      heading: string;
      lead: string;
      /** the line to land on, set big beside the lead */
      kicker: string;
      /** the band's cells: what it is, and who does it */
      items: { what: string; who: string }[];
    }
  /** the plan: a headline over numbered columns */
  | {
      kind: "blocks";
      label: string;
      heading: string;
      blocks: { title: string; body: string }[];
    };

export interface PartnerDeck {
  /** the URL segment: /partners/<slug> */
  slug: string;
  /** the partner's name, as it should read in the deck */
  name: string;
  /**
   * The pitch, in order: the case for this partner first, then the idea it
   * leads to. Rendered one page each, after the general "why partner" page.
   */
  pitch: DeckPage[];
}

export const PARTNER_DECKS: PartnerDeck[] = [
  {
    slug: "openai",
    name: "OpenAI",
    pitch: [
      {
        kind: "band",
        label: "In the room today",
        heading: "Why an OpenAI partnership just makes sense",
        lead: "We've noticed people already using ChatGPT extensively at our debates.",
        kicker: "No one asked them to.",
        items: [
          { what: "Research", who: "Debaters" },
          { what: "Understanding the motion", who: "Audience" },
          { what: "Validating claims", who: "Audience" },
          { what: "Rebuttals", who: "Audience" },
          { what: "Stress testing arguments", who: "Audience" },
        ],
      },
      {
        kind: "blocks",
        label: "What we would build",
        // non-breaking hyphen: never split the word across lines
        heading: "So let's make it AI‑native.",
        blocks: [
          {
            title: "In the room",
            body: "Every event, we would actively encourage people to use ChatGPT: understand the motion, check claims, stress test audience questions and rebuttals.",
          },
          {
            title: "In the content",
            body: "Not only that, we tie it into the content itself, validating and fact checking claims on screen. ChatGPT becomes an integral part of the experience.",
          },
        ],
      },
    ],
  },
];

export function getPartnerDeck(slug: string): PartnerDeck | undefined {
  return PARTNER_DECKS.find((deck) => deck.slug === slug);
}
