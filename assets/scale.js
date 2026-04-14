// The scale page: manage items, compute totals, tilt the SVG beam.

(function () {
  const MAX_TILT = 22; // degrees
  const TILT_K = 2.2;  // degrees per weight-unit of difference

  const state = {
    for: [],     // { id, text, weight }
    against: [],
  };

  let nextId = 1;
  const newId = () => nextId++;

  // --- DOM refs
  const itemsForEl = document.getElementById("itemsFor");
  const itemsAgainstEl = document.getElementById("itemsAgainst");
  const addForBtn = document.getElementById("addFor");
  const addAgainstBtn = document.getElementById("addAgainst");
  const forTotalEl = document.getElementById("forTotal");
  const againstTotalEl = document.getElementById("againstTotal");
  const forTotalLabel = document.getElementById("forTotalLabel");
  const againstTotalLabel = document.getElementById("againstTotalLabel");
  const beam = document.querySelector(".scale-svg .beam");
  const verdict = document.getElementById("verdict");
  const chipsForEl = document.getElementById("chipsFor");
  const chipsAgainstEl = document.getElementById("chipsAgainst");

  // --- seed a couple of placeholder items so the UI isn't empty
  state.for.push({ id: newId(), text: "", weight: 3 });
  state.against.push({ id: newId(), text: "", weight: 3 });

  // --- build suggestion chips
  if (typeof SUGGESTED_FOR !== "undefined") {
    SUGGESTED_FOR.forEach((s) => chipsForEl.appendChild(makeChip(s, "for")));
  }
  if (typeof SUGGESTED_AGAINST !== "undefined") {
    SUGGESTED_AGAINST.forEach((s) => chipsAgainstEl.appendChild(makeChip(s, "against")));
  }

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

  addForBtn.addEventListener("click", () => {
    state.for.push({ id: newId(), text: "", weight: 3 });
    render({ focusLast: "for" });
  });
  addAgainstBtn.addEventListener("click", () => {
    state.against.push({ id: newId(), text: "", weight: 3 });
    render({ focusLast: "against" });
  });

  function render(opts = {}) {
    renderColumn(itemsForEl, state.for, "for");
    renderColumn(itemsAgainstEl, state.against, "against");

    const forTotal = sumWeights(state.for);
    const againstTotal = sumWeights(state.against);
    forTotalEl.textContent = forTotal;
    againstTotalEl.textContent = againstTotal;
    forTotalLabel.textContent = forTotal;
    againstTotalLabel.textContent = againstTotal;

    // Tilt: positive rotation means clockwise in SVG, which pulls the RIGHT side down.
    // We want: for > against → left side down → anti-clockwise → negative rotation.
    const diff = againstTotal - forTotal;
    const tilt = clamp(diff * TILT_K, -MAX_TILT, MAX_TILT);
    beam.style.transform = `rotate(${tilt}deg)`;

    updateVerdict(forTotal, againstTotal);

    if (opts.focusLast) {
      const col = opts.focusLast === "for" ? itemsForEl : itemsAgainstEl;
      const inputs = col.querySelectorAll('input[type="text"]');
      if (inputs.length) inputs[inputs.length - 1].focus();
    }
  }

  function renderColumn(container, items, side) {
    container.innerHTML = "";
    items.forEach((it) => container.appendChild(makeItemRow(it, side)));
  }

  function makeItemRow(item, side) {
    const row = document.createElement("div");
    row.className = "item";
    row.dataset.id = item.id;

    const input = document.createElement("input");
    input.type = "text";
    input.value = item.text;
    input.placeholder = side === "for" ? "e.g. I'll feel proud" : "e.g. It's uncomfortable";
    input.addEventListener("input", (e) => {
      item.text = e.target.value;
      // don't re-render on every keystroke (would kill focus); just keep state in sync
    });

    const weight = document.createElement("div");
    weight.className = "weight";
    weight.title = "Weight (1 = tiny, 10 = huge)";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute("aria-label", "Decrease weight");

    const val = document.createElement("span");
    val.className = "val";
    val.textContent = item.weight;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute("aria-label", "Increase weight");

    minus.addEventListener("click", () => {
      item.weight = Math.max(1, item.weight - 1);
      val.textContent = item.weight;
      recomputeTotalsAndTilt();
    });
    plus.addEventListener("click", () => {
      item.weight = Math.min(10, item.weight + 1);
      val.textContent = item.weight;
      recomputeTotalsAndTilt();
    });

    weight.appendChild(minus);
    weight.appendChild(val);
    weight.appendChild(plus);

    const remove = document.createElement("button");
    remove.className = "remove";
    remove.type = "button";
    remove.setAttribute("aria-label", "Remove");
    remove.innerHTML = "×";
    remove.addEventListener("click", () => {
      state[side] = state[side].filter((x) => x.id !== item.id);
      render();
    });

    row.appendChild(input);
    row.appendChild(weight);
    row.appendChild(remove);
    return row;
  }

  function recomputeTotalsAndTilt() {
    const forTotal = sumWeights(state.for);
    const againstTotal = sumWeights(state.against);
    forTotalEl.textContent = forTotal;
    againstTotalEl.textContent = againstTotal;
    forTotalLabel.textContent = forTotal;
    againstTotalLabel.textContent = againstTotal;
    const diff = againstTotal - forTotal;
    const tilt = clamp(diff * TILT_K, -MAX_TILT, MAX_TILT);
    beam.style.transform = `rotate(${tilt}deg)`;
    updateVerdict(forTotal, againstTotal);
  }

  function updateVerdict(f, a) {
    let line, sub;
    if (f === 0 && a === 0) {
      line = "Add a few reasons on each side.";
      sub = "The scale tips toward whichever side is heavier.";
    } else if (f === a) {
      line = "Perfectly balanced.";
      sub = "Stuck on the fence — nudge either side to tip it.";
    } else if (f > a) {
      const d = f - a;
      if (d >= 8) line = "Tilted hard toward action — you'll do it.";
      else if (d >= 3) line = "Tilted toward action — you're likely to do it.";
      else line = "Leaning toward action.";
      sub = `${f} for, ${a} against.`;
    } else {
      const d = a - f;
      if (d >= 8) line = "Tilted hard away from action — you won't.";
      else if (d >= 3) line = "Tilted away from action — you probably won't.";
      else line = "Leaning away from action.";
      sub = `${f} for, ${a} against.`;
    }
    verdict.innerHTML = `${escapeHtml(line)}<small>${escapeHtml(sub)}</small>`;
  }

  function sumWeights(arr) {
    return arr.reduce((s, x) => s + (Number(x.weight) || 0), 0);
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  render();
})();
