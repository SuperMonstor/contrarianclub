// Everything that is true of this motion and no other. Both sheets in this
// folder are built from it, so the motion is worded in exactly one place.

const DEBATE = {
  number: "Debate Club #10",
  when: "Motion two of two",

  // The ritual lead-in, set smaller above the claim. Leave it out and the
  // motion starts at full size.
  formula: "This Club Believes that",

  // The claim itself, worded exactly as it will be read out. This is what the
  // room votes on, so it carries the page. <br> only to stop an ugly break.
  motion: "Migrants to Bengaluru have the right to reshape the city's culture, rather than merely adapt to it",

  // The two ends of the seven point scale, in the audience's words.
  poleAgainst: "Adapt to it",
  poleFor: "Reshape it",

  // Defined so that neither side would object to the wording. A loaded
  // definition decides the motion before anyone speaks.
  terms: [
    ["Migrants",
     "Anyone who moved here and lives here now, from another state or another country, last year or thirty years ago. Not a legal category, and not about any one region."],
    ["The city's culture",
     "The lived, shared things: the language on the street and in shops, food, festivals, how neighbours behave, and what the city expects of people in it. Not official policy."],
    ["The right to reshape",
     "To change what the culture is by living in it, as of right, rather than only fitting into it. That includes not taking up what is here. Entitlement, not prediction: the city changes either way."],
  ],

  // Name the common ground first, then the one question the evening turns on.
  agreed: "Bengaluru accommodates people who move here more than most Indian cities do: you can live and work here for years without Kannada and manage. A Bengalurean moving elsewhere could not expect the same.",
  split: "Does paying into a city entitle you to live in it by your own norms, or does joining a place oblige you to meet it on its terms?",

  // Where each bench starts. Optional: delete the key and the block does not
  // draw.
  benches: [
    ["For the motion", "You do not check your language and habits at the city limit. People work here, pay for it and raise families here, and belonging cannot be made conditional on giving up what you brought."],
    ["Against", "What the city extends to newcomers is a courtesy, not something they are owed. Joining a place carries an obligation to meet it partway, and a city where only one side ever bends is not shared either."],
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
