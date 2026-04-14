// Render the emotion cards and wire up the accordion interaction.

(function () {
  const grid = document.getElementById("emotions");
  const filterInput = document.getElementById("emotionFilter");
  const countEl = document.getElementById("emotionCount");
  if (!grid || typeof EMOTIONS === "undefined") return;

  const frag = document.createDocumentFragment();
  const cards = [];

  EMOTIONS.forEach((e, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "emotion";
    card.setAttribute("aria-expanded", "false");
    card.setAttribute("aria-controls", `emotion-body-${i}`);

    card.innerHTML = `
      <div class="head">
        <span class="quote">${escapeHtml(e.thought)}</span>
        <span class="chev" aria-hidden="true"></span>
      </div>
      <div class="body" id="emotion-body-${i}">
        <div class="body-inner">
          <div class="label">What it really means</div>
          <div class="meaning">${escapeHtml(e.meaning)}</div>
          <div class="label">The strategy</div>
          <div class="strategy">${escapeHtml(e.strategy)}</div>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      const open = card.classList.toggle("is-open");
      card.setAttribute("aria-expanded", open ? "true" : "false");
    });

    cards.push({ data: e, node: card });
    frag.appendChild(card);
  });

  grid.appendChild(frag);
  updateCount(cards.length, cards.length);

  if (filterInput) {
    filterInput.addEventListener("input", () => {
      const q = filterInput.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach((c) => {
        const haystack = `${c.data.thought} ${c.data.meaning} ${c.data.strategy}`.toLowerCase();
        const show = !q || haystack.includes(q);
        c.node.hidden = !show;
        if (show) visible += 1;
      });
      updateCount(visible, cards.length);
    });
  }

  function updateCount(visible, total) {
    if (!countEl) return;
    countEl.textContent = visible === total ? `Showing all ${total} feelings.` : `Showing ${visible} of ${total} feelings.`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
