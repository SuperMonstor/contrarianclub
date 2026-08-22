// Everything that is true of this motion and no other. Both sheets in this
// folder are built from it, so the motion is worded in exactly one place.

const DEBATE = {
  number: "Debate Club #9",
  when: "Motion one of two",

  // The ritual lead-in, set smaller above the claim. Leave it out and the
  // motion starts at full size.
  formula: "This House Believes that",

  // The claim itself, worded exactly as it will be read out. This is what the
  // room votes on, so it carries the page. <br> only to stop an ugly break.
  motion: "India should move from a culture of familial obligation towards one of individual autonomy",

  // The two ends of the seven point scale, in the audience's words.
  poleAgainst: "The family decides",
  poleFor: "You decide",

  // Defined so that neither side would object to the wording. A loaded
  // definition decides the motion before anyone speaks.
  terms: [
    ["Familial obligation",
     "The social, cultural and moral expectation that you put your family's needs and expectations first in an important decision. Care of parents, money, marriage, career, the family's name."],
    ["Individual autonomy",
     "The freedom to make those same decisions by your own values and aspirations, without undue outside pressure. Career, partner, where you live, what you believe, what you do with your money."],
    ["Move towards",
     "A shift in the balance, not a replacement. Nobody is proposing that family stops mattering. The motion asks which way the weight should sit."],
  ],

  // Name the common ground first, then the one question the evening turns on.
  agreed: "Family matters, and so does the freedom to choose your own life. Neither side is arguing to abolish either, and both accept that every culture strikes some balance between them.",
  split: "Is the balance India strikes about right, or does it weigh family so heavily that individuals pay for it in the lives they end up living?",

  // Where each bench starts. Optional: delete the key and the block does not
  // draw.
  benches: [
    ["For the motion", "The weight sits too far on the family. People pay for it in careers, partners and cities they did not choose, and the culture should move."],
    ["Against", "The balance is not broken. Obligation is what makes families hold, and moving towards autonomy trades real security for individual preference."],
  ],

  // What a speaker is actually being asked to do, in the order they do it.
  how: [
    ["Before you speak",
     "Write your four or five strongest points on the front, one line each. Not a speech, just what will remind you of one."],
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

  points: 5,   // writing blocks on the front
  rows: [["Round one", 3], ["Round two", 3]],   // rebuttal rows, per round
};
