import type { WorkSpec } from "../../src/core/types";
import bellelli from "./assets/bellelli.jpg";
import room from "./assets/room.jpg";
import { Closing, Cover, Distribution, G, Motion, Swing, Verdict } from "./slides";

// Instagram carousel recapping Debate #9, run on 23 August: personal autonomy
// against social obligation, two motions. The design reasoning is in
// slides.tsx.
//
// Every number here comes from the live poll for event 8SRKJQ in Supabase
// (activities, poll_options, votes), read with the same matching the app uses
// on the night: the distributions count everyone who voted in that round, and
// the swing counts only the devices that voted in both rounds, because
// movement cannot be measured for someone who was there once.
//
//   Motion 1, self destruction  pre 40 votes, average -0.10
//                               post 32 votes, average -0.06
//                               27 matched: -0.11 to -0.07, 10 toward
//                               Proposition, 7 toward Opposition, 10 held.
//                               17 of the 27 moved, 10 of them across the
//                               middle, one the full width of the scale.
//
//   Motion 2, familial obligation
//                               pre 29 votes, average +1.52
//                               post 30 votes, average +0.53
//                               23 matched: +1.30 to +0.52, 5 toward
//                               Proposition, 12 toward Opposition, 6 held
//
// The swing slides plot the matched averages, not the round averages, which is
// why motion 2 reads +1.3 to +0.5 there and +1.5 to +0.5 on the two slides
// before it. Different populations, and each slide says which it is using.
//
// The room voted on the scale the app ships: Opposition at -3, Proposition at
// +3, and Proposition is the side the motion is on. The slides say against and
// for, because a reader who was not in the room has not been told which team
// wore which name.

const MOTION_ONE =
  "Respecting personal autonomy requires society to tolerate self destructive choices.";
const MOTION_TWO =
  "India should move from a culture of familial obligation towards one of individual autonomy.";

const AGAINST = "Against the motion";
const FOR = "For the motion";

const MATCHED_NOTE = "Measured on the people who voted in both rounds.";

const work: WorkSpec = {
  title: "Debate #9, recapped",
  date: "2026-08-23",
  formats: ["carousel-slide"],

  slides: [
    // 1. The cover: what the night was, and what this post is.
    {
      label: "Cover",
      hasImage: true,
      render: () => (
        <Cover
          photo={room}
          title="Debate #9"
          subtitle="recapped"
          lead="Two motions on where personal autonomy ends and social obligation begins."
          context={[
            "Nobody saw the motions before the room did. Debaters were drawn at random, then the floor opened to everyone.",
            "We polled the room before a word was said, and again after the floor closed. Here is what the arguments did to it.",
          ]}
          swipeHint="Swipe for the results"
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
        />
      ),
    },

    // 3. Where the room started. Split, and not for want of opinions.
    {
      label: "One, before",
      render: () => (
        <Distribution
          kicker="Pre-debate vote"
          headline="The room walked in split down the middle."
          counts={[3, 12, 5, 2, 5, 10, 3]}
          leftLabel={AGAINST}
          rightLabel={FOR}
          average={-0.1}
          fact={
            <>
              Twenty against, eighteen for, and only <G>two</G> who would not pick a side. The
              balance came from certainty at both ends, not from a room without opinions.
            </>
          }
        />
      ),
    },

    // 4. Where it ended. Almost exactly the same picture.
    {
      label: "One, after",
      render: () => (
        <Distribution
          kicker="Post-debate vote"
          headline="An hour of argument later, it was still split down the middle."
          counts={[3, 8, 5, 3, 2, 7, 4]}
          leftLabel={AGAINST}
          rightLabel={FOR}
          average={-0.1}
          fact={
            <>
              The average moved by <G>four hundredths</G> of a point. If anything the room hardened:
              a larger share of it finished at one of the two extremes than started there.
            </>
          }
        />
      ),
    },

    // 5. The reading, and the best number in the deck. A still average made of
    //    people who almost all moved.
    {
      label: "One, the swing",
      render: () => (
        <Swing
          kicker="Motion One · The swing"
          verdict="The room did not move. Almost everybody in it did."
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
              Two in three people changed their answer, and <G>ten</G> of the twenty seven crossed
              to the other side. One travelled the entire scale, from absolutely sure Against to
              absolutely sure For. All of it cancelled out.
            </>
          }
          footnote={MATCHED_NOTE}
        />
      ),
    },

    // 6. The second motion, on the mother and her daughters, arranged for the
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
        />
      ),
    },

    // 7.
    {
      label: "Two, before",
      render: () => (
        <Distribution
          kicker="Pre-debate vote"
          headline="This one the room had already decided."
          counts={[0, 2, 4, 2, 3, 5, 13]}
          leftLabel={AGAINST}
          rightLabel={FOR}
          average={1.5}
          fact={
            <>
              <G>Thirteen</G> of twenty nine were absolutely sure, and the far end against had
              nobody standing in it at all. The strongest opening position of the night.
            </>
          }
        />
      ),
    },

    // 8.
    {
      label: "Two, after",
      render: () => (
        <Distribution
          kicker="Post-debate vote"
          headline="By the end, the certain end of the room had thinned out."
          counts={[2, 4, 5, 2, 7, 2, 8]}
          leftLabel={AGAINST}
          rightLabel={FOR}
          average={0.5}
          fact={
            <>
              The absolutely sure bloc fell from thirteen to <G>eight</G>, and the end of the scale
              nobody had chosen before the debate finished with <G>two</G> people standing in it.
            </>
          }
        />
      ),
    },

    // 9.
    {
      label: "Two, the swing",
      render: () => (
        <Swing
          kicker="Motion Two · The swing"
          verdict="The room swung against the motion, and gave up most of its lead."
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
              The largest move of the night, and it came out of the side that was surest. More than
              half the room gave ground, and the lead lost <G>more than half</G> its size.
            </>
          }
          footnote={MATCHED_NOTE}
        />
      ),
    },

    // 10. Both motions on one page, and the only thing worth saying about the
    //     two of them together.
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
              note: "Two in three people changed their answer to get back to the same place.",
            },
            {
              label: "Motion Two",
              summary: "Walked in surer than the room was about anything else all night.",
              before: 1.3,
              after: 0.5,
              note: "The side holding the most certainty is the side that gave the most ground.",
            },
          ]}
          reading={
            <>
              A divided room moves in every direction at once and ends up where it started. A room
              that agrees can only move one way.
            </>
          }
        />
      ),
    },

    // 11. The close, back in the painted room.
    {
      label: "Close",
      hasImage: true,
      render: () => (
        <Closing
          src={bellelli}
          focus={{ x: 0.5, y: 0.46, scale: 1.35 }}
          lead="A room that argues well goes home less sure than it arrived."
          rest="Thank you to everyone who put their name in, took the floor, and admitted in front of a room full of strangers that they had changed their mind. That last one is the hard part."
          cta="Next debate announced soon"
        />
      ),
    },
  ],
};

export default work;
