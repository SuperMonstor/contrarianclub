// Everything that is true of this motion and no other. Both sheets in this
// folder are built from it, so the motion is worded in exactly one place.

const DEBATE = {
  number: "Debate Club #10",
  when: "Motion one of two",

  // The ritual lead-in, set smaller above the claim. Leave it out and the
  // motion starts at full size.
  formula: "This House Believes that",

  // The claim itself, worded exactly as it will be read out. This is what the
  // room votes on, so it carries the page. <br> only to stop an ugly break.
  motion: "Bengaluru needs to burst its tech bubble",

  // The two ends of the seven point scale, in the audience's words.
  poleAgainst: "Keep it growing",
  poleFor: "Give the city room",

  // Defined so that neither side would object to the wording. A loaded
  // definition decides the motion before anyone speaks.
  terms: [
    ["Tech bubble",
     "The concentration of technology companies, jobs and investment in Bengaluru, and the cycle by which each attracts more workers and more growth."],
    ["Burst",
     "Deliberately slow future growth by directing new offices and jobs elsewhere, and encouraging companies to distribute operations beyond Bengaluru. Existing companies would not be forced to close, and current residents would not be asked to leave."],
  ],

  // Name the common ground first, then the one question the evening turns on.
  agreed: "Bengaluru's technology economy has created jobs, wealth and opportunity, while its infrastructure has failed to keep pace. Slowing it would mean fewer job opportunities, lower salaries and less investment, at least in the short term.",
  split: "Should Bengaluru accept fewer jobs and lower salaries to slow its tech bubble and reduce traffic, rents and pressure on infrastructure, or do the benefits of continued concentration justify keeping it growing?",

  // Where each bench starts. Optional: delete the key and the block does not
  // draw.
  benches: [
    ["For the motion", "Even if repairs begin now, continued growth will add demand faster than the city can recover. Bengaluru should accept fewer jobs and lower salaries to reduce traffic and rents, and buy breathing room."],
    ["Against", "Continued concentration creates opportunity, investment and resources. Slowing it means fewer jobs and lower salaries without guaranteeing that traffic, rents or infrastructure improve."],
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
