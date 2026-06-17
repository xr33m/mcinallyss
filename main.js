// Dark mode toggle
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
if (themeIcon) themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    if (themeIcon) themeIcon.textContent = next === 'dark' ? '☀️' : '🌙';
  });
}

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');

if (navToggle && mobileNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// Reviews slider
(function () {
  const track = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');
  const dotsContainer = document.getElementById('reviewsDots');
  if (!track || !prevBtn || !nextBtn) return;

  const cards = Array.from(track.children);
  let current = 0;
  let autoTimer = null;

  function visibleCount() {
    const w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 640) return 2;
    return 1;
  }

  function maxIndex() {
    return Math.max(0, cards.length - visibleCount());
  }

  function cardWidthPct() {
    return 100 / visibleCount();
  }

  function getGapPx() {
    return parseFloat(getComputedStyle(track).gap) || 20;
  }

  function goTo(index) {
    const max = maxIndex();
    current = Math.max(0, Math.min(index, max));

    // Use actual rendered card width + gap for precise alignment
    const gap = getGapPx();
    const cardWidth = cards[0] ? cards[0].offsetWidth : 0;
    const offsetPx = current * (cardWidth + gap);
    track.style.transform = `translateX(-${offsetPx}px)`;

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= max;
    updateDots();
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = 'reviews-dot' + (i === 0 ? ' is-active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Go to review ${i + 1}`);
      btn.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsContainer.appendChild(btn);
    }
  }

  function updateDots() {
    Array.from(dotsContainer.children).forEach((dot, i) => {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function startAuto() {
    autoTimer = setInterval(() => {
      goTo(current >= maxIndex() ? 0 : current + 1);
    }, 5000);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { goTo(diff > 0 ? current + 1 : current - 1); resetAuto(); }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { buildDots(); goTo(Math.min(current, maxIndex())); }, 100);
  });

  buildDots();
  goTo(0);
  startAuto();
})();

// Review popup — shown once per session after 30 seconds
(function () {
  if (sessionStorage.getItem('reviewPopupShown')) return;

  const reviews = [
    { name: 'Sarah C.', initials: 'SC', text: 'Ryan came out the same day I called — within a couple of hours. Fixed a burst pipe under the kitchen sink quickly and cleanly. Really fair price and great communication throughout. Would highly recommend.' },
    { name: 'James M.', initials: 'JM', text: 'Called at 8pm with no hot water and Ryan was at my door by 9:30pm — sorted within the hour. As a landlord I need tradespeople I can trust. Ryan is now my go-to plumber for all my Edinburgh properties.' },
    { name: 'Laura T.', initials: 'LT', text: 'Ryan fitted our new bathroom from scratch and the result is fantastic. Tidy, professional and kept us informed at every stage. Came in on budget and on time. We\'ve already recommended McInally\'s to three friends.' },
    { name: 'Mark D.', initials: 'MD', text: 'Used McInally\'s for a blocked drain that two other plumbers couldn\'t sort. Ryan diagnosed the problem immediately and had it cleared within 45 minutes. Honest, no-nonsense service at a fair price. Brilliant.' },
    { name: 'Fiona R.', initials: 'FR', text: 'Our radiators had been making noise for months. Ryan came out, diagnosed a cold spot issue and sorted it quickly. He also spotted a small leak we hadn\'t noticed and fixed that too. Couldn\'t ask for more.' },
  ];

  const review = reviews[Math.floor(Math.random() * reviews.length)];
  const popup = document.getElementById('reviewPopup');
  if (!popup) return;

  document.getElementById('reviewPopupName').textContent = review.name;
  document.getElementById('reviewPopupAvatar').textContent = review.initials;
  document.getElementById('reviewPopupText').textContent = review.text;

  function dismiss() {
    popup.classList.remove('is-visible');
    popup.addEventListener('transitionend', () => popup.hidden = true, { once: true });
    sessionStorage.setItem('reviewPopupShown', '1');
  }

  document.getElementById('reviewPopupClose').addEventListener('click', dismiss);

  setTimeout(() => {
    popup.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => popup.classList.add('is-visible')));
    sessionStorage.setItem('reviewPopupShown', '1');
    setTimeout(dismiss, 8000);
  }, 30000);
})();


