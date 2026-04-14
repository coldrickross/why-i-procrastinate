// Single source of truth for site content.
// To override from a backend, set `window.__FEELING_DATA__` before emotions.js loads.

const DEFAULT_FEELING_DATA = {
  prompt: "How do you feel right now?",
  helperText:
    "Pick one feeling. Then pick the reason that fits best. You will get a simple why + next step.",
  feelings: [
    {
      id: "overwhelmed",
      label: "Overwhelmed",
      reasons: [
        {
          id: "too-big",
          label: "The task feels too big",
          explanation:
            "Your brain cannot see where this ends. Big fuzzy tasks can feel scary, so your brain says, 'do it later.'",
          solution:
            "Cut it into tiny steps. Do one step that takes 10 minutes or less.",
        },
        {
          id: "too-many-things",
          label: "Too many things at once",
          explanation:
            "When many tasks fight for attention, your brain gets noisy and tired.",
          solution:
            "Write all tasks in one list. Pick one task for now. Ignore the rest until done.",
        },
        {
          id: "no-plan",
          label: "No clear plan",
          explanation:
            "If you do not know the first move, starting feels risky.",
          solution:
            "Write: 'First I will ___.' Make it very small and clear.",
        },
      ],
    },
    {
      id: "tired",
      label: "Tired",
      reasons: [
        {
          id: "low-energy",
          label: "Low energy",
          explanation:
            "Low energy makes even easy tasks feel heavy.",
          solution:
            "Shrink the task to the easiest version. Do that first.",
        },
        {
          id: "poor-sleep",
          label: "Bad sleep",
          explanation:
            "Bad sleep hurts focus and self-control. Choices feel harder.",
          solution:
            "Do hard work at your best time of day. Use a checklist. Sleep earlier tonight.",
        },
        {
          id: "burnout",
          label: "Running on empty",
          explanation:
            "If you push too long with no rest, your mind starts to shut down.",
          solution:
            "Take a short reset: water, stretch, 10-minute walk. Then do one small task.",
        },
      ],
    },
    {
      id: "anxious",
      label: "Anxious",
      reasons: [
        {
          id: "fear-fail",
          label: "Fear of failing",
          explanation:
            "You may wait so you can avoid seeing a bad result.",
          solution:
            "Make a 'bad first draft.' Done is better than perfect.",
        },
        {
          id: "fear-judged",
          label: "Fear of what people think",
          explanation:
            "If you expect judgment, delay feels safer.",
          solution:
            "Share with one safe person first. Get one small piece of feedback.",
        },
        {
          id: "fear-unclear",
          label: "Not sure what is expected",
          explanation:
            "Unclear rules make your brain feel danger.",
          solution:
            "Ask one clear question. Then do the first step with the answer.",
        },
      ],
    },
    {
      id: "sad",
      label: "Sad",
      reasons: [
        {
          id: "nothing-matters",
          label: "It feels pointless",
          explanation:
            "Sad moods can turn down your sense of reward.",
          solution:
            "Pick a task with a fast win. Check it off so your brain sees progress.",
        },
        {
          id: "heavy-heart",
          label: "Carrying emotional weight",
          explanation:
            "Hard feelings use mental energy that work also needs.",
          solution:
            "Name the feeling in one sentence. Then do a 5-minute starter task.",
        },
        {
          id: "alone",
          label: "Feeling alone",
          explanation:
            "When you feel alone, it is harder to keep going.",
          solution:
            "Ask a friend to check in later today. Work for 10 minutes before the check-in.",
        },
      ],
    },
    {
      id: "bored",
      label: "Bored",
      reasons: [
        {
          id: "no-meaning",
          label: "No clear reason to care",
          explanation:
            "If the task feels useless, your brain looks for fun instead.",
          solution:
            "Link the task to one real goal you care about.",
        },
        {
          id: "too-repetitive",
          label: "Too repetitive",
          explanation:
            "Doing the same thing over and over can drain attention.",
          solution:
            "Change the format: timer sprint, new place, or music.",
        },
        {
          id: "too-easy",
          label: "Not challenging enough",
          explanation:
            "If it is too easy, your brain may not stay engaged.",
          solution:
            "Turn it into a game. Set a score or time goal.",
        },
      ],
    },
    {
      id: "frustrated",
      label: "Frustrated",
      reasons: [
        {
          id: "stuck-problem",
          label: "Stuck on one problem",
          explanation:
            "Getting stuck can make you want to quit the whole task.",
          solution:
            "Skip that part for now. Do the next part you can do.",
        },
        {
          id: "too-many-errors",
          label: "Too many mistakes",
          explanation:
            "Many mistakes in a row can make effort feel useless.",
          solution:
            "Slow down. Fix one mistake at a time with a short checklist.",
        },
        {
          id: "blocked-tools",
          label: "Tools or systems are hard",
          explanation:
            "When your tools fight you, starting feels painful.",
          solution:
            "Set up your tools first. Make a 'ready to work' setup routine.",
        },
      ],
    },
    {
      id: "confused",
      label: "Confused",
      reasons: [
        {
          id: "dont-know-how",
          label: "I do not know how",
          explanation:
            "A missing skill can feel like a wall.",
          solution:
            "Learn just one small part. Then use it right away.",
        },
        {
          id: "too-much-info",
          label: "Too much information",
          explanation:
            "Too many inputs can freeze decision-making.",
          solution:
            "Pick one trusted source and ignore the rest for now.",
        },
        {
          id: "unclear-goal",
          label: "Goal is unclear",
          explanation:
            "If success is blurry, action is hard.",
          solution:
            "Write what 'done' looks like in one simple sentence.",
        },
      ],
    },
    {
      id: "guilty",
      label: "Guilty",
      reasons: [
        {
          id: "already-late",
          label: "I already delayed too long",
          explanation:
            "Shame can make you avoid the task even more.",
          solution:
            "Drop blame. Start with one repair action right now.",
        },
        {
          id: "let-someone-down",
          label: "I let someone down",
          explanation:
            "Fear of facing people can block action.",
          solution:
            "Send a short honest update. Then do the next small step.",
        },
        {
          id: "all-or-nothing",
          label: "I think it must be perfect",
          explanation:
            "All-or-nothing thinking turns small progress into 'not enough.'",
          solution:
            "Use the rule: any progress counts today.",
        },
      ],
    },
    {
      id: "angry",
      label: "Angry",
      reasons: [
        {
          id: "resent-task",
          label: "I do not want to do this",
          explanation:
            "If a task feels forced, your brain pushes back.",
          solution:
            "Give yourself a choice: do it now fast, or schedule it at a fixed time.",
        },
        {
          id: "angry-person",
          label: "Conflict with someone",
          explanation:
            "Conflict can take over your thoughts and focus.",
          solution:
            "Write down the issue. Park it. Do a short work sprint first.",
        },
        {
          id: "unfair",
          label: "This feels unfair",
          explanation:
            "Unfair tasks can lower motivation.",
          solution:
            "Find one part you can control and act on that part.",
        },
      ],
    },
    {
      id: "restless",
      label: "Restless",
      reasons: [
        {
          id: "cant-sit",
          label: "I cannot sit still",
          explanation:
            "Body tension makes long focus hard.",
          solution:
            "Use 10-minute work sprints with 2-minute movement breaks.",
        },
        {
          id: "phone-pull",
          label: "Phone and apps keep pulling me",
          explanation:
            "Fast rewards from screens can beat slow task rewards.",
          solution:
            "Put phone in another room during one work block.",
        },
        {
          id: "novelty-seeking",
          label: "I keep jumping to new ideas",
          explanation:
            "New ideas feel exciting, so old tasks get dropped.",
          solution:
            "Keep an idea parking list. Return to your current task.",
        },
      ],
    },
    {
      id: "scared",
      label: "Scared",
      reasons: [
        {
          id: "big-consequence",
          label: "Big consequences",
          explanation:
            "When stakes feel huge, your brain may freeze.",
          solution:
            "Break the task into safe mini-steps. Do step one only.",
        },
        {
          id: "new-unknown",
          label: "This is new to me",
          explanation:
            "New things feel risky because you cannot predict them yet.",
          solution:
            "Do a short test run. Treat it like practice, not final.",
        },
        {
          id: "past-bad",
          label: "Bad past experience",
          explanation:
            "A past failure can make your brain expect pain again.",
          solution:
            "Use a different plan this time. Ask for support early.",
        },
      ],
    },
    {
      id: "good-mood",
      label: "Too Comfortable",
      reasons: [
        {
          id: "easy-fun-now",
          label: "Easy fun is close",
          explanation:
            "When you feel good, fun now can beat work later.",
          solution:
            "Do one focus block first. Then enjoy your reward.",
        },
        {
          id: "time-illusion",
          label: "I think I have plenty of time",
          explanation:
            "You may delay because the deadline feels far away.",
          solution:
            "Set a mini-deadline for today and start now.",
        },
        {
          id: "over-confident",
          label: "I think it will be easy later",
          explanation:
            "Overconfidence can hide real effort.",
          solution:
            "List real steps and time. Start step one right away.",
        },
      ],
    },
  ],
};

const FEELING_DATA = window.__FEELING_DATA__ || DEFAULT_FEELING_DATA;

const SUGGESTED_FOR = [
  { text: "I will feel proud", weight: 3 },
  { text: "This helps my health", weight: 3 },
  { text: "This helps my future", weight: 4 },
  { text: "I promised someone", weight: 4 },
  { text: "I can earn money", weight: 5 },
  { text: "I will feel less stress", weight: 4 },
  { text: "I will learn a skill", weight: 4 },
  { text: "I can help my family", weight: 5 },
  { text: "I will sleep better", weight: 3 },
  { text: "I want self-respect", weight: 4 },
];

const SUGGESTED_AGAINST = [
  { text: "I feel tired", weight: 3 },
  { text: "It feels hard", weight: 3 },
  { text: "I might fail", weight: 4 },
  { text: "People may judge me", weight: 4 },
  { text: "I do not know how", weight: 4 },
  { text: "It may take too long", weight: 3 },
  { text: "I can do it later", weight: 3 },
  { text: "My phone pulls me", weight: 3 },
  { text: "I feel stressed", weight: 4 },
  { text: "I need it perfect", weight: 4 },
];
