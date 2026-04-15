(function () {
  // Phases mirror the three reasons from the intro. Each step belongs to one.
  const PHASES = {
    want:     { key: "want",     label: "Establish what you want",           tone: "gold"  },
    feel:     { key: "feel",     label: "Explore the emotional depth",       tone: "terra" },
    structure:{ key: "structure",label: "Structure your life for action",    tone: "teal"  },
  };

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
      prompt: "Include how often each problem happens and exactly how each one feels.",
      example: "Take your time — five minutes of honesty here is worth an hour of planning later.",
      type: "textarea", timerSeconds: 300 },
    { id: "positive-outcomes", phase: "feel",      title: "Positive outcomes if you fix this behaviour",
      prompt: "Include immediate + long-term outcomes and how each one feels.",
      example: "Imagine the first week, the first month, the first year. Let yourself want it.",
      type: "textarea", timerSeconds: 300 },
    { id: "future-problems",   phase: "feel",      title: "If nothing changes — 6 months, 1 year, 2 years",
      prompt: "Write it all down. Turn this into a mood board somewhere visible.",
      example: "Don't soften it. Future-you deserves an honest warning.",
      type: "textarea", timerSeconds: 120 },
    { id: "ssmart",            phase: "structure", title: "Create one SSMART task",
      prompt: "Small, Specific, Measurable, Attainable, Relevant, Time-bound. Just one.",
      example: "Example: Walk 20 minutes at 7am, Monday to Friday.",
      type: "textarea" },
    { id: "task-identity",     phase: "structure", title: "Tie the task to identity",
      prompt: "Write it as a statement your identity would make, not a wish.",
      example: "Example: I put my gym clothes on every day, no matter what.",
      type: "textarea" },
    { id: "distractions",      phase: "structure", title: "Remove distractions",
      prompt: "What will you remove, block, mute, or move out of sight?",
      example: "Example: Phone charges in the kitchen. Notifications off after 9pm.",
      type: "textarea" },
    { id: "resistance",        phase: "structure", title: "Engineer out environmental resistance",
      prompt: "Make doing the habit easier by default. Reduce the steps to start.",
      example: "Example: Lay gym clothes on the chair the night before.",
      type: "textarea" },
    { id: "accountability",    phase: "structure", title: "Add accountability — gently",
      prompt: "Who sees your effort? How often? Keep self-worth separate from their reaction.",
      example: "Example: Send a thumbs-up in the group chat each morning I walk.",
      type: "textarea" },
    { id: "tracking",          phase: "structure", title: "Your 4-week progress chart",
      type: "info" },
    { id: "roadblocks",        phase: "structure", title: "Plan exceptions and roadblocks",
      prompt: "If sick, travelling, or blocked — what is your fallback task?",
      example: "Example: If I can't walk, I do 10 minutes of stretching at home.",
      type: "textarea" },
    { id: "missed-day",        phase: "structure", title: "If you miss a day",
      prompt: "Your self-forgiveness script and your restart plan for tomorrow.",
      example: "Example: 'One day isn't the pattern. Tomorrow I walk at 7am as planned.'",
      type: "textarea" },
  ];

  // State ------------------------------------------------------------------
  const answers = Object.fromEntries(steps.map((s) => [s.id, ""]));
  const timerState = new Map();
  let currentIndex = 0;

  // Elements ---------------------------------------------------------------
  const stepRoot     = document.getElementById("iawStep");
  const reportCard   = document.getElementById("iawReportCard");
  const reportOutput = document.getElementById("reportOutput");
  const buildReportBtn = document.getElementById("buildReportBtn");
  const stepNowEl    = document.getElementById("iawStepNow");
  const stepTotalEl  = document.getElementById("iawStepTotal");
  const phaseNameEl  = document.getElementById("iawPhaseName");
  const dotsEl       = document.getElementById("iawDots");
  const pathEl       = document.getElementById("iawPath");

  stepTotalEl.textContent = steps.length;

  // Build the zig-zag path + dots -----------------------------------------
  function layoutPath() {
    const n = steps.length;
    const vbW = 900;
    const vbH = 120;
    const padX = 36;
    const usableW = vbW - padX * 2;
    const topY = 28;
    const botY = vbH - 28;

    const points = steps.map((_, i) => {
      const x = padX + (usableW * i) / (n - 1);
      const y = i % 2 === 0 ? topY : botY;
      return { x, y };
    });

    // Clear
    pathEl.innerHTML = "";
    dotsEl.innerHTML = "";

    // Background polyline
    const ptsStr = points.map((p) => `${p.x},${p.y}`).join(" ");
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    bg.setAttribute("points", ptsStr);
    bg.setAttribute("class", "iaw-path-bg");
    pathEl.appendChild(bg);

    // Progress polyline — updated when current step changes
    const fg = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    fg.setAttribute("class", "iaw-path-fg");
    fg.id = "iawPathFg";
    pathEl.appendChild(fg);

    // Dots are positioned as percentages so they sit on top of the SVG.
    points.forEach((p, i) => {
      const li = document.createElement("li");
      li.className = "iaw-dot " + toneClass(steps[i].phase);
      li.style.left = `${(p.x / vbW) * 100}%`;
      li.style.top  = `${(p.y / vbH) * 100}%`;
      li.dataset.index = String(i);
      li.title = `Step ${i + 1}: ${steps[i].title}`;
      li.setAttribute("role", "button");
      li.setAttribute("tabindex", "0");
      li.setAttribute("aria-label", `Go to step ${i + 1}: ${steps[i].title}`);
      li.innerHTML = `<span class="iaw-dot-num">${i + 1}</span>`;
      li.addEventListener("click", () => goTo(i));
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goTo(i); }
      });
      dotsEl.appendChild(li);
    });

    // Store points for progress updates
    pathEl.dataset.points = JSON.stringify(points);
  }

  function updatePath() {
    const points = JSON.parse(pathEl.dataset.points || "[]");
    if (!points.length) return;

    // Progress polyline — from start to current index
    const fg = document.getElementById("iawPathFg");
    const slice = points.slice(0, currentIndex + 1);
    fg.setAttribute("points", slice.map((p) => `${p.x},${p.y}`).join(" "));

    // Dot states
    Array.from(dotsEl.children).forEach((node, i) => {
      const done = i < currentIndex && (steps[i].type === "info" || answers[steps[i].id].trim() !== "");
      node.classList.toggle("is-done",    done);
      node.classList.toggle("is-touched", i <  currentIndex);
      node.classList.toggle("is-current", i === currentIndex);
    });
  }

  function toneClass(phaseKey) {
    const p = PHASES[phaseKey];
    return p ? `tone-${p.tone}` : "";
  }

  // Render a single step ---------------------------------------------------
  function renderStep() {
    // Persist previous answer before re-rendering
    const existingInput = stepRoot.querySelector(".iaw-step-input");
    if (existingInput && existingInput.dataset.stepId) {
      answers[existingInput.dataset.stepId] = existingInput.value;
    }

    stepRoot.innerHTML = "";

    const step  = steps[currentIndex];
    const phase = PHASES[step.phase];

    const card = document.createElement("article");
    card.className = `iaw-step-card ${toneClass(step.phase)}`;

    const isInfo  = step.type === "info";
    const isShort = step.type === "short";

    const bodyMarkup = isInfo
      ? `
        <div class="iaw-info">
          <p class="iaw-info-lead">A visible chart turns intention into <strong>evidence</strong>. Every tick is proof — to you — of your new identity, and a quiet promise kept to your future self.</p>
          ${renderAnimatedGrid()}
          <p class="iaw-info-note">This chart will be included in your report — print it, stick it somewhere hard to ignore, and mark one box each day.</p>
        </div>
      `
      : `
        ${step.timerSeconds ? `
          <div class="iaw-timer" id="timer-wrap-${step.id}">
            <span class="iaw-timer-dot" aria-hidden="true"></span>
            <span class="iaw-timer-label">Suggested time</span>
            <span class="iaw-timer-value" id="timer-${step.id}">${formatTime(step.timerSeconds)}</span>
          </div>
        ` : ""}

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

    card.innerHTML = `
      <header class="iaw-step-head">
        <div class="iaw-step-badge">
          <span class="iaw-step-badge-label">Step</span>
          <span class="iaw-step-badge-num">${currentIndex + 1}</span>
          <span class="iaw-step-badge-of">of ${steps.length}</span>
        </div>
        <p class="iaw-step-phase">${phase.label}</p>
      </header>

      <h2 class="iaw-step-title">${escapeHtml(step.title)}</h2>
      ${step.prompt ? `<p class="iaw-step-prompt">${escapeHtml(step.prompt)}</p>` : ""}

      ${bodyMarkup}

      <nav class="iaw-step-nav" aria-label="Step navigation">
        <button class="iaw-btn iaw-btn-ghost" id="iawPrev" type="button" ${currentIndex === 0 ? "disabled" : ""}>
          ← Previous
        </button>
        <div class="iaw-step-save" id="iawSaveHint" aria-live="polite">${isInfo ? "Included in your report" : "Draft kept in this tab"}</div>
        <button class="iaw-btn iaw-btn-primary" id="iawNext" type="button">
          ${currentIndex === steps.length - 1 ? "Finish" : "Next"} →
        </button>
      </nav>
    `;

    stepRoot.appendChild(card);

    // Restore answer / wire input
    const input = card.querySelector(".iaw-step-input");
    if (input) {
      input.value = answers[step.id] || "";
      input.focus({ preventScroll: true });

      input.addEventListener("input", () => {
        answers[step.id] = input.value;
        if (step.timerSeconds && input.value.trim() && !timerState.has(step.id)) {
          startTimer(step.id, step.timerSeconds);
        }
        updatePath();
      });
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

    // Meta
    stepNowEl.textContent = String(currentIndex + 1);
    phaseNameEl.textContent = phase.label;

    // Animate in
    requestAnimationFrame(() => card.classList.add("is-in"));

    updatePath();
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
    const inp = stepRoot.querySelector(".iaw-step-input");
    if (inp) answers[inp.dataset.stepId] = inp.value;
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
    const inp = stepRoot.querySelector(".iaw-step-input");
    if (inp) answers[inp.dataset.stepId] = inp.value;

    const today = new Date();
    const reportData = steps
      .filter((step) => step.type !== "info")
      .map((step, i) => ({
        number: i + 1,
        title: step.title,
        phase: PHASES[step.phase].label,
        value: (answers[step.id] || "").trim() || "(No response entered)",
      }));

    const gridDays = createGridDays(today, 28);
    reportOutput.innerHTML = renderReportPreview(reportData, gridDays, today);

    const downloadable = buildDownloadHtml(reportData, gridDays, today);
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

  function renderReportPreview(data, gridDays, startDate) {
    const rows = data
      .map((item) => `
        <div class="preview-block">
          <h4>${item.number}. ${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.value)}</p>
        </div>`)
      .join("");
    const grid = renderGridTable(gridDays);
    return `
      <div class="preview-head">
        <h3>Your custom report</h3>
        <p>Start date: ${humanDate(startDate)} · 4-week tracker included.</p>
      </div>
      ${rows}
      <div class="preview-block">
        <h4>4-week progress grid</h4>
        ${grid}
      </div>
    `;
  }

  function buildDownloadHtml(data, gridDays, startDate) {
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
</style>
</head>
<body>
  <h1>Inspire Action Report</h1>
  <p class="meta"><strong>Start date:</strong> ${humanDate(startDate)} &nbsp;·&nbsp; <strong>Duration:</strong> 4 weeks (28 days)</p>
  ${data.map((item) => `
    <section class="block">
      <div class="phase">${escapeHtml(item.phase)}</div>
      <h2>${item.number}. ${escapeHtml(item.title)}</h2>
      <p>${escapeHtml(item.value)}</p>
    </section>`).join("")}
  <section class="block">
    <h2>4-week progress grid</h2>
    <p>Mark one box each day when you complete your SSMART action.</p>
    ${renderGridTable(gridDays)}
  </section>
</body>
</html>`;
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

  function renderGridTable(days) {
    let html = '<table><thead><tr><th>Week</th><th>Date</th><th>Done?</th></tr></thead><tbody>';
    days.forEach((day, idx) => {
      const week = Math.floor(idx / 7) + 1;
      html += `<tr><td>Week ${week}</td><td>${humanDate(day)}</td><td class="box">☐</td></tr>`;
    });
    html += "</tbody></table>";
    return html;
  }

  // Animated 4-week chart (used inside the tracking info step) ------------
  function renderAnimatedGrid() {
    const rows = 4;
    const cols = 7;
    const dayNames = ["M", "T", "W", "T", "F", "S", "S"];
    let cells = "";
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const idx = r * cols + c;
        cells += `<span class="iaw-chart-cell" style="--i:${idx}" aria-hidden="true"><span class="iaw-chart-tick"></span></span>`;
      }
    }
    const header = dayNames.map((d) => `<span class="iaw-chart-head">${d}</span>`).join("");
    const weekLabels = [1, 2, 3, 4].map((w) => `<span class="iaw-chart-week">Week ${w}</span>`).join("");
    return `
      <div class="iaw-chart" role="img" aria-label="Animated preview of a 4-week tracking chart, 28 days">
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
  layoutPath();
  renderStep();
})();
