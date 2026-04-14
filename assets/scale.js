(function () {
  const MAX_TILT = 22;
  const TILT_K = 2.2;

  const state = {
    action: "",
    for: [{ id: 1, text: "Love for gf", weight: 2 }],
    against: [
      { id: 2, text: "Fear failure", weight: 2 },
      { id: 3, text: "Less money", weight: 3 },
      { id: 4, text: "Emotional pain", weight: 3 },
    ],
  };

  let nextId = 5;
  const newId = () => nextId++;

  const actionInput = document.getElementById("actionInput");
  const itemsForEl = document.getElementById("itemsFor");
  const itemsAgainstEl = document.getElementById("itemsAgainst");
  const formFor = document.getElementById("formFor");
  const formAgainst = document.getElementById("formAgainst");
  const newForText = document.getElementById("newForText");
  const newAgainstText = document.getElementById("newAgainstText");
  const forTotalEl = document.getElementById("forTotal");
  const againstTotalEl = document.getElementById("againstTotal");
  const forTotalLabel = document.getElementById("forTotalLabel");
  const againstTotalLabel = document.getElementById("againstTotalLabel");
  const beam = document.querySelector(".scale-svg .beam");
  const verdict = document.getElementById("verdict");

  actionInput.addEventListener("input", (e) => {
    state.action = e.target.value;
    updateVerdict(sumWeights(state.for), sumWeights(state.against));
  });

  formFor.addEventListener("submit", (e) => {
    e.preventDefault();
    addReason("for", newForText);
  });

  formAgainst.addEventListener("submit", (e) => {
    e.preventDefault();
    addReason("against", newAgainstText);
  });

  function addReason(side, inputEl) {
    const text = inputEl.value.trim();
    if (!text) return;
    state[side].push({ id: newId(), text, weight: 1 });
    inputEl.value = "";
    render();
  }

  function render() {
    renderColumn(itemsForEl, state.for, "for");
    renderColumn(itemsAgainstEl, state.against, "against");

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

  function renderColumn(container, items, side) {
    container.innerHTML = "";
    [...items].sort((a, b) => b.weight - a.weight).forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `reason-node ${side}`;
      btn.style.fontSize = `${0.78 + item.weight * 0.18}rem`;
      btn.title = "Left click: +1 weight. Right click: -1 weight (remove at 0).";

      const label = document.createElement("span");
      label.className = "reason-text";
      label.textContent = item.text;

      const badge = document.createElement("span");
      badge.className = "reason-badge";
      badge.textContent = item.weight;

      btn.appendChild(label);
      btn.appendChild(badge);

      btn.addEventListener("click", () => {
        item.weight += 1;
        render();
      });

      btn.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        item.weight -= 1;
        if (item.weight <= 0) {
          state[side] = state[side].filter((x) => x.id !== item.id);
        }
        render();
      });

      container.appendChild(btn);
    });
  }

  function updateVerdict(f, a) {
    const action = state.action.trim() || "this action";
    let line;
    let sub;

    if (f === 0 && a === 0) {
      line = `Add reasons for and against ${action}.`;
      sub = "Then click reasons to change their weight and watch the scale tilt.";
    } else if (f === a) {
      line = `${action} is perfectly balanced.`;
      sub = "One extra point on either side will tip the decision.";
    } else if (f > a) {
      line = `${action} is tilted toward action.`;
      sub = `${f} for vs ${a} against.`;
    } else {
      line = `${action} is tilted away from action.`;
      sub = `${f} for vs ${a} against.`;
    }

    verdict.innerHTML = `${escapeHtml(line)}<small>${escapeHtml(sub)}</small>`;
  }

  function sumWeights(arr) {
    return arr.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  render();
})();
