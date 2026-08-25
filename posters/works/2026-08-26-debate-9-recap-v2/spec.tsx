import type { WorkSpec } from "../../src/core/types";
import bellelli from "./assets/bellelli.jpg";
import room from "./assets/room.jpg";
import {
  Closing,
  Cover,
  G,
  Motion,
  Numbers,
  PairedDistribution,
  Swing,
  Verdict,
} from "./slides";

// Ten slide recut of the Debate #9 recap, built for the feed rather than the
// record. Same night, same numbers, different argument order: the paradox
// first, one chart per motion instead of two, the best sentence of the night
// promoted from a caption to a slide, and a close that asks the reader to
// vote in the comments. The design reasoning is in slides.tsx.
//
// Every number is the 2026-08-23 deck's number, which came from the live poll
// for event 8SRKJQ in Supabase. See that work's README for the full
// provenance, populations and checked facts. In short:
//
//   Motion 1  pre 40 votes avg -0.10, post 32 votes avg -0.06.
//             27 matched: -0.11 to -0.07. 37% toward For, 26% toward
//             Against, 37% held. 10 crossed the middle, one travelled the
//             full width of the scale.
//   Motion 2  pre 29 votes avg +1.52, post 30 votes avg +0.53.
//             23 matched: +1.30 to +0.52. 22% toward For, 52% toward
//             Against, 26% held.
//
// The swing slides plot the matched averages, the chart slides the round
// averages, and each slide names its own population.

const MOTION_ONE =
  "Respecting personal autonomy requires society to tolerate self destructive choices.";
const MOTION_TWO =
  "India should move from a culture of familial obligation towards one of individual autonomy.";

const AGAINST = "Against the motion";
const FOR = "For the motion";

const MATCHED_NOTE = "Measured on the people who voted in both rounds.";

