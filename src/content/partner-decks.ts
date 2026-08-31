// The partnership brief is one deck with one variable part: the two bespoke
// pages we add for a given partner. Everything else (the story, the traction,
// the audience, the room) is the same whoever we are talking to.
//
// A new partner is a new entry here. Nothing else needs touching, and
// /partners/<slug> starts working.

/** one bespoke page in the deck: a label, a headline and a few paragraphs */
export interface DeckPage {
  /** the small caps line above the headline */
  label: string;
  /** the headline, set big */
  heading: string;
  /** the paragraphs under it */
  body: string[];
  /** an optional short line to land on, set apart from the body */
  kicker?: string;
}

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
        label: "In the room today",
        heading: "Why an OpenAI partnership just makes sense",
        body: [
          "We've noticed people already using ChatGPT extensively at our debates. Debaters research with it. The audience uses it to understand the motion, validate claims, come up with rebuttals, stress test arguments.",
        ],
        kicker: "No one asked them to.",
      },
      {
        label: "What we would build",
        heading: "So let's make it AI‑native.", // non-breaking hyphen: never split the word across lines
        body: [
          "Every event, we would actively encourage people to use ChatGPT: understand the motion, check claims, stress test audience questions and rebuttals.",
          "Not only that, we tie it into the content itself, validating and fact checking claims on screen. ChatGPT becomes an integral part of the experience.",
        ],
      },
    ],
  },
];

export function getPartnerDeck(slug: string): PartnerDeck | undefined {
  return PARTNER_DECKS.find((deck) => deck.slug === slug);
}
