/* aecom-reveal.js — minimal, dependency-free scroll reveal.
 *
 * Adds `.is-visible` to any [data-reveal] element when it scrolls into view,
 * which triggers the fade-up transition defined in aecom-theme.css. Mirrors the
 * staggered fade-up "builds" from the AECOM PowerPoint look.
 *
 * Usage:
 *   <script src="aecom-reveal.js" defer></script>
 *   <div data-reveal>…</div>
 *   <div data-reveal data-reveal-delay="120">…</div>   // explicit stagger (ms)
 *   <ul data-reveal-group="120">                        // auto-stagger children
 *     <li data-reveal>…</li><li data-reveal>…</li> ...
 *   </ul>
 *
 * Honors prefers-reduced-motion (everything just shows immediately).
 */
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // auto-stagger: set --aecom-reveal-delay on each [data-reveal] child of a group
    document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
      var step = parseInt(group.getAttribute("data-reveal-group"), 10) || 120;
      var i = 0;
      group.querySelectorAll("[data-reveal]").forEach(function (el) {
        if (!el.hasAttribute("data-reveal-delay")) {
          el.style.setProperty("--aecom-reveal-delay", (i * step) + "ms");
        }
        i++;
      });
    });

    // apply explicit per-element delays
    document.querySelectorAll("[data-reveal][data-reveal-delay]").forEach(function (el) {
      el.style.setProperty("--aecom-reveal-delay", parseInt(el.getAttribute("data-reveal-delay"), 10) + "ms");
    });

    var items = document.querySelectorAll("[data-reveal]");

    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    items.forEach(function (el) { io.observe(el); });
  });
})();
