(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let revealObserver = null;
  let scrollHandler = null;
  let siteAbort = null;

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

  function closeMobileNav() {
    const navCenter = document.querySelector('.nav-center');
    const toggle = document.querySelector('.nav-toggle');
    if (navCenter) navCenter.classList.remove('is-open');
    if (toggle) {
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  }

  function initMobileNav(signal) {
    document.addEventListener(
      'click',
      (e) => {
        const toggle = e.target.closest('.nav-toggle');
        if (toggle) {
          const navCenter = document.querySelector('.nav-center');
          if (!navCenter) return;
          const open = navCenter.classList.toggle('is-open');
          toggle.classList.toggle('is-open', open);
          toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
          return;
        }

        const navLink = e.target.closest('.nav-center a[href]');
        if (navLink) {
          closeMobileNav();
        }
      },
      { signal }
    );
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
    document.querySelectorAll('.faq-item:not([data-faq-bound])').forEach((item) => {
      const btn = item.querySelector('.faq-question');
      if (!btn) return;
      item.dataset.faqBound = 'true';
      btn.addEventListener('click', () => {
        const wasOpen = item.classList.contains('is-open');
        document.querySelectorAll('.faq-item.is-open').forEach((el) => el.classList.remove('is-open'));
        if (!wasOpen) item.classList.add('is-open');
      });
    });
  }

  function initContactForm() {
    const form = document.querySelector('.contact-form form:not([data-form-bound])');
    if (!form) return;

    form.dataset.formBound = 'true';
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

  function cleanupSite() {
    if (siteAbort) {
      siteAbort.abort();
      siteAbort = null;
    }

    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }

    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
      scrollHandler = null;
    }
  }

  function initSite() {
    cleanupSite();
    siteAbort = new AbortController();

    closeMobileNav();
    initReveal();
    initNavScroll();
    initMobileNav(siteAbort.signal);
    initActiveNav();
    initFaq();
    initContactForm();
  }

  document.addEventListener('astro:before-swap', cleanupSite);
  document.addEventListener('astro:page-load', initSite);
  initSite();
})();
