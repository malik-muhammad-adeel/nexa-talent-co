(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll-triggered reveal
  const revealEls = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
  if (revealEls.length) {
    if (reducedMotion) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );
      revealEls.forEach((el) => observer.observe(el));
    }
  }

  // Nav scroll state
  const navInner = document.querySelector('.nav-inner');
  const onScroll = () => {
    if (!navInner) return;
    navInner.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu toggle
  const toggle = document.querySelector('.nav-toggle');
  const navCenter = document.querySelector('.nav-center');
  if (toggle && navCenter) {
    toggle.addEventListener('click', () => {
      const open = navCenter.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    navCenter.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navCenter.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active nav link based on current page
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    const linkPath = href.replace(/\/$/, '') || '/';
    if (linkPath === currentPath) {
      link.classList.add('is-active');
    }
  });

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach((el) => el.classList.remove('is-open'));
      if (!wasOpen) item.classList.add('is-open');
    });
  });

  // Contact form — mailto fallback
  const form = document.querySelector('.contact-form form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get('name') || '';
      const email = data.get('email') || '';
      const instagram = data.get('instagram') || '';
      const message = data.get('message') || '';
      const subject = encodeURIComponent('Nexa Talent Co. — Contact from ' + name);
      const body = encodeURIComponent(
        'Name: ' + name + '\nEmail: ' + email + '\nInstagram: ' + instagram + '\n\n' + message
      );
      window.location.href = 'mailto:nexa.talent.co@gmail.com?subject=' + subject + '&body=' + body;
    });
  }
})();
