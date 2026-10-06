/* Adds a small lock indicator to the Journey nav link when the user hasn't
   completed the worksheet yet. Runs on every page that includes it. */
(function () {
  let complete = false;
  try { complete = !!localStorage.getItem("wip-worksheet-complete"); }
  catch (_) { /* ignore */ }
  if (complete) return;

  const links = document.querySelectorAll('.nav .links a[href="progress.html"], .nav .links a[href^="progress.html?"]');
  links.forEach((a) => {
    a.classList.add("is-locked");
    a.setAttribute("title", "Complete the worksheet to unlock the Journey tab");
    if (!a.querySelector(".nav-lock-icon")) {
      const lock = document.createElement("span");
      lock.className = "nav-lock-icon";
      lock.setAttribute("aria-hidden", "true");
      lock.innerHTML = '<svg viewBox="0 0 16 16" width="12" height="12"><rect x="3" y="7" width="10" height="7" rx="2" fill="currentColor"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
      a.appendChild(lock);
    }
  });
})();
