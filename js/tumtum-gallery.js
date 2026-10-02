/* Native gallery scrolling; no tracking, autoplay, dependencies or remote calls. */
(() => {
  const gallery = document.querySelector('.gallery');
  if (!gallery) return;
  const rails = [...gallery.querySelectorAll('.gallery-rail')];
  const previous = gallery.querySelector('[data-gallery-previous]');
  const next = gallery.querySelector('[data-gallery-next]');
  const position = gallery.querySelector('.gallery-position');
  const currentRail = () => rails.find(rail => rail.dataset.device === gallery.querySelector('input:checked').value);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const currentIndex = rail => {
    const card = rail.firstElementChild;
    const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap);
    return Math.min(rail.children.length - 1, Math.max(0, Math.round(rail.scrollLeft / step)));
  };
  function updateControls() {
    const rail = currentRail();
    const index = currentIndex(rail);
    position.textContent = `${String(index + 1).padStart(2, '0')} / ${String(rail.children.length).padStart(2, '0')}`;
    previous.disabled = rail.scrollLeft < 2;
    next.disabled = rail.scrollWidth - rail.clientWidth - rail.scrollLeft < 2;
    previous.setAttribute('aria-controls', rail.id);
    next.setAttribute('aria-controls', rail.id);
  }
  function move(direction) {
    const rail = currentRail();
    const step = rail.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap);
    rail.scrollBy({left:direction * step, behavior:reduced.matches ? 'instant' : 'smooth'});
  }
  gallery.querySelector('.gallery-controls').hidden = false;
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  rails.forEach(rail => rail.addEventListener('scroll', updateControls, {passive:true}));
  gallery.querySelectorAll('input').forEach(input => input.addEventListener('change', updateControls));
  window.addEventListener('resize', updateControls);
  updateControls();

})();
