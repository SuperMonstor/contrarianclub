import type { WorkSpec } from "../../src/core/types";
import classroomSrc from "./assets/classroom.jpg";
import jantarMantarSrc from "./assets/jantar-mantar.jpg";
import mealSrc from "./assets/meal.jpg";
import odishaSrc from "./assets/odisha.jpg";
import posterSrc from "./assets/poster.jpg";
import punjabSrc from "./assets/punjab.jpg";
import rajasthanSrc from "./assets/rajasthan.jpg";
import roomSrc from "./assets/room.jpg";
import tamilNaduSrc from "./assets/tamil-nadu.jpg";
import { Beat, Hook, Motion, Poster, type Plate } from "./slides";

// Debate Club #12, the Indian education system. The carousel for the motion:
//
//   This Club Would end government-run schooling
//
// As the club defines it: the government still pays where it must and still
// sets and enforces standards, but owns and runs no school. Government
// schools are the ones it owns and staffs; aided schools are already
// privately run and are not included.
//
// The design reasoning is in slides.tsx.
//
// ---------------------------------------------------------------------------
// The facts in the copy, checked on 10 October 2026:
//
//   slide 2  CJP's Fix the Schools campaign,     Outlook and ETV Bharat, 11 Aug
//            launched 15 August 2026: water and  2026. The checklist is CJP's
//            toilets, electricity and            own four points.
//            classrooms, boundary walls and
//            safety, midday meals and teacher
//            attendance
//   slide 3  buildings and teachers up, yet      Muralidharan, Das, Holla and
//            nearly a quarter of teachers        Mohpal, Journal of Public
//            absent on surprise visits           Economics, 2017: 23.6% of
//                                                rural government school
//                                                teachers absent on
//                                                unannounced visits (surveys
//                                                of 2010), despite large gains
//                                                in infrastructure and
//                                                pupil-teacher ratios
//            fewer than one in four Class 3      ASER 2024: 23.4% of Std III
//            children in government schools can  children in government
//            read a Class 2 textbook             schools read Std II text
//                                                (35.5% in private schools)
//   slide 5  Andhra Pradesh vouchers: private    Muralidharan and Sundararaman,
//            schools matched government results  QJE 2015: no difference in
//            at under a third of the cost        Telugu or maths, slightly
//                                                higher across all subjects;
//                                                mean cost per pupil under a
//                                                third of government schools'
//
//   slide 8  the guest: a Congress spokesperson    South Matters, 13 Sep 2026:
//            building a platform to report         Dhruv Jatti, Congress
//            broken government schools in          spokesperson, founded
//            Karnataka                             NammaShale; 607 citizen
//                                                  reports from 26 districts.
//            a state his own party runs            Congress has governed
//                                                  Karnataka since May 2023 (CM
//                                                  D. K. Shivakumar since June
//                                                  2026).
//
// The guest is described, not named, on purpose. Slides 4 and 6 are the
// club's argument and the opposition's, and cite nothing.
//
// ---------------------------------------------------------------------------
// The pictures. Free licensed from Wikimedia Commons and credited on their
// own slides, as the licences require; "toned" marks a crop and a colour
// treatment. The room is the club's own photograph.
//
//   classroom      An empty classroom. Muzammil, CC BY-SA 4.0. The file does
//                  not say where it was taken, so the credit names no place.
//   jantar-mantar  CJP's protest site at Jantar Mantar, Delhi, 21 July 2026
//                  (NPR and Al Jazeera, 21 July 2026, place the CJP site
//                  there that day). Alnitak-Alnilam-Mintaka, CC BY-SA 4.0.
//   rajasthan      Government Primary School, Janiyon ka Magra, Rajasthan.
//                  JaniyonKaMagraEditor, CC BY 4.0.
//   punjab         Government primary school, Kaire, Punjab. Tulspal, CC
//                  BY-SA 4.0.
//   tamil-nadu     A government school in Kanchipuram district, Tamil Nadu.
//                  McKay Savage, CC BY 2.0.
//   meal           Midday meal at a government school. Archies2804, CC BY-SA
//                  4.0.
//   odisha         Government Upper Primary School, Rejingtal, Odisha.
//                  Subhashish Panigrahi, CC BY-SA 4.0.
//   room           Debate Club #8. The club's own photograph, from
//                  works/2026-08-09-debate-8-recap.
//   poster         The Debate #12 poster, copied from
//                  works/2026-10-07-debate-12-indian-education/out/
//                  ig-portrait.jpg. If that poster is re-exported, copy it
//                  in again.

const classroom: Plate = {
  src: classroomSrc,
  ratio: 960 / 1280,
  art: "gs-photo",
  credit: "Photo: Muzammil, CC BY-SA 4.0, toned. An empty classroom.",
};
const jantarMantar: Plate = {
  src: jantarMantarSrc,
  ratio: 3000 / 1687,
  art: "gs-photo-night",
  credit:
    "Photo: Alnitak-Alnilam-Mintaka, CC BY-SA 4.0, toned. CJP’s protest at Jantar Mantar, Delhi, 21 July 2026.",
};
const rajasthan: Plate = {
  src: rajasthanSrc,
  ratio: 3000 / 2250,
  art: "gs-photo",
  credit:
    "Photo: JaniyonKaMagraEditor, CC BY 4.0, toned. Government Primary School, Janiyon ka Magra, Rajasthan.",
};
const punjab: Plate = {
  src: punjabSrc,
  ratio: 3000 / 2250,
  art: "gs-photo",
  credit: "Photo: Tulspal, CC BY-SA 4.0, toned. Government primary school, Kaire, Punjab.",
};
const tamilNadu: Plate = {
  src: tamilNaduSrc,
  ratio: 3000 / 2250,
  art: "gs-photo",
  credit: "Photo: McKay Savage, CC BY 2.0, toned. A government school in Kanchipuram district, Tamil Nadu.",
};
const meal: Plate = {
  src: mealSrc,
  ratio: 1200 / 1600,
  art: "gs-photo",
  credit: "Photo: Archies2804, CC BY-SA 4.0, toned. Midday meal at a government school.",
};
const odisha: Plate = {
  src: odishaSrc,
  ratio: 3000 / 2250,
  art: "gs-photo-dusk",
  credit:
    "Photo: Subhashish Panigrahi, CC BY-SA 4.0, toned. Government Upper Primary School, Rejingtal, Odisha.",
};
const room: Plate = {
  src: roomSrc,
  ratio: 1500 / 2000,
  art: "gs-photo",
  credit: "Debate Club #8.",
};