const work: WorkSpec = {
  title: "Debate #9, recapped (feed cut)",
  date: "2026-08-26",
  formats: ["carousel-slide"],

  slides: [
    // 1. The cover leads with the night's paradox, scoped one line later so
    //    the shout stays true: minds moved on the opening motion, the needle
    //    did not, and the second motion is a second hook.
    {
      label: "Cover",
      hasImage: true,
      render: () => (
        <Cover
          photo={room}
          hookTop="Minds moved."
          hookBottom="The needle did not."
          lead="Two in three changed their answer on the opening motion. The average finished where it began."
          tease="The second motion broke the other way. Debate #9, polled before a word was said and again after the floor closed."
          swipeHint="Swipe for the whole story"
        />
      ),
    },

    // 2. The first motion, on the father who has turned his chair away from
    //    his own family.
    {
      label: "Motion one",
      hasImage: true,
      render: () => (
        <Motion
          src={bellelli}
          focus={{ x: 0.82, y: 0.42, scale: 2.4 }}
          lift
          kicker="Motion One"
          motion={MOTION_ONE}
          note="You would stop a friend from wrecking their life. They never asked you to."
          fact={
            <>
              Drinking is the self destructive choice India has already ruled on. Alcohol is{" "}
              <G>banned outright</G> in Gujarat, Bihar, Mizoram, Nagaland and Lakshadweep.
            </>
          }
        />
      ),
    },

    // 3. Both rounds on one chart. The comparison the first cut asked the
    //    reader to make by swiping back and forth is made by the layout.
    {
      label: "One, the vote",
      render: () => (
        <PairedDistribution
          kicker="Motion One · The vote"
          headline="Split walking in. Split walking out."
          before={[3, 12, 5, 2, 5, 10, 3]}
          after={[3, 8, 5, 3, 2, 7, 4]}
          beforeAvg={-0.1}
          afterAvg={-0.1}
          leftLabel={AGAINST}
          rightLabel={FOR}
          fact={
            <>
              Only <G>two</G> people would not pick a side, and a larger share of the room
              finished at an extreme than started at one.
            </>
          }
        />
      ),
    },

    // 4. The story under the still average, with the full-scale traveller
    //    promoted into the reading, and the tease that keeps the swipe alive.
    {
      label: "One, the swing",
      render: () => (
        <Swing
          kicker="Motion One · Under the surface"
          verdict="The stillness was made of motion."
          before={-0.1}
          after={-0.1}
          leftLabel={AGAINST}
          rightLabel={FOR}
          movements={[
            { label: "Toward For", percent: 37, tone: "gold" },
            { label: "Toward Against", percent: 26, tone: "wine" },
            { label: "Held", percent: 37, tone: "muted" },
          ]}
          reading={
            <>
              Two in three changed their answer, and ten crossed to the other side. <G>One
              travelled the whole scale, sure Against to sure For.</G>
            </>
          }
          footnote={MATCHED_NOTE}
          tease="Motion two did move"
        />
      ),
    },

    // 5. The second motion, on the mother and her daughters, arranged for the
    //    record.
    {
      label: "Motion two",
      hasImage: true,
      render: () => (
        <Motion
          src={bellelli}
          focus={{ x: 0.28, y: 0.55, scale: 2.2 }}
          kicker="Motion Two"
          motion={MOTION_TWO}
          note="Everyone agrees you owe your family something. Nobody agrees how much."
          fact={
            <>
              In the India Human Development Survey, <G>5%</G> of married women said they chose
              their husband themselves. Another 37% chose jointly with their parents.
            </>
          }
        />
      ),
    },

    // 6. Both rounds on one chart. The tall +3 bar collapsing into the ghost
    //    behind it is the slide.
    {
      label: "Two, the vote",
      render: () => (
        <PairedDistribution
          kicker="Motion Two · The vote"
          headline="Walked in decided. Walked out arguing."
          before={[0, 2, 4, 2, 3, 5, 13]}
          after={[2, 4, 5, 2, 7, 2, 8]}
          beforeAvg={1.5}
          afterAvg={0.5}
          leftLabel={AGAINST}
          rightLabel={FOR}
          fact={
            <>
              The absolutely sure bloc fell from thirteen to <G>eight</G>, and the end nobody had
              chosen now has <G>two</G> people standing in it.
            </>
          }
        />
      ),
    },

    // 7.
    {
      label: "Two, the swing",
      render: () => (
        <Swing
          kicker="Motion Two · Under the surface"
          verdict="The certain side gave the most ground."
          before={1.3}
          after={0.5}
          leftLabel={AGAINST}
          rightLabel={FOR}
          movements={[
            { label: "Toward For", percent: 22, tone: "gold" },
            { label: "Toward Against", percent: 52, tone: "wine" },
            { label: "Held", percent: 26, tone: "muted" },
          ]}
          reading={
            <>
              <G>Ten</G> people opened absolutely sure. Three left that way, and two ended up on
              the other side.
            </>
          }
          footnote={MATCHED_NOTE}
        />
      ),
    },

    // 8. Both motions on one page, and the only thing worth saying about the
    //    two of them together.
    {
      label: "Verdict",
      render: () => (
        <Verdict
          kicker="The night, both motions"
          headline="The arguments did not move the divided room. They moved the certain one."
          columns={[
            {
              label: "Motion One",
              summary: "Walked in split down the middle. Left split down the middle.",
              before: -0.1,
              after: -0.1,
              note: "Two in three changed their answer to get back to the same place.",
            },
            {
              label: "Motion Two",
              summary: "Walked in surer than about anything else all night.",
              before: 1.3,
              after: 0.5,
              note: "The side with the most certainty gave the most ground.",
            },
          ]}
          reading={
            <>
              A divided room moves every way at once and stays put. A room that agrees can only
              move one way.
            </>
          }
          footnote="Where somebody stood on the first motion told you nothing about the second. The two opening votes barely correlate at all."
        />
      ),
    },

    // 9. Three figures counted across the whole night. The save slide.
    {
      label: "Numbers",
      render: () => (
        <Numbers
          kicker="Odds and ends"
          headline="Three things the charts cannot show."
          rows={[
            {
              figure: "2",
              line: (
                <>
                  Seventeen people voted in all four rounds. <G>Two</G> of them finished with the
                  answers they came in with.
                </>
              ),
            },
            {
              figure: "9",
              line: (
                <>
                  Of the 131 votes cast all night, <G>nine</G> were too close to call. This room
                  does not sit on fences.
                </>
              ),
            },
            {
              figure: "40",
              line: (
                <>
                  The room took ten minutes to say where it stood, and <G>forty seconds</G> to say
                  where it had ended up.
                </>
              ),
            },
          ]}
        />
      ),
    },

    // 10. The close: thanks, and then the reader's turn on the scale the deck
    //     has spent nine slides teaching.
    {
      label: "Close",
      hasImage: true,
      render: () => (
        <Closing
          src={bellelli}
          focus={{ x: 0.5, y: 0.46, scale: 1.35 }}
          lead="A room that argues well goes home less sure than it arrived."
          rest="Thank you to everyone who spoke, and to everyone who only listened and then voted differently. Both of those are the point."
          promptKicker="Your turn"
          prompt={
            <>
              Must society tolerate self destructive choices? Score yourself in the comments.
            </>
          }
          cta="The next one is being arranged"
        />
      ),
    },
  ],
};

export default work;
