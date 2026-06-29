(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let revealObserver = null;
  let scrollHandler = null;

  function initReveal() {
    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }

    const revealEls = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
    if (!revealEls.length) return;

    if (reducedMotion) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    revealEls.forEach((el) => el.classList.remove('is-visible'));

    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  function initNavScroll() {
    const navInner = document.querySelector('.nav-inner');
    if (!navInner) return;

    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
    }

    scrollHandler = () => {
      navInner.classList.toggle('scrolled', window.scrollY > 24);
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    scrollHandler();
  }

  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const navCenter = document.querySelector('.nav-center');
    if (!toggle || !navCenter) return;

    toggle.replaceWith(toggle.cloneNode(true));
    const freshToggle = document.querySelector('.nav-toggle');

    freshToggle.addEventListener('click', () => {
      const open = navCenter.classList.toggle('is-open');
      freshToggle.classList.toggle('is-open', open);
      freshToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    navCenter.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navCenter.classList.remove('is-open');
        freshToggle.classList.remove('is-open');
        freshToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initActiveNav() {
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav-links a').forEach((link) => {
      link.classList.remove('is-active');
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      const linkPath = href.replace(/\/$/, '') || '/';
      if (linkPath === currentPath) {
        link.classList.add('is-active');
      }
    });
  }

  function initFaq() {
    document.querySelectorAll('.faq-question').forEach((btn) => {
      btn.replaceWith(btn.cloneNode(true));
    });

    document.querySelectorAll('.faq-question').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const wasOpen = item.classList.contains('is-open');
        document.querySelectorAll('.faq-item.is-open').forEach((el) => el.classList.remove('is-open'));
        if (!wasOpen) item.classList.add('is-open');
      });
    });
  }

  function initContactForm() {
    const form = document.querySelector('.contact-form form');
    if (!form) return;

    form.replaceWith(form.cloneNode(true));
    const freshForm = document.querySelector('.contact-form form');

    freshForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(freshForm);
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

  function initSite() {
    initReveal();
    initNavScroll();
    initMobileNav();
    initActiveNav();
    initFaq();
    initContactForm();
  }

  initSite();
  document.addEventListener('astro:page-load', initSite);
})();
