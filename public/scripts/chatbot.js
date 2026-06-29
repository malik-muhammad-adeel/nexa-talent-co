(function () {
  const GREETINGS = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'];

  const RESPONSES = [
    {
      keywords: ['what is nexa', 'who are you', 'about nexa', 'what do you do', 'tell me about', 'company'],
      answer:
        'Nexa Talent Co. is a growth operating partner for creators and coaches. We run the backend — sales, funnels, email marketing, offers, and operations — so you can stay focused on content. Our tagline: "We run the backend, you run the content."',
    },
    {
      keywords: ['pricing', 'price', 'cost', 'fee', 'how much', 'revenue share', 'percent', 'plan', 'tier'],
      answer:
        'We offer three revenue-share tiers with $0 upfront setup:\n\n• Starter — 30% revenue share (creators starting to monetize)\n• Growth — 25% revenue share, most popular (existing offers needing consistent sales ops)\n• Premium — 20% revenue share (established creators with multiple offers)\n\nWe only earn when you earn. See full details on our Pricing page.',
    },
    {
      keywords: ['service', 'what you handle', 'funnel', 'email', 'sales', 'operations', 'offer', 'backend'],
      answer:
        'We handle three core pillars:\n\n1. Sales & Offers — building/refining offers and running sales conversations\n2. Funnels & Email — landing pages, sequences, and follow-up systems\n3. Operations — onboarding, payments, scheduling, and client communication\n\nVisit our Services page for the full breakdown.',
    },
    {
      keywords: ['how it work', 'process', 'steps', 'audit', 'onboard', 'get started', 'start'],
      answer:
        'Our process is three steps:\n\n1. Free audit — we review your audience, offer, and funnel\n2. We build the system — offer, funnel, emails, and sales process around your content\n3. We run it monthly — manage sales and ops, report results, and take a cut only of revenue we generate\n\nBook a free audit anytime via the Contact page.',
    },
    {
      keywords: ['contact', 'email', 'reach', 'talk', 'book', 'dm', 'instagram', 'message'],
      answer:
        'You can reach us three ways:\n\n• Email: nexa.talent.co@gmail.com\n• Instagram DM: @nexa.talent.co\n• Contact form on our Contact page\n\nAll three work — pick whichever you prefer. We respond to serious partnership inquiries personally.',
    },
    {
      keywords: ['creator', 'coach', 'audience', 'influencer', 'fit', 'who is this for', 'partner'],
      answer:
        'We partner with creators and coaches who already have an audience (30K or 300K — size matters less than trust), sell or want to sell digital products, and prefer to stay the talent while someone else runs operations. We are selectively onboarding partners this quarter.',
    },
    {
      keywords: ['agency', 'different', 'lose control', 'brand', 'course', 'already have'],
      answer:
        'Unlike a typical agency, we work on a revenue-share model with $0 upfront — we are aligned with your results, not billable hours. You stay the face and voice of your brand; we run the backend systems. If you already have a course or offer, we build around what exists rather than starting from scratch.',
    },
    {
      keywords: ['domain', 'website', 'nexatalent'],
      answer: 'Our website is nexatalent.online. You are in the right place — feel free to explore About, Services, Pricing, and How We Work from the navigation above.',
    },
  ];

  const FALLBACK =
    'Great question. I can help with pricing, services, how we work, who we partner with, and how to get in touch. Try asking about our revenue-share model, or visit the Contact page to book a free audit with our team.';

  const WELCOME =
    "Hi — I'm the Nexa Talent assistant. Ask me about our services, pricing, process, or how to get started. How can I help?";

  let isOpen = false;
  let chatbotAbort = null;

  function normalize(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function findAnswer(input) {
    const query = normalize(input);
    if (!query) return null;

    if (GREETINGS.some((g) => query === g || query.startsWith(g + ' '))) {
      return "Hello! I'm here to answer questions about Nexa Talent Co. — pricing, services, our process, or how to reach us. What would you like to know?";
    }

    let best = null;
    let bestScore = 0;

    for (const item of RESPONSES) {
      let score = 0;
      for (const keyword of item.keywords) {
        if (query.includes(keyword)) score += keyword.split(' ').length + 1;
      }
      if (score > bestScore) {
        bestScore = score;
        best = item.answer;
      }
    }

    return bestScore > 0 ? best : FALLBACK;
  }

  function formatMessage(text) {
    return text.replace(/\n/g, '<br>');
  }

  function getElements() {
    const root = document.querySelector('[data-chatbot]');
    if (!root) return null;

    return {
      root,
      toggle: root.querySelector('[data-chatbot-toggle]'),
      panel: root.querySelector('[data-chatbot-panel]'),
      backdrop: document.querySelector('[data-chatbot-backdrop]'),
      messagesEl: root.querySelector('[data-chatbot-messages]'),
      form: root.querySelector('[data-chatbot-form]'),
      input: root.querySelector('[data-chatbot-input]'),
      promptsEl: root.querySelector('[data-chatbot-prompts]'),
    };
  }

  function appendMessage(messagesEl, text, role) {
    const bubble = document.createElement('div');
    bubble.className = 'chatbot-message chatbot-message--' + role;
    bubble.innerHTML = '<div class="chatbot-bubble">' + formatMessage(text) + '</div>';
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setOpen(open) {
    const els = getElements();
    if (!els || !els.panel || !els.toggle) return;

    isOpen = open;
    els.panel.hidden = !open;
    els.panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    els.panel.classList.toggle('is-open', open);
    els.toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('chatbot-open', open);

    if (els.backdrop) {
      els.backdrop.hidden = !open;
      els.backdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
    }

    if (open) {
      if (els.messagesEl && !els.messagesEl.children.length) {
        appendMessage(els.messagesEl, WELCOME, 'bot');
      }
      if (els.input) {
        window.setTimeout(() => els.input.focus(), 50);
      }
    }
  }

  function sendMessage(text) {
    const els = getElements();
    if (!els || !els.messagesEl || !els.input) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    appendMessage(els.messagesEl, trimmed, 'user');
    els.input.value = '';
    if (els.promptsEl) els.promptsEl.hidden = true;

    window.setTimeout(() => {
      appendMessage(els.messagesEl, findAnswer(trimmed), 'bot');
    }, 300);
  }

  function cleanupChatbot() {
    if (chatbotAbort) {
      chatbotAbort.abort();
      chatbotAbort = null;
    }
    isOpen = false;
    document.body.classList.remove('chatbot-open');
  }

  function bindChatbot() {
    cleanupChatbot();

    const els = getElements();
    if (!els || !els.root || !els.panel || !els.toggle || !els.form || !els.input) return;

    chatbotAbort = new AbortController();
    const { signal } = chatbotAbort;

    setOpen(false);

    els.root.addEventListener(
      'click',
      (e) => {
        if (e.target.closest('[data-chatbot-close]')) {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
          return;
        }

        if (e.target.closest('[data-chatbot-toggle]')) {
          e.preventDefault();
          setOpen(!isOpen);
          return;
        }

        const promptBtn = e.target.closest('.chatbot-prompts-list button');
        if (promptBtn) {
          e.preventDefault();
          sendMessage(promptBtn.textContent || '');
        }
      },
      { signal }
    );

    els.form.addEventListener(
      'submit',
      (e) => {
        e.preventDefault();
        sendMessage(els.input.value);
      },
      { signal }
    );

    if (els.backdrop) {
      els.backdrop.addEventListener('click', () => setOpen(false), { signal });
    }

    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && isOpen) setOpen(false);
      },
      { signal }
    );
  }

  document.addEventListener('astro:before-swap', cleanupChatbot);
  document.addEventListener('astro:page-load', bindChatbot);
  bindChatbot();
})();
