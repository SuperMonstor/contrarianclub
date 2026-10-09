import type { WorkSpec } from "../../src/core/types";
import athensSrc from "./assets/athens.jpg";
import posterSrc from "./assets/poster.jpg";
import { Beat, Hook, Motion, Poster, type Plate } from "./slides";

// Debate Club #12, the Indian education system. The carousel for the motion:
//
//   This Club Believes that India's prevailing attitudes towards education are
//   too deeply entrenched to produce world-class universities in the near
//   future
//
// The design reasoning is in slides.tsx. The copy is the club's own, written
// as one person talking.
//
// ---------------------------------------------------------------------------
// The facts in the copy, checked on 9 October 2026:
//
//   slide 2  IIT Delhi 118th, India's best; no     QS World University
//            Indian university in the top 100      Rankings 2027 (June 2026).
//                                                  Next are IIT Bombay 134 and
//                                                  IIT Madras 170.
//   slide 3  over 16 lakh signed up for JEE Main   NTA: 16,04,854 unique
//            this year                             registrations, JEE Main 2026
//            about 18,800 IIT seats                JoSAA 2026 seat matrix:
//                                                  18,826 IIT seats
//            more than four in ten graduates       India Skills Report 2026:
//            aren't considered employable          employability 56.35%, from
//                                                  about 1 lakh candidates who
//                                                  sat its employability test
//   slide 4  professors paid on fixed government   UGC pay levels (2018
//            scales                                regulations): the same pay
//                                                  at the same level. Promotion
//                                                  between levels does need
//                                                  publications, so the copy
//                                                  says "at the same level".
//
// Slides 5 and 6 are the club's argument, not facts, and cite nothing.
//
// ---------------------------------------------------------------------------
// The picture. Raphael, The School of Athens, 1509 to 1511, fresco, Stanza
// della Segnatura, Apostolic Palace, Vatican. Public domain. Wikimedia
// Commons, "Raffael 058.jpg" (The Yorck Project), 6045 x 4671.
//
// Slide 8 is the Debate #12 poster, assets/poster.jpg, copied from
// works/2026-10-07-debate-12-indian-education/out/ig-portrait.jpg. If that
// poster is re-exported, copy it in again.

const athens: Plate = { src: athensSrc, ratio: 6045 / 4671, art: "wu-art" };
const athensDusk: Plate = { ...athens, art: "wu-art-dusk" };

const OF = 8;
const EDITION = "Debate Club #12";

const work: WorkSpec = {
  title: "Debate Club #12, world-class universities carousel",
  date: "2026-10-09",
  formats: ["carousel-slide"],

  slides: [
    {
      label: "1. The claim",
      hasImage: true,
      render: () => (
        <Hook
          plate={athens}
          crop={{ x: 0.5, y: 0.5, scale: 2 }}
          edition={EDITION}
          hook={["India won’t", "produce a", "world-class", "university", "any time soon."]}
          size={112}
        />
      ),
    },
    {
      label: "2. The scoreboard",
      hasImage: true,
      render: () => (
        <Beat
          plate={athens}
          crop={{ x: 0.82, y: 0.755, scale: 3.6 }}
          scrim="wu-scrim-foot"
          n={2}
          of={OF}
          foot={[
            "As of today, the best university in India is IIT Delhi, ranked 118th in the world. There’s nothing in the top 100.",
          ]}
          footSize={52}
          source="QS World University Rankings 2027."
          detail="Detail: Zoroaster and Ptolemy, holding the heavens and the earth."
        />
      ),
    },
    {
      label: "3. The paradox",
      hasImage: true,
      render: () => (
        <Beat
          plate={athens}
          crop={{ x: 0.27, y: 0.9, scale: 3 }}
          scrim="wu-scrim-head"
          n={3}
          of={OF}
          head={[
            "But for a society that places so much emphasis on education, why is this the case?",
            "Over 16 lakh students signed up for JEE Main this year, for about 18,800 IIT seats. And yet more than four in ten graduates aren’t considered employable.",
          ]}
          headSize={44}
          source="NTA, JEE Main 2026. JoSAA 2026 seat matrix. India Skills Report 2026."
          detail="Detail: Pythagoras, and the students copying from his book."
        />
      ),
    },
    {
      label: "4. The people running them",
      hasImage: true,
      render: () => (
        <Beat
          plate={athens}
          crop={{ x: 0.505, y: 0.7, scale: 3 }}
          scrim="wu-scrim-foot"
          n={4}
          of={OF}
          foot={[
            "So what’s at the crux of this problem? We think it’s partly the people running these universities.",
            "Professors are paid on fixed government scales, so a great researcher and a mediocre one at the same level earn the same. Why would anyone bother?",
          ]}
          footSize={44}
          source="UGC pay levels for university teachers, 2018 regulations."
          detail="Detail: Plato and Aristotle, at the head of the school."
        />
      ),
    },
    {
      label: "5. What we want from it",
      hasImage: true,
      render: () => (
        <Beat
          plate={athens}
          crop={{ x: 0.45, y: 0.9, scale: 3 }}
          scrim="wu-scrim-head"
          n={5}
          of={OF}
          head={[
            "And partly it’s the way we look at education.",
            "For most of us, college is a way to get a job, not to explore ideas. Tell your parents you want to be a researcher and see how that goes.",
          ]}
          headSize={46}
          detail="Detail: Heraclitus, working alone."
        />
      ),
    },
    {
      label: "6. The crux",
      hasImage: true,
      render: () => (
        <Beat
          plate={athens}
          crop={{ x: 0.79, y: 0.9, scale: 4 }}
          scrim="wu-scrim-split"
          n={6}
          of={OF}
          head={[
            "The two feed each other. Students want a degree that gets them a job, and universities are happy to hand out exactly that.",
          ]}
          headSize={46}
          foot={[{ text: "So which has to change first, the universities or us?", tone: "gold" }]}
          footSize={52}
          detail="Detail: Euclid, teaching."
        />
      ),
    },
    {
      label: "7. The motion",
      hasImage: true,
      render: () => (
        <Motion
          plate={athensDusk}
          crop={{ x: 0.5, y: 1, scale: 2.2 }}
          edition={EDITION}
          label="The motion"
          motion="This Club Believes that India’s prevailing attitudes towards education are too deeply entrenched to produce world-class universities in the near future"
        />
      ),
    },
    {
      label: "8. The way in",
      hasImage: true,
      render: () => (
        <Poster src={posterSrc} />
      ),
    },
  ],
};

export default work;
