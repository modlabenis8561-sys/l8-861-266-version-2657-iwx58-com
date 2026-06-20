(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }

    var homeInput = document.querySelector('[data-home-search-input]');
    var homeLink = document.querySelector('[data-home-search-link]');

    if (homeInput && homeLink) {
      var syncHomeSearch = function () {
        var value = homeInput.value.trim();
        homeLink.href = value ? './categories.html?q=' + encodeURIComponent(value) : './categories.html';
      };
      homeInput.addEventListener('input', syncHomeSearch);
      homeInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          syncHomeSearch();
          window.location.href = homeLink.href;
        }
      });
      syncHomeSearch();
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var grid = scope.querySelector('[data-filter-grid]');
      if (!grid) {
        return;
      }

      var input = scope.querySelector('[data-search-input]');
      var category = scope.querySelector('[data-category-select]');
      var year = scope.querySelector('[data-year-select]');
      var empty = scope.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');

      if (q && input) {
        input.value = q;
      }

      var apply = function () {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var categoryValue = category ? category.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;

        grid.querySelectorAll('.movie-card').forEach(function (card) {
          var haystack = [
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.category,
            card.dataset.tags
          ].join(' ').toLowerCase();
          var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var passCategory = !categoryValue || card.dataset.category === categoryValue;
          var passYear = !yearValue || card.dataset.year === yearValue;
          var pass = passKeyword && passCategory && passYear;
          card.style.display = pass ? '' : 'none';
          if (pass) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      };

      [input, category, year].forEach(function (node) {
        if (node) {
          node.addEventListener('input', apply);
          node.addEventListener('change', apply);
        }
      });

      apply();
    });

    document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
      var index = 0;

      if (!slides.length) {
        return;
      }

      var show = function (next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
          slide.classList.toggle('is-active', position === index);
        });
        dots.forEach(function (dot, position) {
          dot.classList.toggle('is-active', position === index);
        });
      };

      dots.forEach(function (dot, position) {
        dot.addEventListener('click', function () {
          show(position);
        });
      });

      setInterval(function () {
        show(index + 1);
      }, 5200);
    });

    document.querySelectorAll('.movie-player').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-start');
      var stream = player.getAttribute('data-stream');
      var loaded = false;
      var hlsInstance = null;

      if (!video || !stream) {
        return;
      }

      var attachStream = function () {
        if (loaded) {
          return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      };

      var start = function () {
        attachStream();
        if (button) {
          button.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      };

      if (button) {
        button.addEventListener('click', start);
      }

      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          start();
        }
      });

      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
}());
