(function () {
  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var isHidden = mobileNav.hasAttribute("hidden");
      if (isHidden) {
        mobileNav.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
      } else {
        mobileNav.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-dot]"),
    );
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  var panel = document.querySelector("[data-filter-panel]");

  if (panel) {
    var input = panel.querySelector("[data-filter-input]");
    var year = panel.querySelector("[data-filter-year]");
    var type = panel.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(
      document.querySelectorAll("[data-search-card]"),
    );
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var empty = document.createElement("div");
    empty.className = "filter-empty";
    empty.textContent = "没有匹配的影片";

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "")
        .toLowerCase()
        .trim();
    }

    function filter() {
      var query = normalize(input ? input.value : "");
      var selectedYear = normalize(year ? year.value : "");
      var selectedType = normalize(type ? type.value : "");
      var shown = 0;

      cards.forEach(function (card) {
        var text = normalize(
          [
            card.getAttribute("data-title"),
            card.getAttribute("data-type"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-keywords"),
          ].join(" "),
        );
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }

        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }

        if (selectedType && cardType.indexOf(selectedType) === -1) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          shown += 1;
        }
      });

      var results = document.querySelector("[data-filter-results]");
      if (results) {
        if (shown === 0 && !empty.parentNode) {
          results.appendChild(empty);
        } else if (shown > 0 && empty.parentNode) {
          empty.parentNode.removeChild(empty);
        }
      }
    }

    [input, year, type].forEach(function (node) {
      if (node) {
        node.addEventListener("input", filter);
        node.addEventListener("change", filter);
      }
    });

    filter();
  }
})();
