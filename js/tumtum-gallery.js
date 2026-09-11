/* Native scrolling and <dialog>; no tracking, autoplay, dependencies or remote calls. */
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

  const dialog = document.querySelector('.gallery-dialog');
  // All thumbnails remain ordinary image links if dialog support is unavailable.
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('.dialog-image');
  const heading = dialog.querySelector('#gallery-dialog-title');
  const caption = dialog.querySelector('#gallery-dialog-caption');
  const original = dialog.querySelector('.dialog-original');
  const back = dialog.querySelector('[data-dialog-previous]');
  const forward = dialog.querySelector('[data-dialog-next]');
  let links = [], index = 0, opener;
  function showImage() {
    const link = links[index];
    const thumbnail = link.querySelector('img');
    image.src = link.href;
    image.alt = thumbnail.alt;
    image.width = thumbnail.width;
    image.height = thumbnail.height;
    heading.textContent = link.dataset.title;
    caption.textContent = `${link.dataset.caption} ${link.dataset.description}`;
    original.href = link.href;
    back.disabled = index === 0;
    forward.disabled = index === links.length - 1;
    dialog.scrollTop = 0;
  }
  function moveImage(direction) {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    index = target;
    showImage();
  }
  gallery.querySelectorAll('[data-gallery-image]').forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    links = [...link.closest('.gallery-rail').querySelectorAll('[data-gallery-image]')];
    index = links.indexOf(link);
    showImage();
    dialog.showModal();
  }));
  back.addEventListener('click', () => moveImage(-1));
  forward.addEventListener('click', () => moveImage(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveImage(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    opener?.focus({preventScroll:true});
  });
})();
