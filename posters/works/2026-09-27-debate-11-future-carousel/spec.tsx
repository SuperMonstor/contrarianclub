import type { WorkSpec } from "../../src/core/types";
import budapestSrc from "./assets/budapest.jpg";
import churchstreetSrc from "./assets/churchstreet.jpg";
import collectorsSrc from "./assets/collectors.jpg";
import gatewaySrc from "./assets/gateway.jpg";
import mehndiSrc from "./assets/mehndi.jpg";
import moscowSrc from "./assets/moscow.jpg";
import seoulSrc from "./assets/seoul.jpg";
import { Beat, Hook, Motion, type Plate, Strike } from "./slides";

// Debate Club #11, Sunday 27 September, Big Pitcher. The carousel for the
// second motion, the pair of works/2026-09-27-debate-11-image-carousel. The
// poster is works/2026-09-27-debate-11-what-you-owe.
//
// The motion is printed on slide 8 with everything after "This Club Would"
// struck out, and it is read out in the room on the day. In full:
//
//   This Club Would Impose a Higher Income Tax on Adults Who Voluntarily
//   Choose to Remain Childfree.
//
// The design reasoning is in slides.tsx.
//
// ---------------------------------------------------------------------------
// The clippings. Every one is real, quoted exactly, and sourced under the
// rule. Sridhar Vembu is a public figure posting publicly and keeps his name.
// The reply on slide 6 is from a private person: the name is struck out, and
// the struck text in this file is a placeholder, so it is not in the repo.
//
//   slide 2  National Herald headline, 10 Jun 2025
//   slide 3  @svembu on X, 19 Nov 2025             x.com/svembu/status/
//                                                  1990977698735476962; the
//                                                  post continues past the
//                                                  second sentence, marked
//                                                  with an ellipsis
//            Business Today headline, 1 Dec 2024
//   slide 4  The Moscow Times headline, 12 Nov 2024
//            Euronews headline, 2 Dec 2025
//   slide 6  "It's not a demographic crisis..."    a reply to @svembu, quoted
//                                                  by The Federal, Nov 2025
//
// The facts in the copy:
//
//   India 1.9 children per woman, nearly five    UNFPA, State of World
//   in 1970; the cost barriers                   Population 2025
//   Bhagwat, at least three children             Nagpur, 1 Dec 2024
//   Soviet childlessness tax, 6%, 1941 to 1990   standard histories
//   Russia bans "childfree propaganda", 2024     Moscow Times, RFE/RL
//   China 13% VAT on contraceptives from         Euronews
//   1 Jan 2026
//   Hungary: mothers of two under 40 exempt      Hungarian personal income
//   from income tax from 1 Jan 2026, for life    tax law, via WTS Klient
//   from 2029
//   South Korea: over 280 trillion won in 16     Al Jazeera, Feb 2025
//   years; 0.72 in 2023, the lowest recorded
//
// ---------------------------------------------------------------------------
// The pictures. The painting is public domain. The photographs are free
// licensed from Wikimedia Commons and each is credited on its own slide, as
// its licence requires; "toned" marks that it has been cropped and colour
// treated. None shows an identifiable private person.
//
//   collectors    Reymerswaele, The Tax Collectors. The same file as the
//                 poster's second panel.
//   gateway       The crowd at the Gateway of India, Mumbai. Sameer05,
//                 CC BY-SA 3.0.
//   mehndi        Mehendi on a bride's hands. An4shubam, CC BY-SA 4.0.
//   moscow        A Soviet-era apartment block in Moscow, in winter. Artyom
//                 Svetlov, CC BY 4.0.
//   budapest      The Hungarian Parliament at night. Pierre Blaché, CC0.
//   seoul         Apartment blocks to the horizon, Nowon-gu, Seoul.
//                 Ox1997cow, CC BY-SA 3.0.
//   churchstreet  Church Street, Bengaluru, on an ordinary afternoon.
//                 T. R. Shankar Raman, CC BY-SA 4.0.

