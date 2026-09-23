import type { WorkSpec } from "../../src/core/types";
import barrelSrc from "./assets/barrel.jpg";
import danceSrc from "./assets/dance.jpg";
import fireSrc from "./assets/fire.jpg";
import lentSrc from "./assets/lent.jpg";
import squareSrc from "./assets/square.jpg";
import wellSrc from "./assets/well.jpg";
import windowsSrc from "./assets/windows.jpg";
import { Beat, Closer, Hook, type Plate } from "./slides";

// Debate Club #11, Sunday 27 September, Big Pitcher. The carousel for the
// first motion, "I. For India's image", to go out a few days before the night.
// The poster is works/2026-09-27-debate-11-what-you-owe.
//
// The motion itself is withheld until the day, as the poster promised, so it
// appears nowhere in this deck. For whoever writes the handout, it is:
//
//   This Club Believes That Indians Should Sacrifice Public Festival
//   Celebrations Abroad To Protect India's Global Image.
//
// The design reasoning, and why each detail of the painting is where it is,
// is in slides.tsx.
//
// The art is one painting: Pieter Bruegel the Elder, The Fight Between
// Carnival and Lent (1559, Kunsthistorisches Museum, Vienna), from the Inside
// Bruegel photograph on Wikimedia Commons (public domain). The full scan is
// 41472 px wide and 230 MB, so it is not in the repo: it was decoded at a
// quarter scale and each detail below was cut from that and saved on its own.
// Every asset is a crop of the same image, which is why they share one
// treatment.
//
// The facts under the rule are sourced. If one ages out, change the fact and
// its source together:
//
//   Leicester visarjan video, "absolute shame"   Free Press Journal, 22 Sep 2026
//   Brampton fireworks ban, 2022                 City of Brampton by-law
//   ~1,490 complaints, 17 to 22 Oct 2025,        inBrampton, October 2025,
//   $45,200 in fines                             from City of Brampton figures
//   Anti-Indian posts on X nearly tripled        Network Contagion Research
//   in 2025, 300m+ views; the Washington         Institute, reported 11 March
//   memorial dance clip and H-1B calls           2026
//   St Patrick's parade, New York, 1762          NYC St. Patrick's Day Parade
//                                                history; first recorded parade
//   6,500 Diwali lights, Belgrave and Melton     Story of Leicester (Leicester
//   Roads; "largest outside India"               City Council)
//   NYC public schools closed for Diwali,        NYC Department of Education;
//   1 November 2024                              Governor Hochul, 14 Nov 2023
//
// Brampton counted six days of complaints in 2025 and only Diwali day in 2024,
// so the tempting "up from 161" comparison is deliberately not made.

const plate = (src: string, w: number, h: number, scrim = "ic-scrim"): Plate => ({
  src,
  ratio: w / h,
  art: "ic-art",
  scrim,
});

const square = plate(squareSrc, 3600, 2647, "ic-scrim-cover");
const squareDusk: Plate = { ...square, art: "ic-art-dusk" };
const well = plate(wellSrc, 2172, 2600);
const fire = plate(fireSrc, 2074, 2116);
const windows = plate(windowsSrc, 1867, 2417);
const barrel = plate(barrelSrc, 2220, 2600);
const dance = plate(danceSrc, 2242, 2600);
const lent = plate(lentSrc, 2221, 2600);

// The counter tells the truth about the deck's length, so it counts both
// covers even though neither carries one.
const OF = 9;

const DETAILS = ["Sunday, 27 September", "2 to 5 pm", "Big Pitcher, Indiranagar"];

