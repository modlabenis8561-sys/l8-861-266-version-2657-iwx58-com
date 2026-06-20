(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initHeader() {
    var header = document.querySelector("[data-header]");
    var button = document.querySelector("[data-menu-button]");
    var mobile = document.querySelector("[data-mobile-nav]");
    if (header) {
      var updateHeader = function () {
        if (window.scrollY > 30) {
          header.classList.add("is-scrolled");
        } else {
          header.classList.remove("is-scrolled");
        }
      };
      updateHeader();
      window.addEventListener("scroll", updateHeader, { passive: true });
    }
    if (button && mobile) {
      button.addEventListener("click", function () {
        mobile.classList.toggle("is-open");
      });
    }
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    };
    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };
    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }
    show(0);
    restart();
  }

  function initLocalSearch() {
    var input = document.querySelector("[data-local-search]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-keywords") || "").toLowerCase();
        card.classList.toggle("hidden-card", query && haystack.indexOf(query) === -1);
      });
    });
  }

  function renderSearchResults(items) {
    var target = document.querySelector("[data-search-results]");
    if (!target) {
      return;
    }
    target.innerHTML = items.slice(0, 80).map(function (movie) {
      return [
        '<a class="movie-card" href="' + movie.url + '">',
        '<div class="poster-box">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
        '</div>',
        '<div class="movie-card-body">',
        '<div class="movie-card-tags"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
        '<h3>' + escapeHtml(movie.title) + '</h3>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="movie-card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '</div>',
        '</a>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initGlobalSearch() {
    var input = document.querySelector("[data-global-search]");
    var select = document.querySelector("[data-search-category]");
    var data = window.SEARCH_INDEX || [];
    if (!input || !select || !data.length) {
      return;
    }
    var filter = function () {
      var query = input.value.trim().toLowerCase();
      var category = select.value;
      var filtered = data.filter(function (movie) {
        var matchedCategory = !category || movie.category === category;
        var matchedQuery = !query || movie.keywords.toLowerCase().indexOf(query) !== -1;
        return matchedCategory && matchedQuery;
      });
      renderSearchResults(filtered);
    };
    input.addEventListener("input", filter);
    select.addEventListener("change", filter);
    renderSearchResults(data.slice(0, 48));
  }

  function initPlayer() {
    var configNode = document.getElementById("movie-config");
    var video = document.querySelector("[data-video]");
    var button = document.querySelector("[data-play]");
    if (!configNode || !video || !button) {
      return;
    }
    var config = {};
    try {
      config = JSON.parse(configNode.textContent || "{}");
    } catch (error) {
      config = {};
    }
    var stream = config.source;
    var hls = null;
    var started = false;
    var hideButton = function () {
      button.classList.add("is-hidden");
    };
    var showButton = function () {
      button.classList.remove("is-hidden");
    };
    var playVideo = function () {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          showButton();
        });
      }
    };
    var start = function () {
      if (!stream) {
        return;
      }
      hideButton();
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.getAttribute("src")) {
          video.setAttribute("src", stream);
        }
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!started) {
          started = true;
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showButton();
            }
          });
        } else {
          playVideo();
        }
      } else {
        video.setAttribute("src", stream);
        playVideo();
      }
    };
    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", hideButton);
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        showButton();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initHeader();
    initHero();
    initLocalSearch();
    initGlobalSearch();
    initPlayer();
  });
})();
