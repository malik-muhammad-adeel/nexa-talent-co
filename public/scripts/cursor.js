(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ARROW =
    '<svg class="mesh-cursor-svg" viewBox="0 0 32 32" aria-hidden="true">' +
    '<polygon points="4,4 4,26 12,18 16,28 20,26 16,16 26,16" fill="rgba(123,92,255,0.22)" stroke="rgba(182,168,255,0.55)" stroke-width="0.6"/>' +
    '<polygon points="4,4 12,18 16,16 26,16" fill="rgba(123,92,255,0.12)" stroke="rgba(123,92,255,0.35)" stroke-width="0.5"/>' +
    '<line x1="4" y1="4" x2="12" y2="18" stroke="rgba(182,168,255,0.7)" stroke-width="0.7"/>' +
    '<line x1="4" y1="4" x2="4" y2="26" stroke="rgba(182,168,255,0.7)" stroke-width="0.7"/>' +
    '<line x1="4" y1="26" x2="12" y2="18" stroke="rgba(182,168,255,0.55)" stroke-width="0.6"/>' +
    '<line x1="12" y1="18" x2="16" y2="16" stroke="rgba(123,92,255,0.6)" stroke-width="0.6"/>' +
    '<line x1="16" y1="16" x2="26" y2="16" stroke="rgba(123,92,255,0.6)" stroke-width="0.6"/>' +
    '<line x1="16" y1="16" x2="16" y2="28" stroke="rgba(123,92,255,0.45)" stroke-width="0.5"/>' +
    '<line x1="16" y1="28" x2="20" y2="26" stroke="rgba(123,92,255,0.45)" stroke-width="0.5"/>' +
    '<circle cx="4" cy="4" r="1.6" fill="#F4F2FF"/><circle cx="4" cy="26" r="1.3" fill="#B6A8FF"/>' +
    '<circle cx="12" cy="18" r="1.4" fill="#F4F2FF"/><circle cx="16" cy="16" r="1.5" fill="#7B5CFF"/>' +
    '<circle cx="26" cy="16" r="1.3" fill="#B6A8FF"/><circle cx="16" cy="28" r="1.2" fill="#F4F2FF"/>' +
    '<circle cx="20" cy="26" r="1.1" fill="#B6A8FF"/></svg>';

  const POINTER =
    '<svg class="mesh-cursor-svg" viewBox="0 0 32 32" aria-hidden="true">' +
    '<polygon points="12,4 12,14 8,14 8,24 14,24 14,18 18,18 18,28 22,28 22,14 26,14 20,4" fill="rgba(123,92,255,0.2)" stroke="rgba(182,168,255,0.5)" stroke-width="0.55"/>' +
    '<polygon points="12,4 20,4 26,14 22,14 18,14 12,14" fill="rgba(123,92,255,0.14)" stroke="rgba(123,92,255,0.35)" stroke-width="0.45"/>' +
    '<line x1="12" y1="4" x2="20" y2="4" stroke="rgba(182,168,255,0.65)" stroke-width="0.65"/>' +
    '<line x1="20" y1="4" x2="26" y2="14" stroke="rgba(182,168,255,0.65)" stroke-width="0.65"/>' +
    '<line x1="12" y1="4" x2="12" y2="14" stroke="rgba(182,168,255,0.55)" stroke-width="0.6"/>' +
    '<line x1="12" y1="14" x2="8" y2="14" stroke="rgba(123,92,255,0.5)" stroke-width="0.55"/>' +
    '<line x1="8" y1="14" x2="8" y2="24" stroke="rgba(123,92,255,0.5)" stroke-width="0.55"/>' +
    '<line x1="8" y1="24" x2="14" y2="24" stroke="rgba(123,92,255,0.45)" stroke-width="0.5"/>' +
    '<line x1="14" y1="24" x2="14" y2="18" stroke="rgba(123,92,255,0.45)" stroke-width="0.5"/>' +
    '<line x1="14" y1="18" x2="18" y2="18" stroke="rgba(123,92,255,0.45)" stroke-width="0.5"/>' +
    '<line x1="18" y1="18" x2="18" y2="28" stroke="rgba(123,92,255,0.45)" stroke-width="0.5"/>' +
    '<line x1="18" y1="28" x2="22" y2="28" stroke="rgba(123,92,255,0.45)" stroke-width="0.5"/>' +
    '<circle cx="12" cy="4" r="1.3" fill="#F4F2FF"/><circle cx="20" cy="4" r="1.2" fill="#B6A8FF"/>' +
    '<circle cx="26" cy="14" r="1.3" fill="#F4F2FF"/><circle cx="12" cy="14" r="1.2" fill="#7B5CFF"/>' +
    '<circle cx="8" cy="14" r="1.1" fill="#B6A8FF"/><circle cx="8" cy="24" r="1.2" fill="#F4F2FF"/>' +
    '<circle cx="14" cy="24" r="1.1" fill="#B6A8FF"/><circle cx="18" cy="28" r="1.3" fill="#7B5CFF"/></svg>';

  const HOVER_SELECTOR =
    'a, button, input, textarea, select, label, summary, [role="button"], .btn-primary, .btn-secondary, .nav-cta, .chatbot-toggle, .chatbot-send, .faq-question';

  let root = null;
  let inner = null;
  let visible = false;
  let pointer = false;
  let x = 0;
  let y = 0;
  let tx = 0;
  let ty = 0;
  let rafId = null;

  function render() {
    const dx = tx - x;
    const dy = ty - y;
    x += dx * 0.55;
    y += dy * 0.55;
    inner.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    rafId = requestAnimationFrame(render);
  }

  function setPointer(isPointer) {
    if (pointer === isPointer) return;
    pointer = isPointer;
    inner.innerHTML = isPointer ? POINTER : ARROW;
    inner.classList.toggle('is-pointer', isPointer);
  }

  function onMove(e) {
    tx = e.clientX;
    ty = e.clientY;
    if (!visible) {
      visible = true;
      root.classList.add('is-visible');
      x = tx;
      y = ty;
    }
    const target = e.target.closest(HOVER_SELECTOR);
    setPointer(!!target && !target.disabled);
  }

  function onLeave() {
    visible = false;
    root.classList.remove('is-visible');
  }

  function initCursor() {
    if (document.body.dataset.cursorReady === 'true') return;
    document.body.dataset.cursorReady = 'true';
    document.body.classList.add('has-mesh-cursor');

    root = document.createElement('div');
    root.className = 'mesh-cursor';
    root.setAttribute('aria-hidden', 'true');
    inner = document.createElement('div');
    inner.className = 'mesh-cursor-inner';
    inner.innerHTML = ARROW;
    root.appendChild(inner);
    document.body.appendChild(root);

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    rafId = requestAnimationFrame(render);
  }

  initCursor();
})();
