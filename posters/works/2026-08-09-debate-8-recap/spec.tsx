import type { WorkSpec } from "../../src/core/types";
import chamber from "./assets/commons1833.jpg";
import room from "./assets/room.jpg";
import cradle from "./assets/cradle.jpg";
import illmatched from "./assets/illmatched.jpg";
import basecamp from "./assets/basecamp.png";
import { Closing, Cover, Distribution, G, Motion, Swing } from "./slides";

// Instagram carousel recapping Debate #8, run with Basecamp on 9 August. The
// design reasoning is in slides.tsx.
//
// Every number here comes from the live poll for event AS25UE in Supabase
// (activities, poll_options, votes), read with the same matching the app uses
// on the night: the distributions count everyone who voted in that round, and
// the swing counts only the devices that voted in both rounds, because
// movement cannot be measured for someone who was there once.
//
//   Motion 1, children      pre 30 votes, average -1.5
//                           post 32 votes, average -0.4
//                           26 matched: -1.5 to -0.4, 15 toward Agree,
//                           5 toward Disagree, 6 held
//
//   Motion 2, age gap       pre 26 votes, average +0.8
//                           post 22 votes, average +0.4
//                           19 matched: +0.7 to +0.1, 3 toward Agree,
//                           8 toward Disagree, 8 held
//
// The swing slides plot the matched averages, not the round averages, which is
// why motion 2 reads +0.7 to +0.1 here and +0.8 to +0.4 on the two slides
// before it. Different populations, and each slide says which it is using.

const MOTION_ONE = "Choosing not to have children is morally selfish in a low birth rate society.";
const MOTION_TWO =
  "The social stigma against consensual age gap relationships causes more harm than the relationships themselves.";

const MATCHED_NOTE = "Measured on the people who voted in both rounds.";

const work: WorkSpec = {
  title: "Debate #8, recapped",
  date: "2026-08-09",
  formats: ["carousel-slide"],

  slides: [
    // 1. The cover.
    {
      label: "Cover",
      hasImage: true,
      render: () => (
        <Cover
          art={{ src: room, treatment: "photo", position: "center 62%" }}
          partner={basecamp}
          title="Debate #8"
          subtitle="recapped"
          context={[
            "Anyone in the audience could put their name in to speak.",
            "Teams were drawn at random, with fifteen minutes to prepare.",
            "We polled the room before a word was said, and again after the open floor closed.",
          ]}
          swipeHint="Swipe for the results"
        />
      ),
    },

    // 2. The first motion, and nothing else. How the night ran moved to the
    //    cover, where it gives a scroller a reason to stop.
    {
      label: "Motion one",
      hasImage: true,
      render: () => (
        <Motion
          art={{ src: cradle, treatment: "bright", position: "center 38%" }}
          kicker="Motion One"
          motion={MOTION_ONE}
          motionSize={58}
        />
      ),
    },

    // 3. Where the room started.
    {
      label: "One, before",
      render: () => (
        <Distribution
          kicker="Pre-debate vote"
          headline="The room walked in firmly against the motion."
          counts={[13, 9, 0, 2, 3, 1, 2]}
          leftLabel="Disagree"
          rightLabel="Agree"
          average={-1.5}
          fact={
            <>
              Not one person sat at <G>-1</G>. The room was certain, or it was on the other side.
              Mild disagreement did not exist yet.
            </>
          }
        />
      ),
    },

    // 4. Where it ended.
    {
      label: "One, after",
      render: () => (
        <Distribution
          kicker="Post-debate vote"
          headline="By the end, the room was close to balanced."
          counts={[8, 5, 4, 2, 5, 3, 5]}
          leftLabel="Disagree"
          rightLabel="Agree"
          average={-0.4}
          fact={
            <>
              Every position on the scale now has takers, including <G>-1</G>, which nobody had
              chosen before the debate.
            </>
          }
        />
      ),
    },

    // 5. The swing.
    {
      label: "One, swing",
      render: () => (
        <Swing
          kicker="Motion One · The swing"
          verdict="The room swung toward Agree."
          before={-1.5}
          after={-0.4}
          leftLabel="Disagree"
          rightLabel="Agree"
          movements={[
            { label: "Toward Agree", percent: 58, tone: "gold" },
            { label: "Toward Disagree", percent: 19, tone: "wine" },
            { label: "Held", percent: 23, tone: "muted" },
          ]}
          reading={
            <>
              A room that arrived certain left the question open. Three in four people moved at
              all, and one of them swung the entire scale: <G>absolutely sure Disagree</G> to{" "}
              <G>absolutely sure Agree</G>.
            </>
          }
          footnote={MATCHED_NOTE}
        />
      ),
    },

    // 6. The second motion, picked by the community.
    {
      label: "Motion two",
      hasImage: true,
      render: () => (
        <Motion
          art={{ src: illmatched, treatment: "lift", position: "center 30%" }}
          intro="The second motion came from the floor. The community put it forward and the room voted to argue it."
          kicker="Motion Two"
          motion={MOTION_TWO}
          note="Cranach painted the stigma in 1530. The question is whether it costs more than the thing it judges."
        />
      ),
    },

    // 7.
    {
      label: "Two, before",
      render: () => (
        <Distribution
          kicker="Pre-debate vote"
          headline="The room walked in leaning toward the motion."
          counts={[2, 1, 2, 6, 4, 7, 4]}
          leftLabel="Disagree"
          rightLabel="Agree"
          average={0.8}
          fact={
            <>
              Six of the twenty six sat at an extreme. On the first motion it was half the room.
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
          headline="By the end, the room was pulling both ways."
          counts={[3, 2, 3, 4, 2, 2, 6]}
          leftLabel="Disagree"
          rightLabel="Agree"
          average={0.4}
          fact={
            <>
              Nine of the twenty two ended at an extreme, up from six. This argument made people
              more certain, not less.
            </>
          }
        />
      ),
    },

    // 9.
    {
      label: "Two, swing",
      render: () => (
        <Swing
          kicker="Motion Two · The swing"
          verdict="The room swung toward Disagree."
          before={0.7}
          after={0.1}
          leftLabel="Disagree"
          rightLabel="Agree"
          movements={[
            { label: "Toward Agree", percent: 16, tone: "gold" },
            { label: "Toward Disagree", percent: 42, tone: "wine" },
            { label: "Held", percent: 42, tone: "muted" },
          ]}
          reading="Sympathy for the motion did not survive the argument. As many people held their ground as moved against it."
          footnote={MATCHED_NOTE}
        />
      ),
    },

    // 10. The close.
    {
      label: "Close",
      hasImage: true,
      render: () => (
        <Closing
          art={{ src: chamber, treatment: "lift", position: "center 30%" }}
          partner={basecamp}
          lead="A brilliant discussion, and an audience to match."
          rest="Thank you to everyone who put their name in, took the floor, and changed their mind in public. That last one is the hard part."
          cta="Next debate announced soon"
        />
      ),
    },
  ],
};

export default work;
