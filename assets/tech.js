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

    let pickedStatus = current;
    popover.querySelectorAll(".tracker-editor-status").forEach((btn) => {
      btn.addEventListener("click", () => {
        pickedStatus = btn.dataset.status;
        popover.querySelectorAll(".tracker-editor-status").forEach((b) =>
          b.classList.toggle("is-selected", b === btn));
      });
    });

    popover.querySelector(".tracker-editor-clear").addEventListener("click", () => {
      delete state.checkins[c.iso];
      writeState(state);
      closeCellEditor();
      rebuildCells();
      renderTracker();
    });

    popover.querySelector(".tracker-editor-save").addEventListener("click", () => {
      const newNote = popover.querySelector(".tracker-editor-note").value.trim();
      if (!pickedStatus && !newNote) {
        delete state.checkins[c.iso];
      } else {
        state.checkins[c.iso] = { status: pickedStatus, note: newNote };
      }
      writeState(state);
      closeCellEditor();
      rebuildCells();
      renderTracker();
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
