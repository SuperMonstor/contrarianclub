import type { WorkSpec } from "../../src/core/types";
import grossSrc from "./assets/gross.jpg";
import superhealthSrc from "./assets/superhealth-white.svg";
import { Poster, type Copy } from "./slides";

// Debate Club #14, with Superhealth. The motion, as the club wrote it:
//
//   TCBT for-profit hospitals can never put patients first
//
// printed with TCBT spelled out, as on every published motion. Varun Dubey,
// Superhealth's CEO, argues against it. The design reasoning is in
// slides.tsx; the open questions are in copy.md.
//
// The wordmark is Superhealth's own white cut, from
// https://www.superhealth.co.in/images/superhealth-white.svg, untouched.

const copy: Copy = {
  edition: "Debate Club #14",
  partner: { src: superhealthSrc, ratio: 162 / 18, name: "Superhealth" },
  // the motion, verbatim, as the title
  title: {
    lead: "This Club Believes that",
    lines: ["for-profit hospitals", "can never put", "patients first."],
  },
  guest: {
    label: "Against the motion",
    lines: ["Varun Dubey, CEO of Superhealth,", "formerly Chief Revenue Officer", "at Apollo Hospitals."],
  },
  art: {
    src: grossSrc,
    ratio: 2902 / 3600,
    face: { x: 0.43, y: 0.415 },
    place: {
      portrait: { x: 473, y: 310, w: 1100, clearEnd: 580, darkAt: 720 },
      story: { x: 560, y: 560, w: 1400, clearEnd: 860, darkAt: 1010 },
      square: { x: 464, y: 230, w: 1080, clearEnd: 420, darkAt: 550 },
    },
  },
};

const work: WorkSpec = {
  title: "Debate Club #14, with Superhealth",
  date: "2026-10-27",
  // ig-square is the WhatsApp cut: a portrait image is shown narrow there
  formats: ["ig-portrait", "ig-story", "ig-square"],
  slides: [
    {
      label: "Poster",
      hasImage: true,
      render: ({ format }) => <Poster copy={copy} format={format} />,
    },
  ],
};

export default work;
