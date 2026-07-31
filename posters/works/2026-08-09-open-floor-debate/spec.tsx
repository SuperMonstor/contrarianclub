import type { WorkSpec } from "../../src/core/types";
import chamber from "./assets/commons1833.jpg";
import lecture from "./assets/orrery.jpg";
import dispute from "./assets/dispute.jpg";
import panel from "./assets/panel.jpg";
import athens from "./assets/athens.jpg";
import basecamp from "./assets/basecamp.png";
import { Closing, G, Poster, Sequence, Statement } from "./slides";

// Instagram carousel for the first Open Floor Debate, 9 August, run with
// Basecamp. The design reasoning is in slides.tsx.
//
// The poster leads rather than closes. Someone scrolling past gets the whole
// offer in one frame, and every slide after it names what is coming next, so
// there is always a reason to keep going rather than deciding you have the
// gist. Slide 6 is the poster's twin, turned into the call to action.
//
// "Bring nothing" and "bring your best topics" used to be two slides, and read
// as contradicting each other. They are one slide now, and the tension is the
// point: turn up with nothing, unless you have been chewing on something.
//
// The art, all public domain via Wikimedia Commons:
//
//   1, 6  chamber   Hayter, The House of Commons 1833   a full house
//   2     lecture   Wright of Derby, The Orrery         one talking, the rest
//                                                       listening
//   3     dispute   Rembrandt, Two Old Men Disputing    two people who are not
//                                                       going to agree
//   4     panel     Rembrandt, The Syndics              a table, mid business
//   5     athens    Raphael, The School of Athens       everyone with an idea
const WHEN = ["Sunday, 9 August", "2:00 to 5:00 pm"];
const CTA = "Tickets link in bio";

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
          cta={CTA}
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
          next="What we argue about"
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
          next="How a round runs"
        />
      ),
    },

    // 4. The run of the night.
    {
      label: "How it runs",
      hasImage: true,
      render: () => (
        <Sequence
          art={{ src: panel, treatment: "lift", position: "center 34%" }}
          lead="Here's how a round runs."
          steps={[
            "We announce the topic",
            "Put your name in a hat",
            "Speakers are drawn at random",
            "15 minutes to prepare",
            "A round of statements",
            "A round of rebuttals",
            "Open floor, for anyone in the audience to join",
          ]}
          note={
            <>
              Two teams of two to three people each. We pick <G>three topics</G> on the day.
            </>
          }
          next="What to bring"
        />
      ),
    },

    // 5. Bring nothing, unless you have been chewing on something.
    {
      label: "Bring nothing",
      hasImage: true,
      render: () => (
        <Statement
          art={{ src: athens, treatment: "bright", position: "center 46%" }}
          lead="Bring nothing."
          leadSize={76}
          rest={
            <>
              No preparation, no experience, no obligation. The goal is to have a fun discourse
              that challenges your core beliefs. Although if you have a topic you haven't been
              able to find a clear answer to, bring that along. If it's good enough, we'll put it
              up to be debated.
            </>
          }
          next="How to join"
        />
      ),
    },

    // 6. The close, in the same room the deck opened in.
    {
      label: "Join",
      hasImage: true,
      render: () => (
        <Closing
          art={{ src: chamber, treatment: "lift", position: "center 30%" }}
          partner={basecamp}
          pitch="Join a charged, intellectually stimulating conversation around the most interesting, divisive topics of our time."
          when={WHEN}
          cta={CTA}
        />
      ),
    },
  ],
};

export default work;
