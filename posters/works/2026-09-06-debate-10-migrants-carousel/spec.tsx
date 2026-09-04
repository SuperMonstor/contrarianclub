import type { WorkSpec } from "../../src/core/types";
import bangaloreSrc from "./assets/bangalore.jpg";
import badge from "./assets/btw-badge.png";
import campSrc from "./assets/camp.jpg";
import pagodaSrc from "./assets/pagoda.jpg";
import palaceSrc from "./assets/palace.jpg";
import siegeSrc from "./assets/siege.jpg";
import { Beat, Motion, type Plate } from "./slides";

// Debate Club #10, at Bengaluru Tech Week 2026. The second of the two motions,
// revealed two days before the night. The first motion's deck is
// works/2026-09-06-debate-10-tech-bubble and the two are a matched pair: same
// margin, same rule, same counter, same band, opposite structure. That one
// opened on its motion because it was the announcement; this one ends on its
// motion because it is the argument.
//
// Slides 1 to 8 are one continuous voice. Every one of them opens on a
// connective and closes on something unfinished, and that is the whole reason
// the deck gets swiped. Anyone editing a line should read the slide before it
// and the slide after it first.
//
// The motion runs verbatim on slide 9, exactly as it is printed on the poster
// in works/2026-09-06-debate-10-migrants, and is never compressed into a
// slogan. The only editorial act is where the lines break, and they break at
// phrase boundaries. Slide 1 is not a second version of it: it is the
// accusation the motion answers, which is the sentence people already argue
// about and the reason anybody stops to read the rest.
//
// The design reasoning, and why each picture is where it is, is in slides.tsx.
//
// The art. Every plate is a coloured aquatint of Bangalore or the Mysore
// country, drawn on the spot between 1791 and 1804 by English officers who had
// just finished besieging it, engraved and sold in London. That is the point
// and it is why every picture slide carries a wall label:
//
//   bangalore  East view of Bangalore. J.W. Edy after Robert Hyde Colebrooke,
//              drawn 1791, published in 'Twelve Views of Places in the Kingdom
//              of Mysore'. The town is a low line of wall on the horizon under
//              an enormous sky, with a tank, some cattle and one figure in the
//              foreground. Opens the deck on slide 1, returns at dusk on slide
//              8, and carries the motion on slide 9.
//   palace     West front of Tipu Sultan's palace, Bangalore. H. Merke after
//              James Hunter, 1804. Persianate arches, lacquer red and gold,
//              figures standing in the colonnade. The grandest building the
//              city had, and nothing about it is from here either.
//   camp       Mausoleum of Hyder Ali Khan at Laulbaug, Seringapatam. J.W. Edy
//              after Colebrooke. A row of white army tents pitched on the lawn
//              in front of the tomb. This is what arrival looks like, and it
//              is why slide 3 needs no picture of anybody travelling.
//   pagoda     A Pagoda at Strupermador. H. Merke after James Hunter, 1803. A
//              temple square: British officers in bicorns standing over a map,
//              two men in turbans talking in the foreground, and everybody
//              else going about their day around them. The most peopled plate
//              in the deck and the only one where the outsiders are visibly
//              outsiders. Slide 5 takes the officers, slide 7 the two men.
//   siege      North view of Sewandroog, showing the attack of December 1791.
//              J.W. Edy after Colebrooke. Gun smoke and a column of troops
//              against a rock face.
//
// All public domain via Wikimedia Commons, scanned by the Yale Center for
// British Art (the Colebrooke plates) and the Wellcome Collection (the Hunter
// and Allan plates, CC BY 4.0).
//
// The numbers in the footnotes are sourced. If one ages out, change the number
// and its source together:
//
//   Kempe Gowda's fort 1537, the cantonment 1809       standard city history
//   HAL 1940, ITI 1948, HMT 1953, BEL 1954             company founding dates
//   Kannada 42%, Tamil 16%, Telugu 14%, Urdu 13%       Census of India 2011
//   60% Kannada signage                                Kannada Language
//                                                      Comprehensive
//                                                      Development (Amendment)
//                                                      Act, notified 26 Feb
//                                                      2024, deadline 28 Feb
//   75% of non-management private jobs for locals      Karnataka State
//                                                      Employment of Local
//                                                      Candidates Bill,
//                                                      cabinet 15 July 2024,
//                                                      put on hold 17 July
//   Kannada 35% in 1991, 42% in 2011                   Newslaundry, 14 Nov
//   two thirds of migrants from within Karnataka       2024, reading the 1991
//                                                      and 2011 censuses