const collectors: Plate = {
  src: collectorsSrc,
  ratio: 3226 / 4000,
  art: "fc-art",
  credit: "Marinus van Reymerswaele, The Tax Collectors, first half of the 16th century.",
};
const collectorsDusk: Plate = { ...collectors, art: "fc-art-dusk" };
const gateway: Plate = {
  src: gatewaySrc,
  ratio: 2600 / 1461,
  art: "fc-photo",
  credit: "Photo: Sameer05, CC BY-SA 3.0, toned. Gateway of India, Mumbai.",
};
const mehndi: Plate = {
  src: mehndiSrc,
  ratio: 2600 / 1722,
  art: "fc-photo",
  credit: "Photo: An4shubam, CC BY-SA 4.0, toned. Bridal mehendi.",
};
const moscow: Plate = {
  src: moscowSrc,
  ratio: 2600 / 1741,
  art: "fc-photo-noon",
  credit: "Photo: Artyom Svetlov, CC BY 4.0, toned. A Soviet-era block, Moscow.",
};
const budapest: Plate = {
  src: budapestSrc,
  ratio: 2600 / 1463,
  art: "fc-photo-night",
  credit: "Photo: Pierre Blaché, CC0. The Hungarian Parliament, Budapest.",
};
const seoul: Plate = {
  src: seoulSrc,
  ratio: 4000 / 1800,
  art: "fc-photo",
  credit: "Photo: Ox1997cow, CC BY-SA 3.0, toned. Nowon-gu, Seoul.",
};
const churchstreet: Plate = {
  src: churchstreetSrc,
  ratio: 2600 / 1950,
  art: "fc-photo",
  credit: "Photo: T. R. Shankar Raman, CC BY-SA 4.0, toned. Church Street, Bengaluru.",
};

const OF = 8;

// Everything after the club's opening words, struck out word by word. Each bar
// is as long as the word it hides, so the sentence keeps its real shape and
// gives away nothing else.
const HIDDEN = [
  "Impose",
  "a",
  "Higher",
  "Income",
  "Tax",
  "on",
  "Adults",
  "Who",
  "Voluntarily",
  "Choose",
  "to",
  "Remain",
  "Childfree.",
];

