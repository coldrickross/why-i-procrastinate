(function () {
  const steps = [
    {
      id: "identity-shift",
      label: "Step 1",
      title: "Establish what you actually want",
      description: "Choose a long-term goal, then rewrite it as a personal identity.",
      fields: [
        {
          id: "long-term-goal",
          label: "Decide a long-term goal",
          placeholder: "Example: Build a stronger, healthier life with consistent training.",
        },
        {
          id: "goal-identity",
          label: "Turn your goal into an identity statement",
          placeholder: "Example: I am an athlete who keeps promises to myself.",
        },
      ],
    },
    {
      id: "emotional-depth",
      label: "Step 2",
      title: "Explore emotional depth",
      description: "Name the pain of staying the same and the payoff of changing.",
      fields: [
        {
          id: "current-problems",
          label: "Problems caused by current actions",
          placeholder: "What is it costing you emotionally, socially, physically, financially?",
        },
        {
          id: "positive-outcomes",
          label: "Positive outcomes if you follow through",
          placeholder: "Write immediate benefits and long-term outcomes.",
        },
      ],
    },
    {
      id: "design-environment",
      label: "Step 3",
      title: "Structure your life for easier action",
      description: "Define one SSMART task and remove friction around it.",
      fields: [
        {
          id: "ssmart-task",
          label: "Your one SSMART task",
          placeholder: "Small, Specific, Measurable, Attainable, Relevant, Time-bound.",
        },
        {
          id: "friction-plan",
          label: "Friction-reduction plan",
          placeholder: "What will you remove, prepare, block, or automate?",
        },
      ],
    },
  ];

  const state = {
    activeStepIndex: 0,
  };

  const stepperTrail = document.getElementById("stepperTrail");
  const stageKicker = document.getElementById("stageKicker");
  const stageTitle = document.getElementById("stageTitle");
  const stageDescription = document.getElementById("stageDescription");
  const stageFields = document.getElementById("stageFields");
  const prevStepBtn = document.getElementById("prevStepBtn");
  const nextStepBtn = document.getElementById("nextStepBtn");
  const reportOutput = document.getElementById("reportOutput");
  const buildReportBtn = document.getElementById("buildReportBtn");

  buildStepper();
  renderStep();

  prevStepBtn.addEventListener("click", () => {
    if (state.activeStepIndex === 0) return;
    state.activeStepIndex -= 1;
    renderStep();
  });

  nextStepBtn.addEventListener("click", () => {
    if (state.activeStepIndex === steps.length - 1) return;
    state.activeStepIndex += 1;
    renderStep();
  });

  buildReportBtn.addEventListener("click", () => {
    const today = new Date();
    const reportData = flattenStepFields().map((field) => ({
      title: field.label,
      value: getFieldValue(field.id),
    }));

    const gridDays = createGridDays(today, 28);
    reportOutput.innerHTML = renderReportPreview(reportData, gridDays, today);

    const downloadable = buildDownloadHtml(reportData, gridDays, today);
    const blob = new Blob([downloadable], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const existing = document.getElementById("downloadReportLink");
    if (existing) {
      URL.revokeObjectURL(existing.href);
      existing.remove();
    }

    const link = document.createElement("a");
    link.id = "downloadReportLink";
    link.className = "btn-secondary";
    link.href = url;
    link.download = `inspire-action-report-${toIsoDate(today)}.html`;
    link.textContent = "Download report (.html)";
    reportOutput.appendChild(link);
  });

  function buildStepper() {
    stepperTrail.innerHTML = steps
      .map(
        (step, idx) => `
        <li class="trail-node" data-step="${idx}">
          <button type="button" class="trail-dot" aria-label="${step.label}">${idx + 1}</button>
          <span class="trail-text">${step.label}</span>
        </li>`,
      )
      .join("");

    stepperTrail.querySelectorAll(".trail-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        const parent = dot.closest(".trail-node");
        if (!parent) return;
        const idx = Number(parent.dataset.step);
        if (Number.isNaN(idx)) return;
        state.activeStepIndex = idx;
        renderStep();
      });
    });
  }

  function renderStep() {
    const step = steps[state.activeStepIndex];

    stageKicker.textContent = step.label;
    stageTitle.textContent = step.title;
    stageDescription.textContent = step.description;
    stageFields.innerHTML = step.fields
      .map((field) => {
        const value = getFieldValue(field.id);
        return `
          <label class="stage-field" for="${field.id}">
            <span>${field.label}</span>
            <textarea id="${field.id}" class="step-input" rows="4" placeholder="${escapeHtml(field.placeholder)}">${escapeHtml(value)}</textarea>
          </label>
        `;
      })
      .join("");

    stageFields.querySelectorAll(".step-input").forEach((input) => {
      input.addEventListener("input", (event) => {
        const target = event.target;
        localStorage.setItem(storageKey(target.id), target.value);
      });
    });

    prevStepBtn.disabled = state.activeStepIndex === 0;
    nextStepBtn.disabled = state.activeStepIndex === steps.length - 1;
    nextStepBtn.textContent = state.activeStepIndex === steps.length - 1 ? "Complete Step 3" : "Next";

    stepperTrail.querySelectorAll(".trail-node").forEach((node) => {
      const idx = Number(node.dataset.step);
      node.classList.toggle("is-active", idx === state.activeStepIndex);
      node.classList.toggle("is-complete", idx < state.activeStepIndex);
    });
  }

  function flattenStepFields() {
    return steps.flatMap((step) => step.fields);
  }

  function getFieldValue(id) {
    return localStorage.getItem(storageKey(id)) || "";
  }

  function storageKey(id) {
    return `worksheet:${id}`;
  }

  function renderReportPreview(data, gridDays, startDate) {
    const rows = data
      .map((item) => `<div class="preview-block"><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.value || "(No response entered)")}</p></div>`)
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
<title>Inspire Action Worksheet Report</title>
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
  <h1>Inspire Action Worksheet Report</h1>
  <p><strong>Start date:</strong> ${humanDate(startDate)}<br/><strong>Duration:</strong> 4 weeks (28 days)</p>
  ${data.map((item) => `<section class="block"><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.value || "(No response entered)")}</p></section>`).join("")}
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

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
