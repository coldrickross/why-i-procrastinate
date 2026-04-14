// Single source of truth for the site's content.
// Extend these arrays freely — both pages will pick up the new entries.

const EMOTIONS = [
  {
    thought: "I don't know how",
    meaning: "Lack of knowledge.",
    strategy:
      "Learn it. Find a teacher, a course, a book, or just the first YouTube video. The gap is information, not willpower.",
  },
  {
    thought: "I'm undecided",
    meaning: "Lack of a specific commitment.",
    strategy:
      "Make a formal decision. Write down what you'll do, when, and where. Tell someone. Ambiguity is the enemy of action.",
  },
  {
    thought: "It sounds boring",
    meaning: "A more interesting alternative is winning your attention.",
    strategy:
      "Remove the distraction, or honestly re-evaluate whether you actually want this. Boredom is a comparison, not a fact.",
  },
  {
    thought: "I'm afraid I'll fail",
    meaning: "Fear of the downside is heavier than the reward.",
    strategy:
      "Shrink the first attempt until it can't fail. Then picture the cost of never trying — that usually weighs more than the fear.",
  },
  {
    thought: "I'm overwhelmed",
    meaning: "The task is too big to picture in one go.",
    strategy:
      "Break it down until the next step takes two minutes. Do only that. Then do the next one.",
  },
  {
    thought: "I don't have time",
    meaning: "It's being outranked by other priorities.",
    strategy:
      "Put it in the calendar as a real appointment. Decide what gets dropped to make room. Time isn't found — it's traded.",
  },
  {
    thought: "I'm too tired",
    meaning: "Low energy, not low desire.",
    strategy:
      "Rest properly. Move it to your peak hours. Or pick a smaller version you can do at low battery.",
  },
  {
    thought: "I'll do it later",
    meaning: "Present-you is winning against future-you.",
    strategy:
      "Make 'now' easier than 'later'. Pre-commit: lay out your gear, block the site, pay upfront, tell a friend.",
  },
  {
    thought: "I might look stupid",
    meaning: "Social fear outweighs the reward.",
    strategy:
      "Practise privately first, or accept a bit of short-term embarrassment for a long-term win. Most people aren't watching.",
  },
  {
    thought: "I'm waiting for the right moment",
    meaning: "Perfectionism in a costume.",
    strategy:
      "The right moment is now. Ship the imperfect version — you can only improve something that exists.",
  },
  {
    thought: "I don't feel motivated",
    meaning: "You're waiting on a feeling before you act.",
    strategy:
      "Motivation follows action, not the other way round. Start for two minutes and let momentum do the rest.",
  },
  {
    thought: "Someone else should do it",
    meaning: "Responsibility feels diffused.",
    strategy:
      "Take ownership. Nobody is coming. If it matters to you, you are the one.",
  },
  {
    thought: "What if I'm doing the wrong thing?",
    meaning: "Fear of the opportunity cost of choosing.",
    strategy:
      "Almost any choice beats no choice. You'll learn more from a wrong move than from standing still.",
  },
  {
    thought: "It won't make a difference anyway",
    meaning: "Low belief in your own effect on the outcome.",
    strategy:
      "Lower the bar: aim for 1% better, not perfect. Small consistent action compounds into big change.",
  },
];

// Suggested chips for the scale page. Users can click to drop them on either side.
const SUGGESTED_FOR = [
  { text: "I'll feel proud", weight: 3 },
  { text: "It's healthy", weight: 3 },
  { text: "Money", weight: 5 },
  { text: "Praise from others", weight: 3 },
  { text: "Fear of regret", weight: 4 },
  { text: "I promised someone", weight: 4 },
  { text: "It's fun", weight: 3 },
  { text: "Long-term dream", weight: 5 },
];

const SUGGESTED_AGAINST = [
  { text: "It's uncomfortable", weight: 3 },
  { text: "I'm tired", weight: 3 },
  { text: "Boredom", weight: 2 },
  { text: "Risk of failure", weight: 4 },
  { text: "Fear of judgement", weight: 4 },
  { text: "It takes too long", weight: 3 },
  { text: "I don't know how", weight: 4 },
  { text: "I'd rather scroll", weight: 3 },
];
