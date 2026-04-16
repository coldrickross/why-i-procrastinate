(function () {
  // Phases mirror the reasons from the intro. Each step belongs to one.
  const PHASES = {
    want:    { key: "want",    label: "Establish what you want",     short: "Clarity", tone: "gold",
      why: { title: "Why clarity matters", body: "Identity is the most powerful motivator there is. When the behaviour is who you are, tomorrow takes care of itself. But first you need to name it." }},
    feel:    { key: "feel",    label: "Explore the emotional depth", short: "Depth",   tone: "terra",
      why: { title: "Why emotional depth matters", body: "Knowing what to do was never the problem. Feeling it deeply enough to act \u2014 that\u2019s the unlock. These steps turn abstract goals into visceral motivation." }},
    build:   { key: "build",   label: "Build the habit",            short: "Build",   tone: "teal",
      why: { title: "Why structure matters", body: "Willpower is a terrible strategy. Instead, we engineer your environment and commitments so doing the right thing is the path of least resistance." }},
    protect: { key: "protect", label: "Protect the habit",          short: "Protect", tone: "sage",
      why: { title: "Why protection matters", body: "Life will interrupt. The difference between people who stick with it and people who don\u2019t isn\u2019t perfection \u2014 it\u2019s having a plan for when things go wrong." }},
  };
  const PHASE_ORDER = ["want", "feel", "build", "protect"];

  const steps = [
    { id: "goal",              phase: "want",      title: "Decide a long-term goal",
      prompt: "One sentence is plenty. Aim at something that would genuinely matter to you.",
      example: "Example: Build a stronger, healthier life.",
      type: "short" },
    { id: "identity",          phase: "want",      title: "Turn your goal into an identity",
      prompt: "Who do you become if this goal is real? Use a noun, not a verb.",
      example: "Examples: Tidy person · Athlete · Person who makes hard choices.",
      type: "short" },
    { id: "facts",             phase: "feel",      title: "State the true facts about where you are today",
      prompt: "Write facts only. No drama. No hiding. Just what is.",
      example: "Example: I sleep at 2am on weekdays. I haven't exercised in 6 weeks.",
      type: "textarea" },
    { id: "forgive",           phase: "feel",      title: "Practice radical self-forgiveness",
      prompt: "List what you forgive yourself for. Say it like you mean it.",
      example: "Example: I forgive myself for the years I spent waiting to feel ready.",
      type: "textarea" },
    { id: "current-problems",  phase: "feel",      title: "Problems caused by your current actions",
      prompt: "List any problems your current actions are causing. Add as many as feel true — or skip this step entirely. Each problem has four small prompts to help you think it through.",
      example: "Take your time — five minutes of honesty here is worth an hour of planning later.",
      type: "problem-list", timerSeconds: 300,
      entryLabel: "Problem",
      fields: [
        { key: "problem",  label: "Problem",                      placeholder: "What is the problem?",        rows: 2 },
        { key: "stops",    label: "What it stops you from doing", placeholder: "What does it keep you from?", rows: 2 },
        { key: "duration", label: "How long it's been a problem", placeholder: "Weeks, months, years…",        rows: 1 },
        { key: "feeling",  label: "How it makes you feel",        placeholder: "Name the feelings honestly.",  rows: 2 },
      ] },
    { id: "positive-outcomes", phase: "feel",      title: "Positive outcomes if you fix this behaviour",
      prompt: "List the good things you'd gain. Add as many as feel true — or skip this step entirely.",
      example: "Imagine the first week, the first month, the first year. Let yourself want it.",
      type: "problem-list", timerSeconds: 300,
      entryLabel: "Outcome",
      fields: [
        { key: "outcome", label: "Positive outcome",             placeholder: "What good thing would happen?", rows: 2 },
        { key: "allows",  label: "What it would allow you to do", placeholder: "What doors does it open?",      rows: 2 },
        { key: "feeling", label: "How you'd feel about it",       placeholder: "Name the feelings honestly.",   rows: 2 },
      ] },
    { id: "future-problems",   phase: "feel",      title: "If nothing changes — 6 months, 1 year, 2 years",
      prompt: "Write down the consequences if nothing changes. Add as many as feel true — or skip this step entirely.",
      example: "Don't soften it. Future-you deserves an honest warning.",
      type: "problem-list", timerSeconds: 120,
      entryLabel: "Problem",
      fields: [
        { key: "problem", label: "Problem",                                 placeholder: "What's the consequence?",  rows: 2 },
        { key: "impact",  label: "Impact / what it stops you from doing",   placeholder: "What does it cost you?",   rows: 2 },
        { key: "feeling", label: "How you'll feel",                         placeholder: "Name the feelings honestly.", rows: 2 },
      ] },
    { id: "identity-foundation", phase: "build", title: "Find the smaller identity beneath it",
      prompt: "Before you can become someone strong and athletic, you first have to become someone who SHOWS UP. Before you can be a great writer, you have to be someone who opens the document. Pick the smaller, truer identity that gets you through the door — everything else grows from it.",
      example: "Pick one that fits — or write your own.",
      type: "identity-foundation",
      options: [
        "Someone who shows up",
        "Someone who keeps promises to themselves",
        "Someone who chooses action over comfort",
        "Someone who starts, even badly",
        "Someone who doesn't wait to feel ready",
      ] },
    { id: "ssmart",            phase: "build", title: "Build your SSMART task",
      prompt: "Small, Specific, Measurable, Attainable, Relevant, Time-bound. Build it piece by piece — then pick the days you'll actually do it.",
      example: "Example: Walk · 20 minutes · 7am · Mon & Wed.",
      type: "ssmart-builder" },
    { id: "distractions",      phase: "build", title: "Remove distractions",
      prompt: "Every distraction has a tactic. Tap a common one below or add your own, then pick how you'll handle it.",
      example: "The best tactic is often the laziest one — move the thing, don't rely on willpower.",
      type: "distraction-board",
      suggestions: [
        "Phone", "Instagram", "TikTok", "YouTube",
        "Email", "Slack / Teams", "News sites", "TV",
        "Games", "Snacks in reach",
      ],
      tactics: [
        { key: "remove",   label: "Remove",   hint: "Delete or get rid of it." },
        { key: "block",    label: "Block",    hint: "App limit, site blocker, grayscale." },
        { key: "mute",     label: "Mute",     hint: "Notifications off, silent mode." },
        { key: "hide",     label: "Hide",     hint: "Off the home screen, in a drawer." },
        { key: "relocate", label: "Relocate", hint: "Charge it in another room." },
      ] },
    { id: "resistance",        phase: "build", title: "Engineer out environmental resistance",
      prompt: "Friction is the silent killer of habits. Pick the tactics you'll use, then describe what it looks like in your life.",
      example: "You don't need all of them. One or two, used seriously, is plenty.",
      type: "friction-reducer",
      tactics: [
        { key: "prepare",  title: "Prepare the night before",
          blurb: "Do tomorrow's first step tonight while motivation is cheap.",
          placeholder: "e.g. Lay out gym clothes and shoes by the door." },
        { key: "cue",      title: "Put the cue in plain sight",
          blurb: "Make the trigger impossible to miss.",
          placeholder: "e.g. Running shoes next to the kettle." },
        { key: "stack",    title: "Stack it onto an existing habit",
          blurb: "After [existing habit], I will [new habit].",
          placeholder: "e.g. After I pour my morning coffee, I walk for 20 minutes." },
        { key: "shrink",   title: "Shrink the starting step",
          blurb: "Make the first 60 seconds ridiculously easy.",
          placeholder: "e.g. Just put the shoes on and step outside." },
        { key: "default",  title: "Make it the default",
          blurb: "Remove the decision. Same time, same route, same version.",
          placeholder: "e.g. Same 20-min loop, same time, every scheduled day." },
        { key: "commit",   title: "Pre-commit so future-you can't wriggle out",
          blurb: "Lock it in before resistance shows up.",
          placeholder: "e.g. Alarm set. Walking buddy texted the night before." },
      ] },
    { id: "accountability",    phase: "build", title: "Add accountability — gently",
      prompt: "Who sees your effort? How often? Keep self-worth separate from their reaction.",
      example: "Example: Send a thumbs-up in the group chat each morning I walk.",
      type: "textarea" },
    { id: "stakes",            phase: "build", title: "Raise the stakes",
      prompt: "Accountability works better when something real is on the line. Choose a consequence you\u2019d genuinely dislike \u2014 something that makes skipping feel more costly than showing up.",
      example: "The best stake is one that makes you wince slightly. That\u2019s the point.",
      type: "stakes-builder",
      suggestions: [
        { key: "donate",   label: "Donate to a cause I disagree with", icon: "\ud83d\udcb8", placeholder: "e.g. $20 to [party/org] every week I miss my target." },
        { key: "give-up",  label: "Give up something I enjoy",         icon: "\ud83d\udeab", placeholder: "e.g. No takeaway coffee for the week if I skip." },
        { key: "uncomfy",  label: "Do something uncomfortable",        icon: "\ud83d\ude2c", placeholder: "e.g. Cold shower every morning of the week after a miss." },
        { key: "public",   label: "Public confession",                 icon: "\ud83d\udce2", placeholder: "e.g. Post on my story that I didn\u2019t follow through." },
        { key: "friend",   label: "Financial penalty to a friend",     icon: "\ud83e\udd1d", placeholder: "e.g. Send \u00a310 to my friend \u2014 they keep it if I miss." },
      ] },
    { id: "tracking",          phase: "protect", title: "Your 4-week progress chart",
      type: "info" },
    { id: "roadblocks",        phase: "protect", title: "Plan exceptions and roadblocks",
      prompt: "Life will get in the way. Decide now — in calm mind — what the tiny fallback looks like so future-you doesn't have to improvise.",
      example: "The fallback should be small enough that you can't talk yourself out of it.",
      type: "scenario-plans",
      scenarios: [
        { key: "sick",      label: "When I'm sick",            icon: "🤒", placeholder: "e.g. 5 minutes of gentle stretching." },
        { key: "travel",    label: "When I'm travelling",      icon: "✈️", placeholder: "e.g. 10-min hotel walk or bodyweight squats." },
        { key: "tired",     label: "When I'm exhausted",       icon: "😴", placeholder: "e.g. Put the shoes on, walk to the corner, come home." },
        { key: "busy",      label: "When the day gets hijacked", icon: "⏰", placeholder: "e.g. 2-minute version counts. Anything > 0." },
      ] },
    { id: "missed-day",        phase: "protect", title: "If you miss a day",
      prompt: "Missing once is noise. Missing twice is a pattern. Write the script now so you know exactly what to say — and do — on day one after a slip.",
      example: "Speak to yourself the way you'd speak to a friend you love.",
      type: "missed-day-plan",
      mantras: [
        "One day isn't the pattern — two would be. Today I restart.",
        "I'm the kind of person who restarts. That's the real identity.",
        "Missing once is data, not failure.",
        "The streak was never the point. The person I'm becoming is.",
        "Day 1 again. That's still a day 1 — and day 1s are powerful.",
      ] },
  ];

  // State ------------------------------------------------------------------
  const emptySsmart = () => ({
    action: "",
    measure: "",
    time: "",
    days: [false, false, false, false, false, false, false], // Mon..Sun
  });
  const emptyDistractionBoard = () => [];
  const emptyFrictionReducer = (step) => {
    const out = {};
    (step.tactics || []).forEach((t) => { out[t.key] = { on: false, detail: "" }; });
    return out;
  };
  const emptyScenarioPlans = (step) => {
    const out = {};
    (step.scenarios || []).forEach((s) => { out[s.key] = ""; });
    return out;
  };
  const emptyStakes = () => ({ chosen: "", detail: "", amount: "" });
  const emptyMissedDayPlan = () => ({ mantra: "", restart: "" });

  const answers = Object.fromEntries(
    steps.map((s) => {
      if (s.type === "problem-list") return [s.id, []];
      if (s.type === "ssmart-builder") return [s.id, emptySsmart()];
      if (s.type === "distraction-board") return [s.id, emptyDistractionBoard()];
      if (s.type === "friction-reducer") return [s.id, emptyFrictionReducer(s)];
      if (s.type === "stakes-builder") return [s.id, emptyStakes()];
      if (s.type === "scenario-plans") return [s.id, emptyScenarioPlans(s)];
      if (s.type === "missed-day-plan") return [s.id, emptyMissedDayPlan()];
      return [s.id, ""];
    })
  );

  // Day-of-week helpers (Mon = 0 … Sun = 6)
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const DAY_SHORT  = ["M", "T", "W", "T", "F", "S", "S"];
  const dayIndexFromDate = (d) => (d.getDay() + 6) % 7;
  const countSelectedDays = (s) => (s && Array.isArray(s.days) ? s.days.filter(Boolean).length : 0);
  const selectedDayLabels = (s) =>
    (s && Array.isArray(s.days) ? s.days : [])
      .map((on, i) => (on ? DAY_LABELS[i] : null))
      .filter(Boolean);

  // Problem-list steps define their own `fields` array — keys/labels vary
  // between "problems", "outcomes", etc. so we read them from the step.
  const getFields = (step) => step.fields || [];
  const entryLabelOf = (step) => step.entryLabel || "Item";
  const emptyEntry = (step) => getFields(step).reduce((a, f) => (a[f.key] = "", a), {});
  const entryIsEmpty = (step, p) => getFields(step).every((f) => !((p && p[f.key]) || "").trim());
  const problemListIsEmpty = (step, arr) =>
    !Array.isArray(arr) || arr.every((p) => entryIsEmpty(step, p));
  const timerState = new Map();
  let currentIndex = 0;

  // Elements ---------------------------------------------------------------
  const stepRoot      = document.getElementById("iawStep");
  const reportCard    = document.getElementById("iawReportCard");
  const reportOutput  = document.getElementById("reportOutput");
  const buildReportBtn= document.getElementById("buildReportBtn");
  const phasesBarEl   = document.getElementById("iawPhasesBar");
  const stepDotsEl    = document.getElementById("iawStepDots");
  const progressMeta  = document.getElementById("iawProgressMeta");
  const whyEl         = document.getElementById("iawWhy");

  // Phase helpers -----------------------------------------------------------
  function getPhaseSteps(phaseKey) {
    return steps
      .map((s, i) => ({ step: s, globalIndex: i }))
      .filter(({ step }) => step.phase === phaseKey);
  }

  function getStepPhaseInfo(globalIndex) {
    const step = steps[globalIndex];
    const phaseKey = step.phase;
    const phaseIdx = PHASE_ORDER.indexOf(phaseKey);
    const phaseSteps = getPhaseSteps(phaseKey);
    const stepInPhase = phaseSteps.findIndex((ps) => ps.globalIndex === globalIndex);
    return {
      phaseKey,
      phaseIndex: phaseIdx + 1,
      stepInPhase: stepInPhase + 1,
      totalInPhase: phaseSteps.length,
    };
  }

  function isPhaseComplete(phaseKey) {
    return getPhaseSteps(phaseKey).every(({ step }) =>
      step.type === "info" || !answerIsEmpty(step)
    );
  }

  // Build the phase progress bar ------------------------------------------
  function layoutPhases() {
    phasesBarEl.innerHTML = "";

    PHASE_ORDER.forEach((key, i) => {
      const phase = PHASES[key];

      // Node
      const node = document.createElement("button");
      node.className = `iaw-phase-node tone-${phase.tone}`;
      node.dataset.phase = key;
      node.setAttribute("role", "button");
      node.setAttribute("tabindex", "0");
      node.setAttribute("aria-label", `Go to ${phase.label}`);
      node.innerHTML = `
        <span class="iaw-phase-pip"><span class="iaw-phase-num">${i + 1}</span><span class="iaw-phase-check" aria-hidden="true">&#10003;</span></span>
        <span class="iaw-phase-short">${escapeHtml(phase.short)}</span>
      `;
      node.addEventListener("click", () => {
        const first = getPhaseSteps(key)[0];
        if (first) goTo(first.globalIndex);
      });
      phasesBarEl.appendChild(node);

      // Connecting line (except after last)
      if (i < PHASE_ORDER.length - 1) {
        const line = document.createElement("div");
        line.className = "iaw-phase-line";
        line.dataset.after = key;
        phasesBarEl.appendChild(line);
      }
    });
  }

  function updateProgress() {
    const info = getStepPhaseInfo(currentIndex);
    const currentPhaseKey = info.phaseKey;
    const currentPhaseIdx = PHASE_ORDER.indexOf(currentPhaseKey);

    // Phase nodes
    PHASE_ORDER.forEach((key, i) => {
      const node = phasesBarEl.querySelector(`[data-phase="${key}"]`);
      if (!node) return;
      const done = i < currentPhaseIdx || (i === currentPhaseIdx && isPhaseComplete(key));
      node.classList.toggle("is-done", done && i < currentPhaseIdx);
      node.classList.toggle("is-current", i === currentPhaseIdx);
      node.classList.toggle("is-upcoming", i > currentPhaseIdx);
    });

    // Connecting lines
    phasesBarEl.querySelectorAll(".iaw-phase-line").forEach((line) => {
      const afterPhase = line.dataset.after;
      const afterIdx = PHASE_ORDER.indexOf(afterPhase);
      line.classList.toggle("is-filled", afterIdx < currentPhaseIdx);
    });

    // Step dots for current phase only
    const phaseSteps = getPhaseSteps(currentPhaseKey);
    stepDotsEl.innerHTML = "";
    phaseSteps.forEach(({ step, globalIndex }) => {
      const dot = document.createElement("button");
      dot.className = "iaw-step-dot";
      dot.setAttribute("role", "button");
      dot.setAttribute("tabindex", "0");
      dot.title = step.title;
      dot.setAttribute("aria-label", `Go to: ${step.title}`);
      const done = globalIndex < currentIndex && (step.type === "info" || !answerIsEmpty(step));
      dot.classList.toggle("is-done", done);
      dot.classList.toggle("is-current", globalIndex === currentIndex);
      dot.classList.toggle("is-upcoming", globalIndex > currentIndex);
      dot.addEventListener("click", () => goTo(globalIndex));
      stepDotsEl.appendChild(dot);
    });

    // Meta text: "Phase X of 4 · Step Y of Z"
    const phase = PHASES[currentPhaseKey];
    progressMeta.innerHTML = `<strong>Phase ${info.phaseIndex} of ${PHASE_ORDER.length}</strong> <span class="iaw-progress-dim">\u00b7 Step ${info.stepInPhase} of ${info.totalInPhase} \u00b7 ${escapeHtml(phase.label)}</span>`;

    // Dynamic why section
    if (whyEl && phase.why) {
      whyEl.innerHTML = `
        <h2>${escapeHtml(phase.why.title)}</h2>
        <p class="iaw-why-body">${escapeHtml(phase.why.body)}</p>
      `;
    }
  }

  function toneClass(phaseKey) {
    const p = PHASES[phaseKey];
    return p ? `tone-${p.tone}` : "";
  }

  function answerIsEmpty(step) {
    const v = answers[step.id];
    if (step.type === "problem-list") return problemListIsEmpty(step, v);
    if (step.type === "ssmart-builder") {
      if (!v) return true;
      const hasText = [v.action, v.measure, v.time].some((s) => String(s || "").trim());
      return !hasText && countSelectedDays(v) === 0;
    }
    if (step.type === "distraction-board") {
      return !Array.isArray(v) || v.every((d) => !String(d && d.what || "").trim());
    }
    if (step.type === "friction-reducer") {
      if (!v) return true;
      return !(step.tactics || []).some((t) => v[t.key] && v[t.key].on);
    }
    if (step.type === "stakes-builder") {
      if (!v) return true;
      return !String(v.chosen || "").trim() && !String(v.detail || "").trim();
    }
    if (step.type === "scenario-plans") {
      if (!v) return true;
      return !(step.scenarios || []).some((s) => String(v[s.key] || "").trim());
    }
    if (step.type === "missed-day-plan") {
      if (!v) return true;
      return !String(v.mantra || "").trim() && !String(v.restart || "").trim();
    }
    return !String(v || "").trim();
  }

  // Pull in the user's identity noun so the current-problems step reads as
  // "…of not being {identity}". Falls back to the neutral title if empty.
  function resolveStepTitle(step) {
    if (step.id === "current-problems") {
      const identity = (answers["identity"] || "").trim();
      if (identity) return `Problems caused by your current actions of not being ${identity}`;
    }
    return step.title;
  }

  // Pull the latest values out of the DOM for whichever step is on screen,
  // so we don't lose work on re-render or navigation.
  function persistCurrentInputs() {
    const root = stepRoot.querySelector("[data-step-id]");
    if (!root) return;
    const stepId = root.dataset.stepId;
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;
    if (step.type === "problem-list") {
      const items = Array.from(root.querySelectorAll(".iaw-problem"));
      answers[stepId] = items.map((item) => {
        const entry = emptyEntry(step);
        getFields(step).forEach((f) => {
          const el = item.querySelector(`[data-field="${f.key}"]`);
          if (el) entry[f.key] = el.value;
        });
        return entry;
      });
    } else if (step.type === "ssmart-builder") {
      const current = answers[stepId] || emptySsmart();
      const action  = root.querySelector('[data-ssmart="action"]');
      const measure = root.querySelector('[data-ssmart="measure"]');
      const time    = root.querySelector('[data-ssmart="time"]');
      if (action)  current.action  = action.value;
      if (measure) current.measure = measure.value;
      if (time)    current.time    = time.value;
      const dayBtns = root.querySelectorAll('[data-ssmart-day]');
      if (dayBtns.length) {
        current.days = Array.from(dayBtns).map((b) => b.getAttribute("aria-pressed") === "true");
      }
      answers[stepId] = current;
    } else if (step.type === "identity-foundation") {
      const input = root.querySelector(".iaw-step-input");
      if (input) answers[stepId] = input.value;
    } else if (step.type === "distraction-board") {
      const rows = Array.from(root.querySelectorAll(".iaw-distraction"));
      answers[stepId] = rows.map((row) => ({
        what:   (row.querySelector('[data-distraction="what"]') || {}).value || "",
        tactic: row.dataset.tactic || "",
      }));
    } else if (step.type === "friction-reducer") {
      const current = answers[stepId] || emptyFrictionReducer(step);
      (step.tactics || []).forEach((t) => {
        const card = root.querySelector(`[data-friction-key="${t.key}"]`);
        if (!card) return;
        const on = card.getAttribute("data-on") === "true";
        const detailEl = card.querySelector('[data-friction-detail]');
        current[t.key] = {
          on,
          detail: detailEl ? detailEl.value : (current[t.key] && current[t.key].detail) || "",
        };
      });
      answers[stepId] = current;
    } else if (step.type === "stakes-builder") {
      const current = answers[stepId] || emptyStakes();
      const detail  = root.querySelector('[data-stakes="detail"]');
      const amount  = root.querySelector('[data-stakes="amount"]');
      const chosen  = root.querySelector('.iaw-stake-card.is-selected');
      if (chosen)  current.chosen = chosen.dataset.stakeKey || "";
      if (detail)  current.detail = detail.value;
      if (amount)  current.amount = amount.value;
      answers[stepId] = current;
    } else if (step.type === "scenario-plans") {
      const current = answers[stepId] || emptyScenarioPlans(step);
      (step.scenarios || []).forEach((s) => {
        const el = root.querySelector(`[data-scenario-key="${s.key}"]`);
        if (el) current[s.key] = el.value;
      });
      answers[stepId] = current;
    } else if (step.type === "missed-day-plan") {
      const current = answers[stepId] || emptyMissedDayPlan();
      const mantra  = root.querySelector('[data-missed="mantra"]');
      const restart = root.querySelector('[data-missed="restart"]');
      if (mantra)  current.mantra  = mantra.value;
      if (restart) current.restart = restart.value;
      answers[stepId] = current;
    } else {
      const input = root.classList.contains("iaw-step-input")
        ? root
        : root.querySelector(".iaw-step-input");
      if (input) answers[stepId] = input.value;
    }
    saveToLocalStorage();
  }

  // ---- localStorage persistence -------------------------------------------
  function saveToLocalStorage() {
    try {
      localStorage.setItem("wip-worksheet", JSON.stringify({
        answers: answers,
        currentIndex: currentIndex,
      }));
    } catch (e) { /* quota exceeded or private browsing — silently fail */ }
  }

  function loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem("wip-worksheet");
      if (!raw) return false;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object") return false;
      if (typeof saved.currentIndex === "number" &&
          saved.currentIndex >= 0 &&
          saved.currentIndex < steps.length) {
        currentIndex = saved.currentIndex;
      }
      if (saved.answers && typeof saved.answers === "object") {
        for (const key of Object.keys(answers)) {
          if (key in saved.answers) answers[key] = saved.answers[key];
        }
      }
      return true;
    } catch (e) {
      try { localStorage.removeItem("wip-worksheet"); } catch (_) {}
      return false;
    }
  }

  function renderProblemItem(step, entry, index) {
    const label = entryLabelOf(step);
    const fields = getFields(step).map((f, fi) => {
      const id = `${step.id}-${index}-${f.key}`;
      const value = escapeHtml(entry[f.key] || "");
      const control = f.rows > 1
        ? `<textarea id="${id}" class="iaw-problem-input" data-field="${f.key}" rows="${f.rows}" placeholder="${escapeHtml(f.placeholder)}">${value}</textarea>`
        : `<input id="${id}" class="iaw-problem-input" data-field="${f.key}" type="text" value="${value}" placeholder="${escapeHtml(f.placeholder)}" />`;
      const fieldHtml = `
        <div class="iaw-problem-field">
          <label class="iaw-problem-field-label" for="${id}">${escapeHtml(f.label)}</label>
          ${control}
        </div>
      `;
      if (fi === 0) return fieldHtml;
      return `<div class="iaw-problem-field-wrap" data-reveal-index="${fi}">${fieldHtml}</div>`;
    }).join("");

    return `
      <li class="iaw-problem" data-problem-index="${index}">
        <header class="iaw-problem-head">
          <span class="iaw-problem-num">${escapeHtml(label)} ${index + 1}</span>
          <button type="button" class="iaw-problem-remove" data-action="remove" aria-label="Remove ${escapeHtml(label.toLowerCase())} ${index + 1}">Remove</button>
        </header>
        <div class="iaw-problem-grid">${fields}</div>
      </li>
    `;
  }

  function applyFieldDisclosure(problemEl, step) {
    const fields = getFields(step);
    const wraps = problemEl.querySelectorAll('.iaw-problem-field-wrap');
    wraps.forEach((wrap) => {
      const ri = Number(wrap.dataset.revealIndex);
      const prevInput = problemEl.querySelector(`[data-field="${fields[ri - 1].key}"]`);
      const curInput = problemEl.querySelector(`[data-field="${fields[ri].key}"]`);
      const show = (prevInput && prevInput.value.length > 0) || (curInput && curInput.value.length > 0);
      wrap.classList.toggle('is-revealed', show);
      if (curInput) {
        if (show) curInput.removeAttribute('tabindex');
        else curInput.setAttribute('tabindex', '-1');
      }
    });
  }

  function applyAllFieldDisclosure(listRoot, step) {
    listRoot.querySelectorAll('.iaw-problem').forEach((el) => applyFieldDisclosure(el, step));
  }

  function wireProblemList(listRoot, step) {
    const tryStartTimer = () => {
      if (step.timerSeconds && !timerState.has(step.id) && !problemListIsEmpty(step, answers[step.id])) {
        startTimer(step.id, step.timerSeconds);
      }
    };

    listRoot.addEventListener("input", (e) => {
      const target = e.target;
      if (!target.matches(".iaw-problem-input")) return;
      persistCurrentInputs();
      tryStartTimer();
      updateProgress();
      const problemEl = target.closest('.iaw-problem');
      if (problemEl) applyFieldDisclosure(problemEl, step);
    });

    listRoot.addEventListener("click", (e) => {
      const addBtn = e.target.closest('[data-action="add"]');
      if (addBtn) {
        e.preventDefault();
        persistCurrentInputs();
        const list = Array.isArray(answers[step.id]) ? answers[step.id] : [];
        list.push(emptyEntry(step));
        answers[step.id] = list;
        rerenderProblemList(listRoot, step, { focusIndex: list.length - 1 });
        return;
      }
      const removeBtn = e.target.closest('[data-action="remove"]');
      if (removeBtn) {
        e.preventDefault();
        persistCurrentInputs();
        const item = removeBtn.closest(".iaw-problem");
        const index = Number(item.dataset.problemIndex);
        const list = Array.isArray(answers[step.id]) ? answers[step.id] : [];
        list.splice(index, 1);
        if (list.length === 0) list.push(emptyEntry(step));
        answers[step.id] = list;
        rerenderProblemList(listRoot, step, { focusIndex: Math.max(0, index - 1) });
        updateProgress();
      }
    });
  }

  function rerenderProblemList(listRoot, step, { focusIndex } = {}) {
    const list = answers[step.id];
    const ol = listRoot.querySelector(".iaw-problems");
    ol.innerHTML = list.map((entry, i) => renderProblemItem(step, entry, i)).join("");
    applyAllFieldDisclosure(listRoot, step);
    if (focusIndex != null) {
      const target = ol.querySelector(`.iaw-problem[data-problem-index="${focusIndex}"] .iaw-problem-input`);
      if (target) target.focus({ preventScroll: true });
    }
  }

  function renderProblemList(step) {
    const list = Array.isArray(answers[step.id]) ? answers[step.id] : [];
    if (list.length === 0) list.push(emptyEntry(step));
    answers[step.id] = list;

    const items = list.map((entry, i) => renderProblemItem(step, entry, i)).join("");

    return `
      <div class="iaw-problem-list" data-step-id="${step.id}">
        <ol class="iaw-problems">${items}</ol>
        <button type="button" class="iaw-problem-add" data-action="add">+ Add another ${escapeHtml(entryLabelOf(step).toLowerCase())}</button>
        <p class="iaw-step-example">${escapeHtml(step.example)}</p>
        <p class="iaw-problem-optional">This step is optional — leave it blank if nothing comes to mind.</p>
      </div>
    `;
  }

  // Identity-foundation step ----------------------------------------------
  function renderIdentityFoundation(step) {
    const longTerm = (answers["identity"] || "").trim();
    const current  = answers[step.id] || "";
    const options  = step.options || [];

    const optionsMarkup = options.map((opt) => {
      const on = current === opt;
      return `<button type="button"
                class="iaw-id-pick ${on ? "is-on" : ""}"
                data-id-pick
                aria-pressed="${on ? "true" : "false"}">${escapeHtml(opt)}</button>`;
    }).join("");

    const longTermLine = longTerm
      ? `<p class="iaw-foundation-long">Your long-term identity: <strong>${escapeHtml(longTerm)}</strong>.</p>`
      : `<p class="iaw-foundation-long iaw-foundation-long--muted">You haven't set a long-term identity yet — that's okay, the foundation still applies.</p>`;

    return `
      <div class="iaw-foundation" data-step-id="${step.id}">
        ${longTermLine}
        <p class="iaw-foundation-lead">
          Big identities are built on top of smaller ones. Before you can be
          <em>${escapeHtml(longTerm || "that bigger person")}</em>, you first
          have to be <strong>someone who shows up</strong>. That's the identity
          we'll actually be training this week.
        </p>
        <div class="iaw-id-picks" role="group" aria-label="Foundational identity options">
          ${optionsMarkup}
        </div>
        <label class="iaw-step-label" for="input-${step.id}">Or write your own</label>
        <input id="input-${step.id}"
               class="iaw-step-input iaw-step-input--short"
               type="text"
               placeholder="Someone who…" />
        <p class="iaw-step-example">${escapeHtml(step.example || "")}</p>
      </div>
    `;
  }

  function wireIdentityFoundation(root, step) {
    const input = root.querySelector(".iaw-step-input");
    const picks = Array.from(root.querySelectorAll("[data-id-pick]"));

    input.value = answers[step.id] || "";

    const syncPicks = () => {
      const v = input.value.trim();
      picks.forEach((btn) => {
        const on = btn.textContent === v;
        btn.classList.toggle("is-on", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
    };
    syncPicks();

    input.addEventListener("input", () => {
      answers[step.id] = input.value;
      syncPicks();
      updateProgress();
    });

    picks.forEach((btn) => {
      btn.addEventListener("click", () => {
        const v = btn.textContent;
        input.value = v;
        answers[step.id] = v;
        syncPicks();
        updateProgress();
        input.focus({ preventScroll: true });
      });
    });
  }

  // Distraction-board step -------------------------------------------------
  function tacticById(step, key) {
    return (step.tactics || []).find((t) => t.key === key) || null;
  }

  function renderDistractionRow(step, entry, index) {
    const tactics = step.tactics || [];
    const current = entry.tactic || "";
    const tacticPills = tactics.map((t) => {
      const on = current === t.key;
      return `<button type="button"
                class="iaw-distraction-tactic ${on ? "is-on" : ""}"
                data-tactic-pick="${t.key}"
                aria-pressed="${on ? "true" : "false"}"
                title="${escapeHtml(t.hint)}">${escapeHtml(t.label)}</button>`;
    }).join("");
    return `
      <li class="iaw-distraction" data-distraction-index="${index}" data-tactic="${escapeHtml(current)}">
        <div class="iaw-distraction-row">
          <input class="iaw-distraction-input"
                 data-distraction="what"
                 type="text"
                 value="${escapeHtml(entry.what || "")}"
                 placeholder="What's the distraction?" />
          <button type="button" class="iaw-distraction-remove" data-action="remove" aria-label="Remove distraction ${index + 1}">×</button>
        </div>
        <div class="iaw-distraction-tactics" role="group" aria-label="Choose a tactic">${tacticPills}</div>
      </li>
    `;
  }

  function renderDistractionBoard(step) {
    const list = Array.isArray(answers[step.id]) ? answers[step.id] : [];
    answers[step.id] = list;

    const suggestionChips = (step.suggestions || []).map((s) =>
      `<button type="button" class="iaw-distraction-chip" data-suggest="${escapeHtml(s)}">+ ${escapeHtml(s)}</button>`
    ).join("");

    const rows = list.map((entry, i) => renderDistractionRow(step, entry, i)).join("");
    const empty = list.length === 0
      ? `<p class="iaw-distraction-empty">No distractions yet — tap a suggestion above or add your own.</p>`
      : "";

    return `
      <div class="iaw-distraction-board" data-step-id="${step.id}">
        <p class="iaw-step-label">Common distractions — tap to add</p>
        <div class="iaw-distraction-chips">${suggestionChips}</div>
        <div class="iaw-distraction-divider" aria-hidden="true"></div>
        <ol class="iaw-distraction-list">${rows}</ol>
        ${empty}
        <button type="button" class="iaw-distraction-add" data-action="add">+ Add your own</button>
        <p class="iaw-step-example">${escapeHtml(step.example)}</p>
      </div>
    `;
  }

  function wireDistractionBoard(root, step) {
    const listEl = root.querySelector(".iaw-distraction-list");
    const emptyMsgSelector = ".iaw-distraction-empty";

    const rerender = ({ focusIndex } = {}) => {
      const list = answers[step.id] || [];
      listEl.innerHTML = list.map((entry, i) => renderDistractionRow(step, entry, i)).join("");
      const existingEmpty = root.querySelector(emptyMsgSelector);
      if (existingEmpty) existingEmpty.remove();
      if (list.length === 0) {
        const p = document.createElement("p");
        p.className = "iaw-distraction-empty";
        p.textContent = "No distractions yet — tap a suggestion above or add your own.";
        listEl.after(p);
      }
      if (focusIndex != null) {
        const target = listEl.querySelector(`.iaw-distraction[data-distraction-index="${focusIndex}"] [data-distraction="what"]`);
        if (target) target.focus({ preventScroll: true });
      }
      updateProgress();
    };

    // Suggestion chips — add a row with that distraction pre-filled
    root.querySelectorAll("[data-suggest]").forEach((chip) => {
      chip.addEventListener("click", () => {
        persistCurrentInputs();
        const list = answers[step.id] || [];
        list.push({ what: chip.dataset.suggest, tactic: "" });
        answers[step.id] = list;
        rerender({ focusIndex: list.length - 1 });
      });
    });

    root.querySelector(".iaw-distraction-add").addEventListener("click", () => {
      persistCurrentInputs();
      const list = answers[step.id] || [];
      list.push({ what: "", tactic: "" });
      answers[step.id] = list;
      rerender({ focusIndex: list.length - 1 });
    });

    // Delegate input / tactic pick / remove
    listEl.addEventListener("input", (e) => {
      if (!e.target.matches('[data-distraction="what"]')) return;
      persistCurrentInputs();
      updateProgress();
    });

    listEl.addEventListener("click", (e) => {
      const tacticBtn = e.target.closest("[data-tactic-pick]");
      if (tacticBtn) {
        const row = tacticBtn.closest(".iaw-distraction");
        const index = Number(row.dataset.distractionIndex);
        const list = answers[step.id] || [];
        if (!list[index]) return;
        const currentKey = list[index].tactic || "";
        const nextKey = tacticBtn.dataset.tacticPick;
        list[index].tactic = currentKey === nextKey ? "" : nextKey;
        // Keep the input's typed value
        const whatEl = row.querySelector('[data-distraction="what"]');
        if (whatEl) list[index].what = whatEl.value;
        row.dataset.tactic = list[index].tactic;
        row.querySelectorAll("[data-tactic-pick]").forEach((btn) => {
          const on = btn.dataset.tacticPick === list[index].tactic;
          btn.classList.toggle("is-on", on);
          btn.setAttribute("aria-pressed", on ? "true" : "false");
        });
        updateProgress();
        return;
      }
      const removeBtn = e.target.closest('[data-action="remove"]');
      if (removeBtn) {
        persistCurrentInputs();
        const row = removeBtn.closest(".iaw-distraction");
        const index = Number(row.dataset.distractionIndex);
        const list = answers[step.id] || [];
        list.splice(index, 1);
        answers[step.id] = list;
        rerender({ focusIndex: Math.min(index, list.length - 1) });
      }
    });
  }

  // Friction-reducer step --------------------------------------------------
  function renderFrictionReducer(step) {
    const state = answers[step.id] || emptyFrictionReducer(step);
    answers[step.id] = state;

    const cards = (step.tactics || []).map((t) => {
      const on = !!(state[t.key] && state[t.key].on);
      const detail = (state[t.key] && state[t.key].detail) || "";
      return `
        <div class="iaw-friction-card ${on ? "is-on" : ""}"
             data-friction-key="${t.key}"
             data-on="${on ? "true" : "false"}">
          <button type="button" class="iaw-friction-toggle" data-friction-toggle aria-pressed="${on ? "true" : "false"}">
            <span class="iaw-friction-check" aria-hidden="true"></span>
            <span class="iaw-friction-head">
              <span class="iaw-friction-title">${escapeHtml(t.title)}</span>
              <span class="iaw-friction-blurb">${escapeHtml(t.blurb)}</span>
            </span>
          </button>
          <div class="iaw-friction-detail-wrap" ${on ? "" : "hidden"}>
            <textarea class="iaw-friction-detail"
                      data-friction-detail
                      rows="2"
                      placeholder="${escapeHtml(t.placeholder)}">${escapeHtml(detail)}</textarea>
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="iaw-friction" data-step-id="${step.id}">
        <div class="iaw-friction-grid">${cards}</div>
        <p class="iaw-step-example">${escapeHtml(step.example)}</p>
      </div>
    `;
  }

  function wireFrictionReducer(root, step) {
    root.querySelectorAll("[data-friction-key]").forEach((card) => {
      const toggle   = card.querySelector("[data-friction-toggle]");
      const wrap     = card.querySelector(".iaw-friction-detail-wrap");
      const textarea = card.querySelector("[data-friction-detail]");

      toggle.addEventListener("click", () => {
        const on = card.getAttribute("data-on") !== "true";
        card.setAttribute("data-on", on ? "true" : "false");
        card.classList.toggle("is-on", on);
        toggle.setAttribute("aria-pressed", on ? "true" : "false");
        if (wrap) wrap.hidden = !on;
        persistCurrentInputs();
        updateProgress();
        if (on && textarea) textarea.focus({ preventScroll: true });
      });

      if (textarea) {
        textarea.addEventListener("input", () => {
          persistCurrentInputs();
          updateProgress();
        });
      }
    });
  }

  // Scenario-plans step ----------------------------------------------------
  function renderScenarioPlans(step) {
    const ssmart = answers["ssmart"] || emptySsmart();
    const state  = answers[step.id] || emptyScenarioPlans(step);
    answers[step.id] = state;

    const planLine = [ssmart.action, ssmart.measure ? `for ${ssmart.measure}` : "", ssmart.time ? `at ${ssmart.time}` : ""]
      .filter(Boolean).join(" ").trim();
    const reminder = planLine
      ? `<div class="iaw-scenario-reminder">
           <span class="iaw-scenario-reminder-label">Normally I will</span>
           <strong>${escapeHtml(planLine)}</strong>
         </div>`
      : `<div class="iaw-scenario-reminder iaw-scenario-reminder--muted">
           <span class="iaw-scenario-reminder-label">Tip</span>
           <span>Build your SSMART action first — then your fallbacks will feel grounded.</span>
         </div>`;

    const cards = (step.scenarios || []).map((s) => {
      const val = state[s.key] || "";
      const filled = !!val.trim();
      return `
        <div class="iaw-scenario-card ${filled ? "is-filled" : ""}" data-scenario-card="${s.key}">
          <div class="iaw-scenario-head">
            <span class="iaw-scenario-icon" aria-hidden="true">${s.icon || "•"}</span>
            <span class="iaw-scenario-label">${escapeHtml(s.label)}</span>
          </div>
          <label class="iaw-scenario-then" for="scenario-${s.key}">…I will</label>
          <textarea id="scenario-${s.key}"
                    class="iaw-scenario-input"
                    data-scenario-key="${s.key}"
                    rows="2"
                    placeholder="${escapeHtml(s.placeholder || "")}">${escapeHtml(val)}</textarea>
        </div>
      `;
    }).join("");

    return `
      <div class="iaw-scenarios" data-step-id="${step.id}">
        ${reminder}
        <div class="iaw-scenario-grid">${cards}</div>
        <p class="iaw-step-example">${escapeHtml(step.example)}</p>
      </div>
    `;
  }

  function wireScenarioPlans(root, step) {
    root.querySelectorAll("[data-scenario-key]").forEach((el) => {
      el.addEventListener("input", () => {
        const card = el.closest(".iaw-scenario-card");
        if (card) card.classList.toggle("is-filled", !!el.value.trim());
        persistCurrentInputs();
        updateProgress();
      });
    });
  }

  // Missed-day-plan step ---------------------------------------------------
  function suggestedRestart() {
    const s = answers["ssmart"] || emptySsmart();
    const parts = [];
    if (s.action)  parts.push(s.action);
    if (s.measure) parts.push(`for ${s.measure}`);
    if (s.time)    parts.push(`at ${s.time}`);
    return parts.length ? `Tomorrow I ${parts.join(" ")} as planned.` : "";
  }

  function renderMissedDayPlan(step) {
    const state = answers[step.id] || emptyMissedDayPlan();
    answers[step.id] = state;

    const mantraPicks = (step.mantras || []).map((m) => {
      const on = state.mantra === m;
      return `<button type="button"
                class="iaw-mantra-pick ${on ? "is-on" : ""}"
                data-mantra-pick
                aria-pressed="${on ? "true" : "false"}">"${escapeHtml(m)}"</button>`;
    }).join("");

    const suggestion = suggestedRestart();
    const restartPlaceholder = suggestion || "e.g. Tomorrow I walk at 7am as planned.";

    return `
      <div class="iaw-missed" data-step-id="${step.id}">
        <div class="iaw-missed-section">
          <h3 class="iaw-missed-section-title">1 · Your self-forgiveness line</h3>
          <p class="iaw-missed-section-sub">Pick one that lands — or write your own.</p>
          <div class="iaw-mantra-picks" role="group" aria-label="Self-forgiveness options">${mantraPicks}</div>
          <textarea class="iaw-missed-input"
                    data-missed="mantra"
                    rows="2"
                    placeholder="Write the exact words you'll say to yourself.">${escapeHtml(state.mantra || "")}</textarea>
        </div>

        <div class="iaw-missed-section">
          <h3 class="iaw-missed-section-title">2 · Tomorrow's restart</h3>
          <p class="iaw-missed-section-sub">Be concrete. No rescheduling, no doubling up. Just tomorrow's plan.</p>
          ${suggestion ? `<button type="button" class="iaw-missed-suggest" data-missed-suggest>Use my SSMART plan: “${escapeHtml(suggestion)}”</button>` : ""}
          <textarea class="iaw-missed-input"
                    data-missed="restart"
                    rows="2"
                    placeholder="${escapeHtml(restartPlaceholder)}">${escapeHtml(state.restart || "")}</textarea>
        </div>

        <p class="iaw-step-example">${escapeHtml(step.example)}</p>
      </div>
    `;
  }

  function wireMissedDayPlan(root, step) {
    const mantraEl  = root.querySelector('[data-missed="mantra"]');
    const restartEl = root.querySelector('[data-missed="restart"]');
    const picks     = Array.from(root.querySelectorAll("[data-mantra-pick]"));

    const syncPicks = () => {
      const v = (mantraEl.value || "").trim().replace(/^["“”]|["“”]$/g, "");
      picks.forEach((btn) => {
        const label = btn.textContent.replace(/^["“]|["”]$/g, "").trim();
        const on = label === v;
        btn.classList.toggle("is-on", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
    };
    syncPicks();

    picks.forEach((btn) => {
      btn.addEventListener("click", () => {
        const text = btn.textContent.replace(/^["“]|["”]$/g, "").trim();
        mantraEl.value = text;
        persistCurrentInputs();
        syncPicks();
        updateProgress();
        mantraEl.focus({ preventScroll: true });
      });
    });

    mantraEl.addEventListener("input", () => {
      persistCurrentInputs();
      syncPicks();
      updateProgress();
    });

    restartEl.addEventListener("input", () => {
      persistCurrentInputs();
      updateProgress();
    });

    const suggestBtn = root.querySelector("[data-missed-suggest]");
    if (suggestBtn) {
      suggestBtn.addEventListener("click", () => {
        restartEl.value = suggestedRestart();
        persistCurrentInputs();
        updateProgress();
        restartEl.focus({ preventScroll: true });
      });
    }
  }

  // Stakes builder step -----------------------------------------------------
  function renderStakes(step) {
    const state = answers[step.id] || emptyStakes();
    answers[step.id] = state;

    const cards = (step.suggestions || []).map((s) => {
      const on = state.chosen === s.key;
      return `<button type="button"
                class="iaw-stake-card ${on ? "is-selected" : ""}"
                data-stake-key="${s.key}"
                aria-pressed="${on ? "true" : "false"}">
                <span class="iaw-stake-icon" aria-hidden="true">${s.icon}</span>
                <span class="iaw-stake-label">${escapeHtml(s.label)}</span>
              </button>`;
    }).join("");

    const chosen = (step.suggestions || []).find((s) => s.key === state.chosen);
    const placeholder = chosen ? chosen.placeholder : "Describe your consequence in specific terms.";

    return `
      <div class="iaw-stakes" data-step-id="${step.id}">
        <div class="iaw-stake-grid" role="group" aria-label="Consequence suggestions">${cards}</div>
        <div class="iaw-stake-detail ${state.chosen || state.detail ? "is-visible" : ""}">
          <label class="iaw-stake-detail-label" for="stakes-detail">Your specific commitment</label>
          <textarea id="stakes-detail"
                    class="iaw-stake-textarea"
                    data-stakes="detail"
                    rows="3"
                    placeholder="${escapeHtml(placeholder)}">${escapeHtml(state.detail || "")}</textarea>
          <label class="iaw-stake-detail-label" for="stakes-amount">Amount or measure <span class="iaw-stake-optional">(optional)</span></label>
          <input id="stakes-amount"
                 class="iaw-stake-amount-input"
                 data-stakes="amount"
                 type="text"
                 placeholder="e.g. $20, one week, 3 days"
                 value="${escapeHtml(state.amount || "")}" />
        </div>
        <p class="iaw-step-example">${escapeHtml(step.example)}</p>
      </div>
    `;
  }

  function wireStakes(root, step) {
    const cards = Array.from(root.querySelectorAll(".iaw-stake-card"));
    const detailWrap = root.querySelector(".iaw-stake-detail");
    const detailEl = root.querySelector('[data-stakes="detail"]');
    const amountEl = root.querySelector('[data-stakes="amount"]');
    const state = answers[step.id] || emptyStakes();

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const key = card.dataset.stakeKey;
        const wasSelected = state.chosen === key;
        state.chosen = wasSelected ? "" : key;
        cards.forEach((c) => {
          const on = c.dataset.stakeKey === state.chosen;
          c.classList.toggle("is-selected", on);
          c.setAttribute("aria-pressed", on ? "true" : "false");
        });
        // Update placeholder to match selected suggestion
        const sug = (step.suggestions || []).find((s) => s.key === state.chosen);
        if (detailEl && sug) detailEl.placeholder = sug.placeholder;
        if (detailWrap) detailWrap.classList.add("is-visible");
        persistCurrentInputs();
        updateProgress();
        if (detailEl) detailEl.focus({ preventScroll: true });
      });
    });

    if (detailEl) {
      detailEl.addEventListener("input", () => {
        if (detailWrap && !detailWrap.classList.contains("is-visible")) {
          detailWrap.classList.add("is-visible");
        }
        persistCurrentInputs();
        updateProgress();
      });
    }
    if (amountEl) {
      amountEl.addEventListener("input", () => {
        persistCurrentInputs();
        updateProgress();
      });
    }
  }

  // SSMART builder step ----------------------------------------------------
  function dayFeedback(count) {
    if (count === 0) {
      return {
        tone: "neutral",
        title: "Pick at least one day to start.",
        body:  "One committed day beats a hopeful week.",
      };
    }
    if (count <= 2) {
      return {
        tone: "good",
        title: `${count} ${count === 1 ? "day" : "days"} — a great starting pace.`,
        body:  "Small and repeatable wins. You can always add more once this feels boring.",
      };
    }
    if (count === 3) {
      return {
        tone: "okay",
        title: "3 days — okay, but keep your rest days sacred.",
        body:  "Doable, but the jump from 2 to 3 is where most people quietly overreach. Protect the off days.",
      };
    }
    return {
      tone: "warn",
      title: `${count} days — this is probably too much, too fast.`,
      body:  "If a voice inside is saying “but I CAN do it every day” — that's the exact all-or-nothing thinking that wrecks most attempts. You do it, you miss once, you feel like a failure, you quit. Start with 2. Prove it for two weeks. Then add a day. Boring wins.",
    };
  }

  function renderSsmartPreview(s, foundation) {
    const parts = [];
    if (s.action)  parts.push(escapeHtml(s.action));
    if (s.measure) parts.push(`for ${escapeHtml(s.measure)}`);
    if (s.time)    parts.push(`at ${escapeHtml(s.time)}`);
    const dayStr = selectedDayLabels(s).join(", ");
    if (dayStr)    parts.push(`on ${escapeHtml(dayStr)}`);
    if (!parts.length) {
      return `<p class="iaw-ssmart-preview-empty">Your task will appear here as you build it.</p>`;
    }
    const identLine = foundation
      ? `<p class="iaw-ssmart-preview-ident">As <strong>${escapeHtml(foundation)}</strong>, I will:</p>`
      : "";
    return `
      ${identLine}
      <p class="iaw-ssmart-preview-line">${parts.join(" ")}.</p>
    `;
  }

  function renderSsmart(step) {
    const s = answers[step.id] || emptySsmart();
    const foundation = (answers["identity-foundation"] || "").trim();

    const reminder = foundation
      ? `<div class="iaw-ident-reminder">
           <span class="iaw-ident-reminder-label">You're doing this as</span>
           <strong>${escapeHtml(foundation)}</strong>
         </div>`
      : `<div class="iaw-ident-reminder iaw-ident-reminder--muted">
           <span class="iaw-ident-reminder-label">Tip</span>
           <span>Head back to the previous step to pick a foundational identity first — it changes how this task feels.</span>
         </div>`;

    const dayPicker = DAY_SHORT.map((lab, i) => {
      const on = !!s.days[i];
      return `<button type="button"
                class="iaw-day-chip ${on ? "is-on" : ""}"
                data-ssmart-day="${i}"
                aria-pressed="${on ? "true" : "false"}"
                aria-label="${DAY_LABELS[i]}"
                title="${DAY_LABELS[i]}">${lab}</button>`;
    }).join("");

    const fb = dayFeedback(countSelectedDays(s));

    return `
      <div class="iaw-ssmart" data-step-id="${step.id}">
        ${reminder}

        <div class="iaw-ssmart-fields">
          <div class="iaw-ssmart-field">
            <label class="iaw-step-label" for="ssmart-action">Action <span class="iaw-ssmart-hint">(small &amp; specific)</span></label>
            <input id="ssmart-action" class="iaw-step-input iaw-step-input--short"
                   data-ssmart="action" type="text"
                   value="${escapeHtml(s.action || "")}"
                   placeholder="e.g. Walk" />
          </div>
          <div class="iaw-ssmart-field">
            <label class="iaw-step-label" for="ssmart-measure">Measure <span class="iaw-ssmart-hint">(how much)</span></label>
            <input id="ssmart-measure" class="iaw-step-input iaw-step-input--short"
                   data-ssmart="measure" type="text"
                   value="${escapeHtml(s.measure || "")}"
                   placeholder="e.g. 20 minutes" />
          </div>
          <div class="iaw-ssmart-field">
            <label class="iaw-step-label" for="ssmart-time">Time of day <span class="iaw-ssmart-hint">(when)</span></label>
            <input id="ssmart-time" class="iaw-step-input iaw-step-input--short"
                   data-ssmart="time" type="text"
                   value="${escapeHtml(s.time || "")}"
                   placeholder="e.g. 7am" />
          </div>
        </div>

        <div class="iaw-day-picker-wrap">
          <label class="iaw-step-label">Pick the days you'll do it</label>
          <div class="iaw-day-picker" role="group" aria-label="Days of the week">${dayPicker}</div>
          <div class="iaw-day-feedback iaw-day-feedback--${fb.tone}" data-ssmart-feedback>
            <strong>${escapeHtml(fb.title)}</strong>
            <span>${escapeHtml(fb.body)}</span>
          </div>
        </div>

        <div class="iaw-ssmart-preview" data-ssmart-preview>
          ${renderSsmartPreview(s, foundation)}
        </div>

        <p class="iaw-step-example">${escapeHtml(step.example || "")}</p>
      </div>
    `;
  }

  function wireSsmart(root, step) {
    const previewBox = root.querySelector("[data-ssmart-preview]");
    const feedbackBox = root.querySelector("[data-ssmart-feedback]");
    const foundation = () => (answers["identity-foundation"] || "").trim();

    const refreshDerived = () => {
      const s = answers[step.id];
      previewBox.innerHTML = renderSsmartPreview(s, foundation());
      const fb = dayFeedback(countSelectedDays(s));
      feedbackBox.className = `iaw-day-feedback iaw-day-feedback--${fb.tone}`;
      feedbackBox.innerHTML = `<strong>${escapeHtml(fb.title)}</strong><span>${escapeHtml(fb.body)}</span>`;
    };

    ["action", "measure", "time"].forEach((key) => {
      const el = root.querySelector(`[data-ssmart="${key}"]`);
      if (!el) return;
      el.addEventListener("input", () => {
        persistCurrentInputs();
        refreshDerived();
        updateProgress();
      });
    });

    root.querySelectorAll("[data-ssmart-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-ssmart-day"));
        const s = answers[step.id] || emptySsmart();
        s.days[i] = !s.days[i];
        answers[step.id] = s;
        btn.setAttribute("aria-pressed", s.days[i] ? "true" : "false");
        btn.classList.toggle("is-on", s.days[i]);
        refreshDerived();
        updateProgress();
      });
    });
  }

  // Render a single step ---------------------------------------------------
  function renderStep() {
    // Persist previous answer before re-rendering
    persistCurrentInputs();

    stepRoot.innerHTML = "";

    const step  = steps[currentIndex];
    const phase = PHASES[step.phase];

    const card = document.createElement("article");
    card.className = `iaw-step-card ${toneClass(step.phase)}`;

    const isInfo        = step.type === "info";
    const isShort       = step.type === "short";
    const isProblem     = step.type === "problem-list";
    const isFoundation  = step.type === "identity-foundation";
    const isSsmart      = step.type === "ssmart-builder";
    const isDistraction = step.type === "distraction-board";
    const isFriction    = step.type === "friction-reducer";
    const isStakes      = step.type === "stakes-builder";
    const isScenarios   = step.type === "scenario-plans";
    const isMissedDay   = step.type === "missed-day-plan";

    const timerMarkup = step.timerSeconds ? `
      <div class="iaw-timer" id="timer-wrap-${step.id}">
        <span class="iaw-timer-dot" aria-hidden="true"></span>
        <span class="iaw-timer-label">Suggested time</span>
        <span class="iaw-timer-value" id="timer-${step.id}">${formatTime(step.timerSeconds)}</span>
      </div>
    ` : "";

    let bodyMarkup;
    if (isInfo) {
      const ssmart = answers["ssmart"] || emptySsmart();
      const today = new Date();
      const scheduledCount = countSelectedDays(ssmart);
      const dayStr = selectedDayLabels(ssmart).join(", ");
      const personalLine = scheduledCount
        ? `Your chart starts <strong>${humanDate(today)}</strong> and will only ask for a tick on <strong>${escapeHtml(dayStr)}</strong>. Rest days stay empty on purpose.`
        : `Your chart starts <strong>${humanDate(today)}</strong>. Head back to the SSMART step and pick your days — the chart will update automatically.`;
      bodyMarkup = `
        <div class="iaw-info">
          <p class="iaw-info-lead">A visible chart turns intention into <strong>evidence</strong>. Every tick is proof — to you — of your new identity, and a quiet promise kept to your future self.</p>
          ${renderAnimatedGrid(ssmart, today)}
          <p class="iaw-info-note">${personalLine}</p>
          <p class="iaw-info-note">This chart will be in your report — print it, stick it somewhere hard to ignore, and mark one box on every scheduled day.</p>
        </div>
      `;
    } else if (isFoundation) {
      bodyMarkup = renderIdentityFoundation(step);
    } else if (isSsmart) {
      bodyMarkup = `
        ${timerMarkup}
        ${renderSsmart(step)}
      `;
    } else if (isProblem) {
      bodyMarkup = `
        ${timerMarkup}
        ${renderProblemList(step)}
      `;
    } else if (isDistraction) {
      bodyMarkup = renderDistractionBoard(step);
    } else if (isFriction) {
      bodyMarkup = renderFrictionReducer(step);
    } else if (isStakes) {
      bodyMarkup = renderStakes(step);
    } else if (isScenarios) {
      bodyMarkup = renderScenarioPlans(step);
    } else if (isMissedDay) {
      bodyMarkup = renderMissedDayPlan(step);
    } else {
      bodyMarkup = `
        ${timerMarkup}
        <label class="iaw-step-label" for="input-${step.id}">Your answer</label>
        ${isShort
          ? `<input id="input-${step.id}"
                    class="iaw-step-input iaw-step-input--short"
                    data-step-id="${step.id}"
                    type="text"
                    placeholder="Write here — no pressure to be perfect." />`
          : `<textarea id="input-${step.id}"
                       class="iaw-step-input"
                       data-step-id="${step.id}"
                       rows="5"
                       placeholder="Write here — no pressure to be perfect."></textarea>`}
        <p class="iaw-step-example">${escapeHtml(step.example)}</p>
      `;
    }

    const phaseInfo = getStepPhaseInfo(currentIndex);
    card.innerHTML = `
      <header class="iaw-step-head">
        <div class="iaw-step-badge">
          <span class="iaw-step-badge-label">Step</span>
          <span class="iaw-step-badge-num">${phaseInfo.stepInPhase}</span>
          <span class="iaw-step-badge-of">of ${phaseInfo.totalInPhase}</span>
        </div>
        <p class="iaw-step-phase">${phase.label}</p>
      </header>

      <h2 class="iaw-step-title">${escapeHtml(resolveStepTitle(step))}</h2>
      ${step.prompt ? `<p class="iaw-step-prompt">${escapeHtml(step.prompt)}</p>` : ""}

      ${bodyMarkup}

      <nav class="iaw-step-nav" aria-label="Step navigation">
        <button class="iaw-btn iaw-btn-ghost" id="iawPrev" type="button" ${currentIndex === 0 ? "disabled" : ""}>
          ← Previous
        </button>
        <div class="iaw-step-save" id="iawSaveHint" aria-live="polite">${isInfo ? "Included in your report" : "Draft saved automatically"}</div>
        <button class="iaw-btn iaw-btn-primary" id="iawNext" type="button">
          ${currentIndex === steps.length - 1 ? "Finish" : "Next"} →
        </button>
      </nav>
    `;

    stepRoot.appendChild(card);

    // Restore answer / wire input
    if (isProblem) {
      const listRoot = card.querySelector(".iaw-problem-list");
      wireProblemList(listRoot, step);
      applyAllFieldDisclosure(listRoot, step);
      const firstInput = listRoot.querySelector(".iaw-problem-input");
      if (firstInput) firstInput.focus({ preventScroll: true });
    } else if (isFoundation) {
      const root = card.querySelector(".iaw-foundation");
      wireIdentityFoundation(root, step);
      const firstPick = root.querySelector(".iaw-id-pick");
      if (firstPick) firstPick.focus({ preventScroll: true });
    } else if (isSsmart) {
      const root = card.querySelector(".iaw-ssmart");
      wireSsmart(root, step);
      const firstInput = root.querySelector('[data-ssmart="action"]');
      if (firstInput) firstInput.focus({ preventScroll: true });
    } else if (isDistraction) {
      const root = card.querySelector(".iaw-distraction-board");
      wireDistractionBoard(root, step);
    } else if (isFriction) {
      const root = card.querySelector(".iaw-friction");
      wireFrictionReducer(root, step);
    } else if (isStakes) {
      const root = card.querySelector(".iaw-stakes");
      wireStakes(root, step);
    } else if (isScenarios) {
      const root = card.querySelector(".iaw-scenarios");
      wireScenarioPlans(root, step);
    } else if (isMissedDay) {
      const root = card.querySelector(".iaw-missed");
      wireMissedDayPlan(root, step);
    } else {
      const input = card.querySelector(".iaw-step-input");
      if (input) {
        input.value = answers[step.id] || "";
        input.focus({ preventScroll: true });

        input.addEventListener("input", () => {
          answers[step.id] = input.value;
          if (step.timerSeconds && input.value.trim() && !timerState.has(step.id)) {
            startTimer(step.id, step.timerSeconds);
          }
          updateProgress();
        });
      }
    }

    // If a timer was already running for this step, resume its display
    if (step.timerSeconds && timerState.has(step.id)) {
      const s = timerState.get(step.id);
      const timerEl = document.getElementById(`timer-${step.id}`);
      if (timerEl) timerEl.textContent = s.remaining <= 0 ? "Time's up — keep going if you need." : formatTime(s.remaining);
    }

    card.querySelector("#iawPrev").addEventListener("click", () => goTo(currentIndex - 1));
    card.querySelector("#iawNext").addEventListener("click", () => {
      if (currentIndex === steps.length - 1) {
        finish();
      } else {
        goTo(currentIndex + 1);
      }
    });

    // Animate in
    requestAnimationFrame(() => card.classList.add("is-in"));

    updateProgress();
  }

  function goTo(idx) {
    if (idx < 0 || idx >= steps.length) return;
    currentIndex = idx;
    renderStep();
    // Keep the step roughly in view
    stepRoot.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function finish() {
    // Persist final answer
    persistCurrentInputs();
    reportCard.classList.remove("is-hidden");
    reportCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Timers -----------------------------------------------------------------
  function startTimer(stepId, totalSeconds) {
    const state = { remaining: totalSeconds };
    timerState.set(stepId, state);

    const tick = () => {
      state.remaining -= 1;
      const el = document.getElementById(`timer-${stepId}`);
      if (el) el.textContent = state.remaining <= 0 ? "Time's up — keep going if you need." : formatTime(state.remaining);
      if (state.remaining <= 0) clearInterval(state.intervalId);
    };
    state.intervalId = setInterval(tick, 1000);
  }

  // Report generation ------------------------------------------------------
  buildReportBtn.addEventListener("click", () => {
    // Make sure we have the latest in-flight answer
    persistCurrentInputs();

    const today = new Date();
    const structuredTypes = new Set([
      "problem-list", "ssmart-builder", "stakes-builder",
      "distraction-board", "friction-reducer", "scenario-plans", "missed-day-plan",
    ]);
    const reportData = steps
      .filter((step) => step.type !== "info")
      .map((step, i) => ({
        number: i + 1,
        title: resolveStepTitle(step),
        phase: PHASES[step.phase].label,
        type: step.type,
        entryLabel: entryLabelOf(step),
        fields: getFields(step),
        tactics: step.tactics || [],
        scenarios: step.scenarios || [],
        suggestions: step.suggestions || [],
        value: structuredTypes.has(step.type)
          ? answers[step.id]
          : ((answers[step.id] || "").trim() || "(No response entered)"),
      }));

    const gridDays = createGridDays(today, 28);
    const ssmart = answers["ssmart"] || emptySsmart();
    reportOutput.innerHTML = renderReportPreview(reportData, gridDays, today, ssmart);

    const downloadable = buildDownloadHtml(reportData, gridDays, today, ssmart);
    const blob = new Blob([downloadable], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const existing = document.getElementById("downloadReportLink");
    if (existing) existing.remove();

    const link = document.createElement("a");
    link.id = "downloadReportLink";
    link.className = "btn-secondary";
    link.href = url;
    link.download = `inspire-action-report-${toIsoDate(today)}.html`;
    link.textContent = "Download report (.html)";
    reportOutput.appendChild(link);
  });

  function renderReportPreview(data, gridDays, startDate, ssmart) {
    const rows = data
      .map((item) => `
        <div class="preview-block">
          <h4>${item.number}. ${escapeHtml(item.title)}</h4>
          ${renderReportValue(item, "preview")}
        </div>`)
      .join("");
    const grid = renderGridTable(gridDays, ssmart);
    const dayStr = selectedDayLabels(ssmart).join(", ") || "(no days chosen yet)";
    return `
      <div class="preview-head">
        <h3>Your custom report</h3>
        <p>Start date: ${humanDate(startDate)} · Scheduled: ${escapeHtml(dayStr)} · 4-week tracker included.</p>
      </div>
      ${rows}
      <div class="preview-block">
        <h4>4-week progress grid</h4>
        ${grid}
      </div>
    `;
  }

  function buildDownloadHtml(data, gridDays, startDate, ssmart) {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Inspire Action Report</title>
<style>
  body { font-family: Inter, Arial, sans-serif; margin: 28px; color: #1a1d2e; line-height: 1.55; }
  h1, h2 { font-family: Georgia, serif; font-weight: 500; }
  h1 { font-size: 2.2rem; margin-bottom: 4px; }
  .meta { color: #6b6a73; margin-bottom: 24px; }
  .block { margin: 0 0 18px; padding: 16px 18px; border: 1px solid #e4dcca; border-radius: 12px; background: #fbf7ef; }
  .block h2 { margin: 0 0 6px; font-size: 1.15rem; }
  .block .phase { text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.72rem; color: #b8864f; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 14px; }
  th { background: #f0e9dd; }
  .box { font-size: 16px; }
  .report-problem { margin: 10px 0 14px; padding: 10px 12px; border: 1px solid #ecdfc8; border-radius: 8px; background: #fffaf0; }
  .report-problem h5 { margin: 0 0 6px; font-family: Georgia, serif; font-size: 1rem; color: #9e5447; }
  .report-problem p { margin: 4px 0; }
</style>
</head>
<body>
  <h1>Inspire Action Report</h1>
  <p class="meta"><strong>Start date:</strong> ${humanDate(startDate)} &nbsp;·&nbsp; <strong>Duration:</strong> 4 weeks (28 days)</p>
  ${data.map((item) => `
    <section class="block">
      <div class="phase">${escapeHtml(item.phase)}</div>
      <h2>${item.number}. ${escapeHtml(item.title)}</h2>
      ${renderReportValue(item, "download")}
    </section>`).join("")}
  <section class="block">
    <h2>4-week progress grid</h2>
    <p>Mark one box on every <strong>scheduled</strong> day when you complete your SSMART action. Rest days are on purpose — don't feel you need to fill them in.</p>
    ${renderGridTable(gridDays, ssmart)}
  </section>
</body>
</html>`;
  }

  function renderReportValue(item, _mode) {
    if (item.type === "stakes-builder") {
      const s = item.value || emptyStakes();
      const hasAny = String(s.chosen || "").trim() || String(s.detail || "").trim();
      if (!hasAny) return `<p>(No stakes set)</p>`;
      const sug = (item.suggestions || []).find((x) => x.key === s.chosen);
      return `
        <div class="report-problem">
          ${sug ? `<h5>${escapeHtml(sug.icon + " " + sug.label)}</h5>` : ""}
          ${s.detail ? `<p>${escapeHtml(s.detail)}</p>` : ""}
          ${s.amount ? `<p><strong>Amount / measure:</strong> ${escapeHtml(s.amount)}</p>` : ""}
        </div>
      `;
    }
    if (item.type === "ssmart-builder") {
      const s = item.value || emptySsmart();
      const hasAny = [s.action, s.measure, s.time].some((v) => String(v || "").trim())
        || countSelectedDays(s) > 0;
      if (!hasAny) return `<p>(No SSMART task built yet)</p>`;
      const dayStr = selectedDayLabels(s).join(", ") || "(no days chosen)";
      return `
        <p><strong>Action:</strong> ${escapeHtml(s.action || "—")}</p>
        <p><strong>Measure:</strong> ${escapeHtml(s.measure || "—")}</p>
        <p><strong>Time of day:</strong> ${escapeHtml(s.time || "—")}</p>
        <p><strong>Days:</strong> ${escapeHtml(dayStr)}</p>
      `;
    }
    if (item.type === "distraction-board") {
      const list = Array.isArray(item.value) ? item.value.filter((d) => (d.what || "").trim()) : [];
      if (!list.length) return `<p>(No distractions listed)</p>`;
      const tacticLabel = (key) => {
        const t = (item.tactics || []).find((x) => x.key === key);
        return t ? t.label : "—";
      };
      return list.map((d) => `
        <div class="report-problem">
          <p><strong>${escapeHtml(d.what)}</strong> — <em>${escapeHtml(tacticLabel(d.tactic))}</em></p>
        </div>
      `).join("");
    }
    if (item.type === "friction-reducer") {
      const state = item.value || {};
      const active = (item.tactics || []).filter((t) => state[t.key] && state[t.key].on);
      if (!active.length) return `<p>(No friction-reducing tactics chosen)</p>`;
      return active.map((t) => {
        const detail = (state[t.key].detail || "").trim();
        return `
          <div class="report-problem">
            <h5>${escapeHtml(t.title)}</h5>
            <p>${detail ? escapeHtml(detail) : "<em>(no details added)</em>"}</p>
          </div>
        `;
      }).join("");
    }
    if (item.type === "scenario-plans") {
      const state = item.value || {};
      const rows = (item.scenarios || [])
        .map((s) => ({ s, v: (state[s.key] || "").trim() }))
        .filter(({ v }) => v);
      if (!rows.length) return `<p>(No fallback plans added)</p>`;
      return rows.map(({ s, v }) => `
        <div class="report-problem">
          <h5>${escapeHtml(s.label)}</h5>
          <p>${escapeHtml(v)}</p>
        </div>
      `).join("");
    }
    if (item.type === "missed-day-plan") {
      const state = item.value || {};
      const mantra  = (state.mantra  || "").trim();
      const restart = (state.restart || "").trim();
      if (!mantra && !restart) return `<p>(No missed-day plan yet)</p>`;
      return `
        ${mantra  ? `<p><strong>Self-forgiveness:</strong> "${escapeHtml(mantra)}"</p>` : ""}
        ${restart ? `<p><strong>Tomorrow's restart:</strong> ${escapeHtml(restart)}</p>` : ""}
      `;
    }
    if (item.type !== "problem-list") {
      return `<p>${escapeHtml(item.value)}</p>`;
    }
    const fields = item.fields || [];
    const label  = item.entryLabel || "Item";
    const isEntryEmpty = (p) => fields.every((f) => !((p && p[f.key]) || "").trim());
    const list = Array.isArray(item.value) ? item.value.filter((p) => !isEntryEmpty(p)) : [];
    if (list.length === 0) return `<p>(No ${escapeHtml(label.toLowerCase())}s listed)</p>`;
    return list.map((p, idx) => {
      const rows = fields.map((f) => {
        const v = (p[f.key] || "").trim();
        if (!v) return "";
        return `<p><strong>${escapeHtml(f.label)}:</strong> ${escapeHtml(v)}</p>`;
      }).join("");
      return `
        <div class="report-problem">
          <h5>${escapeHtml(label)} ${idx + 1}</h5>
          ${rows}
        </div>
      `;
    }).join("");
  }

  function createGridDays(startDate, count) {
    const out = [];
    const base = new Date(startDate);
    base.setHours(0, 0, 0, 0);
    for (let i = 0; i < count; i += 1) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      out.push(d);
    }
    return out;
  }

  function renderGridTable(days, ssmart) {
    const scheduled = (ssmart && Array.isArray(ssmart.days)) ? ssmart.days : [];
    const anyScheduled = scheduled.some(Boolean);
    let html = '<table><thead><tr><th>Week</th><th>Day</th><th>Date</th><th>Done?</th></tr></thead><tbody>';
    days.forEach((day, idx) => {
      const week = Math.floor(idx / 7) + 1;
      const dow = dayIndexFromDate(day);
      const isOn = anyScheduled ? !!scheduled[dow] : true; // if no days picked, fall back to every day
      const cell = isOn ? "☐" : "— (rest)";
      const rowStyle = isOn ? "" : ' style="color:#a19789;background:#faf6ec;"';
      html += `<tr${rowStyle}><td>Week ${week}</td><td>${escapeHtml(DAY_LABELS[dow])}</td><td>${humanDate(day)}</td><td class="box">${cell}</td></tr>`;
    });
    html += "</tbody></table>";
    return html;
  }

  // Animated 4-week chart (used inside the tracking info step) ------------
  function renderAnimatedGrid(ssmart, startDate) {
    const rows = 4;
    const cols = 7;
    const startCol = dayIndexFromDate(startDate || new Date()); // Mon=0..Sun=6
    const days = (ssmart && Array.isArray(ssmart.days))
      ? ssmart.days
      : [false, false, false, false, false, false, false];
    const anyScheduled = days.some(Boolean);

    let cells = "";
    let animIdx = 0;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const isPreStart = r === 0 && c < startCol;
        const isScheduled = days[c];
        const isStartCell = r === 0 && c === startCol;

        let cls = "iaw-chart-cell";
        if (isPreStart) cls += " is-prestart";
        if (!isPreStart && isScheduled) cls += " is-scheduled";
        if (!isPreStart && !isScheduled) cls += " is-rest";
        if (isStartCell) cls += " is-start";

        // Only schedule an animation delay for scheduled, on-or-after-start cells.
        const animate = !isPreStart && isScheduled && anyScheduled;
        const style = animate ? ` style="--i:${animIdx}"` : "";
        if (animate) animIdx += 1;

        const inner = animate
          ? `<span class="iaw-chart-tick"></span>`
          : (isPreStart ? "" : `<span class="iaw-chart-rest" aria-hidden="true"></span>`);
        cells += `<span class="${cls}"${style} aria-hidden="true">${inner}</span>`;
      }
    }
    const header = DAY_SHORT.map((d, i) => {
      const isToday = i === startCol;
      return `<span class="iaw-chart-head${isToday ? " is-today" : ""}">${d}</span>`;
    }).join("");
    const weekLabels = [1, 2, 3, 4].map((w) => `<span class="iaw-chart-week">Week ${w}</span>`).join("");
    return `
      <div class="iaw-chart" role="img" aria-label="Personalised 4-week tracking chart preview, starting today">
        <div class="iaw-chart-weeks">${weekLabels}</div>
        <div class="iaw-chart-body">
          <div class="iaw-chart-head-row">${header}</div>
          <div class="iaw-chart-grid">${cells}</div>
        </div>
      </div>
    `;
  }

  // Helpers ----------------------------------------------------------------
  function toIsoDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function humanDate(d) {
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Keyboard shortcuts — Alt+Arrow to navigate
  document.addEventListener("keydown", (e) => {
    if (!e.altKey) return;
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(currentIndex + 1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); goTo(currentIndex - 1); }
  });

  // Boot -------------------------------------------------------------------
  loadFromLocalStorage();
  layoutPhases();
  renderStep();
})();
