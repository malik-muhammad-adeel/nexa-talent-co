(function () {
  const DOT_RGB = '182, 168, 255';
  const LINE_RGB = '123, 92, 255';
  const DOT_OPACITY = 0.2;
  const LINE_OPACITY = 0.1;
  const CONNECT_DIST = 130;

  let canvas = null;
  let ctx = null;
  let dots = [];
  let width = 0;
  let height = 0;
  let animationId = null;
  let resizeTimer = null;
  let visibilityBound = false;
  let resizeBound = false;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function dotCount() {
    const w = window.innerWidth;
    if (w < 480) return 22;
    if (w < 768) return 32;
    if (w < 1200) return 42;
    return 48;
  }

  function initDots() {
    const count = dotCount();
    dots = [];
    for (let i = 0; i < count; i += 1) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1 + 1.2,
      });
    }
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    initDots();
    drawFrame();
  }

  function drawFrame() {
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (!reducedMotion) {
      dots.forEach((dot) => {
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x <= 0 || dot.x >= width) dot.vx *= -1;
        if (dot.y <= 0 || dot.y >= height) dot.vy *= -1;
      });
    }

    for (let i = 0; i < dots.length; i += 1) {
      for (let j = i + 1; j < dots.length; j += 1) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < CONNECT_DIST) {
          const alpha = LINE_OPACITY * (1 - dist / CONNECT_DIST);
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(' + LINE_RGB + ', ' + alpha + ')';
          ctx.lineWidth = 1;
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
        }
      }
    }

    dots.forEach((dot) => {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(' + DOT_RGB + ', ' + DOT_OPACITY + ')';
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function loop() {
    drawFrame();
    animationId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (reducedMotion || animationId || !canvas) return;
    animationId = requestAnimationFrame(loop);
  }

  function stopLoop() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function onVisibilityChange() {
    if (document.hidden) {
      stopLoop();
    } else {
      startLoop();
    }
  }

  function onResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resizeCanvas, 150);
  }

  function bindGlobalListeners() {
    if (!visibilityBound) {
      document.addEventListener('visibilitychange', onVisibilityChange);
      visibilityBound = true;
    }

    if (!resizeBound) {
      window.addEventListener('resize', onResize, { passive: true });
      resizeBound = true;
    }
  }

  function cleanup() {
    stopLoop();
    window.clearTimeout(resizeTimer);
    resizeTimer = null;
    canvas = null;
    ctx = null;
    dots = [];
  }

  function initNetworkBackground() {
    stopLoop();

    canvas = document.getElementById('network-bg-canvas');
    if (!canvas) {
      ctx = null;
      return;
    }

    ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    bindGlobalListeners();
    resizeCanvas();
    startLoop();
  }

  document.addEventListener('astro:before-swap', cleanup);
  document.addEventListener('astro:page-load', initNetworkBackground);
  initNetworkBackground();
})();
