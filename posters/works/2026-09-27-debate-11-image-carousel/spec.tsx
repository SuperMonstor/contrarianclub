import type { WorkSpec } from "../../src/core/types";
import belgraveSrc from "./assets/belgrave.jpg";
import carnivalSrc from "./assets/carnival.jpg";
import fireworksSrc from "./assets/fireworks.jpg";
import immersionSrc from "./assets/immersion.jpg";
import memorialSrc from "./assets/memorial.jpg";
import templeSrc from "./assets/temple.jpg";
import trafalgarSrc from "./assets/trafalgar.jpg";
import { Beat, Hook, Motion, type Plate, Strike } from "./slides";

// Debate Club #11, Sunday 27 September, Big Pitcher. The carousel for the
// first motion, to go out a few days before the night. The poster is
// works/2026-09-27-debate-11-what-you-owe.
//
// The motion is printed on slide 8 with its load bearing words struck out.
// It is revealed on the day, or when this post reaches 1,000 likes, whichever
// comes first. If it hits 1,000, somebody has to publish it that day. In full:
//
//   This Club Believes That Indians Should Sacrifice Public Festival
//   Celebrations Abroad To Protect India's Global Image.
//
// The design reasoning is in slides.tsx.
//
// ---------------------------------------------------------------------------
// The posts. Every one is real, quoted exactly, and was found reproduced in
// the press, which is the source printed under the rule. Private people's
// names and handles are struck out, and the struck text in this file is a
// placeholder of about the right length, so their names are not in the repo
// either. The City of Brampton is an official account and keeps its name.
//
//   slide 2  "Civic sense 🥲", "Absolute shame"   replies to the Leicester
//            video, Free Press Journal, 22 Sep 2026
//   slide 3  City of Brampton, @CityBrampton,     x.com/CityBrampton/status/
//            18 Oct 2024                          1847328100054417456; the
//                                                 closing line about 311 is
//                                                 cut, marked with an ellipsis
//   slide 4  "Some places deserve respect..."      The Juggernaut, 10 Mar 2026:
//            a MAGA account, over 5.8m views       the account is not named
//            and 9,700 likes
//   slide 5  "This US Diwali video is viral..."    Siasat, 23 Oct 2025
//            22 Oct 2025
//            "Was this necessary?..." 21 Sep 2025  The News Minute, 26 Sep 2025
//   slide 6  The News Minute headline, 26 Sep 2025
//
// The facts in the copy:
//
//   Leicester visarjan, "Indians call it          Free Press Journal, 22 Sep 2026
//   absolute shame"
//   Brampton fireworks ban, 2022; ~1,490          City of Brampton, via inBrampton
//   complaints 17 to 22 Oct 2025                  (Oct 2025)
//   anti-Indian posts on X nearly tripled         Network Contagion Research
//   in 2025; the memorial dance and visas         Institute, 11 Mar 2026
//
// ---------------------------------------------------------------------------
// The pictures. The paintings are public domain. The photographs are free
// licensed from Wikimedia Commons and each is credited on its own slide, as
// its licence requires; "toned" in the credit marks that it has been cropped
// and colour treated.
//
//   carnival   Bruegel, The Fight Between Carnival and Lent, 1559. The same
//              file as the poster's first panel.
//   immersion  Khairatabad Ganesh lowered into Hussain Sagar, Hyderabad.
//              Kavali Chandrakanth KCK, CC BY-SA 4.0.
//   fireworks  Diwali fireworks in a courtyard between apartment towers,
//              Gurugram. Slyronit, CC BY-SA 4.0.
//   memorial   National World War II Memorial, Washington. Kurt Kaiser, CC0.
//   temple     BAPS Shri Swaminarayan Mandir, Neasden, London. Evka W,
//              CC BY-SA 4.0.
//   belgrave   Belgrave Road, Leicester, lit for Diwali and empty. Matt
//              Preston, CC BY-SA 2.0.
//   trafalgar  Diwali on the Square, Trafalgar Square, London. LBM1948,
//              CC BY-SA 4.0.

