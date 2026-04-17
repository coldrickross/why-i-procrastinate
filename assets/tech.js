(function () {
  // ---------- Shared helpers (mirroring progress.js) ----------------------
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const DAY_SHORT  = ["M", "T", "W", "T", "F", "S", "S"];
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const dayIndexFromDate = (d) => (d.getDay() + 6) % 7;
  const parseIso = (s) => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
  const toIso    = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  const humanDate = (d) => `${DAY_LABELS[dayIndexFromDate(d)]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const escapeHtml = (s) => String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
  const sameDay = (a, b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();

  // ---------- Persistent state ---------------------------------------------
  const STORAGE_KEY = "wip-tech";

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) { /* ignore */ }
    return null;
  }
  function writeState(s) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (_) { /* ignore */ }
  }

  const todayIso = toIso(new Date());
  const state = readState() || {
    startDate: todayIso,
    checkins: {},
    problems: [],
    consequences: [],
    outcomes: [],
  };
  if (!state.startDate) state.startDate = todayIso;
  if (!state.checkins) state.checkins = {};
  if (!Array.isArray(state.problems))     state.problems = [];
  if (!Array.isArray(state.consequences)) state.consequences = [];
  if (!Array.isArray(state.outcomes))     state.outcomes = [];
  writeState(state);

  // ---------- Relapse vocab ------------------------------------------------
  // Simplified, monochrome SVG glyphs (currentColor) — not the official brand
  // marks, so they read as the platform without the trademark issues of the
  // real logos. Inline so we ship no binary assets.
  const PLATFORM_ICONS = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>',
    tiktok:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 4c.2 2.4 2.1 4.3 4.5 4.5"/></svg>',
    youtube:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="6" width="19" height="12" rx="3"/><path d="M10.5 9.3v5.4l4.5-2.7z" fill="currentColor" stroke="none"/></svg>',
    x:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/></svg>',
    facebook:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M14.5 8.5h-1.2c-.7 0-1.3.6-1.3 1.3V12m-2 0h6m-3 0v8"/></svg>',
    reddit:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="14" r="7"/><circle cx="12" cy="5.5" r="1.2" fill="currentColor" stroke="none"/><path d="M12 6.7v3.3"/><circle cx="9.3" cy="13.5" r=".9" fill="currentColor" stroke="none"/><circle cx="14.7" cy="13.5" r=".9" fill="currentColor" stroke="none"/><path d="M9.5 16.8c1.2.8 3.8.8 5 0"/></svg>',
    snapchat:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a5 5 0 0 0-5 5v6c-1 1-2 1.5-3 1.6.9 1.4 2.4 1.9 3.9 2.3.1.9.6 1.4 1.5 1.4.9 0 1.6-.5 2.6-.5s1.7.5 2.6.5c.9 0 1.4-.5 1.5-1.4 1.5-.4 3-.9 3.9-2.3-1 -.1-2-.6-3-1.6V8a5 5 0 0 0-5-5z"/></svg>',
    chrome:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3v8.5M20.4 7.5l-8.4 4M3.6 7.5l8.4 4"/></svg>',
    phone:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10 5.5h4"/><circle cx="12" cy="18.5" r=".9" fill="currentColor" stroke="none"/></svg>',
    other:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="8" cy="12" r=".95" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r=".95" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r=".95" fill="currentColor" stroke="none"/></svg>',
  };
  const PLATFORMS = [
    { key: "instagram", label: "Instagram" },
    { key: "tiktok",    label: "TikTok"    },
    { key: "youtube",   label: "YouTube"   },
    { key: "x",         label: "X"         },
    { key: "facebook",  label: "Facebook"  },
    { key: "reddit",    label: "Reddit"    },
    { key: "snapchat",  label: "Snapchat"  },
    { key: "chrome",    label: "Chrome"    },
    { key: "phone",     label: "Phone"     },
    { key: "other",     label: "Other"     },
  ];
  const TRIGGERS = [
    { key: "stress",       label: "Stress"          },
    { key: "boredom",      label: "Boredom"         },
    { key: "loneliness",   label: "Loneliness"      },
    { key: "avoidance",    label: "Avoidance"       },
    { key: "social",       label: "Social pressure" },
    { key: "notification", label: "Notification"    },
    { key: "habit",        label: "Autopilot"       },
    { key: "other",        label: "Other"           },
  ];
  const TIME_BUCKETS = [
    { key: "morning",   label: "Morning" },
    { key: "afternoon", label: "Afternoon" },
    { key: "evening",   label: "Evening" },
    { key: "late",      label: "Late night" },
  ];
  const DURATIONS = [
    { key: "lt15",   label: "<15m"   },
    { key: "15to60", label: "15–60m" },
    { key: "1to3h",  label: "1–3h"   },
    { key: "gt3h",   label: "3h+"    },
  ];

  const startDate = parseIso(state.startDate);
  const today     = parseIso(todayIso);

  // ---------- Tracker cell model ------------------------------------------
  // status: done | missed | rest | pending | scheduled (today) | future
  let cells = [];
  function rebuildCells() {
    cells = [];
    for (let i = 0; i < 28; i += 1) {
      const date = addDays(startDate, i);
      const iso = toIso(date);
      const override = state.checkins[iso];
      const isPast = date < today && !sameDay(date, today);
      const isToday = sameDay(date, today);
      let status;
      let note = "";
      if (override) {
        status = override.status || "pending";
        note = override.note || "";
      } else if (isToday) {
        status = "scheduled";
      } else if (isPast) {
        status = "pending";
      } else {
        status = "future";
      }
      cells.push({ i, date, iso, status, note, isToday });
    }
  }
  rebuildCells();

  // ---------- Tracker render ----------------------------------------------
  function renderTracker() {
    const root = document.getElementById("techTracker");
    if (!root) return;
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
          srStatus = "screen-free day completed";
          break;
        case "missed":
          glyph = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4 L12 12 M12 4 L4 12" /></svg>';
          srStatus = "slipped";
          break;
        case "scheduled":
          glyph = '<span class="tracker-pulse" aria-hidden="true"></span>';
          srStatus = "today";
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

    root.classList.add("is-editable");
    root.innerHTML = `
      <h2 class="prog-section-title">4-week tracker</h2>
      <p class="prog-section-sub">Tap a day to mark it done, slipped, a rest day, or leave a note.</p>
      <div class="tracker-grid" role="list" aria-label="4-week progress tracker">
        <div class="tracker-dow-row" aria-hidden="true">${headerCells}</div>
        ${cellHtml}
      </div>
    `;

    root.querySelector(".tracker-grid").addEventListener("click", (e) => {
      const cell = e.target.closest(".tracker-cell");
      if (!cell) return;
      const idx = Number(cell.dataset.cellIndex);
      if (Number.isNaN(idx)) return;
      openCellEditor(idx, cell);
    });
  }

  // ---------- Tracker editor popover --------------------------------------
  function openCellEditor(cellIndex, anchorEl) {
    closeCellEditor();
    const c = cells[cellIndex];
    const existing = state.checkins[c.iso] || {};
    const current = existing.status || c.status;
    const note    = existing.note   || "";
    const isFuture = c.date > today && !sameDay(c.date, today);

    // Working copy of relapse details so users can edit before saving.
    const relapseDraft = {
      platforms:    Array.isArray(existing.relapse?.platforms) ? [...existing.relapse.platforms] : [],
      timeBucket:   existing.relapse?.timeBucket || "",
      timeExact:    existing.relapse?.timeExact  || "",
      trigger:      existing.relapse?.trigger    || "",
      triggerNote:  existing.relapse?.triggerNote || "",
      duration:     existing.relapse?.duration   || "",
    };

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
        ${statusBtn("done",    "Clean",   "✓", current)}
        ${statusBtn("missed",  "Slipped", "✕", current)}
        ${statusBtn("rest",    "Rest",    "·", current)}
        ${statusBtn("pending", "Pending", "…", current)}
      </div>
      <div class="relapse-panel" data-relapse-panel hidden>
        ${renderRelapsePanel(relapseDraft)}
      </div>
      <label class="tracker-editor-note-label" for="tech-editor-note">Note (optional)</label>
      <textarea id="tech-editor-note" class="tracker-editor-note" rows="3" maxlength="240" placeholder="A line about how it went.">${escapeHtml(note)}</textarea>
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

    const relapsePanel = popover.querySelector("[data-relapse-panel]");
    const setRelapseVisible = (show) => {
      relapsePanel.hidden = !show;
      if (show) requestAnimationFrame(() => positionPopover(popover, anchorEl));
    };

    let pickedStatus = current;
    setRelapseVisible(pickedStatus === "missed");

    popover.querySelectorAll(".tracker-editor-status").forEach((btn) => {
      btn.addEventListener("click", () => {
        pickedStatus = btn.dataset.status;
        popover.querySelectorAll(".tracker-editor-status").forEach((b) =>
          b.classList.toggle("is-selected", b === btn));
        setRelapseVisible(pickedStatus === "missed");
      });
    });

    wireRelapsePanel(relapsePanel, relapseDraft);

    popover.querySelector(".tracker-editor-clear").addEventListener("click", () => {
      delete state.checkins[c.iso];
      writeState(state);
      closeCellEditor();
      rebuildCells();
      renderTracker();
    });

    popover.querySelector(".tracker-editor-save").addEventListener("click", () => {
      const newNote = popover.querySelector(".tracker-editor-note").value.trim();
      const hasRelapseData =
        relapseDraft.platforms.length > 0 ||
        relapseDraft.timeBucket || relapseDraft.timeExact ||
        relapseDraft.trigger || relapseDraft.triggerNote ||
        relapseDraft.duration;

      if (!pickedStatus && !newNote && !hasRelapseData) {
        delete state.checkins[c.iso];
      } else {
        const entry = { status: pickedStatus, note: newNote };
        if (pickedStatus === "missed" && hasRelapseData) {
          entry.relapse = {
            platforms:   [...relapseDraft.platforms],
            timeBucket:  relapseDraft.timeBucket,
            timeExact:   relapseDraft.timeExact,
            trigger:     relapseDraft.trigger,
            triggerNote: relapseDraft.triggerNote.trim(),
            duration:    relapseDraft.duration,
          };
        }
        state.checkins[c.iso] = entry;
      }
      writeState(state);
      closeCellEditor();
      rebuildCells();
      renderTracker();
    });
  }

  // ---------- Relapse panel (renders inside the cell editor) --------------
  function renderRelapsePanel(draft) {
    const platformBtns = PLATFORMS.map((p) => {
      const on = draft.platforms.includes(p.key);
      return `<button type="button"
                class="relapse-platform${on ? " is-selected" : ""}"
                data-platform="${p.key}"
                aria-pressed="${on ? "true" : "false"}"
                title="${escapeHtml(p.label)}">
        <span class="relapse-platform-icon">${PLATFORM_ICONS[p.key] || ""}</span>
        <span class="relapse-platform-label">${escapeHtml(p.label)}</span>
      </button>`;
    }).join("");

    const chipRow = (items, group, current) => items.map((it) => {
      const on = current === it.key;
      return `<button type="button"
                class="relapse-chip${on ? " is-selected" : ""}"
                data-group="${group}" data-value="${it.key}"
                aria-pressed="${on ? "true" : "false"}">${escapeHtml(it.label)}</button>`;
    }).join("");

    return `
      <div class="relapse-block">
        <div class="relapse-label">Which app or site?</div>
        <div class="relapse-platforms" role="group" aria-label="Platforms used">${platformBtns}</div>
      </div>
      <div class="relapse-block">
        <div class="relapse-label">When did it happen?</div>
        <div class="relapse-chips" role="radiogroup" aria-label="Time of day">
          ${chipRow(TIME_BUCKETS, "timeBucket", draft.timeBucket)}
        </div>
        <label class="relapse-time-row">
          <span>Exact time</span>
          <input type="time" class="relapse-time" data-field="timeExact" value="${escapeHtml(draft.timeExact)}" />
        </label>
      </div>
      <div class="relapse-block">
        <div class="relapse-label">What set it off?</div>
        <div class="relapse-chips" role="radiogroup" aria-label="Trigger">
          ${chipRow(TRIGGERS, "trigger", draft.trigger)}
        </div>
        <input type="text" class="relapse-trigger-note"
               data-field="triggerNote"
               maxlength="120"
               placeholder="Optional: in your own words…"
               value="${escapeHtml(draft.triggerNote)}" />
      </div>
      <div class="relapse-block">
        <div class="relapse-label">How long?</div>
        <div class="relapse-chips" role="radiogroup" aria-label="Duration">
          ${chipRow(DURATIONS, "duration", draft.duration)}
        </div>
      </div>
    `;
  }

  function wireRelapsePanel(panel, draft) {
    // Multi-select platforms.
    panel.querySelectorAll(".relapse-platform").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.platform;
        const idx = draft.platforms.indexOf(key);
        if (idx === -1) draft.platforms.push(key);
        else draft.platforms.splice(idx, 1);
        const on = draft.platforms.includes(key);
        btn.classList.toggle("is-selected", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
    });

    // Single-select chip groups.
    panel.querySelectorAll(".relapse-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const group = btn.dataset.group;
        const value = btn.dataset.value;
        // Toggle off if re-tapping the active chip.
        const next = draft[group] === value ? "" : value;
        draft[group] = next;
        panel.querySelectorAll(`.relapse-chip[data-group="${group}"]`).forEach((b) => {
          const sel = b.dataset.value === next;
          b.classList.toggle("is-selected", sel);
          b.setAttribute("aria-pressed", sel ? "true" : "false");
        });
      });
    });

    // Free-text fields.
    panel.querySelectorAll("[data-field]").forEach((el) => {
      el.addEventListener("input", () => {
        draft[el.dataset.field] = el.value;
      });
    });
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
    requestAnimationFrame(() => {
      const pr = popover.getBoundingClientRect();
      if (pr.bottom > window.innerHeight) {
        popover.style.top = `${window.scrollY + r.top - pr.height - 8}px`;
      }
      const margin = 12;
      if (pr.left < margin) { popover.style.left = `${window.scrollX + margin}px`; popover.style.transform = "none"; }
      if (pr.right > window.innerWidth - margin) {
        popover.style.left = `${window.scrollX + window.innerWidth - pr.width - margin}px`;
        popover.style.transform = "none";
      }
    });
  }

  // ---------- Editable problem/outcome sections ---------------------------
  const SECTIONS = [
    {
      stateKey: "problems",
      rootId: "techProblems",
      title: "Problems caused by tech use",
      sub: "Where does screen time get in the way right now? Be honest — this is for you.",
      entryLabel: "Problem",
      fields: [
        { key: "problem",  label: "Problem",                      placeholder: "e.g. I scroll instead of sleeping.", rows: 2 },
        { key: "stops",    label: "What it stops you from doing", placeholder: "What does it keep you from?",        rows: 2 },
        { key: "duration", label: "How long it's been a problem", placeholder: "Weeks, months, years…",              rows: 1 },
        { key: "feeling",  label: "How it makes you feel",        placeholder: "Name the feelings honestly.",        rows: 2 },
      ],
    },
    {
      stateKey: "consequences",
      rootId: "techConsequences",
      title: "If nothing changes — 6 months, 1 year, 2 years",
      sub: "What does the same habit cost future-you?",
      entryLabel: "Consequence",
      fields: [
        { key: "problem", label: "Consequence",                             placeholder: "What's the future consequence?", rows: 2 },
        { key: "impact",  label: "Impact / what it stops you from doing",   placeholder: "What does it cost you?",         rows: 2 },
        { key: "feeling", label: "How you'll feel",                         placeholder: "Name the feelings honestly.",    rows: 2 },
      ],
    },
    {
      stateKey: "outcomes",
      rootId: "techOutcomes",
      title: "Positive outcomes if you change",
      sub: "What opens up when screens stop running the show?",
      entryLabel: "Outcome",
      fields: [
        { key: "outcome", label: "Positive outcome",              placeholder: "What good thing would happen?", rows: 2 },
        { key: "allows",  label: "What it would allow you to do", placeholder: "What doors does it open?",      rows: 2 },
        { key: "feeling", label: "How you'd feel about it",       placeholder: "Name the feelings honestly.",   rows: 2 },
      ],
    },
  ];

  function newId() { return `t${Date.now()}${Math.floor(Math.random()*1000)}`; }

  function renderSection(section) {
    const root = document.getElementById(section.rootId);
    if (!root) return;
    const items = state[section.stateKey];
    const itemHtml = items.map((item, i) => renderEntry(section, item, i)).join("");
    root.innerHTML = `
      <h2 class="prog-section-title">${escapeHtml(section.title)}</h2>
      <p class="prog-section-sub">${escapeHtml(section.sub)}</p>
      <ul class="iaw-problems" data-section="${section.stateKey}">
        ${itemHtml}
      </ul>
      <button type="button" class="iaw-problem-add" data-add="${section.stateKey}">+ Add ${escapeHtml(section.entryLabel.toLowerCase())}</button>
    `;
    wireSection(section, root);
  }

  function renderEntry(section, item, i) {
    const fieldsHtml = section.fields.map((f) => {
      const val = item[f.key] || "";
      const tag = f.rows > 1 ? "textarea" : "input";
      const attrs = f.rows > 1
        ? `rows="${f.rows}"`
        : `type="text"`;
      const inner = f.rows > 1 ? escapeHtml(val) : "";
      const valueAttr = f.rows > 1 ? "" : ` value="${escapeHtml(val)}"`;
      return `
        <div class="iaw-problem-field">
          <label class="iaw-problem-field-label" for="${section.stateKey}-${item.id}-${f.key}">${escapeHtml(f.label)}</label>
          <${tag} id="${section.stateKey}-${item.id}-${f.key}"
                  class="iaw-problem-input"
                  data-field="${f.key}"
                  data-item-id="${item.id}"
                  ${attrs}
                  placeholder="${escapeHtml(f.placeholder)}"${valueAttr}>${f.rows > 1 ? inner + `</${tag}>` : ``}
        </div>
      `;
    }).join("");
    return `
      <li class="iaw-problem" data-item-id="${item.id}">
        <div class="iaw-problem-head">
          <span class="iaw-problem-num">${escapeHtml(section.entryLabel)} ${i + 1}</span>
          <button type="button" class="iaw-problem-remove" data-remove="${item.id}">Remove</button>
        </div>
        <div class="iaw-problem-grid">
          ${fieldsHtml}
        </div>
      </li>
    `;
  }

  function wireSection(section, root) {
    root.querySelector(`[data-add="${section.stateKey}"]`).addEventListener("click", () => {
      const blank = { id: newId() };
      section.fields.forEach((f) => { blank[f.key] = ""; });
      state[section.stateKey].push(blank);
      writeState(state);
      renderSection(section);
      // Focus the first field of the new card.
      const newCard = root.querySelector(`.iaw-problem[data-item-id="${blank.id}"] .iaw-problem-input`);
      if (newCard) newCard.focus();
    });

    root.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.remove;
        state[section.stateKey] = state[section.stateKey].filter((x) => x.id !== id);
        writeState(state);
        renderSection(section);
      });
    });

    root.querySelectorAll(".iaw-problem-input").forEach((el) => {
      el.addEventListener("input", () => {
        const id = el.dataset.itemId;
        const field = el.dataset.field;
        const item = state[section.stateKey].find((x) => x.id === id);
        if (!item) return;
        item[field] = el.value;
        writeState(state);
      });
    });
  }

  // ---------- Boot ---------------------------------------------------------
  renderTracker();
  SECTIONS.forEach(renderSection);
})();