// Google Reviews Carousel (about page)
(function () {
  const track = document.getElementById('greviewsTrack');
  const prevBtn = document.getElementById('greviewPrev');
  const nextBtn = document.getElementById('greviewNext');
  const dots = document.querySelectorAll('.about-greview-dot');
  if (!track) return;

  let current = 0;
  const total = track.children.length;

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle('about-greview-dot--active', i === current);
      d.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
  dots.forEach((d) => d.addEventListener('click', () => goTo(Number(d.dataset.index))));

  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  });
})();

// Scroll animations
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ANIM_SELECTORS = [
    // Section headings
    '.section-label',
    '.section-heading',
    '.section-sub',
    // Individual animate targets
    '[data-anim]',
    // Stagger grids — mark them, observer handles children
    '[data-anim-stagger]',
    // Common content blocks
    '.sp-intro-text',
    '.sp-intro-stats',
    '.sp-process-steps',
    '.cta-banner-content',
    '.about-intro-content',
    '.about-values-grid',
    '.contact-grid',
  ];

  // Auto-tag elements that match common patterns but aren't already tagged
  function autoTag() {
    // Section headings — fade up
    document.querySelectorAll('.section-label:not([data-anim]):not([data-anim-stagger])').forEach(el => {
      el.setAttribute('data-anim', 'fade-up');
    });
    document.querySelectorAll('.section-heading:not([data-anim]):not([data-anim-stagger])').forEach(el => {
      el.setAttribute('data-anim', 'fade-up');
    });
    document.querySelectorAll('.section-sub:not([data-anim]):not([data-anim-stagger])').forEach(el => {
      el.setAttribute('data-anim', 'fade-up');
    });

    // Service cards grid, problems grid, why-us grid
    document.querySelectorAll('.services-grid:not([data-anim-stagger]), .sp-problems-grid:not([data-anim-stagger]), .sp-why-grid:not([data-anim-stagger]), .sp-checklist:not([data-anim-stagger])').forEach(el => {
      el.setAttribute('data-anim-stagger', '');
    });

    // Process steps
    document.querySelectorAll('.sp-process-steps:not([data-anim-stagger])').forEach(el => {
      el.setAttribute('data-anim-stagger', '');
    });

    // Review cards inside slider — stagger the track children
    document.querySelectorAll('.reviews-track:not([data-anim-stagger])').forEach(el => {
      el.setAttribute('data-anim-stagger', '');
    });

    // CTA banner content
    document.querySelectorAll('.cta-banner-content:not([data-anim])').forEach(el => {
      el.setAttribute('data-anim', 'scale-in');
    });

    // Intro split — left fade-left, right fade-right
    document.querySelectorAll('.sp-intro-text:not([data-anim])').forEach(el => {
      el.setAttribute('data-anim', 'fade-left');
    });
    document.querySelectorAll('.sp-intro-stats:not([data-anim])').forEach(el => {
      el.setAttribute('data-anim', 'fade-right');
    });

    // FAQ items
    document.querySelectorAll('.faq-item:not([data-anim])').forEach((el, i) => {
      el.setAttribute('data-anim', 'fade-up');
      el.style.transitionDelay = `${i * 0.06}s`;
    });

    // Areas section
    document.querySelectorAll('.sp-areas-map:not([data-anim])').forEach(el => {
      el.setAttribute('data-anim', 'fade-right');
    });
    document.querySelectorAll('.sp-areas-list:not([data-anim])').forEach(el => {
      el.setAttribute('data-anim', 'fade-left');
    });

    // Hero trust items
    document.querySelectorAll('.sp-hero-trust:not([data-anim-stagger])').forEach(el => {
      el.setAttribute('data-anim-stagger', '');
    });

    // Home page feature cards
    document.querySelectorAll('.home-features-grid:not([data-anim-stagger]), .home-stats-grid:not([data-anim-stagger])').forEach(el => {
      el.setAttribute('data-anim-stagger', '');
    });

    // About page
    document.querySelectorAll('.about-values-grid:not([data-anim-stagger])').forEach(el => {
      el.setAttribute('data-anim-stagger', '');
    });
  }

  autoTag();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-anim], [data-anim-stagger]').forEach(el => observer.observe(el));
})();

