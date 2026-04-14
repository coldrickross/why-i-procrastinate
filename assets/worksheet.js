(function () {
  const steps = [
    { id: "goal", number: 0, title: "Decide a long-term goal", prompt: "Example: Build a stronger, healthier life.", type: "textarea" },
    { id: "identity", number: 1, title: "Turn your goal into identity form", prompt: "Examples: Tidy person, Athlete, Person who makes hard choices.", type: "textarea" },
    { id: "facts", number: 2, title: "State the true facts about where you are today", prompt: "Write facts only. No drama. No hiding.", type: "textarea" },
    { id: "forgive", number: 3, title: "Practice radical self-forgiveness", prompt: "List what you forgive yourself for.", type: "textarea" },
    { id: "current-problems", number: 4, title: "List problems caused by current actions", prompt: "Include how often each problem happens and exactly how each one feels.", type: "textarea", timerSeconds: 300 },
    { id: "positive-outcomes", number: 5, title: "List positive outcomes if you fix this behavior", prompt: "Include immediate + long-term outcomes and how each feels.", type: "textarea", timerSeconds: 300 },
    { id: "future-problems", number: 6, title: "If nothing changes, what gets worse in 6 months, 1 year, 2 years?", prompt: "Write details. Then turn this into a mood board somewhere visible.", type: "textarea", timerSeconds: 120 },
    { id: "ssmart", number: 7, title: "Create one SSMART task", prompt: "Small, Specific, Measurable, Attainable, Relevant, Time-bound.", type: "textarea" },
    { id: "task-identity", number: 8, title: "Tie the task to identity", prompt: "Example: 'I put my gym clothes on every day, no matter what.'", type: "textarea" },
    { id: "distractions", number: 9, title: "Remove distractions", prompt: "What will you remove, block, mute, or move?", type: "textarea" },
    { id: "resistance", number: 10, title: "Engineer out environmental resistance", prompt: "Make doing the habit easier by default.", type: "textarea" },
    { id: "accountability", number: 11, title: "Add accountability without tying self-worth to others", prompt: "Who sees your effort? How often?", type: "textarea" },
    { id: "tracking", number: 12, title: "Track completion daily", prompt: "Where will you put your visible chart?", type: "textarea" },
    { id: "roadblocks", number: 13, title: "Plan exceptions and roadblocks", prompt: "If sick or blocked, what is your fallback task?", type: "textarea" },
    { id: "missed-day", number: 14, title: "If you miss a day", prompt: "Write your self-forgiveness script and your restart plan for tomorrow.", type: "textarea" },
  ];

  const stepRoot = document.getElementById("worksheetSteps");
  const reportOutput = document.getElementById("reportOutput");
  const buildReportBtn = document.getElementById("buildReportBtn");
  const timerState = new Map();

  steps.forEach((step) => {
    const card = document.createElement("article");
    card.className = "step-card";

    const title = document.createElement("h3");
    title.className = "step-title";
    title.textContent = `${step.number}. ${step.title}`;

    const hint = document.createElement("p");
    hint.className = "step-hint";
    hint.textContent = step.prompt;

    const field = document.createElement("textarea");
    field.id = step.id;
    field.rows = 4;
    field.className = "step-input";
    field.placeholder = "Write here...";

    card.appendChild(title);
    card.appendChild(hint);

    if (step.timerSeconds) {
      const timer = document.createElement("div");
      timer.className = "timer";
      timer.innerHTML = `<strong>Timer:</strong> <span id="timer-${step.id}">${formatTime(step.timerSeconds)}</span>`;
      card.appendChild(timer);

      field.addEventListener("input", () => {
        if (!field.value.trim()) return;
        if (!timerState.has(step.id)) {
          startTimer(step.id, step.timerSeconds);
        }
      });
    }

    card.appendChild(field);
    stepRoot.appendChild(card);
  });

  function startTimer(stepId, totalSeconds) {
    const timerEl = document.getElementById(`timer-${stepId}`);
    const state = { remaining: totalSeconds };
    timerState.set(stepId, state);

    const intervalId = setInterval(() => {
      state.remaining -= 1;
      timerEl.textContent = formatTime(Math.max(0, state.remaining));

      if (state.remaining <= 0) {
        clearInterval(intervalId);
        timerEl.textContent = "Time is up — keep going if needed.";
      }
    }, 1000);
  }

  buildReportBtn.addEventListener("click", () => {
    const today = new Date();
    const reportData = steps.map((step) => ({
      number: step.number,
      title: step.title,
      value: document.getElementById(step.id).value.trim() || "(No response entered)",
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
    link.download = `reset-worksheet-report-${toIsoDate(today)}.html`;
    link.textContent = "Download report (.html)";

    reportOutput.appendChild(link);
  });

  function renderReportPreview(data, gridDays, startDate) {
    const rows = data
      .map((item) => `<div class="preview-block"><h4>${item.number}. ${escapeHtml(item.title)}</h4><p>${escapeHtml(item.value)}</p></div>`)
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
<title>Custom Reset Worksheet Report</title>
<style>
  body { font-family: Inter, Arial, sans-serif; margin: 28px; color: #1a1d2e; line-height: 1.5; }
  h1, h2 { font-family: Georgia, serif; }
  .block { margin: 0 0 18px; padding: 14px; border: 1px solid #ddd; border-radius: 10px; background: #faf8f2; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 14px; }
  th { background: #f0e9dd; }
  .box { font-size: 16px; }
</style>
</head>
<body>
  <h1>Custom Reset Worksheet Report</h1>
  <p><strong>Start date:</strong> ${humanDate(startDate)}<br/><strong>Duration:</strong> 4 weeks (28 days)</p>
  ${data.map((item) => `<section class="block"><h2>${item.number}. ${escapeHtml(item.title)}</h2><p>${escapeHtml(item.value)}</p></section>`).join("")}
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
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
