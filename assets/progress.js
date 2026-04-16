(function () {
  const data = window.PROGRESS_DATA;
  if (!data) return;

  // ---------- Helpers (minimal copies of worksheet.js idioms) ---------------
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const DAY_SHORT  = ["M", "T", "W", "T", "F", "S", "S"];
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const dayIndexFromDate = (d) => (d.getDay() + 6) % 7;               // Mon=0..Sun=6
  const parseIso = (s) => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
  const humanDate = (d) => `${DAY_LABELS[dayIndexFromDate(d)]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const escapeHtml = (s) => String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");

  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
  const sameDay = (a, b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();

  const startDate = parseIso(data.startDate);
  const today     = parseIso(data.today);
  const dayOfPlan = Math.round((today - startDate) / 86400000) + 1; // 1-based
  const weekOfPlan = Math.ceil(dayOfPlan / 7);

  const ssmart = data.answers.ssmart || { days: [false,false,false,false,false,false,false] };
  const scheduledByDow = Array.isArray(ssmart.days) ? ssmart.days : [];
  const anyScheduled = scheduledByDow.some(Boolean);

  // ---------- Checkins → derived per-day grid -------------------------------
  // status: done | missed | scheduled | rest | future
  const cells = [];
  for (let i = 0; i < 28; i += 1) {
    const date = addDays(startDate, i);
    const dow = dayIndexFromDate(date);
    const isScheduled = anyScheduled ? !!scheduledByDow[dow] : true;
    const isPast = date < today && !sameDay(date, today);
    const isToday = sameDay(date, today);
    const override = data.checkins && data.checkins[i];

    let status;
    let note = "";
    if (override) {
      status = override.status;
      note = override.note || "";
    } else if (!isScheduled) {
      status = "rest";
    } else if (isToday) {
      status = "scheduled";
    } else if (isPast) {
      status = "done"; // default past scheduled day to done
    } else {
      status = "future";
    }
    cells.push({ i, date, dow, status, note, isScheduled, isToday });
  }

  // Streak = consecutive "done" scheduled cells ending at the most recent
  // completed scheduled day (before today). A "missed" breaks the streak.
  function computeStreak() {
    let streak = 0;
    for (let i = cells.length - 1; i >= 0; i -= 1) {
      const c = cells[i];
      if (c.date > today) continue;
      if (!c.isScheduled) continue;
      if (c.isToday && c.status === "scheduled") continue; // today not done yet
      if (c.status === "done") streak += 1;
      else break;
    }
    return streak;
  }

  function countStatus(target) { return cells.filter((c) => c.status === target).length; }

  // ---------- Rendering -----------------------------------------------------
  const answers = data.answers;

  const identityLine = (() => {
    const big   = (answers.identity || "").trim();
    const small = (answers["identity-foundation"] || "").trim().toLowerCase().replace(/^someone who /, "");
    if (!big && !small) return "";
    if (!small) return `Becoming <strong>${escapeHtml(big.toLowerCase())}</strong>.`;
    if (!big)   return `Right now: <strong>someone who ${escapeHtml(small)}</strong>.`;
    return `Becoming <strong>${escapeHtml(big.toLowerCase())}</strong> &mdash; right now, <strong>someone who ${escapeHtml(small)}</strong>.`;
  })();

  function renderHero() {
    const root = document.getElementById("progHero");
    root.innerHTML = `
      <div class="prog-hero-inner">
        <div class="prog-avatar" aria-hidden="true">${escapeHtml(data.avatarInitial || "?")}</div>
        <div class="prog-hero-text">
          <p class="prog-eyebrow">A journey in progress</p>
          <h1>${escapeHtml(data.displayName)}'s 4 weeks</h1>
          <p class="prog-identity">${identityLine}</p>
          <p class="prog-goal">${escapeHtml(answers.goal || "")}</p>
        </div>
      </div>
    `;
  }

  function renderStrip() {
    const root = document.getElementById("progStrip");
    const done = countStatus("done");
    const missed = countStatus("missed");
    const scheduledPast = cells.filter((c) => c.isScheduled && c.date <= today).length;
    const streak = computeStreak();
    root.innerHTML = `
      <div class="prog-strip-main">
        <div class="prog-day">
          <span class="prog-big">Day ${dayOfPlan}</span>
          <span class="prog-sub">of 28 &middot; Week ${weekOfPlan}</span>
        </div>
        <div class="prog-streak">
          <span class="prog-streak-num">${streak}</span>
          <span class="prog-streak-label">day streak</span>
        </div>
        <div class="prog-stats">
          <p><strong>${done}</strong> of ${scheduledPast} scheduled days completed so far.</p>
          <p class="prog-last">Last check-in: <strong>${escapeHtml(data.latestCheckinAgo || "recently")}</strong>${missed ? ` &middot; ${missed} missed` : ""}</p>
        </div>
      </div>
    `;
  }

  function renderCommitment() {
    const root = document.getElementById("progCommitment");
    const s = ssmart;
    const dayNames = (Array.isArray(s.days) ? s.days : [])
      .map((on, i) => (on ? DAY_LABELS[i] : null))
      .filter(Boolean)
      .join(" &middot; ");
    root.innerHTML = `
      <h2 class="prog-section-title">The commitment</h2>
      <div class="prog-ssmart">
        <div class="prog-ssmart-row">
          <span class="prog-ssmart-label">Action</span>
          <span class="prog-ssmart-value">${escapeHtml(s.action || "—")}</span>
        </div>
        <div class="prog-ssmart-row">
          <span class="prog-ssmart-label">Measure</span>
          <span class="prog-ssmart-value">${escapeHtml(s.measure || "—")}</span>
        </div>
        <div class="prog-ssmart-row">
          <span class="prog-ssmart-label">Time</span>
          <span class="prog-ssmart-value">${escapeHtml(s.time || "—")}</span>
        </div>
        <div class="prog-ssmart-row">
          <span class="prog-ssmart-label">Days</span>
          <span class="prog-ssmart-value">${dayNames || "—"}</span>
        </div>
      </div>
    `;
  }

  function renderTracker() {
    const root = document.getElementById("progTracker");
    const headerCells = DAY_LABELS.map((l, i) =>
      `<div class="tracker-dow" aria-hidden="true"><span class="tracker-dow-long">${l}</span><span class="tracker-dow-short">${DAY_SHORT[i]}</span></div>`
    ).join("");

    const cellHtml = cells.map((c) => {
      const classes = ["tracker-cell", `tracker-cell--${c.status}`];
      if (c.isToday) classes.push("is-today");
      const dateLabel = humanDate(c.date);
      let glyph = "";
      let srStatus = "";
      switch (c.status) {
        case "done":
          glyph = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5 L6.5 12 L13 4.5" /></svg>';
          srStatus = "completed";
          break;
        case "missed":
          glyph = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4 L12 12 M12 4 L4 12" /></svg>';
          srStatus = "missed";
          break;
        case "scheduled":
          glyph = '<span class="tracker-pulse" aria-hidden="true"></span>';
          srStatus = "scheduled for today";
          break;
        case "rest":
          srStatus = "rest day";
          break;
        case "future":
        default:
          srStatus = "upcoming";
      }
      const noteHtml = c.note ? `<span class="tracker-note" aria-hidden="true">${escapeHtml(c.note)}</span>` : "";
      return `
        <div class="${classes.join(" ")}" role="listitem" aria-label="${escapeHtml(dateLabel)} — ${srStatus}${c.note ? ". Note: " + escapeHtml(c.note) : ""}">
          <span class="tracker-daynum">${c.date.getDate()}</span>
          <span class="tracker-glyph">${glyph}</span>
          ${noteHtml}
        </div>
      `;
    }).join("");

    root.innerHTML = `
      <h2 class="prog-section-title">4-week tracker</h2>
      <p class="prog-section-sub">Mon &rarr; Sun. Gold = done, dim = rest, outline = still to come.</p>
      <div class="tracker-grid" role="list" aria-label="4-week progress tracker">
        <div class="tracker-dow-row" aria-hidden="true">${headerCells}</div>
        ${cellHtml}
      </div>
    `;
  }

  function renderWhy() {
    const root = document.getElementById("progWhy");
    const outcomes = Array.isArray(answers["positive-outcomes"]) ? answers["positive-outcomes"] : [];
    const futures  = Array.isArray(answers["future-problems"])   ? answers["future-problems"]   : [];
    const outcome = outcomes[0];
    const future  = futures[0];
    if (!outcome && !future) { root.innerHTML = ""; return; }
    const outcomeCard = outcome ? `
      <figure class="prog-why-card prog-why-card--pull">
        <p class="prog-why-kicker">The pull</p>
        <blockquote>${escapeHtml(outcome.outcome || "")}</blockquote>
        ${outcome.allows  ? `<figcaption>${escapeHtml(outcome.allows)}</figcaption>` : ""}
        ${outcome.feeling ? `<p class="prog-why-feel">${escapeHtml(outcome.feeling)}</p>` : ""}
      </figure>` : "";
    const futureCard = future ? `
      <figure class="prog-why-card prog-why-card--push">
        <p class="prog-why-kicker">The cost of staying the same</p>
        <blockquote>${escapeHtml(future.problem || "")}</blockquote>
        ${future.impact  ? `<figcaption>${escapeHtml(future.impact)}</figcaption>` : ""}
        ${future.feeling ? `<p class="prog-why-feel">${escapeHtml(future.feeling)}</p>` : ""}
      </figure>` : "";
    root.innerHTML = `
      <h2 class="prog-section-title">Why this matters</h2>
      <div class="prog-why-grid">${outcomeCard}${futureCard}</div>
    `;
  }

  function renderStakes() {
    const root = document.getElementById("progStakes");
    const s = answers.stakes || {};
    if (!s.chosen && !s.detail) { root.innerHTML = ""; return; }
    const stakeLabels = {
      donate:   { icon: "💸", label: "Donate to a cause I disagree with" },
      "give-up":{ icon: "🚫", label: "Give up something I enjoy" },
      uncomfy:  { icon: "😬", label: "Do something uncomfortable" },
      public:   { icon: "📢", label: "Public confession" },
      friend:   { icon: "🤝", label: "Financial penalty to a friend" },
    };
    const meta = stakeLabels[s.chosen] || { icon: "⚖️", label: "Stakes" };
    root.innerHTML = `
      <h2 class="prog-section-title">What's on the line</h2>
      <div class="prog-stakes">
        <span class="prog-stakes-icon" aria-hidden="true">${meta.icon}</span>
        <div>
          <p class="prog-stakes-label">${escapeHtml(meta.label)}</p>
          ${s.detail ? `<p class="prog-stakes-detail">${escapeHtml(s.detail)}</p>` : ""}
          ${s.amount ? `<p class="prog-stakes-amount">${escapeHtml(s.amount)}</p>` : ""}
        </div>
      </div>
    `;
  }

  function renderFallbacks() {
    const root = document.getElementById("progFallbacks");
    const r = answers.roadblocks || {};
    const scenarios = [
      { key: "sick",   label: "When sick",       icon: "🤒" },
      { key: "travel", label: "When travelling", icon: "✈️" },
      { key: "tired",  label: "When exhausted",  icon: "😴" },
      { key: "busy",   label: "When busy",       icon: "⏰" },
    ];
    const any = scenarios.some((s) => (r[s.key] || "").trim());
    if (!any) { root.innerHTML = ""; return; }
    const items = scenarios.map((s) => {
      const v = (r[s.key] || "").trim();
      return `
        <li class="prog-fallback${v ? "" : " is-empty"}">
          <span class="prog-fallback-icon" aria-hidden="true">${s.icon}</span>
          <span class="prog-fallback-label">${escapeHtml(s.label)}</span>
          <span class="prog-fallback-plan">${v ? escapeHtml(v) : "—"}</span>
        </li>`;
    }).join("");
    root.innerHTML = `
      <h2 class="prog-section-title">When life gets in the way</h2>
      <ul class="prog-fallbacks">${items}</ul>
    `;
  }

  function renderLatest() {
    const root = document.getElementById("progLatest");
    if (!data.latestNote) { root.innerHTML = ""; return; }
    root.innerHTML = `
      <h2 class="prog-section-title">Latest reflection</h2>
      <blockquote class="prog-latest">
        <p>${escapeHtml(data.latestNote)}</p>
        <footer>&mdash; ${escapeHtml(data.displayName)}, ${escapeHtml(data.latestCheckinAgo || "recently")}</footer>
      </blockquote>
    `;
  }

  // ---------- Boot ----------------------------------------------------------
  renderHero();
  renderStrip();
  renderCommitment();
  renderTracker();
  renderWhy();
  renderStakes();
  renderFallbacks();
  renderLatest();
})();
