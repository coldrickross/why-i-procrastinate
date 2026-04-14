// Scale V2 — click a reason to grow it, use the buttons to shrink, rename or
// remove. The beam tilts based on the difference between totals. The pans
// translate up and down with the beam ends but stay perpendicular to the floor.

(function () {
  const MAX_TILT = 14;   // degrees — kept gentle so the boxes stay readable when tilted
  const TILT_K = 1.6;    // degrees per unit of weight difference
  const MAX_WEIGHT = 10; // cap so the UI doesn't explode

  // Geometry constants matching the SVG. Pivot is at (500, 60). Each rope is
  // anchored at the bottom of the beam (y=66), 300 user-units from the pivot.
  const ARM_X = 300;          // horizontal distance from pivot to rope anchor
  const ANCHOR_OFFSET_Y = 6;  // anchor is on the bottom edge of the beam

  // Preset example scenario on first load: deciding whether to apply for jobs.
  // Balanced weights so the scale starts near-level, inviting exploration.
  const DEFAULT_ACTION = "Apply for jobs";
  const SEED_FOR = [
    { text: "Want a better role", weight: 3 },
    { text: "Need more income", weight: 3 },
    { text: "Learn new skills", weight: 2 },
  ];
  const SEED_AGAINST = [
    { text: "Fear of rejection", weight: 3 },
    { text: "Writing applications is tedious", weight: 3 },
    { text: "Impostor syndrome", weight: 2 },
  ];

  // Suggested chips — general enough to work with most actions.
  const SUGGESTIONS_FOR = [
    { text: "I'll feel proud", weight: 3 },
    { text: "It helps my future", weight: 4 },
    { text: "I'll earn money", weight: 4 },
    { text: "I'll learn a skill", weight: 3 },
    { text: "I want self-respect", weight: 3 },
    { text: "I promised someone", weight: 4 },
  ];
  const SUGGESTIONS_AGAINST = [
    { text: "I feel tired", weight: 3 },
    { text: "It feels hard", weight: 3 },
    { text: "I might fail", weight: 4 },
    { text: "People may judge me", weight: 3 },
    { text: "I don't know how", weight: 3 },
    { text: "It takes too long", weight: 3 },
  ];

  const state = {
    action: DEFAULT_ACTION,
    for: [],     // { id, text, weight }
    against: [],
  };

  let nextId = 1;
  const newId = () => nextId++;

  // DOM refs
  const actionInput = document.getElementById("v2Action");
  const itemsForEl = document.getElementById("v2ItemsFor");
  const itemsAgainstEl = document.getElementById("v2ItemsAgainst");
  const addForBtn = document.getElementById("v2AddFor");
  const addAgainstBtn = document.getElementById("v2AddAgainst");
  const resetBtn = document.getElementById("v2Reset");
  const forTotalEl = document.getElementById("v2ForTotal");
  const againstTotalEl = document.getElementById("v2AgainstTotal");
  const beamEl = document.getElementById("v2Beam");
  const panLeftEl = document.getElementById("v2PanLeft");
  const panRightEl = document.getElementById("v2PanRight");
  const verdictEl = document.getElementById("v2Verdict");
  const chipsForEl = document.getElementById("v2ChipsFor");
  const chipsAgainstEl = document.getElementById("v2ChipsAgainst");

  // Seed example items so the page isn't empty on first load.
  actionInput.value = DEFAULT_ACTION;
  SEED_FOR.forEach((s) => state.for.push({ id: newId(), text: s.text, weight: s.weight }));
  SEED_AGAINST.forEach((s) => state.against.push({ id: newId(), text: s.text, weight: s.weight }));

  // Build suggestion chips.
  SUGGESTIONS_FOR.forEach((s) => chipsForEl.appendChild(makeChip(s, "for")));
  SUGGESTIONS_AGAINST.forEach((s) => chipsAgainstEl.appendChild(makeChip(s, "against")));

  function makeChip(s, side) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `chip ${side}`;
    b.textContent = s.text;
    b.addEventListener("click", () => {
      state[side].push({ id: newId(), text: s.text, weight: s.weight });
      render();
    });
    return b;
  }

  actionInput.addEventListener("input", (e) => {
    state.action = e.target.value;
  });

  addForBtn.addEventListener("click", () => addItem("for"));
  addAgainstBtn.addEventListener("click", () => addItem("against"));

  resetBtn.addEventListener("click", () => {
    state.for = [];
    state.against = [];
    render();
  });

  function addItem(side) {
    const item = { id: newId(), text: "", weight: 1, isNew: true };
    state[side].push(item);
    render();
    // Focus the input of the freshly-added item so user can type immediately.
    const container = side === "for" ? itemsForEl : itemsAgainstEl;
    const rows = container.querySelectorAll(".v2-item");
    const last = rows[rows.length - 1];
    if (last) {
      const input = last.querySelector("input.v2-item-edit");
      if (input) input.focus();
    }
  }

  function render() {
    renderColumn(itemsForEl, state.for, "for");
    renderColumn(itemsAgainstEl, state.against, "against");
    recomputeTotalsAndTilt();
  }

  function renderColumn(container, items, side) {
    container.innerHTML = "";
    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "v2-empty";
      empty.textContent = side === "for"
        ? "Nothing on this side yet. Add what pulls you toward acting."
        : "Nothing on this side yet. Add what holds you back.";
      container.appendChild(empty);
      return;
    }
    items.forEach((it) => container.appendChild(makeItem(it, side)));
  }

  function makeItem(item, side) {
    const row = document.createElement("div");
    row.className = `v2-item v2-item-${side}`;
    row.dataset.id = item.id;
    row.dataset.weight = item.weight;
    // Every item renders at the same font size now — the weight badge already
    // communicates how heavy each reason is, and a fixed size keeps the edit
    // buttons reachable no matter how long the label is.

    // If the item has never been named, show an inline input. Otherwise show
    // the text plus a pencil button that flips it back into edit mode.
    if (item.isNew || !item.text) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "v2-item-edit";
      input.placeholder = side === "for" ? "e.g. I'll feel proud" : "e.g. It might hurt";
      input.value = item.text;
      input.addEventListener("input", (e) => {
        item.text = e.target.value;
      });
      const commit = () => {
        item.text = input.value.trim();
        item.isNew = false;
        if (!item.text) {
          // Drop empty items so the page doesn't fill up with blanks.
          removeItem(item.id, side);
        } else {
          render();
        }
      };
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); commit(); }
        if (e.key === "Escape") { removeItem(item.id, side); }
      });
      input.addEventListener("blur", commit);
      row.appendChild(input);
      return row;
    }

    const label = document.createElement("span");
    label.className = "v2-item-text";
    label.textContent = item.text;

    const badge = document.createElement("span");
    badge.className = "v2-item-weight";
    badge.textContent = item.weight;

    const minusBtn = document.createElement("button");
    minusBtn.type = "button";
    minusBtn.className = "v2-item-minus";
    minusBtn.setAttribute("aria-label", `Make "${item.text}" lighter`);
    minusBtn.textContent = "\u2212"; // proper minus sign

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "v2-item-edit-btn";
    editBtn.setAttribute("aria-label", `Rename "${item.text}"`);
    editBtn.textContent = "\u270e"; // pencil

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "v2-item-remove";
    removeBtn.setAttribute("aria-label", `Remove "${item.text}"`);
    removeBtn.textContent = "\u00d7"; // ×

    row.appendChild(label);
    row.appendChild(badge);
    row.appendChild(minusBtn);
    row.appendChild(editBtn);
    row.appendChild(removeBtn);

    row.title = "Click to make heavier.  −  lighter  ·  ✎  rename  ·  ×  remove";

    // Left click anywhere on the row (except one of the buttons): heavier.
    row.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      if (e.target.tagName === "INPUT") return;
      item.weight = Math.min(MAX_WEIGHT, item.weight + 1);
      render();
    });

    // Minus button: one step lighter, remove at 0.
    minusBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      item.weight -= 1;
      if (item.weight <= 0) {
        removeItem(item.id, side);
      } else {
        render();
      }
    });

    // Remove button: delete the reason entirely.
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeItem(item.id, side);
    });

    // Edit button — flip the row back into its input-editing state.
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      item.isNew = true;
      render();
      const container = side === "for" ? itemsForEl : itemsAgainstEl;
      const input = container.querySelector(`.v2-item[data-id="${item.id}"] input.v2-item-edit`);
      if (input) { input.focus(); input.select(); }
    });

    return row;
  }

  function removeItem(id, side) {
    state[side] = state[side].filter((x) => x.id !== id);
    render();
  }

  function recomputeTotalsAndTilt() {
    const forTotal = sumWeights(state.for);
    const againstTotal = sumWeights(state.against);
    forTotalEl.textContent = forTotal;
    againstTotalEl.textContent = againstTotal;

    // Positive rotation = clockwise in SVG → pulls the right (against) side down.
    // Against heavier → against goes down → positive tilt.
    const diff = againstTotal - forTotal;
    const tiltDeg = clamp(diff * TILT_K, -MAX_TILT, MAX_TILT);
    const theta = (tiltDeg * Math.PI) / 180;

    beamEl.style.transform = `rotate(${tiltDeg}deg)`;

    // Move each pan to wherever its rope-anchor on the beam ends up after the
    // rotation, but DON'T rotate the pan itself — it stays perpendicular to
    // the floor, like a real hanging pan held by ropes.
    const left = anchorDisplacement(-ARM_X, ANCHOR_OFFSET_Y, theta);
    const right = anchorDisplacement(ARM_X, ANCHOR_OFFSET_Y, theta);
    panLeftEl.style.transform = `translate(${left.dx}px, ${left.dy}px)`;
    panRightEl.style.transform = `translate(${right.dx}px, ${right.dy}px)`;

    updateVerdict(forTotal, againstTotal);
  }

  // How far an anchor point at offset (offX, offY) from the pivot moves when
  // the beam rotates by theta radians (SVG convention: y-down, positive = CW).
  function anchorDisplacement(offX, offY, theta) {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const newX = offX * c - offY * s;
    const newY = offX * s + offY * c;
    return { dx: newX - offX, dy: newY - offY };
  }

  function updateVerdict(f, a) {
    let line;
    if (f === 0 && a === 0) {
      line = "Nothing on the scale yet. Start adding reasons.";
    } else if (f === a) {
      line = "Perfectly balanced. A nudge either way will tip it.";
    } else if (f > a) {
      const d = f - a;
      if (d >= 8) line = "Tilted hard toward action — you'll do it.";
      else if (d >= 3) line = "Tilted toward action — you're likely to do it.";
      else line = "Leaning toward action.";
    } else {
      const d = a - f;
      if (d >= 8) line = "Tilted hard away from action — you won't.";
      else if (d >= 3) line = "Tilted away from action — you probably won't.";
      else line = "Leaning away from action.";
    }
    verdictEl.textContent = `${line}  (${f} for, ${a} against)`;
  }

  function sumWeights(arr) {
    return arr.reduce((s, x) => s + (Number(x.weight) || 0), 0);
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  render();
})();
