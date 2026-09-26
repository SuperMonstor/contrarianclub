// Everything that is true of this motion and no other. Both sheets in this
// folder are built from it, so the motion is worded in exactly one place.

const DEBATE = {
  number: "Debate Club #11",
  when: "Motion one of two",

  // The ritual lead-in, set smaller above the claim. Leave it out and the
  // motion starts at full size.
  formula: "This Club Believes that",

  // The claim itself, worded exactly as it will be read out. This is what the
  // room votes on, so it carries the page. <br> only to stop an ugly break.
  motion: "Indians should sacrifice public festival celebrations abroad to protect India’s global image",

  // The two ends of the seven point scale, in the audience's words.
  poleAgainst: "Celebrate in public",
  poleFor: "Hold back",

  // Defined so that neither side would object to the wording. A loaded
  // definition decides the motion before anyone speaks.
  terms: [
    ["Public festival celebrations",
     "Celebrations held in shared public space: processions, immersions in rivers, fireworks in the street, stages in squares. Not worship at home or inside a temple."],
    ["Sacrifice",
     "To give up willingly. The motion asks Indians abroad to choose restraint. It does not ask any host country to ban anything."],
    ["India’s global image",
     "How India and Indians are seen abroad by people who have never been there: in the press, online, and in politics, including debates about visas and immigration."],
  ],

  // Name the common ground first, then the one question the evening turns on.
  agreed: "Clips of Indian festivals abroad travel fast, some draw real complaints about noise, litter or safety, and the backlash online has grown. Nobody argues the host country’s laws should be ignored.",
  split: "Do Indians abroad owe it to the country to stop celebrating in public, or does asking them to hide do more harm to India’s image, and to them?",

  // Where each bench starts. Optional: delete the key and the block does not
  // draw.
  benches: [
    ["For the motion", "A few viral clips shape how millions see Indians, and those views turn into votes and visa rules. Taking the festival indoors is a small price for everyone who carries the passport."],
    ["Against", "Other communities celebrate in public too. The image problem is prejudice, and hiding feeds it. Indians abroad owe their neighbours good manners, not their festivals."],
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