const bangalore: Plate = {
  src: bangaloreSrc,
  ratio: 3740 / 2700,
  art: "ce-art-open",
  scrim: "ce-scrim-low",
  label: ["East View of Bangalore, 1791", "J.W. Edy after R.H. Colebrooke, aquatint"],
};
const bangaloreDusk: Plate = { ...bangalore, art: "ce-art-dusk" };
// The motion page is the one slide where ivory type in poster caps runs across
// the middle of the frame, which is exactly where the open scrim leaves the
// sky at its brightest. So the last picture in the deck is the first picture
// in the deck taken down two stops: same view, same crop family, no glare
// behind the words.
const bangaloreMotion: Plate = { ...bangalore, art: "ce-art-motion", scrim: "ce-scrim-open" };
const palace: Plate = {
  src: palaceSrc,
  ratio: 2400 / 1830,
  art: "ce-art-interior",
  scrim: "ce-scrim-dense",
  label: ["West Front of Tipu Sultan's Palace, Bangalore", "H. Merke after James Hunter, 1804"],
};
const camp: Plate = {
  src: campSrc,
  ratio: 3720 / 2620,
  art: "ce-art",
  scrim: "ce-scrim-low",
  label: ["Mausoleum of Hyder Ali Khan at Laulbaug", "J.W. Edy after R.H. Colebrooke, 1805"],
};
const pagoda: Plate = {
  src: pagodaSrc,
  ratio: 2530 / 1840,
  art: "ce-art",
  scrim: "ce-scrim-low",
  label: ["A Pagoda at Strupermador", "H. Merke after James Hunter, 1803"],
};
// Slide 7 carries five lines including the one in gold, so its picture has to
// give up the open window the other landscapes get and go under the heavy
// scrim instead. Same plate, second helping, quieter.
const pagodaQuiet: Plate = { ...pagoda, scrim: "ce-scrim-dense" };
const siege: Plate = {
  src: siegeSrc,
  ratio: 3760 / 2700,
  art: "ce-art-smoke",
  scrim: "ce-scrim-low",
  label: ["North View of Sewandroog, the Attack of December 1791", "J.W. Edy after R.H. Colebrooke"],
};

// The counter tells the truth about the length of the deck, so it counts the
// motion even though the motion page carries no counter of its own.
const OF = 9;

const HOW_IT_WORKS = [
  "Debaters drawn at random.",
  "The floor opens to everyone.",
  "Limited seats, so everyone speaks.",
];

