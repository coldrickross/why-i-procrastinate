/* Example "live progress" data for progress.html.
   Shape mirrors the `answers` object built in worksheet.js so we can later
   swap this out for URL-encoded state or a real backend without changing
   the view layer.

   `checkins` is indexed 0..27 (day-of-plan). Any scheduled day that isn't
   overridden here is treated as "done" if in the past, "scheduled" if it
   matches `today`, and "future" otherwise. Non-scheduled days are "rest". */
window.PROGRESS_DATA = {
  displayName: "Alex",
  avatarInitial: "A",
  startDate: "2026-04-06",   // Monday
  today:     "2026-04-16",   // Thursday, day 11 of 28
  latestCheckinAgo: "2 hours ago",
  latestNote: "Legs heavy this morning. Put the shoes on anyway — first 60 seconds always lies. Feeling more like myself now.",

  answers: {
    goal: "Build a stronger, healthier life — one where I actually like how I feel.",
    identity: "Athlete",
    facts:
      "I haven't moved my body deliberately in 5 weeks. I sit at my desk 9+ hours a day. " +
      "I bought running shoes in January and they're still in the box. I sleep at midnight and " +
      "wake up tired.",
    forgive:
      "I forgive myself for the years I spent waiting to feel ready. " +
      "I forgive myself for treating rest and avoidance as the same thing. " +
      "I forgive myself for starting, stopping, starting, stopping — I'm still here.",

    "current-problems": [
      {
        problem:  "I feel sluggish from the moment I wake up.",
        stops:    "I start the day drained. Creative work at 10am feels like 4pm.",
        duration: "About 8 months — crept in after I stopped swimming.",
        feeling:  "Defeated before the day starts. Quietly embarrassed.",
      },
      {
        problem:  "My clothes don't fit the way they used to.",
        stops:    "I avoid photos, avoid the beach, decline plans that involve swimwear.",
        duration: "Roughly a year.",
        feeling:  "Shame, then a kind of numbness.",
      },
    ],

    "positive-outcomes": [
      {
        outcome: "I become someone who walks every morning — no debate, just done.",
        allows:  "More energy through the afternoon. Better sleep. Fewer headaches.",
        feeling: "Proud. Steady. Like I'm finally on my own team.",
      },
      {
        outcome: "In a year, I'd trust myself to keep promises I make to myself.",
        allows:  "I could take on bigger things — a half-marathon, a career change, learning to surf.",
        feeling: "Confident in a quiet way. Not performative. Just mine.",
      },
    ],

    "future-problems": [
      {
        problem: "Six months from now I'm still saying 'I'll start next Monday'.",
        impact:  "Another year gone. Another birthday where I feel older than I am.",
        feeling: "A dull, tired regret.",
      },
      {
        problem: "Two years from now the small aches become real medical problems.",
        impact:  "Doctors' appointments. Medication. Limits on what my body can do.",
        feeling: "Scared. Angry at myself for seeing it coming and doing nothing.",
      },
    ],

    "identity-foundation": "Someone who shows up",

    ssmart: {
      action:  "Walk outside",
      measure: "20 minutes",
      time:    "7:00am",
      // Mon=0..Sun=6 — weekdays only
      days: [true, true, true, true, true, false, false],
    },

    distractions: [
      { what: "Phone on bedside table", tactic: "relocate" },
      { what: "Instagram",              tactic: "block"    },
      { what: "Morning email",          tactic: "mute"     },
    ],

    resistance: {
      prepare: { on: true,  detail: "Shoes, socks, jacket, and keys by the front door the night before." },
      cue:     { on: true,  detail: "Running shoes next to the kettle so I see them the moment I walk in." },
      stack:   { on: true,  detail: "After I pour my morning coffee, I put the shoes on and step outside." },
      shrink:  { on: false, detail: "" },
      default: { on: true,  detail: "Same 20-minute loop through the park. No decisions before 8am." },
      commit:  { on: false, detail: "" },
    },

    accountability:
      "Daily thumbs-up to my sister in our chat after each walk. She knows not to ask about missed days — " +
      "I just restart without making it a thing.",

    stakes: {
      chosen:  "friend",
      detail:  "Ten-pound transfer to my brother for every scheduled day I skip. He keeps it.",
      amount:  "£10 / missed day",
    },

    roadblocks: {
      sick:   "5 minutes of slow stretching at the window. Sunlight counts.",
      travel: "10-minute loop around the hotel or airport terminal.",
      tired:  "Put the shoes on, walk to the corner, walk home. Two minutes if that's all I've got.",
      busy:   "2-minute version at lunch. Anything greater than zero is the win.",
    },

    "missed-day": {
      mantra:  "One day isn't the pattern — two would be. Today I restart.",
      restart: "Tomorrow morning: shoes on, front door open, one step outside by 7:05. Don't negotiate.",
    },
  },

  /* Per-day overrides. Keys are day-of-plan (0..27). Anything not listed here
     defaults based on whether the date is past / today / future and whether
     it falls on a scheduled weekday. */
  checkins: {
    0: { status: "done" },                                    // Mon 04-06
    1: { status: "done" },                                    // Tue 04-07
    2: { status: "done" },                                    // Wed 04-08
    3: { status: "missed", note: "Work call ran long. Didn't go." }, // Thu 04-09
    4: { status: "done" },                                    // Fri 04-10
    7: { status: "done" },                                    // Mon 04-13
    8: { status: "done" },                                    // Tue 04-14
    9: { status: "done", note: "Rained the whole way. Still counts." }, // Wed 04-15
    // 10 = today (Thu 04-16) — rendered as "scheduled" (pulsing) automatically
  },
};
