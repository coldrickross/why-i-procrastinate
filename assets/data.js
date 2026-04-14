// Single source of truth for the site's content.
// This structure is ready to come from a backend/admin portal.
// To override from a backend, set `window.__FEELING_DATA__` before emotions.js loads.

const DEFAULT_FEELING_DATA = {
  prompt: "How do you feel in this moment?",
  helperText:
    "Choose one feeling. Then pick the reason that fits to see a clear explanation and solution.",
  feelings: [
    {
      id: "overwhelmed",
      label: "Overwhelmed",
      reasons: [
        {
          id: "too-large",
          label: "The task feels too large",
          explanation:
            "Your brain cannot see a clear finish line, so the task reads as a threat. When a project is vague or huge, avoidance feels like protection.",
          solution:
            "Use containment. Define a tiny work box (for example, 15 minutes or one subsection only). Write the next visible action in plain language and do only that action.",
        },
        {
          id: "too-many-open-loops",
          label: "Too many things are open at once",
          explanation:
            "Competing priorities create cognitive noise. You are not resisting effort; you are paying a constant switching cost.",
          solution:
            "Capture all open loops in one list. Choose a single priority for this session. Park everything else in a 'later' list so your attention can settle.",
        },
      ],
    },
    {
      id: "exhausted",
      label: "Exhausted",
      reasons: [
        {
          id: "limited-energy",
          label: "Limited by energy",
          explanation:
            "When energy is low, even simple tasks feel heavy. The problem is not character; your mental battery is underpowered.",
          solution:
            "Reduce scope before effort. Shrink the task to the lowest-energy version you can still complete. If needed, recover first (water, food, short walk, short rest) and restart with one contained step.",
        },
        {
          id: "sleep-debt",
          label: "Running on sleep debt",
          explanation:
            "Sleep debt weakens planning, memory, and emotion regulation. Procrastination rises because decisions feel harder than usual.",
          solution:
            "Move high-focus tasks to your best energy window. Use checklists instead of memory. Prioritize a recovery night and protect a consistent sleep cutoff.",
        },
      ],
    },
    {
      id: "sad",
      label: "Sad",
      reasons: [
        {
          id: "low-belief",
          label: "Low belief that this will help",
          explanation:
            "Sadness can flatten reward signals. If progress does not feel meaningful, your motivation system downshifts.",
          solution:
            "Pick one action with an immediate, visible win. Track completion (not perfection). Use gentle accountability with a friend or note to yourself.",
        },
        {
          id: "emotionally-heavy",
          label: "Emotionally heavy day",
          explanation:
            "You may be carrying emotional load unrelated to the task. The task becomes a symbol of pressure, not just work.",
          solution:
            "Name the feeling first, then lower the bar. Commit to a short starter block and stop after that if needed. Progress counts even when capacity is limited.",
        },
      ],
    },
    {
      id: "bored",
      label: "Bored",
      reasons: [
        {
          id: "no-stakes",
          label: "The task has no clear stakes",
          explanation:
            "Without consequence or meaning, your brain seeks stronger stimulation elsewhere.",
          solution:
            "Add a stake: deadline, public commitment, or measurable target. Tie the task to one personal outcome you actually care about.",
        },
        {
          id: "monotony",
          label: "The format is monotonous",
          explanation:
            "Repetition without variation drains attention quickly, even when the task matters.",
          solution:
            "Change the format: timebox a sprint, add music, switch location, or gamify with a points target. Keep the work the same, change the delivery.",
        },
      ],
    },
    {
      id: "happy",
      label: "Happy",
      reasons: [
        {
          id: "distraction-by-reward",
          label: "Pulled toward easier rewards",
          explanation:
            "A good mood can lead to choosing instant fun over meaningful effort, especially when the task has friction.",
          solution:
            "Stack rewards after progress. Complete one focused work block first, then use leisure as a deliberate reward.",
        },
        {
          id: "underestimating-effort",
          label: "Underestimating the effort needed",
          explanation:
            "Optimism can hide the true size of the task. You assume you'll do it later 'easily,' so you delay starting.",
          solution:
            "Do a quick reality check: list steps and estimate time honestly. Start immediately on step one before the plan stays theoretical.",
        },
      ],
    },
  ],
};

const FEELING_DATA = window.__FEELING_DATA__ || DEFAULT_FEELING_DATA;

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
