(() => {
  const player = document.querySelector('.photography-player');
  if (!player) return;
  const slides = Array.from(player.querySelectorAll('.photography-slide'));
  const controls = player.querySelector('.photography-controls');
  const toggle = player.querySelector('[data-photo-play]');
  const count = player.querySelector('.photography-count');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let playing = !reducedMotion.matches;
  let visible = false;
  let timer;

  const schedule = () => {
    clearTimeout(timer);
    if (playing && visible && !document.hidden) {
      timer = setTimeout(() => show(current + 1), 5000);
    }
  };
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
    });
    // Start loading the next frame before it is needed.
    slides[(current + 1) % slides.length].querySelector('img').loading = 'eager';
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    schedule();
  };
  const setPlaying = (value) => {
    playing = value;
    toggle.textContent = playing ? 'Pause' : 'Play';
    toggle.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
    count.setAttribute('aria-live', playing ? 'off' : 'polite');
    schedule();
  };
  const step = (direction) => {
    setPlaying(false);
    show(current + direction);
  };
  player.querySelector('[data-photo-prev]').addEventListener('click', () => step(-1));
  player.querySelector('[data-photo-next]').addEventListener('click', () => step(1));
  toggle.addEventListener('click', () => setPlaying(!playing));
  player.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      step(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => setPlaying(!reducedMotion.matches));
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) slides[(current + 1) % slides.length].querySelector('img').loading = 'eager';
    schedule();
  }, { threshold: 0.2 }).observe(player);
  controls.hidden = false;
  setPlaying(playing);
})();
