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
      lock.textContent = "\u{1F512}"; // 🔒
      a.appendChild(document.createTextNode(" "));
      a.appendChild(lock);
    }
  });
})();
