(function () {
  const root = document.getElementById("feelings-flow");
  if (!root || typeof FEELING_DATA === "undefined") return;

  const promptEl = document.getElementById("feelings-prompt");
  const helperEl = document.getElementById("feelings-helper");

  if (promptEl) promptEl.textContent = FEELING_DATA.prompt;
  if (helperEl) helperEl.textContent = FEELING_DATA.helperText;

  const totalFeelings = FEELING_DATA.feelings.length;
  const totalReasons = FEELING_DATA.feelings.reduce(
    (sum, item) => sum + item.reasons.length,
    0,
  );

  root.innerHTML = `
    <section class="db-summary" aria-label="Database summary">
      <strong>Inaction database:</strong> ${totalFeelings} feelings and ${totalReasons} common blockers.
    </section>

    <section>
      <h2 class="flow-title">Step 1: Pick your feeling</h2>
      <div class="pill-grid" id="feeling-options" role="radiogroup" aria-label="Feelings"></div>
    </section>

    <section id="reason-section" class="flow-section is-hidden" aria-live="polite">
      <h2 class="flow-title">Step 2: Pick the reason</h2>
      <div class="pill-grid" id="reason-options" role="radiogroup" aria-label="Reasons"></div>
    </section>

    <section id="report-section" class="flow-section report is-hidden" aria-live="polite">
      <h2 class="flow-title">Step 3: Read and act</h2>
      <div class="report-block">
        <div class="report-label">Why you may feel stuck</div>
        <p id="report-explanation"></p>
      </div>
      <div class="report-block">
        <div class="report-label">What to do now</div>
        <p id="report-solution"></p>
      </div>
    </section>
  `;

  const feelingWrap = root.querySelector("#feeling-options");
  const reasonSection = root.querySelector("#reason-section");
  const reasonWrap = root.querySelector("#reason-options");
  const reportSection = root.querySelector("#report-section");
  const reportExplanation = root.querySelector("#report-explanation");
  const reportSolution = root.querySelector("#report-solution");

  let selectedFeelingId = null;
  let selectedReasonId = null;

  FEELING_DATA.feelings.forEach((feeling) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pill-btn";
    btn.dataset.feelingId = feeling.id;
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", "false");
    btn.textContent = feeling.label;

    btn.addEventListener("click", () => {
      selectedFeelingId = feeling.id;
      selectedReasonId = null;
      syncFeelingSelection();
      renderReasons(feeling.reasons);
      hideReport();
      reasonSection.classList.remove("is-hidden");
      reasonSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    feelingWrap.appendChild(btn);
  });

  function renderReasons(reasons) {
    reasonWrap.innerHTML = "";

    reasons.forEach((reason) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pill-btn pill-btn--reason";
      btn.dataset.reasonId = reason.id;
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", "false");
      btn.textContent = reason.label;

      btn.addEventListener("click", () => {
        selectedReasonId = reason.id;
        syncReasonSelection();
        showReport(reason);
        reportSection.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      reasonWrap.appendChild(btn);
    });
  }

  function showReport(reason) {
    reportExplanation.textContent = reason.explanation;
    reportSolution.textContent = reason.solution;
    reportSection.classList.remove("is-hidden");
  }

  function hideReport() {
    reportSection.classList.add("is-hidden");
    reportExplanation.textContent = "";
    reportSolution.textContent = "";
  }

  function syncFeelingSelection() {
    root.querySelectorAll("[data-feeling-id]").forEach((el) => {
      const active = el.dataset.feelingId === selectedFeelingId;
      el.classList.toggle("is-selected", active);
      el.setAttribute("aria-checked", active ? "true" : "false");
    });
  }

  function syncReasonSelection() {
    root.querySelectorAll("[data-reason-id]").forEach((el) => {
      const active = el.dataset.reasonId === selectedReasonId;
      el.classList.toggle("is-selected", active);
      el.setAttribute("aria-checked", active ? "true" : "false");
    });
  }
})();
