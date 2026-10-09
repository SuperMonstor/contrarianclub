import type { WorkSpec } from "../../src/core/types";
import schoolSrc from "./assets/school.jpg";
import villageSchoolSrc from "./assets/village-school.jpg";
import { type Plate, Poster } from "./slides";

// Debate Club #12. One poster, theme only. The motions are held back until
// the room, and the date, venue and tickets are left off on purpose: this
// piece announces what the night is about and nothing else.
//
// The theme, in the club's words: the Indian education system. The reasoning
// behind the composition is in slides.tsx.

const school: Plate = {
  src: schoolSrc,
  ratio: 3000 / 2275,
  art: "ie-art-school",
};

const villageSchool: Plate = {
  src: villageSchoolSrc,
  ratio: 3072 / 1831,
  art: "ie-art-village",
};

const work: WorkSpec = {
  title: "Debate Club #12, the Indian education system",
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
            theme: ["The Indian", "education system."],
            rooms: [
              {
                plate: school,
                // the schoolmaster with his quill, the girl at the desk, and
                // the boy asleep at the bench
                crop: {
                  portrait: { x: 0.5, y: 0.58, scale: 1.45 },
                  story: { x: 0.5, y: 0.6, scale: 1.7 },
                },
              },
              {
                plate: villageSchool,
                // the story has room for the whole room: the teacher and his
                // pointer on the left, the packed benches and raised hands
                // across the rest. The portrait band is too short to show his
                // head clear of the theme, so it keeps to the benches.
                crop: {
                  portrait: { x: 0.66, y: 0.42, scale: 1.6 },
                  story: { x: 0.48, y: 0.55, scale: 1.5 },
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
