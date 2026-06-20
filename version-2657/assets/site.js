(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));

    function filterCards(value) {
        var query = String(value || '').trim().toLowerCase();
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        cards.forEach(function (card) {
            var text = String(card.getAttribute('data-card-search') || card.textContent || '').toLowerCase();
            card.classList.toggle('is-hidden', Boolean(query) && text.indexOf(query) === -1);
        });
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            filterCards(input.value);
        });
    });

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            filterButtons.forEach(function (item) {
                item.classList.remove('active');
            });
            button.classList.add('active');
            var value = button.getAttribute('data-filter-value') || '';
            searchInputs.forEach(function (input) {
                input.value = value;
            });
            filterCards(value);
        });
    });
})();