const work: WorkSpec = {
  title: "Debate Club #10, Bengaluru and the people who move here",
  date: "2026-09-06",
  formats: ["carousel-slide"],

  slides: [
    // 1. The motion, turned back into the question the city actually argues
    //    about, over the town as it was before anybody had a position on it.
    //    Slide 9 puts the club's proposition; this page puts the accusation it
    //    answers, because that is the sentence a reader already has an opinion
    //    on and the reason they stop scrolling.
    //
    //    The swipe instruction lives here rather than on the motion: this page
    //    asks something, so it is the page that can promise an answer.
    {
      label: "The question",
      hasImage: true,
      render: () => (
        <Beat
          plate={bangalore}
          crop={{ x: 0.46, y: 0.52, scale: 2.0 }}
          n={1}
          of={OF}
          // Seven lines, broken by hand rather than left to wrap: at this size
          // the column wraps "Is Bengaluru's" by itself and opens the deck on
          // the weakest word in the sentence. These breaks fall at phrase
          // boundaries and land "here?" alone at the foot.
          //
          // 124px is the largest the question goes with the line under it. The
          // block runs from just clear of the counter down to the rule, so the
          // page is the question and almost nothing else.
          shout={{
            lines: [
              "Is",
              "Bengaluru's",
              "culture being",
              "erased by",
              "the people",
              "who move",
              "here?",
            ],
            size: 124,
          }}
          cta="Swipe for the argument →"
          lines={[
            {
              text: "Ask it out loud in this city and the room takes sides before you finish the sentence.",
              size: 32,
              tone: "parchment",
            },
          ]}
        />
      ),
    },

    // 2. The palace. The oldest answer to the question is that there has never
    //    been one: the city's grandest building was put up by a sultan from
    //    Mysore and painted by an Englishman, and the British built a second
    //    town beside it and gave that one a different name.
    {
      label: "Never one place",
      hasImage: true,
      render: () => (
        <Beat
          plate={palace}
          crop={{ x: 0.5, y: 0.56, scale: 1.5 }}
          n={2}
          of={OF}
          footnote="The pete, 1537. The cantonment, 1809."
          lines={[
            "Kempe Gowda put a mud fort here in 1537. Tipu Sultan built the finest house in it.",
            {
              text: "Then the British parked a garrison next door in 1809 and called that half of town something else.",
              tone: "parchment",
            },
          ]}
          size={40}
        />
      ),
    },

    // 3. Tents pitched on the lawn of a mausoleum, which is the whole of this
    //    slide's copy in one picture: people who turned up and stayed, on
    //    ground somebody else had already consecrated.
    {
      label: "Then everyone came",
      hasImage: true,
      render: () => (
        <Beat
          plate={camp}
          crop={{ x: 0.32, y: 0.66, scale: 2.9 }}
          n={3}
          of={OF}
          footnote="HAL 1940. ITI 1948. HMT 1953. BEL 1954."
          lines={[
            "Then the factories came, and the software companies after them.",
            {
              text: "People arrived from every state in the country for a job and stayed for a life.",
              tone: "parchment",
            },
          ]}
          size={42}
        />
      ),
    },

    // 4. No picture. The number is the picture, and it is the hinge of the
    //    whole deck: everything before it is history and everything after it
    //    is the fight.
    {
      label: "Forty-two percent",
      render: () => (
        <Beat
          n={4}
          of={OF}
          shout={{ lines: ["42%"], size: 168 }}
          footnote="Census of India 2011. Tamil 16%. Telugu 14%. Urdu 13%."
          lines={[
            "Kannada is the mother tongue of forty-two percent of this city.",
            "",
            {
              text: "The rest of it grew up in something else.",
              tone: "parchment",
            },
          ]}
          size={46}
        />
      ),
    },

    // 5. The temple square, framed on the officers standing over their map with
    //    their backs to everybody in it. No footnote: this slide is
    //    observation rather than evidence, and the picture is the evidence.
    {
      label: "You never have to learn it",
      hasImage: true,
      render: () => (
        <Beat
          plate={pagoda}
          crop={{ x: 0.32, y: 0.63, scale: 1.85 }}
          n={5}
          of={OF}
          lines={[
            "So you can live here for ten years and never need a word of it.",
            "",
            {
              text: "The auto, the app, the office, the lease. Somebody always switches for you.",
              tone: "parchment",
            },
          ]}
          size={44}
        />
      ),
    },

    // 6. Sewandroog under fire. The turn from grievance to policy, and the one
    //    slide where the footnote is doing the arguing.
    {
      label: "So the city asked for it back",
      hasImage: true,
      render: () => (
        <Beat
          plate={siege}
          crop={{ x: 0.72, y: 0.62, scale: 2.1 }}
          n={6}
          of={OF}
          footnote="Kannada Language Act, February 2024. Local candidates bill, July 2024, on hold in two days."
          lines={[
            "And so the city started asking for it back, in writing.",
            "",
            {
              text: "Sixty percent Kannada on every signboard. Three quarters of private sector jobs held for locals.",
              tone: "parchment",
            },
          ]}
          size={42}
        />
      ),
    },

    // 7. The same square, close on the two men talking in the foreground: the
    //    people whose city it is, in the middle of everybody else's picture of
    //    it. The deck's obligation, and the best available fact against the
    //    motion it is about to put up, in gold, on its own line. Do not cut
    //    this slide.
    {
      label: "But",
      hasImage: true,
      render: () => (
        <Beat
          plate={pagodaQuiet}
          crop={{ x: 0.55, y: 0.6, scale: 1.85 }}
          n={7}
          of={OF}
          footnote="Census of India, 1991 and 2011."
          lines={[
            {
              text: "But the share of this city that speaks Kannada at home has gone up, not down.",
              size: 40,
              tone: "parchment",
            },
            "",
            { text: "Thirty-five percent in 1991. Forty-two in 2011.", size: 46, tone: "gold" },
            "",
            {
              text: "And two thirds of the people who moved here moved from inside Karnataka.",
              size: 38,
            },
          ]}
        />
      ),
    },

    // 8. The east view again, at dusk, the town almost a line. The turn, and a
    //    real question rather than a jab: the deck has to leave both sides of
    //    this arguable, and the motion on the next page is blunt enough that
    //    this page has to be fair.
    {
      label: "So which is it",
      hasImage: true,
      render: () => (
        <Beat
          plate={bangaloreDusk}
          crop={{ x: 0.62, y: 0.56, scale: 2.3 }}
          n={8}
          of={OF}
          lines={[
            {
              text: "So the argument was never really about whether Bengaluru changed.",
              size: 40,
              tone: "parchment",
            },
            "",
            { text: "It is about whether what it changed into is worse.", size: 46, tone: "gold" },
            "",
            {
              text: "And whether people who move to a city are meant to fit into it, or to change it.",
              size: 38,
            },
          ]}
        />
      ),
    },

    // 9. The motion, verbatim, over the plate the deck opened on. Eight pages
    //    of argument, then the page that asks the reader to come and finish it
    //    in a room.
    {
      label: "The motion",
      hasImage: true,
      render: () => (
        <Motion
          plate={bangaloreMotion}
          crop={{ x: 0.4, y: 0.42, scale: 1.9 }}
          badge={badge}
          motion={[
            "Migrants to Bengaluru have",
            "the right to reshape",
            "the city's culture,",
            "rather than merely",
            "adapt to it.",
          ]}
          note="The second of two motions. The first: Bengaluru needs to burst its tech bubble."
          invitation="Continue the discussion this Sunday."
          when="6 September, Big Pitcher, Indiranagar"
          lines={HOW_IT_WORKS}
          cta={["Tickets out now", "Link in bio"]}
        />
      ),
    },
  ],
};

export default work;
