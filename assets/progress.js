(function () {
  // ---------- Helpers (minimal copies of worksheet.js idioms) ---------------
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const DAY_SHORT  = ["M", "T", "W", "T", "F", "S", "S"];
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const dayIndexFromDate = (d) => (d.getDay() + 6) % 7;               // Mon=0..Sun=6
  const parseIso = (s) => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
  const toIso    = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  const humanDate = (d) => `${DAY_LABELS[dayIndexFromDate(d)]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const escapeHtml = (s) => String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");

  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
  const sameDay = (a, b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();

  // ---------- Mode selection ------------------------------------------------
  // Priority:
  //   1. ?demo=1                      → Alex sample (window.PROGRESS_DATA)
  //   2. worksheet complete + saved   → the user's personal journey
  //   3. otherwise                    → locked screen (with a link to the sample)
  const params = new URLSearchParams(window.location.search);
  const wantDemo = params.get("demo") === "1";
  const worksheetState = readJson("wip-worksheet");
  const completion     = readJson("wip-worksheet-complete");
  const journeyState   = readJson("wip-journey") || { checkins: {}, reflections: [] };

  function readJson(key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
    catch (_) { return null; }
  }
  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* ignore */ }
  }

  const hasPersonal = !!(worksheetState && completion && worksheetState.answers);

  if (!hasPersonal && !wantDemo) {
    renderLocked();
    return;
  }

  // Assemble the data object. In demo mode we use the bundled example;
  // otherwise we synthesise one from the user's worksheet + journey state.
  const data = wantDemo && window.PROGRESS_DATA
    ? window.PROGRESS_DATA
    : buildPersonalData(worksheetState, completion, journeyState);
  if (!data) { renderLocked(); return; }

  const isPersonal = !wantDemo && hasPersonal;

  // Today is dynamic for personal journeys so "day N" advances over time.
  if (isPersonal) {
    const nowIso = toIso(new Date());
    data.today = nowIso;
    if (!data.startDate) data.startDate = completion.startDate || nowIso;
  }

  const startDate = parseIso(data.startDate);
  const today     = parseIso(data.today);
  const dayOfPlan = Math.round((today - startDate) / 86400000) + 1; // 1-based
  const weekOfPlan = Math.ceil(dayOfPlan / 7);

  const ssmart = data.answers.ssmart || { days: [false,false,false,false,false,false,false] };
  const scheduledByDow = Array.isArray(ssmart.days) ? ssmart.days : [];
  const anyScheduled = scheduledByDow.some(Boolean);

  // ---------- Checkins → derived per-day grid -------------------------------
  // status: done | missed | scheduled | rest | future | pending
  const defaultPastStatus = data.defaultPastStatus || "done"; // demo fills past; personal leaves pending
  const cells = [];
  for (let i = 0; i < 28; i += 1) {
    const date = addDays(startDate, i);
    const dow = dayIndexFromDate(date);
    const isScheduled = anyScheduled ? !!scheduledByDow[dow] : true;
    const isPast = date < today && !sameDay(date, today);
    const isToday = sameDay(date, today);
    // Checkins may be keyed by day-index OR by ISO date string. Try both.
    const override = data.checkins && (data.checkins[i] || data.checkins[toIso(date)]);

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
      status = defaultPastStatus;
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
    const startDow = dayIndexFromDate(startDate);
    const headerCells = Array.from({ length: 7 }, (_, i) => {
      const idx = (startDow + i) % 7;
      return `<div class="tracker-dow" aria-hidden="true"><span class="tracker-dow-long">${DAY_LABELS[idx]}</span><span class="tracker-dow-short">${DAY_SHORT[idx]}</span></div>`;
    }).join("");

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
        case "pending":
          glyph = '<span class="tracker-dot" aria-hidden="true"></span>';
          srStatus = "pending — tap to mark";
          break;
        case "future":
        default:
          srStatus = "upcoming";
      }
      const noteHtml = c.note ? `<span class="tracker-note" aria-hidden="true">${escapeHtml(c.note)}</span>` : "";
      return `
        <div class="${classes.join(" ")}" role="listitem" data-cell-index="${c.i}" aria-label="${escapeHtml(dateLabel)} — ${srStatus}${c.note ? ". Note: " + escapeHtml(c.note) : ""}">
          <span class="tracker-daynum">${c.date.getDate()}</span>
          <span class="tracker-glyph">${glyph}</span>
          ${noteHtml}
        </div>
      `;
    }).join("");

    root.innerHTML = `
      <h2 class="prog-section-title">4-week tracker</h2>
      <div class="tracker-grid" role="list" aria-label="4-week progress tracker">
        <div class="tracker-dow-row" aria-hidden="true">${headerCells}</div>
        ${cellHtml}
      </div>
    `;
  }

  function renderWhy() {
    const root = document.getElementById("progWhy");
    const outcomes = (Array.isArray(answers["positive-outcomes"]) ? answers["positive-outcomes"] : [])
      .filter((o) => (o && (o.outcome || o.allows || o.feeling)));
    const futures  = (Array.isArray(answers["future-problems"])   ? answers["future-problems"]   : [])
      .filter((f) => (f && (f.problem || f.impact || f.feeling)));
    if (!outcomes.length && !futures.length) { root.innerHTML = ""; return; }
    const outcomeCards = outcomes.map((o, i) => `
      <figure class="prog-why-card prog-why-card--pull">
        <p class="prog-why-kicker">${i === 0 ? "The pull" : "And also"}</p>
        <blockquote>${escapeHtml(o.outcome || "")}</blockquote>
        ${o.allows  ? `<figcaption>${escapeHtml(o.allows)}</figcaption>` : ""}
        ${o.feeling ? `<p class="prog-why-feel">${escapeHtml(o.feeling)}</p>` : ""}
      </figure>`).join("");
    const futureCards = futures.map((f, i) => `
      <figure class="prog-why-card prog-why-card--push">
        <p class="prog-why-kicker">${i === 0 ? "The cost of staying the same" : "And also"}</p>
        <blockquote>${escapeHtml(f.problem || "")}</blockquote>
        ${f.impact  ? `<figcaption>${escapeHtml(f.impact)}</figcaption>` : ""}
        ${f.feeling ? `<p class="prog-why-feel">${escapeHtml(f.feeling)}</p>` : ""}
      </figure>`).join("");
    root.innerHTML = `
      <h2 class="prog-section-title">Why this matters</h2>
      <div class="prog-why-grid">${outcomeCards}${futureCards}</div>
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

  function renderStart() {
    const root = document.getElementById("progStart");
    const facts = (answers.facts || "").trim();
    const forgive = (answers.forgive || "").trim();
    if (!facts && !forgive) { root.innerHTML = ""; return; }
    const paragraphs = (text) =>
      text.split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean)
        .map((p) => `<p>${escapeHtml(p)}</p>`).join("");
    const factsBlock = facts ? `
      <article class="prog-start-block prog-start-block--facts">
        <p class="prog-start-kicker">The facts</p>
        ${paragraphs(facts)}
      </article>` : "";
    const forgiveBlock = forgive ? `
      <article class="prog-start-block prog-start-block--forgive">
        <p class="prog-start-kicker">Forgiving past me</p>
        ${paragraphs(forgive)}
      </article>` : "";
    root.innerHTML = `
      <h2 class="prog-section-title">Where you started</h2>
      <div class="prog-start-grid">${factsBlock}${forgiveBlock}</div>
    `;
  }

  function renderCurrent() {
    const root = document.getElementById("progCurrent");
    const list = (Array.isArray(answers["current-problems"]) ? answers["current-problems"] : [])
      .filter((p) => p && (p.problem || p.stops || p.duration || p.feeling));
    if (!list.length) { root.innerHTML = ""; return; }
    const items = list.map((p) => `
      <li class="prog-current-item">
        ${p.problem ? `<p class="prog-current-problem">${escapeHtml(p.problem)}</p>` : ""}
        ${p.stops   ? `<p class="prog-current-row"><span class="prog-current-label">What it stops</span><span>${escapeHtml(p.stops)}</span></p>` : ""}
        ${p.duration? `<p class="prog-current-row"><span class="prog-current-label">How long</span><span>${escapeHtml(p.duration)}</span></p>` : ""}
        ${p.feeling ? `<p class="prog-current-feel">${escapeHtml(p.feeling)}</p>` : ""}
      </li>`).join("");
    root.innerHTML = `
      <h2 class="prog-section-title">The cost of now</h2>
      <p class="prog-section-sub">What staying the same actually costs — today, not someday.</p>
      <ul class="prog-current-list">${items}</ul>
    `;
  }

  function renderDistractions() {
    const root = document.getElementById("progDistractions");
    const list = (Array.isArray(answers.distractions) ? answers.distractions : [])
      .filter((d) => d && (d.what || "").trim());
    if (!list.length) { root.innerHTML = ""; return; }
    const tacticLabels = {
      remove:   "Remove",
      block:    "Block",
      mute:     "Mute",
      hide:     "Hide",
      relocate: "Relocate",
    };
    const items = list.map((d) => `
      <li class="prog-distraction">
        <span class="prog-distraction-what">${escapeHtml(d.what)}</span>
        <span class="prog-distraction-tactic">${escapeHtml(tacticLabels[d.tactic] || "—")}</span>
      </li>`).join("");
    root.innerHTML = `
      <h2 class="prog-section-title">Distractions, defused</h2>
      <ul class="prog-distractions">${items}</ul>
    `;
  }

  function renderResistance() {
    const root = document.getElementById("progResistance");
    const state = answers.resistance || {};
    const tactics = [
      { key: "prepare", title: "Prepare the night before" },
      { key: "cue",     title: "Put the cue in plain sight" },
      { key: "stack",   title: "Stack it on an existing habit" },
      { key: "shrink",  title: "Shrink the starting step" },
      { key: "default", title: "Make it the default" },
      { key: "commit",  title: "Pre-commit so future-you can't wriggle out" },
    ];
    const active = tactics.filter((t) => state[t.key] && state[t.key].on);
    if (!active.length) { root.innerHTML = ""; return; }
    const items = active.map((t) => {
      const detail = ((state[t.key] && state[t.key].detail) || "").trim();
      return `
        <li class="prog-resistance">
          <h3 class="prog-resistance-title">${escapeHtml(t.title)}</h3>
          ${detail ? `<p class="prog-resistance-detail">${escapeHtml(detail)}</p>` : ""}
        </li>`;
    }).join("");
    root.innerHTML = `
      <h2 class="prog-section-title">Friction, engineered out</h2>
      <ul class="prog-resistance-list">${items}</ul>
    `;
  }

  function renderAccountability() {
    const root = document.getElementById("progAccountability");
    const text = (answers.accountability || "").trim();
    if (!text) { root.innerHTML = ""; return; }
    const paragraphs = text.split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean)
      .map((p) => `<p>${escapeHtml(p)}</p>`).join("");
    root.innerHTML = `
      <h2 class="prog-section-title">Who sees your effort</h2>
      <div class="prog-accountability">${paragraphs}</div>
    `;
  }

  function renderMissedDay() {
    const root = document.getElementById("progMissedDay");
    const m = answers["missed-day"] || {};
    const mantra = (m.mantra || "").trim();
    const restart = (m.restart || "").trim();
    if (!mantra && !restart) { root.innerHTML = ""; return; }
    root.innerHTML = `
      <h2 class="prog-section-title">If you miss a day</h2>
      <div class="prog-missed">
        ${mantra ? `
          <blockquote class="prog-missed-mantra">
            <p>&ldquo;${escapeHtml(mantra)}&rdquo;</p>
            <footer>Your self-forgiveness line</footer>
          </blockquote>` : ""}
        ${restart ? `
          <div class="prog-missed-restart">
            <p class="prog-missed-label">Tomorrow's restart</p>
            <p>${escapeHtml(restart)}</p>
          </div>` : ""}
      </div>
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

  // ---------- Personal-journey plumbing -------------------------------------
  function buildPersonalData(ws, comp, journey) {
    const a = (ws && ws.answers) || {};
    const identity = (a.identity || "").trim();
    const nowIso = toIso(new Date());
    const startIso = (comp && comp.startDate) || nowIso;
    const reflections = Array.isArray(journey.reflections) ? journey.reflections : [];
    const latest = reflections.length ? reflections[reflections.length - 1] : null;
    return {
      displayName: "You",
      avatarInitial: "★",
      startDate: startIso,
      today: nowIso,
      defaultPastStatus: "pending",
      latestCheckinAgo: latest ? humanDate(parseIso(latest.date)) : "",
      latestNote: latest ? latest.text : "",
      answers: {
        goal: a.goal || "",
        identity: identity,
        "identity-foundation": a["identity-foundation"] || "",
        facts: a.facts || "",
        forgive: a.forgive || "",
        "current-problems":  a["current-problems"]  || [],
        "positive-outcomes": a["positive-outcomes"] || [],
        "future-problems":   a["future-problems"]   || [],
        ssmart: a.ssmart || null,
        distractions: Array.isArray(a.distractions) ? a.distractions : [],
        resistance: a.resistance || null,
        accountability: a.accountability || "",
        stakes: a.stakes || null,
        roadblocks: a.roadblocks || null,
        "missed-day": a["missed-day"] || null,
      },
      checkins: journey.checkins || {},
      reflections: reflections,
    };
  }

  function saveCheckin(isoDate, patch) {
    const current = readJson("wip-journey") || { checkins: {}, reflections: [] };
    current.checkins = current.checkins || {};
    const prev = current.checkins[isoDate] || {};
    const next = { ...prev, ...patch };
    // If cleared back to default, drop the entry.
    if (!next.status && !(next.note && next.note.trim())) {
      delete current.checkins[isoDate];
    } else {
      current.checkins[isoDate] = next;
    }
    writeJson("wip-journey", current);
    data.checkins = current.checkins;
  }

  function addReflection(text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return;
    const current = readJson("wip-journey") || { checkins: {}, reflections: [] };
    current.reflections = Array.isArray(current.reflections) ? current.reflections : [];
    current.reflections.push({
      id: `r${Date.now()}`,
      date: toIso(new Date()),
      text: trimmed,
    });
    writeJson("wip-journey", current);
    data.reflections = current.reflections;
    const latest = current.reflections[current.reflections.length - 1];
    data.latestNote = latest.text;
    data.latestCheckinAgo = humanDate(parseIso(latest.date));
  }

  function deleteReflection(id) {
    const current = readJson("wip-journey") || { checkins: {}, reflections: [] };
    current.reflections = (current.reflections || []).filter((r) => r.id !== id);
    writeJson("wip-journey", current);
    data.reflections = current.reflections;
    const latest = current.reflections.length ? current.reflections[current.reflections.length - 1] : null;
    data.latestNote = latest ? latest.text : "";
    data.latestCheckinAgo = latest ? humanDate(parseIso(latest.date)) : "";
  }

  function renderLocked() {
    const wrap = document.querySelector("main.prog-wrap");
    if (!wrap) return;
    wrap.innerHTML = `
      <section class="prog-lock" aria-label="Journey locked">
        <div class="prog-lock-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="11" width="16" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <p class="prog-eyebrow">Your journey</p>
        <h1>Finish the worksheet to unlock this tab.</h1>
        <p class="prog-lock-sub">The Journey tab is where your 4-week progress lives &mdash; your tracker, your reflections, your updates. It opens the moment you complete the Inspire Action worksheet.</p>
        <div class="prog-lock-actions">
          <a class="btn" href="worksheet.html">Open the worksheet &rarr;</a>
          <a class="prog-lock-demo" href="progress.html?demo=1">or view a sample journey</a>
        </div>
      </section>
    `;
  }

  // ---------- Boot ----------------------------------------------------------
  renderHero();
  renderStrip();
  renderCommitment();
  renderTracker();
  renderStart();
  renderWhy();
  renderCurrent();
  renderStakes();
  renderDistractions();
  renderResistance();
  renderAccountability();
  renderFallbacks();
  renderMissedDay();
  renderLatest();

  if (isPersonal) {
    wireTrackerEditing();
    wireReflectionEditing();
    addDemoBannerIfNeeded();
  } else if (wantDemo) {
    addDemoBannerIfNeeded();
  }

  function addDemoBannerIfNeeded() {
    if (!wantDemo) return;
    const hero = document.getElementById("progHero");
    if (!hero) return;
    const banner = document.createElement("p");
    banner.className = "prog-demo-banner";
    banner.innerHTML = `You're viewing a sample journey (Alex). <a href="progress.html">Back to your journey &rarr;</a>`;
    hero.parentNode.insertBefore(banner, hero);
  }

  // ---------- Tracker editing ----------------------------------------------
  function wireTrackerEditing() {
    const root = document.getElementById("progTracker");
    if (!root) return;
    root.classList.add("is-editable");
    root.addEventListener("click", (e) => {
      const cell = e.target.closest(".tracker-cell");
      if (!cell) return;
      const idx = Number(cell.dataset.cellIndex);
      if (Number.isNaN(idx)) return;
      openCellEditor(idx, cell);
    });
  }

  function openCellEditor(cellIndex, anchorEl) {
    closeCellEditor();
    const c = cells[cellIndex];
    const iso = toIso(c.date);
    const existing = (data.checkins && (data.checkins[iso] || data.checkins[cellIndex])) || {};
    const current = existing.status || c.status;
    const note    = existing.note   || "";
    const isFuture = c.date > today && !sameDay(c.date, today);

    const popover = document.createElement("div");
    popover.className = "tracker-editor";
    popover.setAttribute("role", "dialog");
    popover.setAttribute("aria-label", `Edit ${humanDate(c.date)}`);
    popover.innerHTML = `
      <header class="tracker-editor-head">
        <strong>${escapeHtml(humanDate(c.date))}</strong>
        <button type="button" class="tracker-editor-close" aria-label="Close">&times;</button>
      </header>
      ${isFuture ? `<p class="tracker-editor-hint">This day hasn't arrived yet. You can still jot a note.</p>` : ""}
      <div class="tracker-editor-statuses" role="radiogroup" aria-label="Status">
        ${statusBtn("done",    "Done",    "✓", current)}
        ${statusBtn("missed",  "Missed",  "✕", current)}
        ${statusBtn("rest",    "Rest",    "·", current)}
        ${statusBtn("pending", "Pending", "…", current)}
      </div>
      <label class="tracker-editor-note-label" for="tracker-editor-note">Note (optional)</label>
      <textarea id="tracker-editor-note" class="tracker-editor-note" rows="3" maxlength="240" placeholder="A line about how it went.">${escapeHtml(note)}</textarea>
      <footer class="tracker-editor-foot">
        <button type="button" class="tracker-editor-clear">Clear</button>
        <button type="button" class="tracker-editor-save btn-primary">Save</button>
      </footer>
    `;
    document.body.appendChild(popover);
    positionPopover(popover, anchorEl);

    const onDocClick = (ev) => {
      if (popover.contains(ev.target) || anchorEl.contains(ev.target)) return;
      closeCellEditor();
    };
    const onKey = (ev) => { if (ev.key === "Escape") closeCellEditor(); };
    setTimeout(() => {
      document.addEventListener("click", onDocClick);
      document.addEventListener("keydown", onKey);
    }, 0);
    popover._cleanup = () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
      popover.remove();
    };

    popover.querySelector(".tracker-editor-close").addEventListener("click", closeCellEditor);

    let pickedStatus = current;
    popover.querySelectorAll(".tracker-editor-status").forEach((btn) => {
      btn.addEventListener("click", () => {
        pickedStatus = btn.dataset.status;
        popover.querySelectorAll(".tracker-editor-status").forEach((b) =>
          b.classList.toggle("is-selected", b === btn));
      });
    });

    popover.querySelector(".tracker-editor-clear").addEventListener("click", () => {
      saveCheckin(iso, { status: "", note: "" });
      closeCellEditor();
      rebuildCell(cellIndex);
      renderTracker();
      wireTrackerEditing();
      renderStrip();
    });

    popover.querySelector(".tracker-editor-save").addEventListener("click", () => {
      const newNote = popover.querySelector(".tracker-editor-note").value.trim();
      saveCheckin(iso, { status: pickedStatus, note: newNote });
      closeCellEditor();
      rebuildCell(cellIndex);
      renderTracker();
      wireTrackerEditing();
      renderStrip();
    });
  }

  function rebuildCell(i) {
    const c = cells[i];
    if (!c) return;
    const iso = toIso(c.date);
    const override = data.checkins && (data.checkins[iso] || data.checkins[i]);
    const isPast = c.date < today && !sameDay(c.date, today);
    const isToday = c.isToday;
    if (override) {
      c.status = override.status;
      c.note = override.note || "";
    } else if (!c.isScheduled) {
      c.status = "rest"; c.note = "";
    } else if (isToday) {
      c.status = "scheduled"; c.note = "";
    } else if (isPast) {
      c.status = data.defaultPastStatus || "done"; c.note = "";
    } else {
      c.status = "future"; c.note = "";
    }
  }

  function statusBtn(key, label, glyph, current) {
    const sel = current === key ? " is-selected" : "";
    return `<button type="button" class="tracker-editor-status${sel}" data-status="${key}">
      <span class="tracker-editor-glyph" aria-hidden="true">${glyph}</span>
      <span>${label}</span>
    </button>`;
  }

  function closeCellEditor() {
    const existing = document.querySelector(".tracker-editor");
    if (existing && existing._cleanup) existing._cleanup();
    else if (existing) existing.remove();
  }

  function positionPopover(popover, anchor) {
    const r = anchor.getBoundingClientRect();
    const pageY = window.scrollY + r.bottom + 8;
    const pageX = window.scrollX + r.left + (r.width / 2);
    popover.style.position = "absolute";
    popover.style.top = `${pageY}px`;
    popover.style.left = `${pageX}px`;
    popover.style.transform = "translateX(-50%)";
    // Flip above if it would go off the bottom of the viewport.
    requestAnimationFrame(() => {
      const pr = popover.getBoundingClientRect();
      if (pr.bottom > window.innerHeight) {
        popover.style.top = `${window.scrollY + r.top - pr.height - 8}px`;
      }
      const margin = 12;
      if (pr.left < margin) popover.style.left = `${window.scrollX + margin}px`, popover.style.transform = "none";
      if (pr.right > window.innerWidth - margin) {
        popover.style.left = `${window.scrollX + window.innerWidth - pr.width - margin}px`;
        popover.style.transform = "none";
      }
    });
  }

  // ---------- Reflection editing --------------------------------------------
  function wireReflectionEditing() {
    const root = document.getElementById("progLatest");
    if (!root) return;
    renderReflectionsEditor();
  }

  function renderReflectionsEditor() {
    const root = document.getElementById("progLatest");
    if (!root) return;
    const refs = Array.isArray(data.reflections) ? data.reflections.slice().reverse() : [];
    const items = refs.map((r) => `
      <li class="prog-reflection" data-reflection-id="${escapeHtml(r.id)}">
        <blockquote>
          <p>${escapeHtml(r.text)}</p>
          <footer>${escapeHtml(humanDate(parseIso(r.date)))}</footer>
        </blockquote>
        <button type="button" class="prog-reflection-remove" aria-label="Delete reflection">Delete</button>
      </li>`).join("");
    root.innerHTML = `
      <h2 class="prog-section-title">Reflections &amp; updates</h2>
      <p class="prog-section-sub">How are things going? Drop a note for future-you.</p>
      <form class="prog-reflection-form" aria-label="Add a reflection">
        <textarea class="prog-reflection-input" rows="3" maxlength="600" placeholder="What went well? What got in the way? What's next?"></textarea>
        <div class="prog-reflection-foot">
          <button type="submit" class="btn-primary">Save reflection</button>
        </div>
      </form>
      ${refs.length
        ? `<ul class="prog-reflection-list">${items}</ul>`
        : `<p class="prog-reflection-empty">No reflections yet &mdash; the first one is usually the hardest.</p>`}
    `;

    const form = root.querySelector(".prog-reflection-form");
    const input = root.querySelector(".prog-reflection-input");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      addReflection(input.value);
      renderReflectionsEditor();
    });
    root.querySelectorAll(".prog-reflection-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const li = btn.closest(".prog-reflection");
        const id = li && li.dataset.reflectionId;
        if (!id) return;
        if (!window.confirm("Delete this reflection?")) return;
        deleteReflection(id);
        renderReflectionsEditor();
      });
    });
  }
})();
