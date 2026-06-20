(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
            var index = 0;
            var show = function (nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            };
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                });
            });
            if (slides.length > 1) {
                setInterval(function () {
                    show(index + 1);
                }, 5200);
            }
        }

        document.querySelectorAll("[data-filter-root]").forEach(function (root) {
            var query = root.querySelector("[data-filter-query]");
            var year = root.querySelector("[data-filter-year]");
            var type = root.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-filter-card]"));
            var empty = root.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            if (query && root.hasAttribute("data-query-from-url") && params.get("q")) {
                query.value = params.get("q");
            }
            var filter = function () {
                var q = query ? query.value.trim().toLowerCase() : "";
                var y = year ? year.value : "";
                var t = type ? type.value : "";
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-text") || "").toLowerCase();
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var match = (!q || haystack.indexOf(q) !== -1) && (!y || cardYear === y) && (!t || cardType === t);
                    card.style.display = match ? "" : "none";
                    if (match) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", shown === 0);
                }
            };
            [query, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", filter);
                    control.addEventListener("change", filter);
                }
            });
            filter();
        });
    });
})();

function initMoviePlayer(streamUrl) {
    var video = document.getElementById("movie-player");
    var layer = document.querySelector("[data-play-layer]");
    if (!video || !layer || !streamUrl) {
        return;
    }
    var bound = false;
    var start = function () {
        if (!bound) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new Hls();
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video.hls = hls;
            } else {
                video.src = streamUrl;
            }
            bound = true;
        }
        layer.classList.add("is-hidden");
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    };
    layer.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
}
