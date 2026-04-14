(function () {
  const MAX_TILT = 18;
  const TILT_FACTOR = 2.4;

  const state = {
    for: [
      { id: 1, text: "Love for my future", weight: 2 },
    ],
    against: [
      { id: 2, text: "Fear of failure", weight: 1 },
      { id: 3, text: "Less free time", weight: 3 },
      { id: 4, text: "Emotional pain", weight: 3 },
    ],
  };

  let nextId = 5;

  const forList = document.getElementById("forList");
  const againstList = document.getElementById("againstList");
  const insertForForm = document.getElementById("insertForForm");
  const insertAgainstForm = document.getElementById("insertAgainstForm");
  const beam = document.getElementById("v2Beam");
  const verdict = document.getElementById("v2Verdict");

  insertForForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = insertForForm.elements.insertFor;
    const text = String(input.value || "").trim();
    if (!text) return;

    state.for.push({ id: nextId++, text, weight: 1 });
    input.value = "";
    render();
    input.focus();
  });

  insertAgainstForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = insertAgainstForm.elements.insertAgainst;
    const text = String(input.value || "").trim();
    if (!text) return;

    state.against.push({ id: nextId++, text, weight: 1 });
    input.value = "";
    render();
    input.focus();
  });

  function render() {
    forList.innerHTML = "";
    againstList.innerHTML = "";

    state.for.forEach((item) => {
      forList.appendChild(makeRow(item, "for"));
    });

    state.against.forEach((item) => {
      againstList.appendChild(makeRow(item, "against"));
    });

    updateScale();
  }

  function makeRow(item, side) {
    const row = document.createElement("div");
    row.className = `v2-item v2-item--${side}`;

    const label = document.createElement("input");
    label.type = "text";
    label.value = item.text;
    label.setAttribute("aria-label", `${side} item text`);
    label.addEventListener("input", (event) => {
      item.text = event.target.value;
    });

    const weight = document.createElement("button");
    weight.type = "button";
    weight.className = "v2-weight";
    weight.textContent = String(item.weight);
    weight.title = "Left click: +1 • Right click: -1 (remove at 0)";

    weight.addEventListener("click", () => {
      item.weight += 1;
      if (item.weight > 9) {
        item.weight = 9;
      }
      render();
    });

    weight.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      item.weight -= 1;
      if (item.weight <= 0) {
        state[side] = state[side].filter((entry) => entry.id !== item.id);
      }
      render();
    });

    row.appendChild(label);
    row.appendChild(weight);
    return row;
  }

  function updateScale() {
    const forWeight = state.for.reduce((sum, item) => sum + item.weight, 0);
    const againstWeight = state.against.reduce((sum, item) => sum + item.weight, 0);
    const difference = againstWeight - forWeight;
    const tilt = clamp(difference * TILT_FACTOR, -MAX_TILT, MAX_TILT);

    beam.style.transform = `translateY(-50%) rotate(${tilt}deg)`;

    if (!forWeight && !againstWeight) {
      verdict.textContent = "Insert items to see which side wins.";
      return;
    }

    if (forWeight === againstWeight) {
      verdict.textContent = `Balanced: ${forWeight} vs ${againstWeight}`;
      return;
    }

    if (forWeight > againstWeight) {
      verdict.textContent = `Tilting toward action: ${forWeight} vs ${againstWeight}`;
      return;
    }

    verdict.textContent = `Tilting against action: ${forWeight} vs ${againstWeight}`;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  render();
})();
