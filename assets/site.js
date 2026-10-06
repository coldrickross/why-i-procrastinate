/* Shared site chrome: theme toggle and the sticky header's scrolled state.
   The initial theme is applied by a tiny inline script in each page's <head>
   so there's no flash of the wrong colours. */
(function () {
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function current() {
    return root.dataset.theme || (media.matches ? "dark" : "light");
  }

  function label() {
    if (!toggle) return;
    const next = current() === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-label", `Switch to ${next} mode`);
    toggle.setAttribute("title", `Switch to ${next} mode`);
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = current() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("wip-theme", next); } catch (_) { /* ignore */ }
      label();
    });
    media.addEventListener("change", label);
    label();
  }

  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Keep the active nav link visible when the link row scrolls sideways on phones.
  const active = document.querySelector('.nav .links a[aria-current="page"]');
  if (active && active.parentElement.scrollWidth > active.parentElement.clientWidth) {
    active.scrollIntoView({ block: "nearest", inline: "center" });
  }
})();
