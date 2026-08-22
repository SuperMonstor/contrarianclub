import type { WorkSpec } from "../../src/core/types";
import athens from "./assets/athens.jpg";
import augustine from "./assets/augustine.jpg";
import jerome from "./assets/jerome.jpg";
import { Column, Index, Manifesto, Plate, Spine, Ticket } from "./slides";

// A bookmark, printed at 2 x 6 in, handed out at debates and kept for as long
// as the book lasts. Six variations to choose between, not six slides of one
// argument: they are alternatives. The design reasoning is in slides.tsx.
//
// Nothing here names a date or an event, because the object outlives both. The
// only facts on it are the address, the city and how the club actually runs a
// night, all taken from the club's own copy.
//
// The house rules on variation 2 are the one piece of invented copy in the
// set. If the club has its own wording for them, that wording wins.

const work: WorkSpec = {
  title: "Bookmark, six variations",
  date: "2026-08-22",
  formats: ["bookmark"],
  slides: [
    {
      label: "1. The Column",
      hasImage: true,
      render: () => (
        <Column
          art={{ src: athens, position: "center 44%" }}
          line={
            <>
              Somewhere in
              <br />
              this book is
              <br />
              your next
              <br />
              argument.
            </>
          }
        />
      ),
    },
    {
      label: "2. The Plate",
      hasImage: true,
      render: () => (
        <Plate
          art={{ src: jerome, position: "center 46%" }}
          caption="Antonello da Messina, Saint Jerome in His Study, c. 1475"
          kicker="Rules of Engagement"
          rules={[
            { numeral: "i", text: "Attack the argument, never the arguer." },
            { numeral: "ii", text: "Concede the good point out loud." },
            { numeral: "iii", text: "Leave with a better opinion than the one you brought." },
          ]}
          closing="Bring a position you are willing to lose."
        />
      ),
    },
    {
      label: "3. The Manifesto",
      hasImage: false,
      render: () => (
        <Manifesto
          kicker="For the reader who argues back"
          lead="The other side deserves a"
          accent="better argument"
          tail="than the one you gave it."
          closing="The floor is open to everyone."
        />
      ),
    },
    {
      label: "4. The Ticket",
      hasImage: true,
      render: () => (
        <Ticket
          art={{ src: augustine, position: "58% 34%" }}
          kicker="Admit One"
          line={
            <>
              Admit one
              <br />
              to the other side.
            </>
          }
          terms={[
            { label: "Motion", value: "Announced on the night" },
            { label: "The floor", value: "Open to everyone" },
            { label: "Seats", value: "Limited, so everyone speaks" },
            { label: "City", value: "Bangalore" },
          ]}
          closing="Not transferable. Opinions are."
        />
      ),
    },
    {
      label: "5. The Index",
      hasImage: true,
      render: () => (
        <Index
          art={{ src: athens, position: "center 42%" }}
          kicker="Motions from the floor"
          motions={[
            { numeral: "I", text: "Can too much national pride hold a country back?" },
            {
              numeral: "II",
              text: "Should Indians leave the country if the opportunity presents itself?",
            },
            {
              numeral: "III",
              text: "Respecting personal autonomy requires society to tolerate self destructive choices.",
            },
            {
              numeral: "IV",
              text: "Choice feminism is not real when it feeds the system that oppresses you.",
            },
          ]}
          foot="The next one is argued in Bangalore."
        />
      ),
    },
    {
      label: "6. The Spine",
      hasImage: true,
      render: () => (
        <Spine
          art={{ src: augustine, position: "62% 46%" }}
          line={
            <>
              Hold the page.
              <br />
              Not the position.
            </>
          }
        />
      ),
    },
  ],
};

export default work;
