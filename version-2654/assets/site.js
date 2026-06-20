(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav-menu");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));

    if (slides.length > 0) {
      var index = 0;
      var timer;

      function showSlide(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      function startTimer() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
          startTimer();
        });
      });

      showSlide(0);
      startTimer();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));

    panels.forEach(function (panel) {
      var root = panel.closest(".section") || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
      var input = panel.querySelector("input[type='search']");
      var typeSelect = panel.querySelector("select[data-filter='type']");
      var yearSelect = panel.querySelector("select[data-filter='year']");
      var regionSelect = panel.querySelector("select[data-filter='region']");
      var empty = root.querySelector(".no-results");
      var params = new URLSearchParams(window.location.search);
      var queryFromUrl = params.get("q");

      if (input && queryFromUrl) {
        input.value = queryFromUrl;
      }

      function applyFilters() {
        var query = normalize(input ? input.value : "");
        var type = normalize(typeSelect ? typeSelect.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var region = normalize(regionSelect ? regionSelect.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-type"),
            card.getAttribute("data-region"),
            card.textContent
          ].join(" "));
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }

          if (type && normalize(card.getAttribute("data-type")) !== type) {
            matched = false;
          }

          if (year && normalize(card.getAttribute("data-year")) !== year) {
            matched = false;
          }

          if (region && normalize(card.getAttribute("data-region")) !== region) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [input, typeSelect, yearSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    });
  });
})();

function initMoviePlayer(sourceUrl) {
  var video = document.getElementById("main-player");
  var overlay = document.querySelector(".play-overlay");
  var attached = false;

  if (!video) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function play() {
    attach();

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
}
