(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      const open = mobileNav.hasAttribute('hidden');
      if (open) {
        mobileNav.removeAttribute('hidden');
      } else {
        mobileNav.setAttribute('hidden', '');
      }
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let activeSlide = 0;
  const showSlide = (index) => {
    if (!slides.length) return;
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === activeSlide));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === activeSlide));
  };
  document.querySelector('.hero-next')?.addEventListener('click', () => showSlide(activeSlide + 1));
  document.querySelector('.hero-prev')?.addEventListener('click', () => showSlide(activeSlide - 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));
  if (slides.length > 1) {
    window.setInterval(() => showSlide(activeSlide + 1), 5600);
  }

  const cards = Array.from(document.querySelectorAll('.movie-card'));
  const input = document.querySelector('.filter-input');
  const selects = Array.from(document.querySelectorAll('.filter-select'));
  const empty = document.querySelector('.empty-state');
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  if (input && query) {
    input.value = query;
  }

  const normalize = (value) => String(value || '').trim().toLowerCase();
  const applyFilters = () => {
    if (!cards.length) return;
    const keyword = normalize(input?.value);
    const selected = {};
    selects.forEach((select) => {
      selected[select.dataset.filter] = normalize(select.value);
    });
    let visible = 0;
    cards.forEach((card) => {
      const text = normalize(card.dataset.search);
      const matchKeyword = !keyword || text.includes(keyword);
      const matchYear = !selected.year || normalize(card.dataset.year) === selected.year;
      const matchCategory = !selected.category || normalize(card.dataset.category) === selected.category;
      const ok = matchKeyword && matchYear && matchCategory;
      card.hidden = !ok;
      if (ok) visible += 1;
    });
    if (empty) {
      empty.hidden = visible !== 0;
    }
  };
  input?.addEventListener('input', applyFilters);
  selects.forEach((select) => select.addEventListener('change', applyFilters));
  if (query) {
    applyFilters();
  }
})();
