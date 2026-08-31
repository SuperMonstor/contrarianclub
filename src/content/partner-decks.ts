// The partnership brief is one deck with one variable part: the two bespoke
// pages we add for a given partner. Everything else (the story, the traction,
// the audience, the room) is the same whoever we are talking to.
//
// A new partner is a new entry here. Nothing else needs touching, and
// /partners/<slug> starts working.

/** a photograph from one of our rooms, carrying the page */
export interface DeckImage {
  src: string;
  alt: string;
  /** object-position, to keep the subject clear of the type */
  focus?: string;
}

/**
 * A bespoke page comes in one of two shapes, and the shape decides the layout.
 * Both lead with a photograph, so the point lands before anything is read.
 */
export type DeckPage =
  /** the evidence: a headline over a full-bleed photograph of it happening */
  | {
      kind: "evidence";
      label: string;
      heading: string;
      /** the opening sentence, picked out in gold */
      lead: string;
      /** the rest of the paragraph, running on from it */
      body: string;
      image: DeckImage;
    }
  /** the offer: a photograph beside the two things we would build */
  | {
      kind: "offer";
      label: string;
      heading: string;
      lead: string;
      blocks: { title: string; body: string }[];
      image: DeckImage;
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
        kind: "evidence",
        label: "In the room today",
        heading: "Why an OpenAI partnership just makes sense",
        lead: "Show up to one of our debates and half the room is already on ChatGPT.",
        body: "Debaters research with it, and the audience uses it to understand the motion, validate claims, come up with rebuttals and stress test arguments.",
        image: {
          src: "/media/speaker-with-phone.jpg",
          alt: "A speaker at the mic making a point with his phone in his hand",
          focus: "62% center",
        },
      },
      {
        kind: "offer",
        label: "What we would build",
        // non-breaking hyphen: never split the word across lines
        heading: "So let's make it AI‑native.",
        lead: "ChatGPT in the room, and in everything we publish afterwards.",
        blocks: [
          {
            title: "In the room",
            body: "Every event, we actively encourage the room to lean on ChatGPT: understand the motion, check claims, stress test questions and rebuttals.",
          },
          {
            title: "In the content",
            body: "Then we tie it into everything we publish, with fact checks on screen and claims validated in the clips. ChatGPT becomes an integral part of the experience.",
          },
        ],
        image: {
          src: "/media/room-and-screen.jpg",
          alt: "The Contrarian room watching the stage, the screen lit behind the speakers",
          focus: "center 42%",
        },
      },
    ],
  },
];

export function getPartnerDeck(slug: string): PartnerDeck | undefined {
  return PARTNER_DECKS.find((deck) => deck.slug === slug);
}
