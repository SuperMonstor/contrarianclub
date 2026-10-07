import type { WorkSpec } from "../../src/core/types";
import schoolSrc from "./assets/school.jpg";
import settlementSrc from "./assets/settlement.jpg";
import { type Plate, Poster } from "./slides";

// Debate Club #12. One poster, themes only. The motions are held back until
// the room, and the date, venue and tickets are left off on purpose: this
// piece announces what the night is about and nothing else.
//
// The two subjects are the education system and government schools, and the
// legal dynamics of relationships. The reasoning behind the composition is in
// slides.tsx.

const school: Plate = {
  src: schoolSrc,
  ratio: 3000 / 2275,
  art: "ws-art-school",
};

const settlement: Plate = {
  src: settlementSrc,
  ratio: 3000 / 2280,
  art: "ws-art-settlement",
};

const work: WorkSpec = {
  title: "Debate Club #12, where does the state belong",
  date: "2026-10-07",
  formats: ["ig-portrait", "ig-story"],

  slides: [
    {
      label: "Poster",
      hasImage: true,
      render: ({ format }) => (
        <Poster
          format={format}
          copy={{
            edition: "Debate Club #12",
            themeLabel: "Theme",
            theme: ["Where does the", "state belong?"],
            rooms: [
              {
                label: "In the classroom",
                plate: school,
                // the schoolmaster with his quill, the girl at the desk, and
                // the boy asleep on the floor in front of them
                crop: {
                  portrait: { x: 0.5, y: 0.58, scale: 1.45 },
                  story: { x: 0.5, y: 0.6, scale: 1.7 },
                },
              },
              {
                label: "Between two people",
                plate: settlement,
                // the couple back to back, the lawyer leaning in, and the
                // father with the contract
                crop: {
                  portrait: { x: 0.36, y: 0.58, scale: 1.5 },
                  story: { x: 0.36, y: 0.64, scale: 1.75 },
                },
              },
            ],
            notice: "Motions revealed on the day",
            lines: [
              "Debaters drawn at random.",
              "The floor opens to everyone.",
              "Limited seats, so everyone speaks.",
            ],
          }}
        />
      ),
    },
  ],
};

export default work;