// FAQ accordion
document.querySelectorAll('.faq-question').forEach((btn) => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.faq-question').forEach((b) => {
      b.setAttribute('aria-expanded', 'false');
      const a = b.nextElementSibling;
      if (a) a.classList.remove('is-open');
    });

    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      if (answer) answer.classList.add('is-open');
    }
  });
});

// Gallery carousel popup
(function () {
  const modal   = document.getElementById('galleryLightbox');
  if (!modal) return;

  const backdrop  = document.getElementById('lightboxBackdrop');
  const closeBtn  = document.getElementById('lightboxClose');
  const openBtn   = document.getElementById('galleryOpenBtn');
  const prevBtn   = document.getElementById('lightboxPrev');
  const nextBtn   = document.getElementById('lightboxNext');
  const lbImg     = document.getElementById('lightboxImg');
  const lbCounter = document.getElementById('lightboxCounter');
  const lbDots    = document.getElementById('lightboxDots');

  const thumbs  = Array.from(document.querySelectorAll('.ow-thumb img'));
  const images  = thumbs.map(img => ({ src: img.src, alt: img.alt }));
  let current   = 0;

  function buildDots() {
    lbDots.innerHTML = '';
    images.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'ow-carousel-dot';
      d.setAttribute('aria-label', `Go to image ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      lbDots.appendChild(d);
    });
  }

  function goTo(index) {
    current = (index + images.length) % images.length;
    lbImg.src = images[current].src;
    lbImg.alt = images[current].alt;
    lbCounter.textContent = `${current + 1} / ${images.length}`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === images.length - 1;
    Array.from(lbDots.children).forEach((d, i) => d.classList.toggle('is-active', i === current));
  }

  function openAt(index) {
    buildDots();
    goTo(index);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('is-open'));
    closeBtn.focus();
  }

  function close() {
    modal.classList.remove('is-open');
    modal.addEventListener('transitionend', () => {
      modal.hidden = true;
      document.body.style.overflow = '';
    }, { once: true });
  }

  if (openBtn) openBtn.addEventListener('click', () => openAt(0));
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  let touchStartX = 0;
  modal.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  modal.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  });
})();



// Contact form — Formspree submission
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = document.getElementById('contactFormSubmit');
  const errorBox = document.getElementById('contactFormError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const originalLabel = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    errorBox.hidden = true;

    try {
      const res = await fetch('https://formspree.io/f/xpqeroav', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });

      if (res.ok) {
        window.location.href = 'thank-you.html';
      } else {
        throw new Error('non-ok response');
      }
    } catch {
      errorBox.hidden = false;
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalLabel;
    }
  });
})();


// ===========================================
//  CHATBOT WIDGET — lead capture flow
// ===========================================
(function () {
  // Inject widget HTML
  const widget = document.createElement('div');
  widget.id = 'chatWidget';
  widget.className = 'cw-widget';
  widget.setAttribute('role', 'complementary');
  widget.setAttribute('aria-label', 'Chat with McInally\'s Plumbing');
  widget.innerHTML = `
    <div class="cw-panel" id="cwPanel" role="dialog" aria-modal="true" aria-label="Get a quick quote" hidden>
      <div class="cw-panel-head">
        <div class="cw-brand">
          <div class="cw-logo" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <div>
            <div class="cw-brand-name">McInally's Plumbing</div>
            <div class="cw-brand-status"><span class="cw-online-dot"></span>Typically replies within minutes</div>
          </div>
        </div>
        <button class="cw-close-btn" id="cwClose" aria-label="Close chat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="cw-messages" id="cwMessages" aria-live="polite" aria-atomic="false"></div>
      <div class="cw-options" id="cwOptions"></div>
      <form class="cw-composer" id="cwComposer" autocomplete="off" hidden>
        <input id="cwInput" type="text" placeholder="Type here…" aria-label="Your answer" />
        <button type="submit" aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>
    </div>
    <button class="cw-fab" id="cwFab" aria-label="Chat with us — get a quick quote" aria-expanded="false">
      <svg class="cw-fab-icon cw-fab-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <svg class="cw-fab-icon cw-fab-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      <span class="cw-badge" id="cwBadge">1</span>
    </button>
  `;
  document.body.appendChild(widget);

  // Elements
  const fab     = document.getElementById('cwFab');
  const panel   = document.getElementById('cwPanel');
  const closeBtn= document.getElementById('cwClose');
  const msgs    = document.getElementById('cwMessages');
  const opts    = document.getElementById('cwOptions');
  const composer= document.getElementById('cwComposer');
  const input   = document.getElementById('cwInput');
  const badge   = document.getElementById('cwBadge');
  const iconChat= widget.querySelector('.cw-fab-chat');
  const iconClose=widget.querySelector('.cw-fab-close');

  let isOpen    = false;
  let started   = false;
  let lead      = { service: '', area: '', name: '', phone: '' };
  let step      = 0;

  // ── Conversation steps ──────────────────────────────────────────────
  const STEPS = [
    {
      bot: ["Hi there 👋 I'm here to help you get a quick quote from Ryan at McInally's.", "What service are you looking for?"],
      type: 'options',
      options: ['Kitchen Fitting', 'Bathroom Fitting', 'Emergency Plumbing', 'Boiler Service', 'Blocked Drains', 'Other'],
      save: (v) => { lead.service = v; },
      next: 1,
    },
    {
      bot: (l) => [`Great — ${l.service}. What area of Edinburgh are you in?`],
      type: 'options',
      options: ['Leith / Portobello', 'Morningside / Bruntsfield', 'Stockbridge / Newington', 'Corstorphine / Murrayfield', 'Other Edinburgh area'],
      save: (v) => { lead.area = v; },
      next: 2,
    },
    {
      bot: () => ["What's your name?"],
      type: 'text',
      placeholder: 'Your first name…',
      validate: (v) => v.trim().length >= 2,
      errMsg: "Please enter your name so Ryan knows who to call.",
      save: (v) => { lead.name = v.trim(); },
      next: 3,
    },
    {
      bot: (l) => [`Thanks ${l.name}! What's the best phone number for Ryan to reach you on?`],
      type: 'text',
      placeholder: 'e.g. 07700 900123',
      inputType: 'tel',
      validate: (v) => /^[\d\s\+\-\(\)]{7,}$/.test(v.trim()),
      errMsg: "Please enter a valid phone number.",
      save: (v) => { lead.phone = v.trim(); },
      next: 4,
    },
    {
      bot: null,
      type: 'submit',
    },
  ];

  // ── Helpers ──────────────────────────────────────────────────────────

  function scrollBottom() {
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addMsg(text, who) {
    const wrap = document.createElement('div');
    wrap.className = `cw-msg cw-msg--${who}`;
    if (who === 'bot') {
      wrap.innerHTML = `
        <div class="cw-msg-avatar" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        </div>
        <div class="cw-msg-bubble">${text}</div>`;
    } else {
      wrap.innerHTML = `<div class="cw-msg-bubble">${text}</div>`;
    }
    msgs.appendChild(wrap);
    scrollBottom();
    return wrap;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'cw-msg cw-msg--bot cw-typing';
    t.setAttribute('aria-label', 'Typing…');
    t.innerHTML = `
      <div class="cw-msg-avatar" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      </div>
      <div class="cw-msg-bubble">
        <span class="cw-typing-dot"></span>
        <span class="cw-typing-dot"></span>
        <span class="cw-typing-dot"></span>
      </div>`;
    msgs.appendChild(t);
    scrollBottom();
    return t;
  }

  function clearOptions() { opts.innerHTML = ''; }
  function showOptions(options) {
    clearOptions();
    options.forEach(o => {
      const btn = document.createElement('button');
      btn.className = 'cw-option-btn';
      btn.type = 'button';
      btn.textContent = o;
      btn.addEventListener('click', () => handleOption(o));
      opts.appendChild(btn);
    });
  }

  // Queue multiple bot messages with typing delays
  function botSay(messages, delay = 500) {
    return new Promise(resolve => {
      let i = 0;
      function next() {
        if (i >= messages.length) { resolve(); return; }
        const typing = showTyping();
        const msgDelay = Math.min(messages[i].length * 18 + 300, 1400);
        setTimeout(() => {
          typing.remove();
          addMsg(messages[i], 'bot');
          i++;
          setTimeout(next, 300);
        }, msgDelay);
      }
      setTimeout(next, delay);
    });
  }

  // ── Step runner ───────────────────────────────────────────────────────
  async function runStep(i) {
    step = i;
    const s = STEPS[i];
    if (!s) return;

    clearOptions();
    composer.hidden = true;

    // Resolve bot messages
    if (s.bot) {
      const botMsgs = typeof s.bot === 'function' ? s.bot(lead) : s.bot;
      await botSay(botMsgs);
    }

    if (s.type === 'options') {
      showOptions(s.options);
    } else if (s.type === 'text') {
      if (s.inputType) input.type = s.inputType;
      else input.type = 'text';
      input.placeholder = s.placeholder || 'Type here…';
      input.value = '';
      composer.hidden = false;
      setTimeout(() => input.focus(), 80);
    } else if (s.type === 'submit') {
      await submitLead();
    }
  }

  function handleOption(value) {
    const s = STEPS[step];
    if (!s || s.type !== 'options') return;
    clearOptions();
    s.save(value);
    addMsg(value, 'user');
    runStep(s.next);
  }

  async function handleText(value) {
    const s = STEPS[step];
    if (!s || s.type !== 'text') return;

    if (s.validate && !s.validate(value)) {
      await botSay([s.errMsg], 200);
      composer.hidden = false;
      input.focus();
      return;
    }

    s.save(value);
    addMsg(value, 'user');
    composer.hidden = true;
    runStep(s.next);
  }

  // ── Submit ────────────────────────────────────────────────────────────
  async function submitLead() {
    const typing = showTyping();
    const body = new FormData();
    body.append('_subject', `New Enquiry: ${lead.service} — ${lead.area}`);
    body.append('service', lead.service);
    body.append('area', lead.area);
    body.append('name', lead.name);
    body.append('phone', lead.phone);
    body.append('_gotcha', '');

    let ok = false;
    try {
      const res = await fetch('https://formspree.io/f/xpqeroav', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body,
      });
      ok = res.ok;
    } catch { ok = false; }

    typing.remove();
    showDone(ok);
  }

  function showDone(success) {
    msgs.innerHTML = '';
    clearOptions();
    composer.hidden = true;

    const done = document.createElement('div');
    done.className = 'cw-done';
    if (success) {
      done.innerHTML = `
        <div class="cw-done-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3>You're all set, ${lead.name}!</h3>
        <p>Ryan will give you a call on <strong>${lead.phone}</strong> to discuss your <strong>${lead.service}</strong> project and arrange a free site visit.</p>
        <p>Need something urgent? <a href="tel:07449984820">Call 07449 984820</a></p>`;
    } else {
      done.innerHTML = `
        <div class="cw-done-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3>Something went wrong</h3>
        <p>Sorry about that — please call Ryan directly on <a href="tel:07449984820">07449 984820</a> or <a href="contact.html">send a message</a>.</p>`;
    }
    msgs.appendChild(done);
    scrollBottom();
  }

  // ── Open / Close ───────────────────────────────────────────────────────
  function openPanel() {
    isOpen = true;
    badge.hidden = true;
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    iconChat.style.display = 'none';
    iconClose.style.display = '';

    requestAnimationFrame(() => {
      panel.classList.add('cw-panel--enter');
      requestAnimationFrame(() => {
        panel.classList.remove('cw-panel--enter');
        panel.classList.add('cw-panel--visible');
      });
    });

    closeBtn.focus();

    if (!started) {
      started = true;
      runStep(0);
    }
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('cw-panel--visible');
    panel.classList.add('cw-panel--enter');
    fab.setAttribute('aria-expanded', 'false');
    iconChat.style.display = '';
    iconClose.style.display = 'none';
    panel.addEventListener('transitionend', () => {
      panel.classList.remove('cw-panel--enter');
      panel.hidden = true;
    }, { once: true });
    fab.focus();
  }

  fab.addEventListener('click', () => { if (isOpen) closePanel(); else openPanel(); });
  closeBtn.addEventListener('click', closePanel);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  composer.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    input.value = '';
    handleText(val);
  });

  // Show badge after 4 seconds if user hasn't opened yet
  setTimeout(() => {
    if (!started) badge.hidden = false;
  }, 4000);

})();