const carnival: Plate = {
  src: carnivalSrc,
  ratio: 3000 / 2145,
  art: "ic-art",
  credit: "Pieter Bruegel the Elder, The Fight Between Carnival and Lent, 1559.",
};
const carnivalDusk: Plate = { ...carnival, art: "ic-art-dusk" };
const immersion: Plate = {
  src: immersionSrc,
  ratio: 2117 / 4239,
  art: "ic-photo",
  credit: "Photo: Kavali Chandrakanth KCK, CC BY-SA 4.0, toned. Hussain Sagar, Hyderabad.",
};
const fireworks: Plate = {
  src: fireworksSrc,
  ratio: 2400 / 1666,
  art: "ic-photo-night",
  credit: "Photo: Slyronit, CC BY-SA 4.0, toned. Diwali, Gurugram.",
};
const memorial: Plate = {
  src: memorialSrc,
  ratio: 2400 / 1800,
  art: "ic-photo-noon",
  credit: "Photo: Kurt Kaiser, CC0. National World War II Memorial, Washington.",
};
const temple: Plate = {
  src: templeSrc,
  ratio: 2400 / 1600,
  art: "ic-photo",
  credit: "Photo: Evka W, CC BY-SA 4.0, toned. BAPS Shri Swaminarayan Mandir, Neasden, London.",
};
const belgrave: Plate = {
  src: belgraveSrc,
  ratio: 2400 / 1600,
  art: "ic-photo-night",
  credit: "Photo: Matt Preston, CC BY-SA 2.0, toned. Belgrave Road, Leicester, at Diwali.",
};
const trafalgar: Plate = {
  src: trafalgarSrc,
  ratio: 2400 / 1905,
  art: "ic-photo",
  credit: "Photo: LBM1948, CC BY-SA 4.0, toned. Diwali on the Square, Trafalgar Square, London.",
};

const OF = 8;

