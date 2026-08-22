// Everything that is true of this motion and no other. Both sheets in this
// folder are built from it, so the motion is worded in exactly one place.

const DEBATE = {
  number: "Debate Club #9",
  when: "Motion two of two",

  // The ritual lead-in, set smaller above the claim. Leave it out and the
  // motion starts at full size.
  formula: "This Club Believes that",

  // The claim itself, worded exactly as it will be read out. This is what the
  // room votes on, so it carries the page. <br> only to stop an ugly break.
  motion: "Respecting personal autonomy requires society to tolerate self destructive choices",

  // The two ends of the seven point scale, in the audience's words.
  poleAgainst: "Step in",
  poleFor: "Leave them to it",

  // Defined so that neither side would object to the wording. A loaded
  // definition decides the motion before anyone speaks.
  terms: [
    ["Personal autonomy",
     "A competent adult's capacity to make informed, voluntary decisions about their own life, by their own values, with nobody coercing them."],
    ["Self destructive choices",
     "Decisions that risk serious physical, psychological, financial or social harm, mainly to the person making them. Refusing treatment, addiction, gambling, extreme sport, assisted dying."],
    ["Tolerate",
     "To refrain from prohibiting, preventing or punishing a choice you disagree with. Not the same as approving of it: the motion asks whether society should allow, not whether it should applaud."],
  ],

  // Name the common ground first, then the one question the evening turns on.
  agreed: "Autonomy matters, and society has some duty to prevent serious harm. Neither side denies either, and both accept that some limits on choice are already justified.",
  split: "Is stopping someone from seriously harming themselves a legitimate exercise of social responsibility, or an unjustified exercise of control over their life?",

  // Where each bench starts. Optional: delete the key and the block does not
  // draw.
  benches: [
    ["For the motion", "An adult who knowingly chooses something that harms mainly themselves should be left to it, however unwise the choice looks from outside."],
    ["Against", "Autonomy is not absolute. Where the harm is severe or irreversible, or consent is compromised, society may legitimately restrict the choice."],
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
