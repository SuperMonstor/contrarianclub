// The partnership brief is one deck with one variable part: the bespoke
// segment we propose to a given partner. Everything else (the story, the
// traction, the audience, the room) is the same whoever we are talking to.
//
// A new partner is a new entry here. Nothing else needs touching, and
// /partners/<slug> starts working.

export interface PartnerDeck {
  /** the URL segment: /partners/<slug> */
  slug: string;
  /** the partner's name, as it should read in the deck */
  name: string;
  /** the bespoke idea we are pitching them */
  proposal: {
    /** the line above the idea, e.g. "OpenAI presents:" */
    presents: string;
    /** the idea's name */
    title: string;
    /** two or three sentences on what it is and why it fits them */
    body: string;
  };
}

export const PARTNER_DECKS: PartnerDeck[] = [
  {
    slug: "openai",
    name: "OpenAI",
    proposal: {
      presents: "OpenAI presents:",
      title: "The Fact Check",
      body: "A recurring live segment that turns the room's most contested claims into a shared moment of verification, powered by ChatGPT. It is a visible, useful expression of better questions, stronger context and more informed debate.",
    },
  },
];

export function getPartnerDeck(slug: string): PartnerDeck | undefined {
  return PARTNER_DECKS.find((deck) => deck.slug === slug);
}
