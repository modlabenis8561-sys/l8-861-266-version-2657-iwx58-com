(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function initMenu() {
        var button = document.querySelector(".mobile-menu-button");
        if (!button) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = document.body.classList.toggle("nav-open");
            button.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function initHero() {
        var heroes = document.querySelectorAll("[data-hero]");
        heroes.forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function start() {
                if (timer || slides.length < 2) {
                    return;
                }
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    stop();
                    show(dotIndex);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    stop();
                    show(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    stop();
                    show(index + 1);
                    start();
                });
            }

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initFilters() {
        document.querySelectorAll(".filter-scope").forEach(function (scope) {
            var input = scope.querySelector(".movie-search");
            var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".filterable-card"));
            var empty = scope.querySelector(".empty-state");
            var active = "";

            function update() {
                var keyword = input ? normalize(input.value) : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-card-text"));
                    var passKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var passChip = !active || text.indexOf(active) !== -1;
                    var isVisible = passKeyword && passChip;
                    card.hidden = !isVisible;
                    if (isVisible) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener("input", update);
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    active = normalize(chip.getAttribute("data-filter"));
                    chips.forEach(function (item) {
                        item.classList.toggle("is-active", item === chip);
                    });
                    update();
                });
            });

            update();
        });
    }

    window.startMoviePlayer = function (videoId, buttonId, frameId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var frame = document.getElementById(frameId);
        if (!video || !source) {
            return;
        }

        function attach() {
            if (video.getAttribute("src") || video.dataset.readyState === "ready") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.dataset.readyState = "ready";
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video.dataset.readyState = "ready";
                video._hlsPlayer = hls;
                return;
            }
            video.src = source;
            video.dataset.readyState = "ready";
        }

        function play() {
            attach();
            if (frame) {
                frame.classList.add("is-playing");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }

        if (frame) {
            frame.addEventListener("click", function (event) {
                if (event.target === video || event.target.closest("button")) {
                    return;
                }
                play();
            });
        }

        video.addEventListener("click", function (event) {
            event.stopPropagation();
            if (video.paused) {
                play();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
