import type { WorkSpec } from "../../src/core/types";
import arnolfiniSrc from "./assets/arnolfini.jpg";
import { Beat, Hook, Invite, Motion, type Plate, Strike } from "./slides";

// Debate Club #11, Sunday 27 September, Big Pitcher. The carousel for the
// second motion, as rewritten after works/2026-09-27-debate-11-future-carousel
// was made for the old one. The poster is works/2026-09-27-debate-11-what-
// you-owe.
//
// The motion is printed on slide 9 with everything after "This Club Would"
// struck out. It is read out on the day, or when the post reaches 500 likes,
// whichever comes first. In full:
//
//   This Club Would Make Eligibility For The Legal And Financial Benefits Of
//   Marriage Conditional On Having A Child Within Five Years Of Marriage.
//
// The design reasoning is in slides.tsx.
//
// ---------------------------------------------------------------------------
// The facts in the copy:
//
//   slide 2  a spouse inherits without a will;     Indian succession law
//            draws a family pension; tax free      (Hindu Succession Act 1956,
//            gifts between spouses; maintenance    Indian Succession Act 1925,
//                                                  Muslim personal law);
//                                                  family pension under the
//                                                  CCS (Pension) Rules and
//                                                  EPS 1995; the income tax
//                                                  exemption for gifts from a
//                                                  relative, which includes a
//                                                  spouse; BNSS section 144 and
//                                                  Hindu Marriage Act s.25.
//                                                  Spousal visas: general.
//   slide 4  1.9 children per woman, 2.1 is        UNFPA, State of World
//            replacement                           Population 2025
//   slide 5  Hungary's baby expecting loan         Euronews, 29 July 2019
//            (babaváró), from July 2019: up to     (Emma Beswick): "they must
//            HUF 10 million, interest free, to     repay everything that they
//            married couples; repayments paused    have borrowed plus interest";
//            for three years with a first child,   the loan is written off at
//            written off with a third; no child    the third child. The cap has
//            within five years and it is repaid    since risen to HUF 11
//            with interest                         million, hence "began".
//   slide 6  one in six people face infertility    WHO, 4 April 2023: 17.5% of
//            at some point                         adults, lifetime prevalence
//
// ---------------------------------------------------------------------------
// The picture. Jan van Eyck, The Arnolfini Portrait, 1434, National Gallery,
// London. Public domain. Wikimedia Commons, "Van Eyck - Arnolfini
// Portrait.jpg", resized to 5200px on the long edge.

const arnolfini: Plate = { src: arnolfiniSrc, ratio: 3801 / 5200, art: "mc-art" };
const arnolfiniDusk: Plate = { ...arnolfini, art: "mc-art-dusk" };

const OF = 10;

// Everything after the club's opening words, struck out word by word. Each bar
// is as long as the word it hides, so the sentence keeps its real shape and
// gives away nothing else.
const HIDDEN = [
  "Make",
  "Eligibility",
  "For",
  "The",
  "Legal",
  "And",
  "Financial",
  "Benefits",
  "Of",
  "Marriage",
  "Conditional",
  "On",
  "Having",
  "A",
  "Child",
  "Within",
  "Five",
  "Years",
  "Of",
  "Marriage.",
];