const work: WorkSpec = {
  title: "Debate Club #11, motion one, India's image",
  date: "2026-09-27",
  formats: ["carousel-slide"],

  slides: [
    // 1. The accusation the motion answers, over the whole square.
    {
      label: "The question",
      hasImage: true,
      render: () => (
        <Hook
          plate={square}
          crop={{ x: 0.36, y: 0.5, scale: 1.8 }}
          details={DETAILS}
          label="I. For India's image"
          shout={{ lines: ["Are Indians abroad", "embarrassing", "India?"], size: 100 }}
          line="Post a festival video from abroad this month and the replies answer it for you."
          cta="Swipe for the argument →"
        />
      ),
    },

    // 2. The well, for the river. The news this month, and the headline it got
    //    at home, which is the case for the motion made by somebody else.
    {
      label: "Leicester",
      hasImage: true,
      render: () => (
        <Beat
          plate={well}
          crop={{ x: 0.42, y: 0.46, scale: 1.2 }}
          n={2}
          of={OF}
          footnote="Leicester, September 2026. Free Press Journal, 22 September."
          lines={[
            "Take Leicester, this month. Ganesh idols going out on hired boats, into the river, for visarjan.",
            "",
            {
              text: "Back home, the headline read: “Indians call it absolute shame.”",
              tone: "parchment",
            },
          ]}
          size={40}
        />
      ),
    },

    // 3. The fire, for the fireworks. The pattern, and the one city that has
    //    already legislated its answer.
    {
      label: "Brampton",
      hasImage: true,
      render: () => (
        <Beat
          plate={fire}
          crop={{ x: 0.4, y: 0.63, scale: 1.5 }}
          n={3}
          of={OF}
          footnote="City of Brampton, 17 to 22 October 2025. $45,200 in fines."
          lines={[
            "And it isn't one river. Brampton banned fireworks outright in 2022.",
            "",
            {
              text: "Around Diwali last year, the city still logged nearly 1,500 complaints in six days.",
              tone: "parchment",
            },
          ]}
          size={42}
        />
      ),
    },

    // 4. The window full of faces. How a clip in one street becomes an
    //    argument about everyone, which is the strongest form of the case.
    {
      label: "Everyone is watching",
      hasImage: true,
      render: () => (
        <Beat
          plate={windows}
          crop={{ x: 0.5, y: 0.3, scale: 1.2 }}
          n={4}
          of={OF}
          footnote="Network Contagion Research Institute, March 2026. Over 300 million views."
          lines={[
            "And none of it stays in the street it happened in.",
            "",
            {
              text: "Anti-Indian posts on X nearly tripled in 2025. One clip of a couple dancing at a war memorial in Washington turned into calls to cut Indian visas.",
              size: 36,
              tone: "parchment",
            },
          ]}
          size={42}
        />
      ),
    },

    // 5. No picture. The question is the picture, and the deck turns on it.
    {
      label: "Whose image",
      render: () => (
        <Beat
          n={5}
          of={OF}
          shout={{ lines: ["Whose", "image?"], size: 150 }}
          lines={[
            "India's, which none of us chose and all of us carry.",
            "",
            {
              text: "Or yours, in a city you live in, pay taxes to, and are allowed to be loud in.",
              tone: "parchment",
            },
          ]}
          size={40}
        />
      ),
    },

    // 6. Carnival on his barrel, unapologetic. The case against begins with
    //    the oldest precedent there is.
    {
      label: "The Irish",
      hasImage: true,
      render: () => (
        <Beat
          plate={barrel}
          crop={{ x: 0.55, y: 0.4, scale: 1.25 }}
          n={6}
          of={OF}
          footnote="New York's first recorded St Patrick's Day parade, 1762."
          lines={[
            "Because every community that ever celebrated in public abroad heard this first.",
            "",
            {
              text: "New York's St Patrick's Day parade is older than the United States, and for a long stretch of it the Irish were the city's embarrassment.",
              size: 36,
              tone: "parchment",
            },
          ]}
          size={42}
        />
      ),
    },

    // 7. The round dance: a festival the town has stopped noticing, because it
    //    is the town's now.
    {
      label: "Tolerated, then owned",
      hasImage: true,
      render: () => (
        <Beat
          plate={dance}
          crop={{ x: 0.47, y: 0.62, scale: 1.6 }}
          n={7}
          of={OF}
          footnote="Leicester City Council. New York City public schools, 1 November 2024."
          lines={[
            "And the festivals that got tolerated became the city's own.",
            "",
            {
              text: "Leicester lights 6,500 lamps for Diwali and calls it the biggest outside India. New York shut every public school for it in 2024.",
              size: 36,
              tone: "parchment",
            },
          ]}
          size={42}
        />
      ),
    },

    // 8. Lent on her cart, restraint made into a person. The fair question,
    //    set as #10's matched pair was: a quiet line, the question in gold,
    //    then a second question that widens it.
    {
      label: "The question underneath",
      hasImage: true,
      render: () => (
        <Beat
          plate={lent}
          crop={{ x: 0.5, y: 0.42, scale: 1.15 }}
          n={8}
          of={OF}
          lines={[
            {
              text: "So the question was never whether Indians abroad are seen.",
              size: 38,
              tone: "parchment",
            },
            "",
            { text: "It is whether India gets a say in how.", size: 48, tone: "gold" },
            "",
            { text: "And what a diaspora owes a country it has already left.", size: 38 },
          ]}
        />
      ),
    },

    // 9. The back cover, over the square the deck opened on, at dusk.
    {
      label: "Back cover",
      hasImage: true,
      render: () => (
        <Closer
          plate={squareDusk}
          crop={{ x: 0.5, y: 0.46, scale: 1.8 }}
          details={DETAILS}
          label="I. For India's image"
          invitation={["Come and", "take a side."]}
          notice="The full motion is revealed on the day."
          note="One of two. The second is for India's future."
          lines={[
            "Debaters drawn at random.",
            "The floor opens to everyone.",
            "Limited seats, so everyone speaks.",
          ]}
          cta={["Tickets out now", "Link in bio"]}
        />
      ),
    },
  ],
};

export default work;
