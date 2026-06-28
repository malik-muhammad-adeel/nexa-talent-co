(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const COLORS = ['123,92,255', '182,168,255', '244,242,255'];

  function initField(wrapper) {
    const canvas = wrapper.querySelector('canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let frameId = null;
    let width = 0;
    let height = 0;

    const isMobile = () => window.innerWidth < 768;
    const particleCount = () => (isMobile() ? 32 : 55);
    const linkDistance = () => (isMobile() ? 90 : 130);

    function resize() {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      particles = [];
      for (let i = 0; i < particleCount(); i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.8,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: Math.random() * 0.35 + 0.25,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const maxDist = linkDistance();

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.015;

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

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
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

    resize();
    seed();

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) start();
        else stop();
      },
      { threshold: 0.05 }
    );
    observer.observe(wrapper);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        stop();
        resize();
        seed();
        if (wrapper.getBoundingClientRect().bottom > 0 && wrapper.getBoundingClientRect().top < window.innerHeight) {
          start();
        }
      }, 150);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (wrapper.getBoundingClientRect().top < window.innerHeight) start();
    });
  }

  document.querySelectorAll('[data-particle-field]').forEach(initField);
})();