const OF = 9;
const EDITION = "Debate Club #12";

const work: WorkSpec = {
  title: "Debate Club #12, government schools carousel",
  date: "2026-10-10",
  formats: ["carousel-slide"],

  slides: [
    {
      label: "1. The claim",
      hasImage: true,
      render: () => (
        <Hook
          plate={classroom}
          crop={{ x: 0.5, y: 0.5, scale: 1 }}
          edition={EDITION}
          hook={["Fixing", "government", "schools won’t", "change a thing."]}
          size={118}
        />
      ),
    },
    {
      label: "2. The news",
      hasImage: true,
      render: () => (
        <Beat
          plate={jantarMantar}
          crop={{ x: 0.62, y: 0.5, scale: 1 }}
          scrim="gs-scrim-head"
          n={2}
          of={OF}
          head={[
            "This August, the Cockroach Janta Party launched a campaign to fix government schools: toilets, drinking water, boundary walls, midday meals, and teachers who actually turn up.",
            "It’s a good list. We just don’t think it will work.",
          ]}
          headSize={40}
          source="Outlook and ETV Bharat, 11 August 2026."
        />
      ),
    },
    {
      label: "3. The record",
      hasImage: true,
      render: () => (
        <Beat
          plate={rajasthan}
          crop={{ x: 0.5, y: 0.55, scale: 2.2 }}
          scrim="gs-scrim-foot"
          n={3}
          of={OF}
          foot={[
            "We’ve tried this before. Government schools have got better buildings and more teachers, yet on surprise visits nearly a quarter of teachers weren’t there.",
            "Today, fewer than one in four Class 3 children in government schools can read a Class 2 textbook.",
          ]}
          footSize={40}
          source="Muralidharan, Das, Holla and Mohpal, Journal of Public Economics, 2017. ASER 2024."
        />
      ),
    },
    {
      label: "4. The diagnosis",
      hasImage: true,
      render: () => (
        <Beat
          plate={punjab}
          crop={{ x: 0.5, y: 0.4, scale: 1.8 }}
          scrim="gs-scrim-head"
          n={4}
          of={OF}
          head={[
            "The problem isn’t toilets. In a government school, the government runs the school and also judges it, so it only ever answers to itself.",
            "When children don’t learn, nobody pays a price.",
          ]}
          headSize={44}
        />
      ),
    },
    {
      label: "5. The proposal",
      hasImage: true,
      render: () => (
        <Beat
          plate={tamilNadu}
          crop={{ x: 0.5, y: 1, scale: 2 }}
          scrim="gs-scrim-foot-deep"
          n={5}
          of={OF}
          foot={[
            "So stop running schools. The government still pays, and still sets and enforces standards, but it owns no school, and parents can take the money elsewhere.",
            "When Andhra Pradesh tried this with vouchers, private schools matched government results at under a third of the cost.",
          ]}
          footSize={38}
          source="Muralidharan and Sundararaman, Quarterly Journal of Economics, 2015."
        />
      ),
    },
    {
      label: "6. The other side",
      hasImage: true,
      render: () => (
        <Beat
          plate={meal}
          crop={{ x: 0.5, y: 0.5, scale: 1 }}
          scrim="gs-scrim-split"
          n={6}
          of={OF}
          head={[
            "But a market only builds where it pays, and parents can only leave if there’s somewhere to go. Private schools can pick the easy kids. Only a government school has to take every child.",
          ]}
          headSize={40}
          foot={[
            {
              text: "So is the system still worth fixing, or does it need tearing down?",
              tone: "gold",
            },
          ]}
          footSize={50}
        />
      ),
    },
    {
      label: "7. The motion",
      hasImage: true,
      render: () => (
        <Motion
          plate={odisha}
          crop={{ x: 0.45, y: 0.5, scale: 1 }}
          edition={EDITION}
          label="The motion"
          motion="This Club Would end government-run schooling"
        />
      ),
    },
    {
      label: "8. The guest",
      hasImage: true,
      render: () => (
        <Beat
          plate={room}
          crop={{ x: 0.5, y: 0.5, scale: 1 }}
          scrim="gs-scrim-foot"
          n={8}
          of={OF}
          edition={EDITION}
          foot={[
            "And this time, there’s a twist. Our guest is a Congress spokesperson who is building a platform for anyone to report a broken government school in Karnataka, a state his own party runs. He’ll explain what’s really going on inside these schools, then take on the room.",
            {
              text: "Bring your toughest questions. You can challenge his ideas and policies directly.",
              tone: "gold",
            },
            { text: "A first of its kind in Bangalore.", tone: "parchment", size: 30 },
          ]}
          footSize={38}
          source="South Matters, 13 September 2026."
        />
      ),
    },
    {
      label: "9. The way in",
      hasImage: true,
      render: () => <Poster src={posterSrc} />,
    },
  ],
};

export default work;
