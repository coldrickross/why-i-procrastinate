// Scale V2 — click to grow a weight, right-click to shrink it.
// The beam tilts based on the difference between totals.

(function () {
  const MAX_TILT = 14;   // degrees — kept gentle so the boxes stay readable when tilted
  const TILT_K = 1.6;    // degrees per unit of weight difference
  const MAX_WEIGHT = 10; // cap so the UI doesn't explode

  const state = {
    action: "",
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
  const forTotalEl = document.getElementById("v2ForTotal");
  const againstTotalEl = document.getElementById("v2AgainstTotal");
  const beamEl = document.getElementById("v2Beam");
  const verdictEl = document.getElementById("v2Verdict");

  // Seed example items so the page isn't empty on first load.
  // These mirror the sketch.
  state.for.push({ id: newId(), text: "Love for GF", weight: 2 });
  state.against.push({ id: newId(), text: "Fear failure", weight: 2 });
  state.against.push({ id: newId(), text: "Less money", weight: 3 });
  state.against.push({ id: newId(), text: "Emotional pain", weight: 1 });

  actionInput.addEventListener("input", (e) => {
    state.action = e.target.value;
  });

  addForBtn.addEventListener("click", () => addItem("for"));
  addAgainstBtn.addEventListener("click", () => addItem("against"));

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
    row.style.fontSize = fontSizeFor(item.weight);

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

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "v2-item-edit-btn";
    editBtn.setAttribute("aria-label", `Edit "${item.text}"`);
    editBtn.textContent = "✎";

    row.appendChild(label);
    row.appendChild(badge);
    row.appendChild(editBtn);

    row.title = "Click: heavier  ·  Right-click: lighter  ·  ✎ to rename";

    // Left click anywhere on the row (except the edit button): heavier.
    row.addEventListener("click", (e) => {
      // Don't count a click that was meant for a button inside the row.
      if (e.target.closest("button")) return;
      if (e.target.tagName === "INPUT") return;
      item.weight = Math.min(MAX_WEIGHT, item.weight + 1);
      render();
    });

    // Right click: lighter; remove at 0.
    row.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      item.weight -= 1;
      if (item.weight <= 0) {
        removeItem(item.id, side);
      } else {
        render();
      }
    });

    // Dedicated edit button — replaces the old double-click affordance, which
    // conflicted with fast repeated left-clicks.
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

  function fontSizeFor(weight) {
    // Map weight (1..MAX_WEIGHT) to a font size between 0.95rem and 1.9rem.
    const w = Math.max(1, Math.min(MAX_WEIGHT, weight));
    const min = 0.95, max = 1.9;
    const t = (w - 1) / (MAX_WEIGHT - 1);
    return `${(min + (max - min) * t).toFixed(3)}rem`;
  }

  function recomputeTotalsAndTilt() {
    const forTotal = sumWeights(state.for);
    const againstTotal = sumWeights(state.against);
    forTotalEl.textContent = forTotal;
    againstTotalEl.textContent = againstTotal;

    // Positive rotation = clockwise in SVG → pulls the right (against) side down.
    // Against heavier → against goes down → positive tilt.
    const diff = againstTotal - forTotal;
    const tilt = clamp(diff * TILT_K, -MAX_TILT, MAX_TILT);
    beamEl.style.transform = `rotate(${tilt}deg)`;

    updateVerdict(forTotal, againstTotal);
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