const work: WorkSpec = {
  title: "Debate Club #11, motion two (marriage)",
  date: "2026-09-27",
  formats: ["carousel-slide"],

  slides: [
    // 1. The provocation, under the couple.
    {
      label: "Hook",
      hasImage: true,
      render: () => (
        <Hook
          plate={arnolfini}
          crop={{ x: 0.5, y: 0.3, scale: 1.4 }}
          label="Debate Club #11, Motion 2"
          hook={["Marriages should", "be annulled if", "you don’t have", "kids within", "five years."]}
          size={108}
        />
      ),
    },

    // 2. The stakes, on the joined hands.
    {
      label: "What marriage gets you",
      hasImage: true,
      render: () => (
        <Beat
          plate={arnolfini}
          crop={{ x: 0.55, y: 0.44, scale: 3.2 }}
          n={2}
          of={OF}
          lines={[
            "Getting married changes more than your status. It changes what the state gives you.",
            "",
            { text: "Your spouse inherits without a will.", tone: "parchment" },
            { text: "Draws your pension.", tone: "parchment" },
            { text: "Joins you abroad on your visa.", tone: "parchment" },
            { text: "Can gift you money, tax free.", tone: "parchment" },
            { text: "Can claim maintenance if it ends.", tone: "parchment" },
          ]}
          size={38}
          source="Indian succession, pension, income tax and family law."
          detail="Detail: the hands."
        />
      ),
    },

    // 3. The first answer to what the state is paying for: the question at the
    //    head, the mirror, the answer at the foot.
    {
      label: "The first answer",
      hasImage: true,
      render: () => (
        <Beat
          plate={arnolfini}
          crop={{ x: 0.508, y: 0.3, scale: 3.6 }}
          scrim="mc-scrim-split"
          lift
          n={3}
          of={OF}
          head={["So what is the state", "actually paying for?"]}
          headSize={60}
          lines={[
            {
              text: "One answer: the next generation. Marriage is where most children are raised, and the benefits back the families that raise them.",
              tone: "parchment",
            },
          ]}
          size={40}
          detail="Detail: the mirror."
        />
      ),
    },

    // 4. The case, on her hand and her gown.
    {
      label: "The logic",
      hasImage: true,
      render: () => (
        <Beat
          plate={arnolfini}
          crop={{ x: 0.72, y: 0.33, scale: 2.4 }}
          n={4}
          of={OF}
          lines={[
            "And India is having fewer children. The average woman now has 1.9, below the 2.1 a country needs to replace itself.",
            "",
            {
              text: "So the argument goes: if the benefits exist to raise the next generation, why should couples who don’t raise one still get them?",
              tone: "parchment",
            },
          ]}
          size={38}
          source="UNFPA, State of World Population 2025."
          detail="Detail: the wife."
        />
      ),
    },

    // 5. It has been done, under the chandelier and its one lit candle.
    {
      label: "Hungary",
      hasImage: true,
      render: () => (
        <Beat
          plate={arnolfini}
          crop={{ x: 0.51, y: 0.12, scale: 2.9 }}
          lift
          n={5}
          of={OF}
          lines={[
            "Hungary runs a version. In 2019 it began lending married couples up to 10 million forints, interest free.",
            "",
            {
              text: "Have a child and the payments pause. Have three and the loan is written off. Have none within five years, and you pay it all back, with interest.",
              tone: "parchment",
            },
          ]}
          size={38}
          source="Hungary’s baby expecting loan, from July 2019. Euronews, 29 July 2019."
          detail="Detail: the chandelier."
        />
      ),
    },

    // 6. The second answer, turning slide 2's list round, with the hard cases
    //    as its evidence. Opens at the head, the dog below.
    {
      label: "The second answer",
      hasImage: true,
      render: () => (
        <Beat
          plate={arnolfini}
          crop={{ x: 0.52, y: 0.86, scale: 2.4 }}
          scrim="mc-scrim-head"
          lift
          n={6}
          of={OF}
          head={[
            "The other answer: the two of you.",
            "",
            {
              text: "Look at that list again. Every benefit on it is for your spouse, not your children. It’s what you’d write if marriage were a promise between two people to look after each other.",
              size: 36,
            },
            "",
            {
              text: "That promise doesn’t expire at five years. Not for the one in six people who face infertility, the couple who married at 38, or the pair who spent those years caring for a parent.",
              size: 36,
              tone: "parchment",
            },
          ]}
          headSize={52}
          source="World Health Organization, April 2023."
          detail="Detail: the dog."
        />
      ),
    },

    // 7. What is on the table, and what is not. Opens at the head, the
    //    joined hands below. The adoption line is the club's reading of
    //    "having a child" in the motion.
    {
      label: "What's on the table",
      hasImage: true,
      render: () => (
        <Beat
          plate={arnolfini}
          crop={{ x: 0.55, y: 0.4, scale: 2.2 }}
          scrim="mc-scrim-head"
          n={7}
          of={OF}
          head={[
            "Nobody\u2019s marriage gets annulled. Nobody\u2019s stopped from living together.",
            "",
            {
              text: "You could spend your life with someone and never marry. You just wouldn\u2019t get the state\u2019s package. And adopting a child would count.",
              size: 36,
              tone: "parchment",
            },
            "",
            {
              text: "The only question is whether that package should come with a condition.",
              size: 36,
            },
          ]}
          headSize={48}
          detail="Detail: the couple."
        />
      ),
    },

    // 8. The crux, both answers side by side, with the whole room above.
    {
      label: "The question",
      hasImage: true,
      render: () => (
        <Beat
          plate={arnolfini}
          crop={{ x: 0.5, y: 0.34, scale: 1 }}
          scrim="mc-scrim-wide"
          n={8}
          of={OF}
          lines={[
            { text: "Where does a marriage get its value?", size: 50, tone: "gold" },
            {
              text: "The bond between two people, or what it does for everyone else?",
              size: 50,
              tone: "gold",
            },
            "",
            "That\u2019s what we\u2019re debating this Sunday.",
          ]}
          size={38}
        />
      ),
    },

    // 9. The motion, struck out, and when it will be read, which is the
    //    point of the slide.
    {
      label: "The motion",
      hasImage: true,
      render: () => (
        <Motion
          plate={arnolfiniDusk}
          crop={{ x: 0.5, y: 0.3, scale: 1.4 }}
          label="Motion 2"
          motion={
            <>
              This Club Would{" "}
              {HIDDEN.map((word, i) => (
                <span key={i}>
                  <Strike>{word}</Strike>{" "}
                </span>
              ))}
            </>
          }
          notice="Motion announced on the day, or when this post hits 500 likes."
          details={["Sunday, 27 September", "2 to 5 pm", "Big Pitcher, Indiranagar"]}
        />
      ),
    },

    // 10. The way in, on the husband's raised hand.
    {
      label: "Tickets",
      hasImage: true,
      render: () => (
        <Invite
          plate={arnolfini}
          crop={{ x: 0.26, y: 0.33, scale: 2.6 }}
          invitation={["Spectate, or get involved", "in the debate.", "Watch live."]}
          when="Sunday, 27 September, 2 to 5 pm. Big Pitcher, Indiranagar."
          cta="Tickets in bio"
          detail="Detail: the raised hand."
        />
      ),
    },
  ],
};

export default work;