const work: WorkSpec = {
  title: "Debate Club #11, motion one",
  date: "2026-09-27",
  formats: ["carousel-slide"],

  slides: [
    // 1. The hook, on the poster's carnival.
    {
      label: "Hook",
      hasImage: true,
      render: () => (
        <Hook
          plate={carnival}
          crop={{ x: 0.4, y: 0.5, scale: 1.9 }}
          label="Debate Club #11 · Motion 1"
          question={["Should Indians", "stop celebrating", "festivals abroad?"]}
          size={104}
        />
      ),
    },

    // 2. It happened. The photograph is the way it happens at home, which is
    //    the whole of the first sentence.
    {
      label: "Leicester",
      hasImage: true,
      render: () => (
        <Beat
          plate={immersion}
          crop={{ x: 0.42, y: 0.5, scale: 1.05 }}
          n={2}
          of={OF}
          clipping={{
            kind: "replies",
            replies: [
              { name: "reply_name", text: "Civic sense 🥲" },
              { name: "another_name", text: "Absolute shame" },
            ],
          }}
          lines={[
            "This month in Leicester, Ganesh Chaturthi ended the way it does back home: idols on boats, out into the water.",
            "",
            {
              text: "Someone filmed it. By the next morning it was a headline in India: “Indians call it absolute shame.”",
              tone: "parchment",
            },
          ]}
          size={38}
          source="Leicester, September 2026. Replies and headline: Free Press Journal, 22 September."
        />
      ),
    },

    // 3. It keeps happening, and a city has already legislated.
    {
      label: "Brampton",
      hasImage: true,
      render: () => (
        <Beat
          plate={fireworks}
          crop={{ x: 0.38, y: 0.5, scale: 2.0 }}
          n={3}
          of={OF}
          clipping={{
            kind: "posts",
            posts: [
              {
                platform: "X",
                who: {
                  kind: "official",
                  name: "City of Brampton",
                  handle: "@CityBrampton",
                  initials: "CB",
                },
                text: "Under the fireworks by-law, fireworks are prohibited in #Brampton, including on Diwali. ✨ ✅ Sparklers are permitted. Penalties for failing to comply range from $500 to $1,000 and may reach up to $100,000 if a court summons is issued. …",
                meta: "18 October 2024",
              },
            ],
          }}
          lines={[
            "And it wasn't the first clip. In Brampton, Diwali got so loud that the city banned fireworks outright.",
            "",
            {
              text: "Last Diwali, it still got nearly 1,500 complaints in six days.",
              size: 36,
              tone: "parchment",
            },
          ]}
          size={38}
          source="City of Brampton, 17 to 22 October 2025."
        />
      ),
    },

    // 4. And it spreads: one couple becomes everyone.
    {
      label: "Washington",
      hasImage: true,
      render: () => (
        <Beat
          plate={memorial}
          crop={{ x: 0.42, y: 0.46, scale: 1.8 }}
          n={4}
          of={OF}
          clipping={{
            kind: "posts",
            posts: [
              {
                platform: "X",
                who: { kind: "private", name: "Account name", handle: "@account_handle" },
                text: "Some places deserve respect, not the IT department making socially awkward TikTok dances. They ALL have to go back.",
                meta: "March 2026 · 5.8M views · 9.7K likes",
              },
            ],
            size: 28,
          }}
          lines={[
            "None of this stays local anymore.",
            "",
            {
              text: "Anti-Indian posts on X nearly tripled last year. One couple dancing at a war memorial in Washington somehow became an argument for cutting Indian visas.",
              tone: "parchment",
            },
          ]}
          size={38}
          source="Network Contagion Research Institute, March 2026. Post: The Juggernaut, 10 March 2026."
        />
      ),
    },

    // 5. The ask, in the voices of the people making it.
    {
      label: "The ask",
      hasImage: true,
      render: () => (
        <Beat
          plate={temple}
          crop={{ x: 0.46, y: 0.3, scale: 1.9 }}
          n={5}
          of={OF}
          clipping={{
            kind: "posts",
            size: 24,
            posts: [
              {
                platform: "X",
                who: { kind: "private", name: "Account name", handle: "@account_handle" },
                text: "This US Diwali video is viral on Instagram. The USA Police & Fire department had to intervene and stop fireworks and just look at the mess on the road And then you cry when you are deported. Is this the image of India & Hindus you are creating in foreign lands?",
                meta: "22 October 2025",
              },
              {
                platform: "X",
                who: { kind: "private", name: "Other name", handle: "@other_handle" },
                text: "Was this necessary? No wonder Indians are being hated by foreigners",
                meta: "21 September 2025",
              },
            ],
          }}
          lines={[
            "So people back home have started asking the diaspora for something.",
            "",
            {
              text: "Take it to the temple, not the street. Skip the fireworks. Don't hand them the video.",
              tone: "parchment",
            },
          ]}
          size={38}
          source="Posts: Siasat, 23 October 2025. The News Minute, 26 September 2025."
        />
      ),
    },

    // 6. Is it worth it: the lights on, and nobody in the street.
    {
      label: "Would it work",
      hasImage: true,
      render: () => (
        <Beat
          plate={belgrave}
          crop={{ x: 0.58, y: 0.42, scale: 2.0 }}
          n={6}
          of={OF}
          clipping={{
            kind: "headline",
            item: {
              masthead: "The News Minute",
              headline: "‘Zero civic sense’ or racism? Unpacking global scrutiny of the Indian diaspora",
              date: "26 September 2025",
            },
          }}
          lines={[
            "But would it even work? If every Indian abroad went quiet tomorrow, would India's image recover?",
            "",
            {
              text: "Or is a quieter Diwali just a band-aid on a much bigger problem?",
              tone: "gold",
            },
          ]}
          size={38}
        />
      ),
    },

    // 7. Is it fair: the festival at its most public, in the middle of London.
    {
      label: "Is it fair",
      hasImage: true,
      render: () => (
        <Beat
          plate={trafalgar}
          crop={{ x: 0.5, y: 0.38, scale: 1.7 }}
          n={7}
          of={OF}
          lines={[
            { text: "And even if it would work, is it fair to ask?", size: 44, tone: "gold" },
            "",
            {
              text: "That's what we're debating this Sunday. Should Indians abroad be asked to hold back their festivals, and should anyone be asking them in the first place?",
              size: 36,
            },
          ]}
        />
      ),
    },

    // 8. The motion, struck out, and the terms on which it is read.
    {
      label: "The motion",
      hasImage: true,
      render: () => (
        <Motion
          plate={carnivalDusk}
          crop={{ x: 0.42, y: 0.36, scale: 1.9 }}
          label="Motion 1"
          motion={
            <>
              This Club Believes That Indians Should <Strike tone="ivory">Sacrifice</Strike> Public
              Festival Celebrations Abroad To <Strike tone="ivory">Protect</Strike> India's{" "}
              <Strike tone="ivory">Global</Strike> <Strike tone="ivory">Image</Strike>.
            </>
          }
          reveal={["Motion revealed on the day, or at 1,000 ", ".", "Whichever comes first."]}
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
