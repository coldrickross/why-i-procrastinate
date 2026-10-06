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
    <ol class="flow-steps" aria-hidden="true">
      <li data-step="1" class="is-current"><span>1</span>Feeling</li>
      <li data-step="2"><span>2</span>Reason</li>
      <li data-step="3"><span>3</span>Next step</li>
    </ol>

    <section class="flow-section" aria-labelledby="feeling-title">
      <header class="flow-head">
        <span class="flow-num">01</span>
        <h2 class="flow-title" id="feeling-title">What are you feeling right now?</h2>
      </header>
      <div class="feeling-grid" id="feeling-options" role="radiogroup" aria-labelledby="feeling-title"></div>
    </section>

    <section id="reason-section" class="flow-section is-hidden" aria-live="polite" aria-labelledby="reason-title">
      <header class="flow-head">
        <span class="flow-num">02</span>
        <h2 class="flow-title" id="reason-title">Which reason fits best?</h2>
      </header>
      <div class="reason-list" id="reason-options" role="radiogroup" aria-labelledby="reason-title"></div>
    </section>

    <section id="report-section" class="flow-section is-hidden" aria-live="polite" aria-labelledby="report-title">
      <header class="flow-head">
        <span class="flow-num">03</span>
        <h2 class="flow-title" id="report-title">Read it, then act</h2>
      </header>
      <div class="report">
        <div class="report-block report-block--why">
          <div class="report-label">Why you may feel stuck</div>
          <p id="report-explanation"></p>
        </div>
        <div class="report-block report-block--do">
          <div class="report-label">What to do now</div>
          <p id="report-solution"></p>
        </div>
      </div>
      <div class="report-actions">
        <button type="button" class="btn btn-ghost" id="flow-restart">Start over</button>
        <a class="btn btn-primary" href="scale.html">Weigh it on the Scale &rarr;</a>
      </div>
    </section>
  `;

  const feelingWrap = root.querySelector("#feeling-options");
  const reasonSection = root.querySelector("#reason-section");
  const reasonWrap = root.querySelector("#reason-options");
  const reasonTitle = root.querySelector("#reason-title");
  const reportSection = root.querySelector("#report-section");
  const reportExplanation = root.querySelector("#report-explanation");
  const reportSolution = root.querySelector("#report-solution");
  const restartBtn = root.querySelector("#flow-restart");
  const stepEls = root.querySelectorAll(".flow-steps li");
  const footerSummary = document.getElementById("db-summary-footer");

  if (footerSummary) {
    footerSummary.textContent = `The inaction database covers ${totalFeelings} feelings and ${totalReasons} common blockers.`;
  }

  let selectedFeelingId = null;
  let selectedReasonId = null;

  FEELING_DATA.feelings.forEach((feeling, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "feeling-tile";
    btn.dataset.feelingId = feeling.id;
    btn.style.setProperty("--i", i);
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", "false");

    const label = document.createElement("span");
    label.className = "feeling-label";
    label.textContent = feeling.label;
    const count = document.createElement("span");
    count.className = "feeling-count";
    count.textContent = `${feeling.reasons.length} reasons`;
    btn.append(label, count);

    btn.addEventListener("click", () => {
      selectedFeelingId = feeling.id;
      selectedReasonId = null;
      syncFeelingSelection();
      reasonTitle.textContent = `Why do you feel ${feeling.label.toLowerCase()}?`;
      renderReasons(feeling.reasons);
      hideReport();
      reasonSection.classList.remove("is-hidden");
      setStep(2);
      reasonSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    feelingWrap.appendChild(btn);
  });

  restartBtn.addEventListener("click", () => {
    selectedFeelingId = null;
    selectedReasonId = null;
    syncFeelingSelection();
    hideReport();
    reasonSection.classList.add("is-hidden");
    reasonWrap.innerHTML = "";
    setStep(1);
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function renderReasons(reasons) {
    reasonWrap.innerHTML = "";

    reasons.forEach((reason) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "reason-row";
      btn.dataset.reasonId = reason.id;
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", "false");

      const mark = document.createElement("span");
      mark.className = "reason-mark";
      mark.setAttribute("aria-hidden", "true");
      const text = document.createElement("span");
      text.className = "reason-text";
      text.textContent = reason.label;
      btn.append(mark, text);

      btn.addEventListener("click", () => {
        selectedReasonId = reason.id;
        syncReasonSelection();
        showReport(reason);
        setStep(3);
        reportSection.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      reasonWrap.appendChild(btn);
    });
  }

  function setStep(n) {
    stepEls.forEach((el) => {
      const s = Number(el.dataset.step);
      el.classList.toggle("is-current", s === n);
      el.classList.toggle("is-done", s < n);
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
    root.classList.toggle("has-feeling", !!selectedFeelingId);
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
