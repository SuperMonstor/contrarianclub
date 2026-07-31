import type { WorkSpec } from "../../src/core/types";
import chamber from "./assets/commons1833.jpg";
import lecture from "./assets/orrery.jpg";
import dispute from "./assets/dispute.jpg";
import athens from "./assets/athens.jpg";
import basecamp from "./assets/basecamp.png";
import { Closing, G, Plain, Poster, Sequence, Statement } from "./slides";

// Instagram carousel for the first Open Floor Debate, 9 August, run with
// Basecamp. The design reasoning is in slides.tsx.
//
// The poster leads rather than closes. Someone scrolling past gets the whole
// offer in one frame, and the swipe cue tells them the rest is there if they
// want it. Slide 7 is that poster's twin, turned into a call to action.
//
// The five slides between them are the club's own words about the night, in
// the order someone asks the questions: can I take part, what will we argue
// about, how does it actually run, can I bring something, what do I need.
//
// The art, all public domain via Wikimedia Commons:
//
//   1, 7  chamber   Hayter, The House of Commons 1833   a full house
//   2     lecture   Wright of Derby, The Orrery         one talking, the rest
//                                                       listening
//   3     dispute   Rembrandt, Two Old Men Disputing    two people who are not
//                                                       going to agree
//   5     athens    Raphael, The School of Athens       everyone with an idea
const WHEN = ["Sunday, 9 August", "2:00 to 5:00 pm"];

const work: WorkSpec = {
  title: "Open Floor Debate, format explainer",
  date: "2026-08-09",
  formats: ["carousel-slide"],

  slides: [
    // 1. The poster, up front.
    {
      label: "Poster",
      hasImage: true,
      render: () => (
        <Poster
          art={{ src: chamber, treatment: "lift", position: "center 46%" }}
          partner={basecamp}
          title="Open Floor Debate"
          tagline="The most interesting conversation in Bangalore this weekend."
          checklist={[
            { icon: "seal", label: "Topics revealed on the night" },
            { icon: "scales", label: "Questions that divide the room" },
            { icon: "voices", label: "Everyone has a voice" },
          ]}
          when={WHEN}
          cta="Tickets on Offlyn"
          swipeHint="More details to follow"
        />
      ),
    },

    // 2. You can take part, and nobody has a head start.
    {
      label: "Take the floor",
      hasImage: true,
      render: () => (
        <Statement
          art={{ src: lecture, treatment: "lift", position: "center 40%" }}
          lead="Anyone in the audience has the option to take the floor."
          rest="We announce topics on the day, so no one can prepare beforehand."
        />
      ),
    },

    // 3. What gets argued. The named topics do more work than any description
    //    of them would, so they are set in gold and the sentence runs around
    //    them.
    {
      label: "Topics",
      hasImage: true,
      render: () => (
        <Statement
          art={{ src: dispute, treatment: "lift", position: "center 38%" }}
          lead="Topics that divide the room, and force you to think critically."
          rest={
            <>
              We've debated everything from <G>AI</G> to <G>choice feminism</G>,{" "}
              <G>billionaires</G>, <G>national pride</G> and <G>political power</G>. It'll be a
              topic you definitely have a strong opinion on.
            </>
          }
        />
      ),
    },

    // 4. The run of the night.
    {
      label: "How it runs",
      render: () => (
        <Sequence
          lead="Here's how a round runs."
          steps={[
            "We announce the topic",
            "Put your name in a hat",
            "Speakers are drawn at random",
            "15 minutes to prepare",
            "A round of statements",
            "A round of rebuttals",
            "Open floor, for anyone in the audience to join the conversation",
          ]}
          note={
            <>
              Two teams of two to three people each. We pick <G>three topics</G> on the day.
            </>
          }
        />
      ),
    },

    // 5. The audience can set the agenda too.
    {
      label: "Bring your topics",
      hasImage: true,
      render: () => (
        <Statement
          art={{ src: athens, treatment: "bright", position: "center 46%" }}
          lead="Bring your best topics."
          leadSize={68}
          rest="If you have something interesting that you haven't been able to find a clear answer to, bring it along on the day. If it's good enough, we'll bring it up to be debated."
        />
      ),
    },

    // 6. And you need nothing to walk in.
    {
      label: "Bring nothing",
      render: () => (
        <Plain
          lead="You don't need to bring anything."
          rest="No preparation, no experience, no obligation. The goal is to have a fun discourse that challenges your core beliefs."
        />
      ),
    },

    // 7. The close, in the same room the deck opened in.
    {
      label: "Join",
      hasImage: true,
      render: () => (
        <Closing
          art={{ src: chamber, treatment: "lift", position: "center 30%" }}
          partner={basecamp}
          pitch={
            <>
              If you've been interested in debating, or just want to hear a charged, intellectual
              conversation around the most interesting, divisive topics of our time,{" "}
              <G>join now</G>.
            </>
          }
          when={WHEN}
          cta="Tickets on Offlyn"
        />
      ),
    },
  ],
};

export default work;
