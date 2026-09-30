(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const lab = document.querySelector('#hero-lab');
  const tabs = [...document.querySelectorAll('[data-preview]')];
  const panels = [...document.querySelectorAll('.stage-panel')];
  function selectPreview(index, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    lab.dataset.product = tabs[index].dataset.preview;
    lab.querySelector('[data-stage-number]').textContent = `0${index + 1} / 04`;
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectPreview(index));
    tab.addEventListener('keydown', event => {
      const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
      if (next !== undefined) { event.preventDefault(); selectPreview(next, true); }
    });
  });
  lab.addEventListener('pointermove', event => {
    if (reduced.matches || !finePointer.matches) return;
    const rect = lab.getBoundingClientRect();
    lab.style.setProperty('--tilt-x', `${((event.clientY - rect.top) / rect.height - .5) * -5}deg`);
    lab.style.setProperty('--tilt-y', `${((event.clientX - rect.left) / rect.width - .5) * 6}deg`);
  });
  const resetTilt = () => { lab.style.setProperty('--tilt-x', '0deg'); lab.style.setProperty('--tilt-y', '0deg'); };
  lab.addEventListener('pointerleave', resetTilt);
  reduced.addEventListener('change', resetTilt);

  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.product-card')];
  const search = document.querySelector('#catalog-search');
  let activeFilter = 'all';
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function filterCatalog() {
    const query = normalize(search.value.trim());
    cards.forEach(card => {
      const matchesCategory = activeFilter === 'all' || activeFilter === card.dataset.category || activeFilter === 'soon' && card.dataset.soon === 'true' || activeFilter === 'released' && card.dataset.status === 'released';
      card.hidden = !(matchesCategory && normalize(card.dataset.search).includes(query));
    });
    const status = document.querySelector('#catalog-status');
    status.textContent = `${status.dataset.label}: ${cards.filter(card => !card.hidden).length}`;
  }
  filters.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filterCatalog();
  }));
  search.addEventListener('input', filterCatalog);
  cards.forEach(card => card.addEventListener('pointermove', event => {
    if (reduced.matches || !finePointer.matches) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
    card.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
  }));

  // No calendar access, sound or external call: this is a local, accelerated demo.
  const start = document.querySelector('#demo-start');
  const demo = document.querySelector('#demo-window');
  const overlay = document.querySelector('#meeting-overlay');
  const success = document.querySelector('#demo-success');
  const count = document.querySelector('#demo-count');
  const status = document.querySelector('#demo-status');
  const steps = [...document.querySelectorAll('[data-step]')];
  let timeout, interval, run = 0;
  function clearTimers() { clearTimeout(timeout); clearInterval(interval); }
  function step(index) { steps.forEach((item, i) => item.classList.toggle('is-active', i === index)); }
  function resetDemo() {
    run += 1; clearTimers();
    overlay.hidden = true; success.hidden = true;
    demo.classList.remove('is-knocking', 'is-expired');
    start.textContent = start.dataset.start + ' ↗'; start.disabled = false;
    step(0); count.textContent = '00:08'; status.textContent = '';
  }
  start.addEventListener('click', () => {
    resetDemo();
    const currentRun = run;
    start.textContent = start.dataset.reset + ' ↗';
    void demo.offsetWidth;
    demo.classList.add('is-knocking');
    step(1); status.textContent = status.dataset.knock;
    timeout = setTimeout(() => {
      if (run !== currentRun) return;
      demo.classList.remove('is-knocking'); overlay.hidden = false;
      status.textContent = status.dataset.ready;
      const deadline = Date.now() + 8000;
      interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        count.textContent = `00:${String(remaining).padStart(2, '0')}`;
        if (remaining === 0) { clearInterval(interval); demo.classList.add('is-expired'); }
      }, 250);
    }, reduced.matches ? 0 : 760);
  });
  document.querySelector('#demo-join').addEventListener('click', () => {
    clearTimers(); overlay.hidden = true; success.hidden = false; step(2);
    status.textContent = status.dataset.success;
    start.focus({ preventScroll: true });
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetDemo(); });
  window.addEventListener('pagehide', clearTimers);

  if ('IntersectionObserver' in window) {
    const reveals = [...document.querySelectorAll('[data-reveal]')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: .08 });
    document.body.classList.add('motion-ready');
    reveals.forEach(item => observer.observe(item));
    const demoObserver = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) resetDemo();
    });
    demoObserver.observe(demo);
  }
  const languages = document.querySelector('.lab-languages');
  document.addEventListener('click', event => { if (!languages.contains(event.target)) languages.open = false; });
  languages.addEventListener('keydown', event => { if (event.key === 'Escape') { languages.open = false; languages.querySelector('summary').focus(); } });
})();
