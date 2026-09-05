import type { WorkSpec } from "../../src/core/types";
import bazaarSrc from "./assets/bazaar-1856.jpg";
import fortSrc from "./assets/fort-1849.jpg";
import { MotionBookmark, type Plate } from "./slides";

// Debate Club #10, 6 September 2026, at Big Pitcher, Indiranagar. Both motions
// as a pair of 2 x 6in bookmarks, handed out on the night.
//
// Two pieces, not two slides of one argument: they are handed out together and
// a person ends the evening holding both. The design reasoning is in
// slides.tsx.
//
// Both motions are worded exactly as the handouts word them, because the room
// votes on that wording and a bookmark that paraphrases it is wrong. The
// source of truth is handouts/2026-09-06-debate-10-*/debate.js, and if a
// motion changes there it changes here.
//
// The pictures. Both are Victorian wood engravings of Bangalore itself, both
// public domain via Wikimedia Commons, and both carry the city's name printed
// on the plate, which is the point: the earlier drafts of this pair used a
// Bruegel and a Song dynasty scroll, and a metaphor that needs a caption to
// justify it is not working on a 2in strip of card.
//
//   fort      "Fort and Pettah of Bangalore", wood engraving, 1849. A low
//             town of white houses running to the horizon under a big sky.
//             This is the same place the motion is about, at 1849.
//             https://commons.wikimedia.org/wiki/File:Fort_and_Pettah_of_Bangalore_(p.139,_1849)_-_Copy.jpg
//   bazaar    "A Bazaar, or Shop, in One of the Principal Streets of
//             Bangalore", wood engraving, 1856. A street, the people trading
//             on it, and whatever was being spoken across the counter. Which
//             is exactly what motion two calls the city's culture.
//             https://commons.wikimedia.org/wiki/File:A_Bazar,_or_Shop,_in_One_of_the_Principal_Streets_of_Bangalore_(p.97,_1856)_-_Copy.jpg
//
// They are also the same kind of object as each other, off the same kind of
// printed page a decade apart, which is what makes the two bookmarks a pair
// rather than two designs.
//
// THE NUMBERS
//
// One fact each, and both are measured against 1991, so the pair asks the
// same question of the city twice: how much has it changed, and into what.
//
//   3.3m (1991), ~14m now                Census of India, projections. Already
//                                        sourced in the tech-bubble deck.
//   Kannada 42% (2011), 35% (1991)       Census 2011, reported by Newslaundry,
//                                        14 November 2024.
//
// If either ages out, change the number and its source together.

const fort: Plate = {
  src: fortSrc,
  art: "d10-art-engraving",
  height: 400,
  position: "50% 50%",
  // the engraving is half empty sky, and the town is a thin band across the
  // middle of it. Pushed in on that band, which is the only part of the
  // picture that is the city.
  zoom: 1.55,
  focus: "50% 66%",
  caption: "Fort and Pettah of Bangalore, wood engraving, 1849.",
};

const bazaar: Plate = {
  src: bazaarSrc,
  art: "d10-art-engraving",
  height: 420,
  position: "46% 50%",
  zoom: 1.15,
  focus: "46% 42%",
  caption: "A bazaar in one of the principal streets of Bangalore, 1856.",
};

const work: WorkSpec = {
  title: "Debate 10, both motions, bookmarks",
  date: "2026-09-06",
  formats: ["bookmark", "bookmark-bleed"],
  slides: [
    {
      label: "I. Burst",
      hasImage: true,
      render: ({ format }) => (
        <MotionBookmark
          bleed={format.bleed}
          numeral="I"
          motionLabel="Motion one of two"
          plate={fort}
          motionSize={58}
          motion={
            <>
              Bengaluru
              <br />
              needs to burst
              <br />
              its tech bubble.
            </>
          }
          fact="3.3 million people lived here in 1991. Around 14 million do now."
        />
      ),
    },
    {
      label: "II. Reshape",
      hasImage: true,
      render: ({ format }) => (
        <MotionBookmark
          bleed={format.bleed}
          numeral="II"
          motionLabel="Motion two of two"
          plate={bazaar}
          motionSize={38}
          motion={
            <>
              Migrants to Bengaluru have the right to{" "}
              <span style={{ color: "var(--cc-gold)" }}>reshape</span> the city&rsquo;s culture,
              rather than merely adapt to it.
            </>
          }
          fact="42% of the city calls Kannada its mother tongue. In 1991 it was 35%."
        />
      ),
    },
  ],
};

export default work;
