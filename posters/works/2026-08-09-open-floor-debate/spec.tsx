import type { WorkSpec } from "../../src/core/types";
import chamber from "./assets/commons1833.jpg";
import lecture from "./assets/orrery.jpg";
import athens from "./assets/athens.jpg";
import basecamp from "./assets/basecamp.png";
import { Answer, Bring, Cover, Format, Motions, Poster } from "./slides";

// Instagram carousel announcing the first Open Floor Debate, 9 August, and
// explaining the format. The design reasoning is in slides.tsx.
//
// Six slides. The order is built around one question, because it is the one
// that actually decides whether someone comes: do I have to speak? It is
// answered on slide 2, in the largest type on the slide, before the format is
// explained at all. Everything after that is detail for someone who has
// already decided they are allowed in.
//
// The art is three rooms full of people, which is the whole subject:
//
//   1  athens    Raphael, The School of Athens       the argument as a place
//                                                    you can walk into
//   2  lecture   Wright of Derby, The Orrery         one person presenting,
//                                                    everyone else rapt
//   6  chamber   Hayter, The House of Commons 1833   a full house, and an
//                                                    empty floor in the middle
//
// All public domain, via Wikimedia Commons.
const work: WorkSpec = {
  title: "Open Floor Debate, format explainer",
  date: "2026-08-09",
  formats: ["carousel-slide"],

  slides: [
    // 1. The announcement. "Presents" does the ceremony, so the kicker does
    //    not have to repeat the club name the logo already carries.
    {
      label: "Cover",
      hasImage: true,
      render: () => (
        <Cover
          copy={{
            kicker: "Presents",
            title: "Open Floor Debate",
            oneLiner:
              "Impromptu debates. The topic is revealed on the day, and anyone in the room can take the floor.",
            image: { src: athens, treatment: "bright", position: "center 42%" },
          }}
        />
      ),
    },

    // 2. The answer. The question we get more than any other, answered flatly
    //    and early. The two ways in are set symmetrically on purpose.
    {
      label: "Speak or watch",
      hasImage: true,
      render: () => (
        <Answer
          copy={{
            kicker: "Before You Ask",
            title: "No, you do not have to speak",
            closing: "Either way, you get the full night.",
            image: { src: lecture, treatment: "lift", position: "center 40%" },
          }}
          options={[
            {
              heading: "Take the floor",
              body: "Put your name in once the topic is up. Nothing is decided in advance, so you can call it in the room.",
            },
            {
              heading: "Take a seat",
              body: "Sit, listen, and judge it. Nobody is called on, and nobody is counted. Plenty of regulars only watch.",
            },
          ]}
        />
      ),
    },

    // 3. What gets argued. Three motions we have actually run say more about
    //    the register than any list of categories could.
    {
      label: "Motions",
      render: () => (
        <Motions
          copy={{
            kicker: "What Gets Debated",
            title: "Motions we have actually run",
          }}
          motions={[
            "Casual misandry among liberals slows down the feminist movement by alienating boys and young men",
            "National pride is a barrier to progress because it discourages international comparison",
            "Integration of AI in schools is a net harm to children",
          ]}
          footnote="This edition leans toward AI and technology, relationships, and a few we are keeping to ourselves until the day."
        />
      ),
    },

    // 4. The format itself, in the order it happens.
    {
      label: "How a round works",
      render: () => (
        <Format
          copy={{
            kicker: "How A Round Works",
            title: "Topic to rebuttal in under an hour",
            closing: "Then the floor resets, and it goes again.",
          }}
          steps={[
            {
              label: "The topic drops",
              body: "Revealed on the spot, so nobody arrives with a script.",
            },
            {
              label: "Names go in",
              body: "Want to argue it? Put your name in. Sitting this one out costs you nothing.",
            },
            {
              label: "Ten to fifteen minutes to prep",
              body: "Teams of four, working out the line together before they are up.",
            },
            {
              label: "Opening statements",
              body: "On stage. One statement each, so everyone on the team gets the floor.",
            },
            {
              label: "Rebuttals",
              body: "Both sides answer what they just heard. This is the part worth staying for.",
            },
          ]}
        />
      ),
    },

    // 5. The other worry: not obligation but competence. One word answers it.
    {
      label: "What to bring",
      render: () => (
        <Bring
          copy={{
            kicker: "What You Need To Bring",
            title: "Nothing",
            oneLiner:
              "You will not be the only person there for the first time, and the room knows it.",
          }}
          points={[
            "No preparation. The topic is new to everyone.",
            "No experience. Most speakers started at an open floor.",
            "No obligation. You can decide in the room, or not at all.",
          ]}
        />
      ),
    },

    // 6. The poster. Also ships standalone, so it repeats everything the deck
    //    has said: the sell, the mechanic, the way out, the logistics. Run in
    //    collaboration with Basecamp, so both marks lead.
    {
      label: "Poster",
      hasImage: true,
      render: () => (
        <Poster
          copy={{
            kicker: "Presents",
            title: "Open Floor Debate",
            oneLiner:
              "The most interesting conversation in Bangalore this weekend.",
            image: { src: chamber, treatment: "lift", position: "center 46%" },
          }}
          partner={basecamp}
          beats={[
            { icon: "seal", label: "Topics revealed on the night" },
            { icon: "scales", label: "Questions that divide the room" },
            { icon: "voices", label: "Everyone has a voice" },
          ]}
          when={["Sunday, 9 August", "2:00 to 5:00 pm"]}
          cta="Tickets on Offlyn"
        />
      ),
    },
  ],
};

export default work;
