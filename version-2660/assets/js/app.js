(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.poster-frame img').forEach(function (image) {
    if (image.complete && image.naturalWidth === 0) {
      image.closest('.poster-frame').classList.add('is-missing');
    }
    image.addEventListener('error', function () {
      image.closest('.poster-frame').classList.add('is-missing');
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-filter-bar]').forEach(function (bar) {
    var grid = document.querySelector('[data-card-grid]');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    bar.addEventListener('click', function (event) {
      var button = event.target.closest('[data-filter]');
      if (!button) {
        return;
      }
      var value = button.getAttribute('data-filter');
      bar.querySelectorAll('[data-filter]').forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      cards.forEach(function (card) {
        var matched = value === 'all' || card.getAttribute('data-year') === value;
        card.style.display = matched ? '' : 'none';
      });
    });
  });

  function renderSearchResults(container, query, limit) {
    if (!container || !window.MOVIE_CATALOG) {
      return;
    }
    var text = String(query || '').trim().toLowerCase();
    if (!text) {
      container.innerHTML = '';
      return;
    }
    var words = text.split(/\s+/).filter(Boolean);
    var hits = window.MOVIE_CATALOG.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(' ').toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, limit || 24);

    if (!hits.length) {
      container.innerHTML = '<p class="empty-result">没有找到匹配内容</p>';
      return;
    }

    container.innerHTML = hits.map(function (movie) {
      return '<a class="search-hit" href="./' + movie.link + '">' +
        '<div class="poster-frame"><img src="./' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="poster-fallback">' + escapeHtml(movie.title.slice(0, 2)) + '</span></div>' +
        '<div><h3>' + escapeHtml(movie.title) + '</h3><p>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</p></div>' +
        '</a>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  document.querySelectorAll('[data-search-box]').forEach(function (box) {
    var input = box.querySelector('[data-inline-search]');
    var results = box.querySelector('[data-inline-results]');
    if (!input || !results) {
      return;
    }
    input.addEventListener('input', function () {
      renderSearchResults(results, input.value, 6);
    });
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    var searchInput = searchPage.querySelector('[data-search-input]');
    var searchResults = searchPage.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (searchInput) {
      searchInput.value = initial;
      renderSearchResults(searchResults, initial, 60);
      searchInput.addEventListener('input', function () {
        renderSearchResults(searchResults, searchInput.value, 60);
      });
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.player-play');
    var stream = box.getAttribute('data-stream');
    var started = false;
    var hlsInstance = null;

    function playVideo() {
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }

    function startPlayer() {
      if (!video || !stream) {
        return;
      }
      if (started) {
        playVideo();
        return;
      }
      started = true;
      box.classList.add('is-playing');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        return;
      }

      video.src = stream;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      video.load();
    }

    if (button) {
      button.addEventListener('click', startPlayer);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          startPlayer();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
