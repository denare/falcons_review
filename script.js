(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Score digit count-up (one orchestrated moment) ---------- */
  var scoreDigit = document.querySelector(".score-digit");
  if (scoreDigit) {
    var target = parseFloat(scoreDigit.getAttribute("data-target"));
    if (reduceMotion) {
      scoreDigit.textContent = target.toFixed(1);
    } else {
      var start = null;
      var duration = 1100;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        scoreDigit.textContent = (target * eased).toFixed(1);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  }

  /* ---------- Scoreline bar fill (triggers once, on scroll into view) ---------- */
  var bars = document.querySelectorAll(".bars li");
  var barObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var li = entry.target;
          var score = parseFloat(li.getAttribute("data-score"));
          var fill = li.querySelector(".bar-fill");
          if (fill) fill.style.width = (score / 10) * 100 + "%";
          barObserver.unobserve(li);
        }
      });
    },
    { threshold: 0.4 }
  );
  bars.forEach(function (li) { barObserver.observe(li); });

  /* ---------- Lazy-load live proof iframes ---------- */
  var frames = document.querySelectorAll(".proof-frame");
  var frameObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var wrap = entry.target;
          var src = wrap.getAttribute("data-src");
          var iframe = wrap.querySelector("iframe");
          if (iframe && src && !iframe.src) {
            iframe.src = src;
          }
          frameObserver.unobserve(wrap);
        }
      });
    },
    { threshold: 0.1, rootMargin: "200px 0px" }
  );
  frames.forEach(function (wrap) { frameObserver.observe(wrap); });

  /* ---------- Fix-list expand / collapse (click-triggered) ---------- */
  document.querySelectorAll(".fix-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var list = btn.nextElementSibling;
      var isOpen = list.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  /* ---------- Active nav pill on scroll ---------- */
  var pills = document.querySelectorAll(".pill");
  var sections = [];
  pills.forEach(function (pill) {
    var id = pill.getAttribute("data-section");
    var el = document.getElementById(id);
    if (el) sections.push({ id: id, el: el, pill: pill });
  });

  var navObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var match = sections.find(function (s) { return s.el === entry.target; });
        if (!match) return;
        if (entry.isIntersecting) {
          pills.forEach(function (p) { p.classList.remove("active"); });
          match.pill.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach(function (s) { navObserver.observe(s.el); });

  /* ---------- Sync topbar score with hero score once animation settles ---------- */
  var topbarScore = document.getElementById("topbarScore");
  if (topbarScore && scoreDigit) {
    var finalScore = scoreDigit.getAttribute("data-target");
    setTimeout(function () {
      topbarScore.innerHTML = finalScore + "<small>/10</small>";
    }, reduceMotion ? 0 : 1150);
  }
})();
