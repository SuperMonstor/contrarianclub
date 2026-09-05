// Everything that is true of this motion and no other. Both sheets in this
// folder are built from it, so the motion is worded in exactly one place.

const DEBATE = {
  number: "Debate Club #10",
  when: "Motion one of two",

  // The ritual lead-in, set smaller above the claim. Leave it out and the
  // motion starts at full size.
  formula: "This Club Believes that",

  // The claim itself, worded exactly as it will be read out. This is what the
  // room votes on, so it carries the page. <br> only to stop an ugly break.
  motion: "Bengaluru needs to burst its tech bubble",

  // The two ends of the seven point scale, in the audience's words.
  poleAgainst: "Build up to it",
  poleFor: "Let the air out",

  // Defined so that neither side would object to the wording. A loaded
  // definition decides the motion before anyone speaks.
  terms: [
    ["Tech bubble",
     "What forms when investment floods tech companies and startups and pushes salaries far past what the city used to pay. Those salaries reset the rest: rents climb, travel and daily costs follow, and buying property moves out of reach."],
    ["Burst",
     "To deliberately shrink it rather than wait for it to deflate on its own. Take it as given that the government has the means: tonight is not about whether it can be done, or how, but whether it should be."],
    ["Needs to",
     "The motion asserts necessity. Nothing here grants it. What the room is judging is whether bursting would leave the city and the people in it better off, or worse."],
  ],

  // Name the common ground first, then the one question the evening turns on.
  agreed: "Both sides accept that the economy has grown faster than the city can keep up with. Traffic that does not move, water that runs out, and a cost of living climbing faster than most pay. Nobody argues this is fine.",
  split: "Whether the answer is to slow that growth and push it to other cities, buying time to fix water, roads and housing, at the cost of the wages and opportunities people here live on.",

  // Where each bench starts. Optional: delete the key and the block does not
  // draw.
  benches: [
    ["For the motion", "Slow the growth and send it elsewhere, and the city buys time to fix water, roads and housing. Wages and opportunities fall, but the people who stay get somewhere liveable."],
    ["Against", "The people already here pay for it, in what they earn and in what they can build. Firms lose the clients that kept them, drivers lose their riders, founders lose their funding, and salaries fall with all of it."],
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
