(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const COLORS = ['123,92,255', '182,168,255', '244,242,255'];
  const activeFields = new WeakMap();

  function initField(wrapper) {
    if (activeFields.has(wrapper)) return;

    const canvas = wrapper.querySelector('canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let particles = [];
    let frameId = null;
    let width = 0;
    let height = 0;
    let observer = null;

    const isMobile = () => window.innerWidth < 768;
    const particleCount = () => (isMobile() ? 36 : 62);
    const linkDistance = () => (isMobile() ? 95 : 135);
    const speed = () => (isMobile() ? 0.42 : 0.48);

    function resize() {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      particles = [];
      const count = particleCount();
      const s = speed();
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * s,
          vy: (Math.random() - 0.5) * s,
          r: Math.random() * 1.6 + 0.8,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: Math.random() * 0.35 + 0.25,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function drawLinks(maxDist) {
      const cell = maxDist;
      const buckets = new Map();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const key = Math.floor(p.x / cell) + ':' + Math.floor(p.y / cell);
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(i);
      }

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const cx = Math.floor(a.x / cell);
        const cy = Math.floor(a.y / cell);

        for (let ox = -1; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            const list = buckets.get(cx + ox + ':' + (cy + oy));
            if (!list) continue;
            for (let k = 0; k < list.length; k++) {
              const j = list[k];
              if (j <= i) continue;
              const b = particles[j];
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const dist = Math.hypot(dx, dy);
              if (dist < maxDist) {
                const opacity = (1 - dist / maxDist) * 0.14;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = 'rgba(123, 92, 255, ' + opacity.toFixed(3) + ')';
                ctx.lineWidth = 0.8;
                ctx.stroke();
              }
            }
          }
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const maxDist = linkDistance();

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.02;

        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;

        const glow = p.alpha + Math.sin(p.phase) * 0.12;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color + ',' + (glow * 0.12).toFixed(3) + ')';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color + ',' + Math.max(0.18, glow).toFixed(3) + ')';
        ctx.fill();
      }

      drawLinks(maxDist);
      frameId = requestAnimationFrame(draw);
    }

    function start() {
      if (frameId) return;
      resize();
      if (!particles.length) seed();
      draw();
    }

    function stop() {
      if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    }

    function onResize() {
      stop();
      resize();
      seed();
      const rect = wrapper.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) start();
    }

    function onVisibility() {
      if (document.hidden) stop();
      else if (wrapper.getBoundingClientRect().top < window.innerHeight) start();
    }

    resize();
    seed();

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) start();
        else stop();
      },
      { threshold: 0.05, rootMargin: '80px 0px' }
    );
    observer.observe(wrapper);

    let resizeTimer;
    const resizeHandler = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(onResize, 200);
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', resizeHandler, { passive: true });

    activeFields.set(wrapper, {
      destroy() {
        stop();
        observer.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('resize', resizeHandler);
        activeFields.delete(wrapper);
      },
    });
  }

  function initParticles() {
    document.querySelectorAll('[data-particle-field]').forEach((wrapper) => {
      if (!activeFields.has(wrapper)) initField(wrapper);
    });
  }

  initParticles();
  document.addEventListener('astro:page-load', initParticles);
})();