const work: WorkSpec = {
  title: "Debate Club #11, motion two",
  date: "2026-09-27",
  formats: ["carousel-slide"],

  slides: [
    // 1. The hook, on the poster's tax collectors.
    {
      label: "Hook",
      hasImage: true,
      render: () => (
        <Hook
          plate={collectors}
          crop={{ x: 0.56, y: 0.52, scale: 1.12 }}
          label="Debate Club #11, Motion 2"
          question={["Should you", "pay more", "tax for", "not having", "kids?"]}
          size={172}
        />
      ),
    },

    // 2. The number, over the most crowded country on earth.
    {
      label: "The number",
      hasImage: true,
      render: () => (
        <Beat
          plate={gateway}
          crop={{ x: 0.3, y: 0.5, scale: 2.3 }}
          n={2}
          of={OF}
          clipping={{
            kind: "headline",
            item: {
              masthead: "National Herald",
              headline:
                "India’s fertility rate fell; now focus on citizens realising reproductive goals: UNFPA",
              date: "10 June 2025",
            },
            width: 700,
          }}
          lines={[
            "The most populous country on earth has a new worry: not enough babies.",
            "",
            {
              text: "The average Indian woman now has 1.9 children, below the 2.1 a population needs to replace itself. In 1970 it was nearly five.",
              size: 36,
              tone: "parchment",
            },
          ]}
          size={40}
          source="UNFPA, State of World Population 2025."
        />
      ),
    },

    // 3. The pressure, in the words of the people applying it.
    {
      label: "The pressure",
      hasImage: true,
      render: () => (
        <Beat
          plate={mehndi}
          crop={{ x: 0.42, y: 0.5, scale: 1.95 }}
          n={3}
          of={OF}
          clipping={{
            kind: "stack",
            items: [
              {
                post: {
                  platform: "X",
                  who: { kind: "official", name: "Sridhar Vembu", handle: "@svembu" },
                  text: "I advise young entrepreneurs I meet, both men and women, to marry and have kids in their 20s and not keep postponing it. I tell them they have to do their demographic duty to society and their own ancestors. …",
                  date: "19 November 2025",
                },
                size: 23,
              },
              {
                headline: {
                  masthead: "Business Today",
                  headline:
                    "RSS chief Mohan Bhagwat’s big claim: Society will perish if population growth rate goes below 2.1",
                  date: "1 December 2024",
                },
                width: 720,
              },
            ],
          }}
          lines={[
            "And the people in charge have noticed. The head of the RSS wants every couple to have at least three.",
            "",
            {
              text: "Zoho’s founder tells young entrepreneurs to marry in their twenties and do their “demographic duty.”",
              tone: "parchment",
            },
          ]}
          size={36}
          source="Business Today, 1 December 2024. Post: @svembu on X, 19 November 2025."
        />
      ),
    },

    // 4. It has been done, and it is being done.
    {
      label: "Gone further",
      hasImage: true,
      render: () => (
        <Beat
          plate={moscow}
          crop={{ x: 0.4, y: 0.5, scale: 1.9 }}
          n={4}
          of={OF}
          clipping={{
            kind: "stack",
            items: [
              {
                headline: {
                  masthead: "The Moscow Times",
                  headline: "Russian Lawmakers Pass Bill Banning ‘Childfree Propaganda’",
                  date: "12 November 2024",
                },
                width: 660,
              },
              {
                headline: {
                  masthead: "Euronews",
                  headline:
                    "China to tax condoms for first time in 30 years as demographic crisis deepens",
                  date: "2 December 2025",
                },
                width: 700,
              },
            ],
          }}
          lines={[
            "Other countries have gone further. The Soviet Union charged childless adults an extra 6% income tax for half a century.",
            "",
            {
              text: "In 2024, Russia made it illegal to even promote a childfree life. This January, China started taxing condoms.",
              tone: "parchment",
            },
          ]}
          size={36}
          source="The Moscow Times, 12 November 2024. Euronews, 2 December 2025."
        />
      ),
    },

    // 5. The case for it, put fairly. Opens on the argument at the head, with
    //    the parliament that already does a version of it in the middle.
    {
      label: "The argument",
      hasImage: true,
      render: () => (
        <Beat
          plate={budapest}
          crop={{ x: 0.5, y: 0.5, scale: 2.2 }}
          n={5}
          of={OF}
          head={[
            "The argument goes like this: your pension will be paid by other people’s children. If you choose not to raise any, why shouldn’t you pay a little more?",
          ]}
          headSize={42}
          lines={[
            {
              text: "Hungary already does a version of it. This year, mothers of two under 40 stopped paying income tax. Everyone else picks up the difference.",
              tone: "parchment",
            },
          ]}
          size={36}
          source="Hungary: income tax exemption for mothers of two, from 1 January 2026; for life from 2029."
        />
      ),
    },

    // 6. Is it worth it. The reply pinned top right, over the apartment
    //    blocks; the talking at the foot.
    {
      label: "Would it work",
      hasImage: true,
      render: () => (
        <Beat
          plate={seoul}
          crop={{ x: 0.4, y: 0.5, scale: 2.8 }}
          n={6}
          of={OF}
          clipping={{
            kind: "posts",
            posts: [
              {
                platform: "X",
                who: { kind: "private", name: "Account name", handle: "@account_handle" },
                text: "It\u2019s not a demographic crisis. It\u2019s an economic one. Fix that, and hands will rise on their own.",
                date: "November 2025",
              },
            ],
            size: 28,
            width: 700,
          }}
          clippingAlign="right"
          lines={[
            "But would it even work? South Korea spent more than 280 trillion won in 16 years trying to get people to have kids. In 2023 its birth rate hit 0.72, the lowest ever recorded.",
            "",
            {
              text: "And when Indians say what stops them having the children they want, it isn\u2019t tax. It\u2019s money, rent, jobs and childcare.",
              tone: "parchment",
            },
          ]}
          size={34}
          source="Al Jazeera, February 2025. UNFPA, 2025. Reply to @svembu, via The Federal."
        />
      ),
    },

    // 7. Is it fair: an ordinary afternoon in the audience's own city. The
    //    talking sits at the head so the street itself shows below it.
    {
      label: "Is it fair",
      hasImage: true,
      render: () => (
        <Beat
          plate={churchstreet}
          crop={{ x: 0.75, y: 0.9, scale: 2.0 }}
          n={7}
          of={OF}
          head={[
            { text: "And even if it would work, is it fair?", size: 46, tone: "gold" },
            "",
            {
              text: "That\u2019s what we\u2019re debating this Sunday. Should the state charge you for a choice about your own life? Or is not having kids a choice everyone else ends up paying for?",
              size: 36,
            },
          ]}
          lines={[]}
        />
      ),
    },

    // 8. The motion, struck out.
    {
      label: "The motion",
      hasImage: true,
      render: () => (
        <Motion
          plate={collectorsDusk}
          crop={{ x: 0.55, y: 0.36, scale: 1.2 }}
          label="Motion 2"
          motion={
            <>
              This Club Would{" "}
              {HIDDEN.map((word) => (
                <span key={word}>
                  <Strike tone="ivory">{word}</Strike>{" "}
                </span>
              ))}
            </>
          }
          notice="Read out in the room on Sunday. Nobody sees it before then."
          details={["Sunday, 27 September", "2 to 5 pm", "Big Pitcher, Indiranagar"]}
          lines={[
            "Debaters drawn at random.",
            "The floor opens to everyone.",
            "Limited seats, so everyone speaks.",
          ]}
          cta={["Tickets out now", "Link in bio"]}
        />
      ),
    },
  ],
};

export default work;
