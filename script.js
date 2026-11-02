const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}


/* ---------- Плавный скролл (инерция колёсика + плавные якоря) ---------- */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touchOnly = window.matchMedia('(pointer: coarse)').matches;
  // На телефонах и при «уменьшении анимаций» оставляем нативную прокрутку.
  if (reduceMotion || touchOnly) return;

  const EASE = 0.085;        // 0..1 — чем меньше, тем «тягучее» доводка
  const WHEEL_SPEED = 0.9;   // множитель шага колёсика
  const ANCHOR_OFFSET = 16;  // отступ сверху у якорей, px

  root.style.scrollBehavior = 'auto'; // отключаем CSS smooth, чтобы не конфликтовал

  const maxScroll = () => Math.max(0, root.scrollHeight - window.innerHeight);
  const clamp = (v) => Math.min(Math.max(v, 0), maxScroll());

  let current = window.scrollY;
  let target = current;
  let frame = 0;
  let last = 0;

  const tick = (now) => {
    const dt = Math.min(now - last, 64) || 16.67;
    last = now;
    target = clamp(target);
    // коэффициент не зависит от частоты кадров (60/120/144 Гц)
    const k = 1 - Math.pow(1 - EASE, dt / 16.67);
    current += (target - current) * k;

    if (Math.abs(target - current) < 0.4) {
      current = target;
      window.scrollTo(0, current);
      frame = 0;
      return;
    }
    window.scrollTo(0, current);
    frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (frame) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };

  const scrollToY = (y) => {
    target = clamp(y);
    start();
  };

  // Колёсико мыши / тачпад
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.defaultPrevented) return; // зум жестом — не трогаем
    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 16;                    // строки
    else if (e.deltaMode === 2) delta *= window.innerHeight; // страницы
    if (!delta) return;
    e.preventDefault();
    if (!frame) { current = window.scrollY; target = current; }
    scrollToY(target + delta * WHEEL_SPEED);
  }, { passive: false });

  // Клавиатура, перетаскивание полосы прокрутки, поиск по странице:
  // подхватываем внешнее изменение позиции, чтобы не «откатывало» назад.
  window.addEventListener('scroll', () => {
    if (!frame && Math.abs(window.scrollY - current) > 1) {
      current = target = window.scrollY;
    }
  }, { passive: true });

  window.addEventListener('resize', () => { target = clamp(target); });

  // Якорные ссылки: плавный доезд до секции
  document.addEventListener('click', (e) => {
    const link = e.target.closest && e.target.closest('a[href^="#"]');
    if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    const el = id ? document.getElementById(id) : null;
    if (id && !el) return;
    e.preventDefault();
    if (!frame) { current = window.scrollY; target = current; }
    const y = el ? el.getBoundingClientRect().top + window.scrollY - ANCHOR_OFFSET : 0;
    scrollToY(id === 'top' ? 0 : y);
    history.pushState(null, '', id ? '#' + id : location.pathname);
  });
})();
