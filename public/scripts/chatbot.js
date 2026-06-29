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

  const QUICK_PROMPTS = [
    'What does Nexa Talent do?',
    'How does pricing work?',
    'How do I get started?',
  ];

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

  function initChatbot() {
    const root = document.querySelector('[data-chatbot]');
    if (!root || root.dataset.initialized === 'true') return;
    root.dataset.initialized = 'true';

    const toggle = root.querySelector('[data-chatbot-toggle]');
    const panel = root.querySelector('[data-chatbot-panel]');
    const closeBtn = root.querySelector('[data-chatbot-close]');
    const messagesEl = root.querySelector('[data-chatbot-messages]');
    const form = root.querySelector('[data-chatbot-form]');
    const input = root.querySelector('[data-chatbot-input]');
    const promptsEl = root.querySelector('[data-chatbot-prompts]');

    if (!toggle || !panel || !messagesEl || !form || !input) return;

    let isOpen = false;

    function appendMessage(text, role) {
      const bubble = document.createElement('div');
      bubble.className = 'chatbot-message chatbot-message--' + role;
      bubble.innerHTML = '<div class="chatbot-bubble">' + formatMessage(text) + '</div>';
      messagesEl.appendChild(bubble);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function setOpen(open) {
      isOpen = open;
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        if (!messagesEl.children.length) appendMessage(WELCOME, 'bot');
        input.focus();
      }
    }

    function sendMessage(text) {
      const trimmed = text.trim();
      if (!trimmed) return;
      appendMessage(trimmed, 'user');
      input.value = '';
      if (promptsEl) promptsEl.hidden = true;

      window.setTimeout(() => {
        appendMessage(findAnswer(trimmed), 'bot');
      }, 350);
    }

    toggle.addEventListener('click', () => setOpen(!isOpen));
    if (closeBtn) closeBtn.addEventListener('click', () => setOpen(false));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      sendMessage(input.value);
    });

    if (promptsEl) {
      promptsEl.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => sendMessage(btn.textContent || ''));
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) setOpen(false);
    });
  }

  initChatbot();
  document.addEventListener('astro:page-load', initChatbot);
})();
