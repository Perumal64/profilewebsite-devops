(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // Theme toggle (the initial theme is set by a tiny inline script in <head> to avoid a flash)
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const syncThemeButton = () => {
    const dark = root.getAttribute('data-theme') === 'dark';
    themeBtn.textContent = dark ? '\u2600' : '\u263E';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  };
  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
    syncThemeButton();
  });
  syncThemeButton();

  // Hamburger menu (closes on link click or Escape)
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const setMenu = (open) => {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.addEventListener('click', (e) => { if (e.target.tagName === 'A') { setMenu(false); } });

  // Scroll-triggered reveal
  const reveal = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => reveal.observe(el));

  // Highlight the nav link of the section currently in view
  const navLinks = Array.from(links.querySelectorAll('a'));
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) { return; }
      navLinks.forEach((a) => {
        a.toggleAttribute('aria-current', false);
        if (a.getAttribute('href') === '#' + entry.target.id) { a.setAttribute('aria-current', 'true'); }
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((sec) => spy.observe(sec));

  // Show more / show less
  document.querySelectorAll('.more-btn').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const collapsed = btn.previousElementSibling.classList.toggle('collapsed');
      btn.textContent = collapsed ? 'Show more' : 'Show less';
      btn.setAttribute('aria-expanded', String(!collapsed));
    });
  });

  // Flip cards: hover on desktop, tap or Enter/Space on touch and keyboard
  const touchOnly = window.matchMedia('(hover: none)').matches;
  document.querySelectorAll('.flip-card').forEach((card) => {
    const flip = () => {
      const flipped = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', String(flipped));
    };
    if (touchOnly) { card.addEventListener('click', flip); }
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });
  });

  // Lightbox with focus management
  const box = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbTitle = document.getElementById('lb-title');
  const lbText = document.getElementById('lb-text');
  const lbClose = document.getElementById('lb-close');
  let opener = null;
  const closeBox = () => {
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
    if (opener) { opener.focus(); opener = null; }
  };
  document.querySelectorAll('.hobby').forEach((card) => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      opener = card;
      lbImg.src = img.getAttribute('src');
      lbImg.alt = img.getAttribute('alt');
      lbTitle.textContent = card.dataset.title;
      lbText.textContent = card.dataset.text;
      box.classList.add('open');
      box.setAttribute('aria-hidden', 'false');
      lbClose.focus();
    });
  });
  lbClose.addEventListener('click', closeBox);
  box.addEventListener('click', (e) => { if (e.target === box) { closeBox(); } });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') { return; }
    if (box.classList.contains('open')) { closeBox(); }
    setMenu(false);
  });

  // Footer: current year and back to top (guarded so a missing element can never break the script)
  const year = document.getElementById('year');
  if (year) { year.textContent = String(new Date().getFullYear()); }
  const topBtn = document.getElementById('top-btn');
  if (topBtn) {
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}());
