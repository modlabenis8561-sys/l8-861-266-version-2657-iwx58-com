(function () {
    function startPlayer(wrapper) {
        var video = wrapper.querySelector('video');
        var source = wrapper.getAttribute('data-hls');

        if (!video || !source) {
            return;
        }

        function playVideo() {
            wrapper.classList.add('is-playing');
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    wrapper.classList.remove('is-playing');
                });
            }
        }

        if (wrapper.getAttribute('data-ready') !== 'yes') {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            } else {
                video.src = source;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
            }
            wrapper.setAttribute('data-ready', 'yes');
        } else {
            playVideo();
        }
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));
    players.forEach(function (wrapper) {
        var button = wrapper.querySelector('[data-play-button]');
        var video = wrapper.querySelector('video');

        if (button) {
            button.addEventListener('click', function () {
                startPlayer(wrapper);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayer(wrapper);
                }
            });
        }
    });
})();
