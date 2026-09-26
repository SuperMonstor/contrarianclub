// Everything that is true of this motion and no other. Both sheets in this
// folder are built from it, so the motion is worded in exactly one place.

const DEBATE = {
  number: "Debate Club #11",
  when: "Motion two of two",

  // The ritual lead-in, set smaller above the claim. Leave it out and the
  // motion starts at full size.
  formula: "This Club Would",

  // The claim itself, worded exactly as it will be read out. This is what the
  // room votes on, so it carries the page. <br> only to stop an ugly break.
  motion: "make eligibility for the legal and financial benefits of marriage conditional on having a child within five years of marriage",

  // The two ends of the seven point scale, in the audience's words.
  poleAgainst: "As it is",
  poleFor: "Tie to children",

  // Defined so that neither side would object to the wording. A loaded
  // definition decides the motion before anyone speaks.
  terms: [
    ["Legal and financial benefits",
     "What the state gives spouses and not unmarried partners: inheritance without a will, a family pension, tax free gifts, maintenance, spousal visas."],
    ["Having a child",
     "By birth or by adoption. An adopted child counts."],
    ["Within five years",
     "Counted from the wedding. A couple without a child by then stays married and lives as it likes. Only the benefits are at stake."],
  ],

  // Name the common ground first, then the one question the evening turns on.
  agreed: "India’s birth rate is below replacement, and the state already treats married couples differently from everyone else. Nobody wants the state ending marriages.",
  split: "Where does a marriage get its value: the bond between two people, or raising the next generation?",

  // Where each bench starts. Optional: delete the key and the block does not
  // draw.
  benches: [
    ["For the motion", "The state backs marriage because families raise the next generation. Benefits for couples who don’t raise one are a subsidy with no return."],
    ["Against", "The benefits protect the partner, not the children. That promise is worth the same without a child, and a five year clock punishes infertility and marrying late."],
  ],

  // What a speaker is actually being asked to do, in the order they do it.
  how: [
    ["Before you speak",
     "Write your four strongest points on the front, one line each. Not a speech, just what will remind you of one."],
    ["On stage",
     "Take them one at a time and elaborate. A couple of minutes, so roughly thirty seconds a point."],
    ["In the rebuttal",
     "Write down the claim the other side actually made, then answer that one, not the one you wish they had made."],
  ],

  // The night runs the same cycle twice. Beats marked true get a rule to
  // write the speaker's name on.
  rounds: [
    ["Round one", [["Speech, for", true], ["Speech, against", true], ["Rebuttals", false], ["Open floor", false]]],
    ["Round two", [["Speech, for", true], ["Speech, against", true], ["Rebuttals", false], ["Open floor", false]]],
  ],

  afterOrder: "The room votes before the first speech and again after the last. Anyone may take an open floor, drawn or not.",

  points: 4,   // writing blocks on the front
  rows: [["Round one", 3], ["Round two", 3]],   // rebuttal rows, per round
};
