/* Mittiva — main.js (editorial / cinematic build)
   - Theme toggle (persisted)
   - Full-screen menu overlay
   - Page intro mask wipe
   - Scroll progress bar
   - IntersectionObserver reveals (fade, mask-wipe, stacked-title)
   - Ambient drifting constellation canvas (NO pointer tracking)
   - Contact form (Formspree-ready)
   - Word/letter splits
   ZERO mousemove / pointermove / cursor-tracking handlers.
*/
(function () {
  'use strict';

  const root = document.documentElement;
  const body = document.body;

  /* ───── THEME ───── */
  const storedTheme = localStorage.getItem('mittiva-theme');
  const initial = storedTheme || 'dark';
  root.setAttribute('data-theme', initial);

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('mittiva-theme', next);
    });
  });

  /* ───── EMAIL LINK HYDRATION ───── */
  /* Anti-scraper: emails are stored in HTML as separate data-user + data-host
     attributes (never as a full "user@host" string in static markup). On DOM
     ready we reassemble the address into:
       · the href as `mailto:user@host` (with optional ?subject= from data-subject)
       · the visible text content (unless data-keep-label="1", which means the
         author wanted a custom label like "Send an email" preserved)
     Bots that only parse static HTML never see the address; humans get a
     working mailto: click. The visible fallback (`user [at] host`) reads
     correctly for users with JS disabled too. */
  document.querySelectorAll('a.email-link').forEach((a) => {
    const user = a.getAttribute('data-user');
    const host = a.getAttribute('data-host');
    if (!user || !host) return;
    const addr = user + '@' + host;
    const subject = a.getAttribute('data-subject');
    a.setAttribute('href', 'mailto:' + addr + (subject ? '?' + subject : ''));
    if (a.getAttribute('data-keep-label') !== '1') {
      a.textContent = addr;
    }
  });

  /* ───── MENU OVERLAY ───── */
  const menuBtn = document.querySelector('[data-menu-btn]');
  if (menuBtn) {
    const toggle = () => body.classList.toggle('is-menu-open');
    const close = () => body.classList.remove('is-menu-open');
    menuBtn.addEventListener('click', toggle);
    document.querySelectorAll('.menu-overlay a').forEach((a) =>
      a.addEventListener('click', () => setTimeout(close, 120))
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  /* ───── PAGE INTRO MASK ───── */
  const intro = document.querySelector('[data-intro-mask]');
  if (intro) {
    window.addEventListener('load', () => {
      setTimeout(() => intro.classList.add('is-done'), 350);
    });
    // Fallback in case 'load' doesn't fire
    setTimeout(() => intro.classList.add('is-done'), 1600);
  }

  /* ───── SCROLL PROGRESS ───── */
  const progress = document.querySelector('[data-scroll-progress]');
  if (progress) {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      progress.style.width = Math.min(100, Math.max(0, scrolled)) + '%';
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ───── STACKED-TITLE LETTERS WRAP ───── */
  /* Each <span> child is wrapped with <i> inside for transform-on-line */
  document.querySelectorAll('.stacked-title').forEach((title) => {
    title.querySelectorAll('span').forEach((line) => {
      if (line.querySelector('i')) return;
      const inner = line.innerHTML;
      line.innerHTML = `<i>${inner}</i>`;
    });
  });

  /* ───── REVEAL ON SCROLL ───── */
  const revealEls = document.querySelectorAll(
    '.reveal, .reveal-stagger, .reveal-mask, .stacked-title'
  );
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ───── AMBIENT CONSTELLATION CANVAS (no pointer tracking) ───── */
  const canvas = document.querySelector('[data-constellation]');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    const nodes = [];
    const NODE_COUNT = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 24000));

    function resize() {
      dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      // canvas.clientWidth/Height are READ-ONLY DOM props. Assigning to them
      // throws TypeError in strict mode — this was killing all JS below.
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function buildNodes() {
      nodes.length = 0;
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          r: Math.random() * 1.4 + 0.6,
          a: Math.random() * 0.5 + 0.25,
        });
      }
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      const theme = root.getAttribute('data-theme');
      const baseColor = theme === 'light' ? 'rgba(74, 106, 138,' : 'rgba(176, 192, 216,';

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          const maxD = 150;
          if (d2 < maxD * maxD) {
            const t = 1 - Math.sqrt(d2) / maxD;
            ctx.strokeStyle = baseColor + (t * 0.18).toFixed(3) + ')';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        ctx.fillStyle = baseColor + n.a.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf;
    resize();
    buildNodes();
    if (!reduce) raf = requestAnimationFrame(tick);
    else tick();

    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { resize(); buildNodes(); }, 160);
    });
  }

  /* ───── COUNT-UP NUMBERS ───── */
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-count-suffix') || '';
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      const t0 = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / 1400);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = target * eased;
        el.textContent = (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (e) => e.forEach((x) => x.isIntersecting && start()),
        { threshold: 0.5 }
      );
      io.observe(el);
    } else {
      start();
    }
  });

  /* ───── CONTACT FORM ───── */
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    form.addEventListener('submit', async (e) => {
      const action = form.getAttribute('action');
      const msg = form.querySelector('[data-form-msg]');
      if (!action || action.includes('PASTE_FORMSPREE')) {
        e.preventDefault();
        if (msg) {
          msg.textContent =
            'Form preview only — add your Formspree endpoint in the form action attribute before going live.';
          msg.classList.add('is-show');
        }
        return;
      }
      e.preventDefault();
      try {
        const data = new FormData(form);
        const res = await fetch(action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          form.reset();
          if (msg) {
            msg.textContent = "Thank you. We'll be in touch within 24 hours.";
            msg.classList.add('is-show');
          }
        } else if (msg) {
          msg.textContent = 'Something went wrong. Please email hello@mittiva.io.';
          msg.classList.add('is-show');
        }
      } catch (err) {
        if (msg) {
          msg.textContent = 'Network error. Please email hello@mittiva.io.';
          msg.classList.add('is-show');
        }
      }
    });
  }

  /* ───── PINNED HORIZONTAL SCROLL — minimal sticky implementation ─────
     The .h-scroll wrapper has its outer height set to viewport + horizontalDistance.
     The .h-scroll__pin inside uses real CSS position:sticky to stay locked at
     top:0 while the wrapper passes through the viewport.
     JS only does TWO things:
       1. Set the wrapper's height so there's enough vertical scroll distance.
       2. Read scroll position → translate the track horizontally.
  */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobileViewport = window.matchMedia('(max-width: 760px)').matches;

  // The scroll-jack IS the layout, not a decoration — don't gate on reduce-motion.
  // Only skip on mobile viewport (replaced by a native horizontal swipe scroll).
  document.querySelectorAll('.h-scroll').forEach((wrapper) => {
    if (isMobileViewport) return;

    const pin = wrapper.querySelector('.h-scroll__pin');
    const track = wrapper.querySelector('.h-scroll__track');
    const progressBar = wrapper.querySelector('.h-scroll__bar');
    const counter = wrapper.querySelector('[data-h-counter]');
    const cards = track ? track.querySelectorAll('.h-card') : [];
    if (!pin || !track) return;

    const lastCard = cards.length ? cards[cards.length - 1] : null;

    // The zoom-in preview is hardcoded in HTML now (inside the pin as
    // .h-scroll__preview) — title + paragraph + CTA button all together.
    // Pin stays sticky while this block scales from a dot up to full size,
    // so the user never has to "scroll past" to reach the next chapter.
    const nextPreview = pin.querySelector('.h-scroll__preview');
    if (nextPreview) {
      nextPreview.style.transform = 'translate(-50%, -50%) scale(0.04)';
      nextPreview.style.opacity = '0';
    }

    let distance = 0; // pixels the track must travel horizontally

    function measure() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const trackWidth = track.scrollWidth;
      distance = Math.max(0, trackWidth - vw);
      // Three extra zones AFTER the horizontal scroll, all while the pin
      // is still sticky (so the user "doesn't scroll down to the next section"):
      //   exitZone  — CTA card scales from 1 → 0 (a dot)
      //   entryZone — cloned next-section headline scales from 0 → 1
      const exitZone = Math.round(vh * 0.7);
      const entryZone = Math.round(vh * 1.0);
      wrapper.style.height = (vh + distance + exitZone + entryZone) + 'px';
    }

    let lastIdx = -1;
    let raf = null;
    function update() {
      const rect = wrapper.getBoundingClientRect();
      const vh = window.innerHeight;
      const approachRange = vh * 2;
      const exitZone = Math.round(vh * 0.7);
      const entryZone = Math.round(vh * 1.0);

      let progress = 0;          // 0–1 horizontal scroll progress
      let exitProgress = 0;      // 0–1 CTA card zoom-out progress
      let entryProgress = 0;     // 0–1 next-section preview zoom-in progress
      let approachProgress = 0;  // 0–1 approach progress (card 01 entry)

      if (rect.top > 0) {
        // Before pin engages
        approachProgress = Math.max(0, Math.min(1, 1 - rect.top / approachRange));
      } else if (rect.bottom > vh + exitZone + entryZone) {
        // Horizontal phase — pin sticky, track slides
        progress = distance > 0 ? Math.min(1, Math.max(0, (-rect.top) / distance)) : 0;
        approachProgress = 1;
      } else if (rect.bottom > vh + entryZone) {
        // Exit phase — CTA card scales down to a dot
        progress = 1;
        exitProgress = Math.max(0, Math.min(1, 1 - (rect.bottom - vh - entryZone) / exitZone));
        approachProgress = 1;
      } else if (rect.bottom > vh) {
        // Entry phase — next-section preview zooms in from a dot to full size
        progress = 1;
        exitProgress = 1;
        entryProgress = Math.max(0, Math.min(1, 1 - (rect.bottom - vh) / entryZone));
        approachProgress = 1;
      } else {
        // Past — pin releases naturally, real next section is visible
        progress = 1;
        exitProgress = 1;
        entryProgress = 1;
        approachProgress = 1;
      }

      // ── 1. Track translates horizontally (cards stay flat) ────────
      track.style.transform = 'translate3d(' + (-progress * distance).toFixed(2) + 'px, 0, 0)';

      // ── 2. Card 01 diagonal entry — translate only, NO tilt ───────
      // Card 01 is 100vh tall and lives inside the section. It only becomes
      // VISIBLE in the viewport during the second half of the approach
      // (approachProgress 0.5 → 1 — when the section starts entering view
      // from the bottom). So we play the diagonal animation entirely during
      // that visible window — otherwise most of the motion happens while
      // card 01 is still off-screen and the user sees nothing diagonal.
      const ANIM_START = 0.45;
      const animT = approachProgress <= ANIM_START
        ? 0
        : Math.min(1, (approachProgress - ANIM_START) / (1 - ANIM_START));
      // Cubic ease-out — card decelerates as it settles
      const remaining = 1 - animT;
      const easeOut = remaining * remaining * remaining;

      // ── CTA card pan-out (exit zone) ──────────────────────────────
      // Only the LAST card scales — applying scale to the sticky pin breaks
      // sticky. The card scales around its own center → visually shrinks
      // toward a dot at the centre of the viewport.
      const lastIndex = cards.length - 1;
      let lastScale = 1;
      let lastOpacity = 1;
      if (exitProgress > 0 && lastCard) {
        // Ease-out cubic — fast initial shrink, decelerates to a dot
        const eEx = 1 - Math.pow(1 - exitProgress, 3);
        lastScale = 1 - eEx * 0.96;     // 1 → 0.04 (basically a dot)
        lastOpacity = 1 - eEx * 0.95;   // 1 → 0.05
      }

      for (let i = 0; i < cards.length; i++) {
        if (i === 0 && easeOut > 0.001) {
          // Card 01 entry sweep — visible diagonal in
          const tx = easeOut * 420;
          cards[i].style.transform = 'translate3d(' + tx.toFixed(2) + 'px, 0, 0)';
          if (cards[i].style.opacity) cards[i].style.opacity = '';
        } else if (i === lastIndex && exitProgress > 0) {
          // Last card (CTA) panning out
          cards[i].style.transform = 'scale(' + lastScale.toFixed(3) + ')';
          cards[i].style.opacity = lastOpacity.toFixed(3);
        } else {
          if (cards[i].style.transform) cards[i].style.transform = '';
          if (cards[i].style.opacity) cards[i].style.opacity = '';
        }
      }

      // ── Next-section preview zoom-in (pinned, scroll-tied) ──────
      // Scales from a dot (0.04) up to full size (1) over the entry zone.
      // Pin stays sticky throughout — the user keeps scrolling but the page
      // doesn't visually advance, the preview just grows in place.
      if (nextPreview) {
        if (entryProgress > 0) {
          // Ease-out cubic for cinematic settle as it reaches full size
          const eIn = 1 - Math.pow(1 - entryProgress, 3);
          const scale = 0.04 + eIn * 0.96;
          const opacity = Math.min(1, eIn * 1.2);
          nextPreview.style.transform =
            'translate(-50%, -50%) scale(' + scale.toFixed(3) + ')';
          nextPreview.style.opacity = opacity.toFixed(3);
          // Only let the CTA receive clicks once the preview is essentially
          // settled — prevents stray clicks during the zoom-in
          nextPreview.style.pointerEvents = entryProgress > 0.85 ? 'auto' : 'none';
        } else {
          nextPreview.style.transform = 'translate(-50%, -50%) scale(0.04)';
          nextPreview.style.opacity = '0';
          nextPreview.style.pointerEvents = 'none';
        }
      }

      if (progressBar) {
        progressBar.style.setProperty('--h-progress', (progress * 100).toFixed(1) + '%');
      }
      if (counter && cards.length) {
        const idx = Math.min(cards.length - 1, Math.floor(progress * cards.length));
        if (idx !== lastIdx) {
          counter.textContent =
            String(idx + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
          lastIdx = idx;
        }
      }

      raf = null;
    }
    function onScroll() {
      if (raf == null) raf = requestAnimationFrame(update);
    }

    measure();
    update();

    // Re-measure when fonts and images finish loading (card sizes may change)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { measure(); update(); });
    }
    window.addEventListener('load', () => { measure(); update(); });
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { measure(); update(); }, 160);
    });
    document.addEventListener('scroll', onScroll, { passive: true });
  });

  /* ───── SERVICE DECK — playing-card flip + ambient shuffle ───
     Cards are face-down by default. Clicking a card flips it (3D
     rotateY) to reveal the front. Only one card flipped at a time.
     A shuffle animation runs every 15s when no card is flipped —
     each card lifts and settles in sequence, like a dealer fanning
     a hand. Escape key flips the active card back. */
  const deckCards = document.querySelectorAll('[data-deck-card]');
  if (deckCards.length) {

    // ── SEQUENCED FLIP / UNFLIP ────────────────────────────────
    // Three phases, each does ONE thing to avoid 3D render artefacts:
    //   1. is-elevated  → card lifts above the deck     (280ms)
    //   2. is-rotated   → flipper rotates 180° in place (480ms)
    //   3. is-flipped   → card settles to centre + zoom (280ms)
    // Total 1040ms either direction. Reverses cleanly.
    const T_ELEVATE = 280;
    const T_ROTATE = 480;

    // Deck-wrap class that JS toggles SYNCHRONOUSLY on flip-in. CSS uses
    // it (plain class selector, no :has()) to kill all hover effects the
    // instant a flip begins — guaranteed to apply before the next paint.
    const deckWrap = document.querySelector('.service-deck-wrap');
    const deck     = document.querySelector('.service-deck');
    const lockDeck = () => deckWrap && deckWrap.classList.add('is-locked');
    const unlockDeck = () => deckWrap && deckWrap.classList.remove('is-locked');

    /* Smoothly scroll so the flipped card sits at the vertical center of
       the viewport. The card lands at the deck's center post-flip (CSS
       top/left 50%), so centering the .service-deck element on screen
       centers the active card.

       We can't use window.scrollTo({ behavior: 'smooth' }) — browsers
       finish that in ~300–400ms, well before the 1040ms flip completes,
       so the scroll feels detached. Instead, hand-roll a rAF tween that
       spans the full flip duration with a cinematic ease, so motion +
       flip land together as a single beat. */
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* The 3-phase flip takes 1040ms total:
         0–280ms  : elevate
         280–760ms: rotate
         760–1040ms: settle to viewport-center + zoom

       If the page scroll runs the full 1040ms, the user perceives it as
       "the layout is still moving while the card lands" — the scroll
       trails the flip. Resolving the scroll EARLY (by the time the
       rotate phase ends) means the card's final settle happens on a
       page that's already at rest, and the two motions read as a single
       beat instead of two.

       So: 720ms total with a strong ease-out (fast accel, gentle decay)
       — page slides 90%+ into place during the elevate + rotate phases,
       and the card's settle-to-center confirms the new center. */
    const SCROLL_DURATION = 720;
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    let scrollRaf = null;
    function scrollCardToCenter () {
      if (prefersReducedMotion) return;
      const target = deck || deckWrap;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const targetCenter   = rect.top + window.scrollY + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const endY = Math.max(0, targetCenter - viewportCenter);
      const startY = window.scrollY;
      const delta = endY - startY;
      // If we're already close enough, skip the scroll to avoid jitter.
      if (Math.abs(delta) < 24) return;

      // Cancel any in-flight scroll so the new click takes over cleanly.
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      const t0 = performance.now();
      function tick (now) {
        const elapsed = now - t0;
        const p = Math.min(1, elapsed / SCROLL_DURATION);
        const eased = easeOutQuart(p);
        window.scrollTo(0, startY + delta * eased);
        if (p < 1) {
          scrollRaf = requestAnimationFrame(tick);
        } else {
          scrollRaf = null;
        }
      }
      scrollRaf = requestAnimationFrame(tick);
    }

    function flipIn(card) {
      // Clear any leftover state
      card.classList.remove('is-flipped', 'is-rotated', 'is-elevated', 'is-dropping');
      // Lock + elevate in the SAME tick so the deck never has a frame
      // where it's locked but has no card driving the fan position. No
      // collapse-to-stack flicker between locking and elevating.
      lockDeck();
      card.classList.add('is-elevated');
      // Phase 2: rotate (while elevated)
      setTimeout(() => {
        if (!card.classList.contains('is-elevated')) return;
        card.classList.add('is-rotated');
      }, T_ELEVATE);
      // Phase 3: settle to centre
      setTimeout(() => {
        if (!card.classList.contains('is-elevated')) return;
        card.classList.remove('is-elevated');
        card.classList.add('is-flipped');
      }, T_ELEVATE + T_ROTATE);
    }

    function flipOut(card) {
      // Reverse sequence — walk back from whatever state we're in.
      // Deck stays locked until ALL phases finish, then unlocks if no
      // other card is still active.
      const finish = () => { if (!anyFlipped()) unlockDeck(); };

      // Helper: phase 3 drop. is-dropping keeps z-index high during the
      // descent back to fan position, so the card never visually passes
      // BEHIND its siblings as it lands. Cleared after 280ms.
      const startDrop = () => {
        card.classList.remove('is-elevated');
        card.classList.add('is-dropping');
        setTimeout(() => {
          card.classList.remove('is-dropping');
          finish();
        }, T_ELEVATE);
      };

      if (card.classList.contains('is-flipped')) {
        card.classList.remove('is-flipped');
        card.classList.add('is-elevated');
        setTimeout(() => {
          if (!card.classList.contains('is-elevated')) return;
          card.classList.remove('is-rotated');
        }, T_ELEVATE);
        setTimeout(() => {
          if (!card.classList.contains('is-elevated')) return;
          startDrop();
        }, T_ELEVATE + T_ROTATE);
      } else if (card.classList.contains('is-rotated')) {
        card.classList.remove('is-rotated');
        setTimeout(startDrop, T_ROTATE);
      } else if (card.classList.contains('is-elevated')) {
        startDrop();
      } else {
        finish();
      }
    }

    function isCardActive(card) {
      return card.classList.contains('is-elevated') ||
             card.classList.contains('is-rotated') ||
             card.classList.contains('is-flipped');
    }
    const anyFlipped = () => Array.from(deckCards).some(isCardActive);

    /* ── MOBILE OPEN/CLOSE ─────────────────────────────────────
       On ≤768px viewports the deck renders as a 3-2-3 grid (CSS).
       Tapping a card adds .is-mobile-open which CSS uses to lift
       the card into a fullscreen fixed overlay + flip the flipper.
       A close button is injected into each card on first open. */
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    function isMobile () { return mobileQuery.matches; }

    function ensureMobileClose (card) {
      if (card.querySelector('[data-deck-mobile-close]')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'service-deck__mobile-close';
      btn.setAttribute('data-deck-mobile-close', '');
      btn.setAttribute('aria-label', 'Close card');
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
      card.appendChild(btn);
    }

    function openMobileCard (card) {
      deckCards.forEach((c) => { if (c !== card) c.classList.remove('is-mobile-open'); });
      ensureMobileClose(card);
      card.classList.add('is-mobile-open');
      document.body.classList.add('deck-mobile-open');
    }

    function closeMobileCard (card) {
      card.classList.remove('is-mobile-open');
      if (!document.querySelector('.service-deck__card.is-mobile-open')) {
        document.body.classList.remove('deck-mobile-open');
      }
    }

    // Click on a card → open it (if not already active). Clicking INSIDE an
    // already-active card does nothing — that lets the user interact with
    // the card's content (e.g. the Voice AI widget's call button) without
    // accidentally flipping the card back down. To close the active card,
    // the user clicks outside it (handled below).
    deckCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        // Mobile flow: tap-to-fullscreen
        if (isMobile()) {
          if (e.target.closest('[data-deck-mobile-close]')) {
            closeMobileCard(card);
            return;
          }
          if (e.target.closest('a, button, input, textarea, select')) return;
          if (card.classList.contains('is-mobile-open')) return;
          openMobileCard(card);
          return;
        }
        // Desktop flow: 3-phase flip
        if (e.target.closest('a, button, input, textarea, select')) return;
        if (isCardActive(card)) return;     // Already open → ignore inside clicks
        // Close any other active card first
        deckCards.forEach((c) => { if (isCardActive(c)) flipOut(c); });
        // Open this one
        flipIn(card);
        // Smoothly bring the deck (and thus the flipping card) into the
        // vertical center of the viewport. Kicked off immediately so the
        // scroll runs in parallel with the 1040ms flip sequence and both
        // finish at roughly the same time.
        scrollCardToCenter();
      });
    });

    // Esc closes whatever's open
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (isMobile()) {
        const open = document.querySelector('.service-deck__card.is-mobile-open');
        if (open) closeMobileCard(open);
      } else {
        deckCards.forEach((c) => { if (isCardActive(c)) flipOut(c); });
      }
    });

    // Click outside any card → close. CSS then collapses the deck.
    // The Mitti chat panel lives OUTSIDE the deck but is visually paired
    // with card 04 — clicks inside it must NOT collapse the deck.
    document.addEventListener('click', (e) => {
      // Mobile: tap backdrop to close
      if (isMobile()) {
        if (!document.body.classList.contains('deck-mobile-open')) return;
        if (e.target.closest('.service-deck__card')) return;
        if (e.target.closest('.mitti-panel')) return;
        const open = document.querySelector('.service-deck__card.is-mobile-open');
        if (open) closeMobileCard(open);
        return;
      }
      // Desktop: existing behaviour
      if (!anyFlipped()) return;
      if (e.target.closest('.service-deck__card')) return;
      if (e.target.closest('.mitti-panel')) return;
      if (e.target.closest('[data-talk-to-mitti]')) return;
      deckCards.forEach((c) => { if (isCardActive(c)) flipOut(c); });
    });

    // Ambient riffle shuffle — every 10 seconds, animate each card through
    // the dealer-style lift-sway-spin-land arc, staggered so the deck looks
    // like a wave passing through it. Suspended when:
    //   • any card is flipped (don't disturb a reader)
    //   • the cursor is over an actual card (matches the CSS fan-trigger)
    // Hovering the section's empty padding does NOT suspend the shuffle.
    const isCardHovered = () => !!document.querySelector('.service-deck__card:hover');

    function runShuffle() {
      if (anyFlipped() || isCardHovered()) return;
      deckCards.forEach((card, i) => {
        setTimeout(() => {
          // Re-check at each stagger tick so if the user hovers a card
          // mid-wave the remaining cards abort instead of swooping around.
          if (anyFlipped() || isCardHovered()) return;
          card.classList.add('is-shuffling');
          // 1500ms matches the keyframe duration (smoother + slower than
          // before for the new 4-stage arc); remove just after end
          setTimeout(() => card.classList.remove('is-shuffling'), 1520);
        }, i * 160);
      });
    }
    setInterval(runShuffle, 10000);

    // Hovering any card immediately stops any in-progress shuffle so the
    // fanned view is stable and the user can pick a card cleanly. Listener
    // on each card so we react to actual card contact, not section padding.
    deckCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        deckCards.forEach((c) => c.classList.remove('is-shuffling'));
      });
    });

    /* ── DEEP-LINK FROM HOMEPAGE / NAV DROPDOWN ─────────────────
       The homepage h-scroll cards link to services.html#<id> (e.g.
       #voice, #conversation, #social, #changing-room, #web,
       #email, #automations, #crm). The nav dropdown does the same.
       On arrival we look up the matching card via its id, scroll
       it into view, and trigger flipIn() so the visitor lands on
       the exact card they clicked — no manual hunt through the
       deck. We sanitise the hash to a strict id pattern before
       passing it to querySelector. */
    function openDeckCardFromHash () {
      const raw = (location.hash || '').replace(/^#/, '');
      if (!/^[a-z][a-z0-9-]{0,40}$/i.test(raw)) return;
      const target = document.getElementById(raw);
      if (!target || !target.classList.contains('service-deck__card')) return;
      // Close any other open card first (defensive — usually nothing's open
      // on a fresh navigation).
      deckCards.forEach((c) => { if (c !== target && isCardActive(c)) flipOut(c); });
      // Brief delay so the page settles + the deck's mobile auto-fan
      // observer can mark itself in-view before we kick off the flip.
      setTimeout(() => {
        if (!isCardActive(target)) {
          flipIn(target);
          scrollCardToCenter();
        }
      }, 220);
    }
    // Run once on initial load
    openDeckCardFromHash();
    // And again if the hash changes while the page is open (e.g. user
    // clicks a same-page anchor or browser back/forward changes it).
    window.addEventListener('hashchange', openDeckCardFromHash);

    // ── MOBILE: auto-fan the deck when it scrolls into view ────────
    // Touch devices have no hover, so the hover-driven fan-out rule
    // (Trigger A in styles.css) never fires. Instead, on mobile we
    // watch the deck wrap with IntersectionObserver and toggle the
    // .is-in-view class — CSS Trigger C picks that up and fans the
    // deck out exactly like a desktop hover would. Gated to the
    // mobile breakpoint via matchMedia so desktop users don't get
    // the auto-fan (their hover still works fine).
    const mobileMQ = window.matchMedia('(max-width: 768px)');
    if (deckWrap && 'IntersectionObserver' in window) {
      const fanObserver = new IntersectionObserver((entries) => {
        if (!mobileMQ.matches) return;       // desktop: keep hover behaviour
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            deckWrap.classList.add('is-in-view');
          } else {
            deckWrap.classList.remove('is-in-view');
          }
        });
      }, {
        // Trigger when ~30% of the deck is visible — gives a clean
        // fan reveal as the user scrolls down, not the moment a
        // single pixel pokes into the viewport.
        threshold: 0.3
      });
      fanObserver.observe(deckWrap);

      // If the viewport flips between mobile and desktop (rotation,
      // dev tools), strip the class so we don't leave a stale fan
      // hanging on a desktop session.
      mobileMQ.addEventListener('change', (e) => {
        if (!e.matches) deckWrap.classList.remove('is-in-view');
      });
    }

    // If the page loaded with a hash like #voice, auto-flip that card
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target && target.matches('[data-deck-card]')) {
        // Tiny delay so the intro mask / fonts settle before the flip
        setTimeout(() => {
          target.classList.add('is-flipped');
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 400);
      }
    }
  }

  /* ───── ACTIVE NAV ───── */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.menu-overlay__links a').forEach((a) => {
    if (a.getAttribute('href') === path) a.classList.add('is-active');
  });

  /* ───── VOICE AI WIDGET — relocate LeadConnector into the Voice AI card ───
     The LeadConnector loader script is preloaded in services.html so the
     <chat-widget> element gets injected at <body> level on page load.
     We:
       1. Watch for that injection.
       2. Move the chat-widget into .voice-widget-host inside #voice.
       3. Toggle body.voice-widget-on while the card is active so CSS shows
          / hides it without remounting the iframe (which would re-load
          the widget every time and feel laggy).
     Hiding the widget while the card is face-down is critical — otherwise
     the floating chat button would sit on top of every page section. */
  (function initVoiceWidget () {
    const voiceCard = document.getElementById('voice');
    if (!voiceCard) return;
    const host = voiceCard.querySelector('[data-voice-host]');
    if (!host) return;

    const LC_WIDGET_ID = '6a0fd05bb47a945bd7d13bd3';
    // Selectors LC might use — we try the specific widget-id first (most
    // reliable), then fall back to known tag names.
    const LC_SELECTORS = [
      '[data-widget-id="' + LC_WIDGET_ID + '"]:not(script)',
      'chat-widget',
      'chat-widget-floating-button',
      'lc-chat-widget',
    ];
    let   relocated = false;

    const isActive = (el) =>
      el.classList.contains('is-elevated') ||
      el.classList.contains('is-rotated')  ||
      el.classList.contains('is-flipped');

    function findWidget () {
      for (const sel of LC_SELECTORS) {
        const el = document.querySelector(sel);
        if (el && el.tagName !== 'SCRIPT' && !host.contains(el)) return el;
      }
      return null;
    }

    function relocateOnce () {
      if (relocated) return;
      const el = findWidget();
      if (!el) return;
      // Strip any inline display:none / position the widget may have set
      // on itself before we move it.
      el.style.display = '';
      host.appendChild(el);
      relocated = true;
    }

    // Try immediately (script may have already finished).
    relocateOnce();

    if (!relocated) {
      // Watch the WHOLE document for the LC element to appear — on mobile
      // the LC loader is slower and may inject the widget into a wrapper
      // div, not directly under <body>. subtree:true catches both.
      const docObs = new MutationObserver(() => {
        relocateOnce();
        if (relocated) docObs.disconnect();
      });
      docObs.observe(document.documentElement, { childList: true, subtree: true });

      // Belt-and-suspenders: poll for up to 15s in case the observer misses
      // a deeply-nested injection (shadow DOM, late JS, etc).
      let polls = 0;
      const pollId = setInterval(() => {
        relocateOnce();
        if (relocated || ++polls > 60) {
          clearInterval(pollId);
          if (relocated) docObs.disconnect();
        }
      }, 250);
    }

    function sync () {
      if (isActive(voiceCard)) {
        document.body.classList.add('voice-widget-on');
      } else {
        document.body.classList.remove('voice-widget-on');
      }
    }

    // React to flipIn / flipOut by watching the card's class list.
    new MutationObserver(sync).observe(voiceCard, {
      attributes: true, attributeFilter: ['class']
    });

    // Handle deep-link case (services.html#voice) where the hash flips
    // the card before the observer is attached.
    sync();
  })();

  /* ───── CONVERSATION AI WIDGET — relocate LeadConnector into the Mitti panel ───
     The Conversation widget no longer lives inside the deck card. The card
     shows a "Talk to Mitti" CTA; clicking it slides the deck left and flies
     the floating .mitti-panel in from the right edge. The chat widget itself
     is hosted inside that panel. Same disambiguation as the voice side —
     LC's loader stamps the widget-id onto the injected element so we match
     on `widget-id="6a112f..."`. Fallback: any LC element not in the voice
     card's host. The panel is hidden by default via CSS (off-screen +
     opacity 0) so we don't need a separate body class to hide the widget. */
  (function initConversationWidget () {
    // The host now sits inside the floating .mitti-panel, not inside the
    // card — so query it globally.
    const host = document.querySelector('[data-conversation-host]');
    if (!host) return;

    const LC_WIDGET_ID = '6a112f4120e5a77e67391912';
    const OTHER_HOST_SEL = '[data-voice-host]';
    const LC_TAGS = 'chat-widget, chat-widget-floating-button, lc-chat-widget';
    let   relocated = false;

    function widgetIdOf (el) {
      return el.getAttribute('widget-id') || el.getAttribute('data-widget-id') || '';
    }

    function findWidget () {
      const all = document.querySelectorAll(LC_TAGS);
      const otherHost = document.querySelector(OTHER_HOST_SEL);
      // Pass 1: explicit widget-id match
      for (const el of all) {
        if (host.contains(el)) continue;
        if (widgetIdOf(el) === LC_WIDGET_ID) return el;
      }
      // Pass 2: any LC element NOT already inside the Voice host
      for (const el of all) {
        if (host.contains(el)) continue;
        if (otherHost && otherHost.contains(el)) continue;
        const id = widgetIdOf(el);
        if (id && id !== LC_WIDGET_ID) continue;
        return el;
      }
      return null;
    }

    function relocateOnce () {
      if (relocated) return;
      const el = findWidget();
      if (!el) return;
      el.style.display = '';
      host.appendChild(el);
      relocated = true;
    }

    // Try immediately (script may have already finished).
    relocateOnce();

    if (!relocated) {
      const docObs = new MutationObserver(() => {
        relocateOnce();
        if (relocated) docObs.disconnect();
      });
      docObs.observe(document.documentElement, { childList: true, subtree: true });

      let polls = 0;
      const pollId = setInterval(() => {
        relocateOnce();
        if (relocated || ++polls > 60) {
          clearInterval(pollId);
          if (relocated) docObs.disconnect();
        }
      }, 250);
    }
  })();

  /* ───── MITTI PANEL — open/close orchestration ─────────────────────
     CTA inside the conversation card opens the floating panel. Close
     button, Esc, and clicks outside the panel close it again. Closing
     the panel does NOT unflip the card — the user can keep exploring
     the card after dismissing the chat. Unflipping the card via outside
     click (handled in the deck section above) also closes the panel
     so we never end up with a panel open but no visible context. */
  (function initMittiPanel () {
    const trigger = document.querySelector('[data-talk-to-mitti]');
    const panel   = document.querySelector('[data-mitti-panel]');
    if (!trigger || !panel) return;
    const closeBtn = panel.querySelector('[data-mitti-close]');
    const convCard = document.getElementById('conversation');

    // Lazy-injects the LeadConnector loader for the Conversation widget
    // on the first open. By NOT loading it at page-boot we keep the Voice
    // AI loader as the only chat-widget on the page at startup — no race,
    // no risk of voice grabbing the wrong widget.
    const CONV_WIDGET_ID = '6a112f4120e5a77e67391912';
    function ensureConvLoader () {
      const exists = document.querySelector(
        'script[data-widget-id="' + CONV_WIDGET_ID + '"]'
      );
      if (exists) return;
      const s = document.createElement('script');
      s.src = 'https://beta.leadconnectorhq.com/loader.js';
      s.setAttribute('data-resources-url',
        'https://beta.leadconnectorhq.com/chat-widget/loader.js');
      s.setAttribute('data-widget-id', CONV_WIDGET_ID);
      s.async = true;
      document.body.appendChild(s);
    }

    // ─── Scroll-lock so the panel + card never drift while open ─────
    // Approach: overflow:hidden on <html>, NOT position:fixed on body.
    // We tried the position:fixed trick first — it detaches the body
    // from normal flow, which let the documentElement's transparent
    // background show through as white (looked like the page was
    // jumping to light mode when the user opened the chat). overflow:
    // hidden keeps body in flow, dark theme intact, no visual flash.
    // The scrollbar disappearance is compensated with a matching
    // padding-right on the html element so content doesn't shift.
    let scrollLocked = false;
    function lockScroll () {
      if (scrollLocked) return;
      const html = document.documentElement;
      const sw = window.innerWidth - html.clientWidth;
      if (sw > 0) html.style.setProperty('--mitti-sbw', sw + 'px');
      html.classList.add('mitti-locked');
      scrollLocked = true;
    }
    function unlockScroll () {
      if (!scrollLocked) return;
      const html = document.documentElement;
      html.classList.remove('mitti-locked');
      html.style.removeProperty('--mitti-sbw');
      scrollLocked = false;
    }

    function open () {
      if (document.body.classList.contains('mitti-on')) return;
      ensureConvLoader();

      // 1. Centre the conversation card in the viewport so it pairs
      //    visually with the panel (which is fixed at viewport centre).
      if (convCard) {
        convCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // 2. Reveal the panel right away — its slide-in transition runs
      //    while the page is still smooth-scrolling.
      document.body.classList.add('mitti-on');
      panel.setAttribute('aria-hidden', 'false');

      // 3. Lock scroll once the smooth-scroll has settled (~400ms in
      //    most browsers). Locking earlier would interrupt the scroll.
      setTimeout(lockScroll, 480);

      // Move focus into the panel for keyboard users (close button is
      // the first focusable child, so this lands them there).
      if (closeBtn) {
        setTimeout(() => closeBtn.focus({ preventScroll: true }), 560);
      }
    }
    function close () {
      if (!document.body.classList.contains('mitti-on')) return;
      document.body.classList.remove('mitti-on');
      unlockScroll();                 // restore page scroll
      panel.setAttribute('aria-hidden', 'true');
      // Return focus to the trigger so keyboard nav doesn't get stranded.
      if (trigger) trigger.focus({ preventScroll: true });
    }

    trigger.addEventListener('click', (e) => {
      // The trigger sits inside an already-flipped card — don't let the
      // click bubble to the card's outside-click closer.
      e.stopPropagation();
      open();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        close();
      });
    }

    // Esc closes the panel (and bubbles up so the card can stay flipped).
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('mitti-on')) {
        close();
      }
    });

    // Click outside the panel (but not on the trigger or the card) → close.
    document.addEventListener('click', (e) => {
      if (!document.body.classList.contains('mitti-on')) return;
      if (panel.contains(e.target)) return;
      if (e.target.closest('[data-talk-to-mitti]')) return;
      if (e.target.closest('.service-deck__card')) return;
      close();
    });

    // If the conversation card is closed (un-flipped), also close the panel —
    // there's no card to anchor the chat to anymore.
    if (convCard) {
      new MutationObserver(() => {
        const stillActive =
          convCard.classList.contains('is-elevated') ||
          convCard.classList.contains('is-rotated')  ||
          convCard.classList.contains('is-flipped');
        if (!stillActive) close();
      }).observe(convCard, { attributes: true, attributeFilter: ['class'] });
    }
  })();

  /* ───── SOCIAL CARD WHISPER FEED — services.html card 03 ────────
     Populates the in-card whisper stage with drifting customer
     fragments + occasional green AI-reply flashes. Three depth tiers
     (far/mid/near) give the feed a parallax-like depth. Large pool
     of whispers + handles with recency tracking so the user never
     sees the same line or handle twice in quick succession.
     Gated by IntersectionObserver — only spawns while card 03 is in
     view, so it doesn't burn cycles when the user is elsewhere. */
  (function initSocialCardWhispers () {
    const stage = document.querySelector('[data-card-whispers]');
    if (!stage) return;

    // ~70 customer-thought fragments spanning shipping questions,
    // product compliments, packaging delight, casual/formal tones,
    // family/friends mentions, location asks, collabs, etc.
    const WHISPERS = [
      // shipping & logistics
      "do you ship to Mumbai?",
      "any plans for international shipping?",
      "Bangalore stockists?",
      "how long does delivery take these days?",
      "express shipping option anywhere?",
      // product compliments
      "the roast is sublime",
      "best small-batch I've tried this year",
      "you've ruined every other brand for me",
      "ordered three more before I'd finished the first",
      "didn't expect to love it this much",
      "the formula has changed my evenings",
      // packaging
      "the packaging deserves an award",
      "kept the box on my shelf",
      "the unboxing was a moment",
      "loved the handwritten note",
      "the wrapping alone is worth it",
      // content & captions
      "the caption made me laugh out loud",
      "your reels keep me up at night",
      "saving every post for inspiration",
      "newsletter twice every Sunday",
      // questions
      "when's the next drop?",
      "is the espresso back yet?",
      "do you do custom orders?",
      "any referral discount?",
      "do you ever do trunk shows?",
      // family/friends mentions
      "ordering for my mother — she's smitten",
      "my husband won't stop talking about it",
      "sister sent me your post",
      "telling everyone at work today",
      "bought one for my boss — winner",
      // restock asks
      "let me know the second it's back",
      "would set an alarm for the next drop",
      "I check every Monday",
      // gifts
      "any gift-wrap option?",
      "perfect Diwali present, thank you",
      "anniversary present sorted",
      // collabs & b2b
      "open to brand collabs?",
      "any B2B program?",
      "bulk pricing available?",
      // personal stories
      "Sunday morning ritual",
      "the only thing on my desk that brings joy",
      "lurked for months, finally ordering",
      "saw your founder on a podcast — bought immediately",
      "third order this month, no regrets",
      // location-flavoured
      "any London pop-up planned?",
      "would order from Dubai if you'd ship",
      "Chennai represents",
      "any chance of a Goa stockist?",
      "saw your story from Pondy and ran",
      // surprise / delight
      "obsessed",
      "made my month",
      "feeling spoilt",
      "y'all can do no wrong",
      "didn't think anything could be this good",
      // service
      "your service is unreal",
      "replied in 12 seconds — wild",
      "first brand to fix it without arguing",
      // aesthetic
      "colour exactly as advertised",
      "the typography on the label alone",
      "every detail feels considered",
      "love what you've done with the rebrand",
      // casual / formal mix
      "lol the new ad is gold",
      "y'all are crushing it",
      "no notes",
      "Excellent product. Will recommend.",
      "Outstanding quality for the price.",
      // misc
      "honestly the best",
      "saved the post for later",
      "any behind-the-scenes content coming?",
      "you nailed it",
      "what's your secret?",
      "tell whoever wrote that — thank you",
      "I keep coming back",
      "the consistency is what gets me",
      "subscribed forever",
    ];

    // Categorical reply generator — no fake handles. Outputs lines like
    // "→ Replied to ig_comment in 6 secs" or "→ Hearted ig_story_reply
    // immediately". Each category has its own verb pool so the verb
    // always pairs naturally with the target (you "Like" a comment but
    // you "Answer" a DM, etc.). Weighted distribution favours comments,
    // which is what most real ops feeds look like.
    const REPLY_CATEGORIES = {
      comment: {
        targets: ['ig_comment', 'ig_reel_comment', 'fb_comment', 'li_comment', 'yt_comment', 'tt_comment', 'x_reply', 'threads_reply'],
        verbs:   ['Replied to', 'Liked', 'Hearted', 'Reacted to', 'Answered', 'Responded to'],
      },
      dm: {
        targets: ['ig_dm', 'fb_dm', 'li_dm', 'x_dm', 'tt_dm'],
        verbs:   ['Replied to', 'Answered', 'Responded to'],
      },
      mention: {
        targets: ['ig_mention', 'x_mention', 'fb_mention', 'ig_tag', 'x_tag'],
        verbs:   ['Acknowledged', 'Followed back on', 'Replied to', 'Liked', 'Reacted to'],
      },
      story: {
        targets: ['ig_story_reply', 'ig_story_reaction', 'fb_story_reply'],
        verbs:   ['Replied to', 'Reacted to', 'Hearted'],
      },
    };
    // Cumulative weights — pick a category, then pick verb + target.
    const REPLY_WEIGHTS = [
      ['comment', 0.55],
      ['dm',      0.80],   // 0.55 + 0.25
      ['mention', 0.92],   // 0.80 + 0.12
      ['story',   1.00],   // 0.92 + 0.08
    ];
    const REPLY_TIMES_TXT = [
      'in 1 sec', 'in 2 secs', 'in 3 secs', 'in 4 secs', 'in 5 secs',
      'in 6 secs', 'in 7 secs', 'in 8 secs', 'in 11 secs', 'in 14 secs',
      'in 17 secs', 'in 22 secs', 'in 31 secs', 'in under a second', 'immediately',
    ];
    function makeReply () {
      const r = Math.random();
      let key = 'comment';
      for (const [k, cum] of REPLY_WEIGHTS) { if (r < cum) { key = k; break; } }
      const cfg  = REPLY_CATEGORIES[key];
      const verb = cfg.verbs[Math.floor(Math.random() * cfg.verbs.length)];
      const tgt  = cfg.targets[Math.floor(Math.random() * cfg.targets.length)];
      const tm   = REPLY_TIMES_TXT[Math.floor(Math.random() * REPLY_TIMES_TXT.length)];
      return '→ ' + verb + ' ' + tgt + ' ' + tm;
    }

    // 5 lanes covering the feed area; round-robin with a small skip
    // so we don't stack two whispers in the same band back-to-back.
    const LANES = [10, 28, 46, 64, 82];
    let laneCursor = 0;
    function nextLane () {
      laneCursor = (laneCursor + 1 + Math.floor(Math.random() * 2)) % LANES.length;
      return LANES[laneCursor] + (Math.random() * 6 - 3);
    }

    // Recency rings — whispers never repeat until 15 others have cycled
    // past; full reply strings never repeat until 8 others have.
    const recentWhispers = [];
    const recentReplies  = [];
    function pickFresh (pool, recent, keepLast) {
      let attempts = 0, item;
      do {
        item = pool[Math.floor(Math.random() * pool.length)];
        attempts++;
      } while (recent.indexOf(item) !== -1 && attempts < 12);
      recent.push(item);
      if (recent.length > keepLast) recent.shift();
      return item;
    }
    function freshReply () {
      let attempts = 0, r;
      do { r = makeReply(); attempts++; }
      while (recentReplies.indexOf(r) !== -1 && attempts < 10);
      recentReplies.push(r);
      if (recentReplies.length > 8) recentReplies.shift();
      return r;
    }

    const MAX_VISIBLE = 5;
    let running = false;
    let spawnTimer = null;

    function spawnOne () {
      if (stage.children.length >= MAX_VISIBLE) return;
      const el = document.createElement('div');
      const roll = Math.random();
      let cls = 'social-whisper';
      let text;

      // Per-tier animation durations create parallax depth: far whispers
      // drift SLOWLY (look further away), near whispers drift FASTER
      // (look closer). Same horizontal distance, different speeds.
      let dur;
      if (roll < 0.16) {
        cls += ' social-whisper--reply';      // near tier, sharp
        text = freshReply();
        dur = 13 + Math.random() * 3;          // near
      } else if (roll < 0.50) {
        cls += ' social-whisper--far';
        text = '"' + pickFresh(WHISPERS, recentWhispers, 15) + '"';
        dur = 22 + Math.random() * 6;          // far — slow
      } else if (roll < 0.82) {
        cls += ' social-whisper--mid';
        text = '"' + pickFresh(WHISPERS, recentWhispers, 15) + '"';
        dur = 17 + Math.random() * 4;          // mid
      } else {
        cls += ' social-whisper--near';
        text = '"' + pickFresh(WHISPERS, recentWhispers, 15) + '"';
        dur = 13 + Math.random() * 3;          // near — fast
      }
      el.className = cls;
      el.textContent = text;
      el.style.top = nextLane() + '%';
      el.style.animationDuration = dur + 's';
      stage.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }

    function loop () {
      if (!running) return;
      spawnOne();
      spawnTimer = setTimeout(loop, 1400 + Math.random() * 1300);
    }
    function start () {
      if (running) return;
      running = true;
      for (let i = 0; i < 2; i++) spawnOne();   // pre-seed
      spawnTimer = setTimeout(loop, 600);
    }
    function stop () {
      running = false;
      if (spawnTimer) { clearTimeout(spawnTimer); spawnTimer = null; }
    }

    // Only spawn while the card is on screen. Saves cycles when the
    // user is on the hero or scroll-jacked horizontal section.
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => e.isIntersecting ? start() : stop());
      }, { threshold: 0.05 });
      io.observe(stage);
    } else {
      start();
    }
  })();

  /* ── CARD 05 — Rotating type-specimen carousel ──────────────
     Five SMB hero specimens, each in its own typographic
     register and palette, cycling every ~4.2s. Dots adapt
     colour to whichever specimen background is currently
     active (light cream specimens get dark dots, dark
     specimens get light dots). Gated by IntersectionObserver
     so it doesn't burn cycles when card 05 isn't visible. */
  (function initWebsiteCardSpecimens () {
    const stage = document.querySelector('[data-card-specimens]');
    if (!stage) return;
    const specimens = stage.querySelectorAll('.specimen');
    const dots = stage.querySelectorAll('.specimen-dot');
    if (!specimens.length) return;

    let i = 0;
    let timer = null;

    function adjustDots () {
      const active = specimens[i];
      if (!active) return;
      const bg = window.getComputedStyle(active).backgroundColor || '';
      // Heuristic: any of our cream/light specimens contain rgb
      // values in the 200+ range. If so use dark dots, otherwise
      // light dots.
      const m = bg.match(/\d+/g);
      let isLight = false;
      if (m && m.length >= 3) {
        const lum = (parseInt(m[0]) * 0.299 + parseInt(m[1]) * 0.587 + parseInt(m[2]) * 0.114);
        isLight = lum > 160;
      }
      dots.forEach(function (d, idx) {
        const on = idx === i;
        if (isLight) {
          d.style.background = on ? 'rgba(20, 14, 8, 0.62)' : 'rgba(20, 14, 8, 0.18)';
        } else {
          d.style.background = on ? 'rgba(255, 255, 255, 0.82)' : 'rgba(255, 255, 255, 0.22)';
        }
      });
    }

    function tick () {
      specimens.forEach(function (s, idx) { s.classList.toggle('is-on', idx === i); });
      dots.forEach(function (d, idx) { d.classList.toggle('is-on', idx === i); });
      adjustDots();
      i = (i + 1) % specimens.length;
    }

    function start () {
      if (timer) return;
      tick();
      timer = setInterval(tick, 4200);
    }
    function stop () {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0.05 });
      io.observe(stage);
    } else {
      start();
    }
  })();

  /* ── PIXEL DISSOLVE (card 04 front face: AI Changing Room) ─
     12×16 grid that cycles through six garment silhouettes —
     pants → t-shirt → dress → bag → jacket → sneaker. Each
     shape emerges from noise via a per-pixel threshold (stable
     pseudo-random per (x,y)), holds, then dissolves into the
     next. Mirrors what the live product at fit.mittiva.io
     actually does: render a figure pixel-by-pixel from an AI
     model. IntersectionObserver gates so the rAF loop pauses
     when the card is off-screen. */
  (function initPixelDissolve () {
    const grid = document.querySelector('[data-pixel-grid]');
    if (!grid) return;
    const nameEl  = document.querySelector('[data-pixel-name]');
    const countEl = document.querySelector('[data-pixel-count]');

    const GARMENTS = [
      { name: 'pants', shape: [
        '............',
        '............',
        '...OOOOOO...',
        '...OOOOOO...',
        '...OOOOOO...',
        '..OOOOOOOO..',
        '..OO....OO..',
        '..OO....OO..',
        '..OO....OO..',
        '..OO....OO..',
        '..OO....OO..',
        '..OO....OO..',
        '..OO....OO..',
        '..OO....OO..',
        '............',
        '............'
      ]},
      { name: 't-shirt', shape: [
        '............',
        '............',
        '.OO......OO.',
        '.OOO....OOO.',
        'OOOOO..OOOOO',
        'OOOOOOOOOOOO',
        '.OOOOOOOOOO.',
        '.OOOOOOOOOO.',
        '..OOOOOOOO..',
        '..OOOOOOOO..',
        '..OOOOOOOO..',
        '..OOOOOOOO..',
        '..OOOOOOOO..',
        '..OOOOOOOO..',
        '............',
        '............'
      ]},
      { name: 'dress', shape: [
        '............',
        '............',
        '....OOOO....',
        '....OOOO....',
        '...OOOOOO...',
        '..OOOOOOOO..',
        '..OOOOOOOO..',
        '.OOOOOOOOOO.',
        '.OOOOOOOOOO.',
        '.OOOOOOOOOO.',
        'OOOOOOOOOOOO',
        'OOOOOOOOOOOO',
        'OOOOOOOOOOOO',
        'OOOOOOOOOOOO',
        '............',
        '............'
      ]},
      { name: 'bag', shape: [
        '............',
        '....OOOO....',
        '...OO..OO...',
        '..OO....OO..',
        '..OO....OO..',
        '.OOOOOOOOOO.',
        '.OOOOOOOOOO.',
        '.OOOOOOOOOO.',
        '.OOOOOOOOOO.',
        '.OOOOOOOOOO.',
        '.OOOOOOOOOO.',
        '.OOOOOOOOOO.',
        '.OOOOOOOOOO.',
        '.OOOOOOOOOO.',
        '............',
        '............'
      ]},
      { name: 'jacket', shape: [
        '............',
        '............',
        '.OO......OO.',
        '.OOO....OOO.',
        'OOOO.OO.OOOO',
        'OOOOO..OOOOO',
        '.OOOO..OOOO.',
        '.OOOO..OOOO.',
        '.OOOO..OOOO.',
        '.OOOO..OOOO.',
        '.OOOO..OOOO.',
        '.OOOO..OOOO.',
        '.OOOO..OOOO.',
        '.OOOO..OOOO.',
        '............',
        '............'
      ]},
      { name: 'sneaker', shape: [
        '............',
        '............',
        '............',
        '............',
        '............',
        '............',
        '..OOOO......',
        '.OOOOOOOO...',
        'OOOOOOOOOO..',
        'OOOOOOOOOOOO',
        '.OOOOOOOOOO.',
        '.OOOOOOOOOO.',
        '..O.OO.OO.O.',
        '............',
        '............',
        '............'
      ]}
    ];

    const W = 12, H = 16;
    const cells = new Array(W * H);
    const noise = new Array(W * H);
    // Stable per-pixel pseudo-random in [0, 1)
    for (let i = 0; i < W * H; i++) {
      const x = i % W, y = (i / W) | 0;
      const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      noise[i] = s - Math.floor(s);
    }
    // Build cells once
    const frag = document.createDocumentFragment();
    for (let i = 0; i < W * H; i++) {
      const d = document.createElement('div');
      d.className = 'px';
      cells[i] = d;
      frag.appendChild(d);
    }
    grid.appendChild(frag);

    const HOLD = 2200;          // ms — time held on current shape
    const TRANS = 900;           // ms — dissolve transition
    const CYCLE = HOLD + TRANS;
    const TOTAL = GARMENTS.length * CYCLE;

    let running = false;
    let rafId = null;
    let lastIdx = -1;
    let startedAt = 0;
    let accumulated = 0;

    function paint (cell, on, x, y) {
      let cls = 'px';
      if (on) {
        const p = (x + y) % 3;
        cls = (p === 0) ? 'px on-bright' : (p === 1) ? 'px on-mid' : 'px on-dim';
      }
      if (cell.className !== cls) cell.className = cls;
    }

    function frame (now) {
      const t = (accumulated + (now - startedAt)) % TOTAL;
      const idx = Math.floor(t / CYCLE);
      const subT = t % CYCLE;
      const cur = GARMENTS[idx];
      const nxt = GARMENTS[(idx + 1) % GARMENTS.length];

      if (idx !== lastIdx) {
        if (nameEl) nameEl.textContent = cur.name;
        if (countEl) {
          const n = idx + 1;
          countEl.textContent = (n < 10 ? '0' : '') + n;
        }
        lastIdx = idx;
      }

      for (let y = 0; y < H; y++) {
        const rowC = cur.shape[y];
        const rowN = nxt.shape[y];
        for (let x = 0; x < W; x++) {
          const i = y * W + x;
          const inC = rowC.charCodeAt(x) === 79; // 'O' === 79
          const inN = rowN.charCodeAt(x) === 79;
          let on;
          if (subT < HOLD) {
            on = inC;
          } else {
            const p = (subT - HOLD) / TRANS;
            const nz = noise[i];
            if (inC && !inN) on = p < nz;
            else if (!inC && inN) on = p > (1 - nz);
            else on = inC;
          }
          paint(cells[i], on, x, y);
        }
      }

      if (running) rafId = requestAnimationFrame(frame);
    }

    function start () {
      if (running) return;
      running = true;
      startedAt = performance.now();
      rafId = requestAnimationFrame(frame);
    }
    function stop () {
      if (!running) return;
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      // Preserve where we were so resume is seamless.
      accumulated = (accumulated + (performance.now() - startedAt)) % TOTAL;
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0.05 });
      io.observe(grid);
    } else {
      start();
    }
  })();

  /* ── CRM KANBAN (card 08 front face) ───────────────────────
     Live pipeline simulation. Three columns: NEW · WARM · WON.
     Cards spawn in NEW, move across to WARM, then to WON, then
     fade out. Each column caps at 3 visible — old cards drop
     off the bottom (set is-on=false + opacity fade). Header
     counts are cumulative — WON only ever climbs. Revenue ticker
     in the footer ticks up whenever a card reaches WON.
     Gated by IntersectionObserver so it pauses off-screen and
     the deck back-face never burns cycles. */
  (function initCrmKanban () {
    const kanban = document.querySelector('[data-card-kanban]');
    if (!kanban) return;

    const stacks = {
      new:  kanban.querySelector('[data-stack="new"]'),
      warm: kanban.querySelector('[data-stack="warm"]'),
      won:  kanban.querySelector('[data-stack="won"]')
    };
    if (!stacks.new || !stacks.warm || !stacks.won) return;

    const countNodes = {
      new:  kanban.querySelector('.crm-kanban__col--new  [data-count]'),
      warm: kanban.querySelector('.crm-kanban__col--warm [data-count]'),
      won:  kanban.querySelector('.crm-kanban__col--won  [data-count]')
    };
    const revNode = document.querySelector('[data-rev]');

    // Realistic Indian SMB deal pool — names + initials + value bands
    const pool = [
      { name: 'Pondi Textiles', initials: 'PT', value: 42000 },
      { name: 'Mylapore Chai',  initials: 'MC', value: 18500 },
      { name: 'Javeri Tubes',   initials: 'JT', value: 96000 },
      { name: 'Kochi Spices',   initials: 'KS', value: 31000 },
      { name: 'Nadar Logistics',initials: 'NL', value: 67500 },
      { name: 'Saraswati Press',initials: 'SP', value: 24000 },
      { name: 'Tirupur Knits',  initials: 'TK', value: 88000 },
      { name: 'Adyar Dental',   initials: 'AD', value: 36500 },
      { name: 'Begum Bakery',   initials: 'BB', value: 15500 },
      { name: 'Hosur Hardware', initials: 'HH', value: 52000 },
      { name: 'Anna Auto Parts',initials: 'AA', value: 41500 },
      { name: 'Trichy Tiles',   initials: 'TT', value: 73000 },
      { name: 'Velachery Vet',  initials: 'VV', value: 22500 },
      { name: 'Madurai Mango',  initials: 'MM', value: 28000 },
      { name: 'Coorg Coffee',   initials: 'CC', value: 47000 },
      { name: 'Royapettah RX',  initials: 'RX', value: 33500 }
    ];
    const avatarPalette = [
      '#5a7a9a', '#ef9f27', '#1d9e75', '#a59cff',
      '#d97757', '#4a8bdb', '#b86bb8', '#6ba66b'
    ];

    const MAX_PER_COL = 3;
    const STEP_Y = 32;          // vertical spacing between cards in a column
    const SLIDE_OFF = 60;       // px to slide off the edge when entering/leaving
    let totalWon = 34;          // seed value from HTML
    let totalRev = 482000;      // seed ₹4,82,000
    let counts = { new: 4, warm: 7, won: 34 };
    let timer = null;
    let running = false;
    let stepIdx = 0;

    function fmtRupee (n) {
      // Indian number format: 4,82,000
      const s = String(n);
      if (s.length <= 3) return '₹' + s;
      const last3 = s.slice(-3);
      const rest = s.slice(0, -3);
      const withCommas = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
      return '₹' + withCommas + ',' + last3;
    }

    function pickDeal () {
      return pool[Math.floor(Math.random() * pool.length)];
    }

    function pickAv () {
      return avatarPalette[Math.floor(Math.random() * avatarPalette.length)];
    }

    function makeCard (deal, color) {
      const card = document.createElement('div');
      card.className = 'crm-card';
      card.innerHTML =
        '<div class="crm-card__avatar" style="--av-bg:' + color + '">' + deal.initials +
        '<span class="crm-card__check" aria-hidden="true"></span></div>' +
        '<div class="crm-card__name">' + deal.name + '</div>' +
        '<div class="crm-card__value">' + fmtRupee(deal.value) + '</div>';
      card.dataset.deal = deal.name;
      card.dataset.value = String(deal.value);
      card.dataset.color = color;
      return card;
    }

    function bump (node) {
      if (!node) return;
      node.classList.remove('is-bump');
      // Force reflow to restart the animation
      void node.offsetWidth;
      node.classList.add('is-bump');
      setTimeout(function () { node.classList.remove('is-bump'); }, 300);
    }

    function refreshCounts () {
      if (countNodes.new)  countNodes.new.textContent  = counts.new;
      if (countNodes.warm) countNodes.warm.textContent = counts.warm;
      if (countNodes.won)  countNodes.won.textContent  = counts.won;
    }

    // Place cards within a stack using --cy, fading older ones.
    function reflow (col) {
      const stack = stacks[col];
      const cards = Array.from(stack.querySelectorAll('.crm-card'));
      // Newest first (last appended is index 0 visually)
      cards.reverse();
      cards.forEach(function (c, i) {
        if (i >= MAX_PER_COL) {
          // Push out and fade
          c.style.setProperty('--cy', (i * STEP_Y) + 'px');
          c.style.opacity = '0';
          c.classList.remove('is-on');
          setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 600);
        } else {
          c.style.setProperty('--cy', (i * STEP_Y) + 'px');
          c.style.setProperty('--cx', '0px');
          // Older cards in the column fade slightly
          c.style.opacity = String(1 - (i * 0.20));
          c.classList.add('is-on');
        }
      });
    }

    function spawnNew () {
      const deal = pickDeal();
      const color = pickAv();
      const card = makeCard(deal, color);
      card.style.setProperty('--cx', (-SLIDE_OFF) + 'px');
      card.style.setProperty('--cy', '0px');
      stacks.new.appendChild(card);
      // next frame, trigger slide-in
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          card.classList.add('is-on');
          reflow('new');
        });
      });
      counts.new += 1;
      refreshCounts();
      bump(countNodes.new);
    }

    function moveFirstAcross (fromCol, toCol) {
      const stack = stacks[fromCol];
      // The oldest visible card is the FIRST child (since we
      // append newest at end). Take the first in DOM order.
      const card = stack.querySelector('.crm-card.is-on');
      if (!card) return false;

      // Slide it out to the right edge of its current column
      card.style.setProperty('--cx', SLIDE_OFF + 'px');
      card.style.opacity = '0';

      setTimeout(function () {
        if (card.parentNode) card.parentNode.removeChild(card);
        // Re-create in destination so it slides in from the left
        const deal = { name: card.dataset.deal, value: parseInt(card.dataset.value, 10), initials: card.querySelector('.crm-card__avatar').textContent.trim().slice(0, 2) };
        const color = card.dataset.color;
        const incoming = makeCard(deal, color);
        if (toCol === 'won') incoming.classList.add('crm-card--won');
        incoming.style.setProperty('--cx', (-SLIDE_OFF) + 'px');
        incoming.style.setProperty('--cy', '0px');
        stacks[toCol].appendChild(incoming);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            incoming.classList.add('is-on');
            if (toCol === 'won') {
              // small delay before the green check pops in
              setTimeout(function () { incoming.classList.add('is-won'); }, 180);
            }
            reflow(toCol);
          });
        });
        reflow(fromCol);
        // Update counts: source decreases, destination increases
        if (fromCol === 'new')  counts.new  = Math.max(0, counts.new - 1);
        if (fromCol === 'warm') counts.warm = Math.max(0, counts.warm - 1);
        if (toCol === 'warm') {
          counts.warm += 1;
          bump(countNodes.warm);
        }
        if (toCol === 'won') {
          counts.won += 1;
          totalWon += 1;
          totalRev += deal.value;
          bump(countNodes.won);
          if (revNode) {
            revNode.textContent = fmtRupee(totalRev);
            bump(revNode);
          }
        }
        refreshCounts();
      }, 380);
      return true;
    }

    // Seed each column with a few baseline cards so the pipeline
    // doesn't start empty — the visitor sees a live system, not
    // a blank canvas.
    function seed () {
      // Clear any leftovers
      Object.values(stacks).forEach(function (s) { s.innerHTML = ''; });
      function seedCol (col, n) {
        for (let i = 0; i < n; i++) {
          const card = makeCard(pickDeal(), pickAv());
          if (col === 'won') {
            card.classList.add('crm-card--won', 'is-won');
          }
          card.style.setProperty('--cy', (i * STEP_Y) + 'px');
          card.style.setProperty('--cx', '0px');
          card.style.opacity = String(1 - (i * 0.20));
          card.classList.add('is-on');
          stacks[col].appendChild(card);
        }
      }
      seedCol('new',  2);
      seedCol('warm', 3);
      seedCol('won',  3);
    }

    /* The simulation runs as a sequence of beats. Each beat we
       pick one of three actions weighted toward forward motion:
         · spawn a new deal (NEW gets a fresh card)
         · promote oldest NEW → WARM
         · promote oldest WARM → WON
       Rough cadence: every 2.6s a beat fires. */
    function beat () {
      stepIdx += 1;
      // Cycle through the 3 actions in a slightly randomised order
      // so the pipeline feels alive, not metronomic.
      const r = Math.random();
      if (r < 0.36) {
        spawnNew();
      } else if (r < 0.70) {
        if (!moveFirstAcross('new', 'warm')) spawnNew();
      } else {
        if (!moveFirstAcross('warm', 'won')) {
          if (!moveFirstAcross('new', 'warm')) spawnNew();
        }
      }
    }

    function start () {
      if (running) return;
      running = true;
      if (!stacks.new.children.length) seed();
      // first beat after a brief settle so the seed renders cleanly
      timer = setInterval(beat, 2600);
    }
    function stop () {
      running = false;
      if (timer) { clearInterval(timer); timer = null; }
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0.05 });
      io.observe(kanban);
    } else {
      start();
    }
  })();

  /* ── AUTOMATIONS BRIDGE ────────────────────────────────────
     Fully meshed graph of 13 nodes (3 cores: Mittiva CRM, AI,
     Meta + 10 deck nodes) drawn in the silhouette of a
     suspension bridge. Mounts into ANY element with
     [data-card-bridge] (card 07 inline) or
     [data-hero-bridge] (full-bleed on automations.html).
     Same SVG builder, different scale. IntersectionObserver
     gates pulse spawning so we don't burn cycles off-screen.
     Signal pulses route through varied combinations of the
     three cores — single, dual, triple, or none. */
  function buildBridge (mount, opts) {
    if (!mount) return null;
    const ns = 'http://www.w3.org/2000/svg';
    const cfg = Object.assign({
      maxPulses: 14,
      spawnMin: 120,
      spawnMax: 300,
      labelsOnDeck: true,
      labelSize: 10
    }, opts || {});

    const nodes = {
      crm:      { x: 170, y: 80,  role: 'core',     label: 'Mittiva CRM' },
      meta:     { x: 510, y: 80,  role: 'core',     label: 'Meta' },
      ai:       { x: 340, y: 245, role: 'core',     label: 'AI' },
      slack:    { x: 110, y: 397, role: 'sideDeck', label: 'Slack',    color: '#639922' },
      stripe:   { x: 200, y: 397, role: 'trigger',  label: 'Stripe',   color: '#ef9f27' },
      razorpay: { x: 240, y: 397, role: 'trigger',  label: 'RazorPay', color: '#ef9f27' },
      form:     { x: 280, y: 397, role: 'trigger',  label: 'Form',     color: '#ef9f27' },
      survey:   { x: 320, y: 397, role: 'trigger',  label: 'Survey',   color: '#ef9f27' },
      calendar: { x: 360, y: 397, role: 'action',   label: 'Calendar', color: '#1d9e75' },
      whatsapp: { x: 400, y: 397, role: 'action',   label: 'WhatsApp', color: '#1d9e75' },
      dm:       { x: 440, y: 397, role: 'action',   label: 'DM',       color: '#1d9e75' },
      email:    { x: 480, y: 397, role: 'action',   label: 'Email',    color: '#1d9e75' },
      call:     { x: 570, y: 397, role: 'sideDeck', label: 'Call',     color: '#ef9f27' }
    };
    const keys = Object.keys(nodes);

    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 680 460');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('class', 'bridge-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Mittiva automations — fully meshed network of 13 nodes shaped like a suspension bridge');
    svg.style.overflow = 'visible';

    const defs = document.createElementNS(ns, 'defs');
    defs.innerHTML = ''
      + '<linearGradient id="bFadeL" x1="0" y1="0" x2="1" y2="0">'
      +   '<stop offset="0" stop-color="var(--bridge-mesh-spoke)" stop-opacity="0"/>'
      +   '<stop offset="1" stop-color="var(--bridge-mesh-spoke)" stop-opacity="0.6"/>'
      + '</linearGradient>'
      + '<linearGradient id="bFadeR" x1="0" y1="0" x2="1" y2="0">'
      +   '<stop offset="0" stop-color="var(--bridge-mesh-spoke)" stop-opacity="0.6"/>'
      +   '<stop offset="1" stop-color="var(--bridge-mesh-spoke)" stop-opacity="0"/>'
      + '</linearGradient>'
      + '<linearGradient id="bCableFadeL" x1="0" y1="0" x2="1" y2="0">'
      +   '<stop offset="0" stop-color="var(--bridge-cable)" stop-opacity="0"/>'
      +   '<stop offset="1" stop-color="var(--bridge-cable)" stop-opacity="1"/>'
      + '</linearGradient>'
      + '<linearGradient id="bCableFadeR" x1="0" y1="0" x2="1" y2="0">'
      +   '<stop offset="0" stop-color="var(--bridge-cable)" stop-opacity="1"/>'
      +   '<stop offset="1" stop-color="var(--bridge-cable)" stop-opacity="0"/>'
      + '</linearGradient>'
      + '<linearGradient id="bDeckFadeL" x1="0" y1="0" x2="1" y2="0">'
      +   '<stop offset="0" stop-color="var(--bridge-deck)" stop-opacity="0"/>'
      +   '<stop offset="1" stop-color="var(--bridge-deck)" stop-opacity="1"/>'
      + '</linearGradient>'
      + '<linearGradient id="bDeckFadeR" x1="0" y1="0" x2="1" y2="0">'
      +   '<stop offset="0" stop-color="var(--bridge-deck)" stop-opacity="1"/>'
      +   '<stop offset="1" stop-color="var(--bridge-deck)" stop-opacity="0"/>'
      + '</linearGradient>';
    svg.appendChild(defs);

    function el (tag, attrs) {
      const e = document.createElementNS(ns, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    }
    const meshLayer = el('g', { 'fill': 'none', 'stroke-linecap': 'round' });
    const extLayer  = el('g', { 'fill': 'none', 'stroke-linecap': 'round' });
    const sigLayer  = el('g', { 'fill': 'none', 'stroke': 'transparent' });
    const pulsesLayer = el('g', {});
    svg.appendChild(meshLayer);
    svg.appendChild(extLayer);

    // Cable extensions (off-frame side spans, fading)
    const extGroup = el('g', { 'fill': 'none', 'stroke-linecap': 'round' });
    extGroup.appendChild(el('path', { d: 'M -60,180 Q -10,290 30,395', stroke: 'url(#bCableFadeL)', 'stroke-width': '2.2' }));
    extGroup.appendChild(el('path', { d: 'M 650,395 Q 690,290 740,180', stroke: 'url(#bCableFadeR)', 'stroke-width': '2.2' }));
    svg.appendChild(extGroup);

    // Main cables: side span L, main span (catenary through AI), side span R
    const cables = el('g', { stroke: 'var(--bridge-cable)', 'stroke-width': '2.2', fill: 'none', 'stroke-linecap': 'round' });
    cables.appendChild(el('path', { d: 'M 30,395 Q 110,285 170,80' }));
    cables.appendChild(el('path', { d: 'M 510,80 Q 570,285 650,395' }));
    cables.appendChild(el('path', { d: 'M 170,80 Q 340,420 510,80' }));
    svg.appendChild(cables);

    // Side-span suspenders (left + right)
    const sideSusp = el('g', { stroke: 'var(--bridge-suspender)', 'stroke-width': '0.7', fill: 'none', opacity: '0.75' });
    [[55,357],[80,313],[110,250],[145,158],[535,158],[570,250],[600,313],[625,357]].forEach(([x,y]) => {
      sideSusp.appendChild(el('line', { x1: x, y1: y, x2: x, y2: 397 }));
    });
    svg.appendChild(sideSusp);

    // Main-span suspenders
    const mainSusp = el('g', { stroke: 'var(--bridge-suspender-main)', 'stroke-width': '0.6', fill: 'none', opacity: '0.75' });
    [[200,124],[240,174],[280,212],[320,234],[360,234],[400,212],[440,174],[480,124]].forEach(([x,y]) => {
      mainSusp.appendChild(el('line', { x1: x, y1: y, x2: x, y2: 397 }));
    });
    svg.appendChild(mainSusp);

    // Anchorages
    const anch = el('g', {});
    [20, 626].forEach(x => {
      anch.appendChild(el('rect', { x: x, y: 395, width: 34, height: 40, fill: 'var(--bridge-anchor)', stroke: 'var(--bridge-anchor-stroke)', 'stroke-width': '0.8', rx: '2' }));
      anch.appendChild(el('rect', { x: x + 2, y: 395, width: 30, height: 4, fill: 'var(--bridge-tower-detail)' }));
      anch.appendChild(el('line', { x1: x - 5, y1: 430, x2: x + 39, y2: 430, stroke: 'var(--bridge-tower-detail)', 'stroke-width': '2' }));
    });
    svg.appendChild(anch);

    // Towers (CRM left, Meta right)
    const towers = el('g', {});
    [170, 510].forEach(x => {
      towers.appendChild(el('line', { x1: x, y1: 80, x2: x, y2: 397, stroke: 'var(--bridge-pylon)', 'stroke-width': '2.6', 'stroke-linecap': 'round' }));
      [180, 270, 345].forEach(y => {
        towers.appendChild(el('line', { x1: x - 4, y1: y, x2: x + 4, y2: y, stroke: 'var(--bridge-tower-detail)', 'stroke-width': '2.5' }));
      });
    });
    svg.appendChild(towers);

    // Deck (extending past the frame)
    svg.appendChild(el('line', { x1: -80, y1: 397, x2: 20, y2: 397, stroke: 'url(#bDeckFadeL)', 'stroke-width': '2.4', 'stroke-linecap': 'round' }));
    svg.appendChild(el('line', { x1: 660, y1: 397, x2: 760, y2: 397, stroke: 'url(#bDeckFadeR)', 'stroke-width': '2.4', 'stroke-linecap': 'round' }));
    svg.appendChild(el('line', { x1: 20, y1: 397, x2: 660, y2: 397, stroke: 'var(--bridge-deck)', 'stroke-width': '2.4', 'stroke-linecap': 'round' }));
    svg.appendChild(el('line', { x1: -80, y1: 403, x2: 760, y2: 403, stroke: 'var(--bridge-deck-soft)', 'stroke-width': '0.8', 'stroke-linecap': 'round', opacity: '0.7' }));
    svg.appendChild(el('line', { x1: -80, y1: 408, x2: 760, y2: 408, stroke: 'var(--bridge-mesh-web)', 'stroke-width': '0.5', 'stroke-dasharray': '4 8', opacity: '0.6' }));

    svg.appendChild(pulsesLayer);

    // Cores
    const cores = el('g', {});
    const aiHalo = el('circle', { cx: 340, cy: 245, r: 26, fill: 'var(--bridge-node-bg)', stroke: '#7f77dd', 'stroke-width': '1.2', opacity: '0.35' });
    cores.appendChild(el('circle', { cx: 170, cy: 80, r: 16, fill: 'var(--bridge-node-bg)', stroke: '#ef9f27', 'stroke-width': '1.8' }));
    cores.appendChild(el('circle', { cx: 170, cy: 80, r: 6, fill: '#ef9f27' }));
    cores.appendChild(el('text', { x: 170, y: 52, 'text-anchor': 'middle', 'font-size': '11', 'font-weight': '500', fill: '#f4c875', 'letter-spacing': '0.02em', 'font-family': 'Inter, ui-sans-serif, system-ui' })).textContent = 'Mittiva CRM';
    cores.appendChild(el('circle', { cx: 510, cy: 80, r: 16, fill: 'var(--bridge-node-bg)', stroke: '#378add', 'stroke-width': '1.8' }));
    cores.appendChild(el('circle', { cx: 510, cy: 80, r: 6, fill: '#378add' }));
    cores.appendChild(el('text', { x: 510, y: 52, 'text-anchor': 'middle', 'font-size': '11', 'font-weight': '500', fill: '#a4cbf2', 'letter-spacing': '0.02em', 'font-family': 'Inter, ui-sans-serif, system-ui' })).textContent = 'Meta';
    cores.appendChild(aiHalo);
    cores.appendChild(el('circle', { cx: 340, cy: 245, r: 16, fill: 'var(--bridge-node-bg)', stroke: '#a59cff', 'stroke-width': '1.6' }));
    cores.appendChild(el('circle', { cx: 340, cy: 245, r: 5, fill: '#a59cff' }));
    cores.appendChild(el('text', { x: 340, y: 218, 'text-anchor': 'middle', 'font-size': '11', 'font-weight': '500', fill: '#cfc7ff', 'letter-spacing': '0.02em', 'font-family': 'Inter, ui-sans-serif, system-ui' })).textContent = 'AI';
    svg.appendChild(cores);

    // Deck nodes (labels go below the node)
    const deck = el('g', {});
    ['slack','stripe','razorpay','form','survey','calendar','whatsapp','dm','email','call'].forEach(k => {
      const n = nodes[k];
      const g = el('g', { transform: 'translate(' + n.x + ',' + n.y + ')' });
      g.appendChild(el('circle', { r: 7, fill: 'var(--bridge-node-bg)', stroke: n.color, 'stroke-width': '1.4' }));
      if (cfg.labelsOnDeck) {
        const t = el('text', { y: 22, 'text-anchor': 'middle', 'font-size': cfg.labelSize, fill: 'var(--bridge-text)', 'font-family': 'Inter, ui-sans-serif, system-ui' });
        t.textContent = n.label;
        g.appendChild(t);
      }
      deck.appendChild(g);
    });
    svg.appendChild(deck);
    svg.appendChild(sigLayer);

    // ── Build the 78-edge mesh
    function classify (a, b) {
      const A = nodes[a], B = nodes[b];
      const cs = { crm: 1, meta: 1, ai: 1 };
      if (cs[a] && cs[b]) return 'frame';
      if (cs[a] || cs[b]) return 'spoke';
      const deckLike = r => r === 'trigger' || r === 'action' || r === 'sideDeck';
      if (deckLike(A.role) && deckLike(B.role)) {
        return Math.abs(A.x - B.x) < 70 ? 'deck' : 'crossweb';
      }
      return 'crossweb';
    }
    const styles = {
      frame:    { stroke: 'var(--bridge-mesh-frame)', width: 1.4, opacity: 0.55 },
      spoke:    { stroke: 'var(--bridge-mesh-spoke)', width: 0.7, opacity: 0.42 },
      deck:     { stroke: 'var(--bridge-mesh-deck)',  width: 0.6, opacity: 0.50 },
      crossweb: { stroke: 'var(--bridge-mesh-web)',   width: 0.35, opacity: 0.32 }
    };
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const a = keys[i], b = keys[j], s = styles[classify(a, b)];
        meshLayer.appendChild(el('line', {
          x1: nodes[a].x, y1: nodes[a].y,
          x2: nodes[b].x, y2: nodes[b].y,
          stroke: s.stroke, 'stroke-width': s.width, opacity: s.opacity
        }));
      }
    }

    // ── Continuation rays leaving the frame
    const extensions = [
      ['crm',-80,30],['crm',-80,120],['ai',-80,245],['ai',-80,360],
      ['slack',-80,397],['slack',-80,320],['stripe',-80,430],
      ['meta',760,30],['meta',760,120],['ai',760,245],['ai',760,360],
      ['call',760,397],['call',760,320],['email',760,430]
    ];
    extensions.forEach(([from, x, y]) => {
      const n = nodes[from];
      extLayer.appendChild(el('line', {
        x1: n.x, y1: n.y, x2: x, y2: y,
        stroke: x < 0 ? 'url(#bFadeL)' : 'url(#bFadeR)',
        'stroke-width': '0.6'
      }));
    });

    // ── Routes (varied routing through cores)
    const COL = {
      crm: '#ef9f27', ai: '#a59cff', meta: '#378add',
      crm_ai: '#f0997b', crm_meta: '#c0dd97', ai_meta: '#9fe1cb',
      all: '#e8e6df', direct: '#5a6b85'
    };
    const variants = [
      { cores: ['crm'],             color: COL.crm,      w: 3 },
      { cores: ['ai'],              color: COL.ai,       w: 3 },
      { cores: ['meta'],            color: COL.meta,     w: 3 },
      { cores: ['crm','ai'],        color: COL.crm_ai,   w: 2 },
      { cores: ['ai','meta'],       color: COL.ai_meta,  w: 2 },
      { cores: ['crm','meta'],      color: COL.crm_meta, w: 2 },
      { cores: ['meta','ai'],       color: COL.ai_meta,  w: 1 },
      { cores: ['meta','crm'],      color: COL.crm_meta, w: 1 },
      { cores: ['ai','crm'],        color: COL.crm_ai,   w: 1 },
      { cores: ['crm','ai','meta'], color: COL.all,      w: 1 },
      { cores: ['meta','ai','crm'], color: COL.all,      w: 1 },
      { cores: ['crm','meta','ai'], color: COL.all,      w: 1 },
      { cores: [],                  color: COL.direct,   w: 1 }
    ];
    const triggers = ['stripe','razorpay','form','survey'];
    const actions  = ['calendar','whatsapp','dm','email'];
    const sources  = ['slack'].concat(triggers);
    const sinks    = actions.concat(['call']);
    const routes = [];
    sources.forEach(src => {
      sinks.forEach(snk => {
        if (src === snk) return;
        variants.forEach(v => {
          const seq = [src].concat(v.cores, [snk]);
          const d = 'M ' + seq.map(k => nodes[k].x + ',' + nodes[k].y).join(' L ');
          routes.push({ d: d, color: v.color, dur: 1500 + Math.random() * 1600, w: v.w });
        });
      });
    });
    // Core-to-core shorts
    [['crm','ai',COL.ai,700],['ai','meta',COL.ai,700],
     ['crm','meta',COL.crm_meta,1100],['ai','crm',COL.crm,700],
     ['meta','ai',COL.meta,700]].forEach(([a,b,c,d]) => {
      routes.push({ d: 'M ' + nodes[a].x + ',' + nodes[a].y + ' L ' + nodes[b].x + ',' + nodes[b].y, color: c, dur: d, w: 2 });
    });
    routes.forEach((r, i) => {
      const p = el('path', { d: r.d });
      sigLayer.appendChild(p);
      r.path = p;
    });
    const pool = [];
    routes.forEach(r => { for (let i = 0; i < r.w; i++) pool.push(r); });

    function pulse (route) {
      const path = route.path;
      const L = path.getTotalLength();
      const head = el('circle', { r: 2.8, fill: route.color });
      const glow = el('circle', { r: 6, fill: route.color, opacity: 0.22 });
      const tail = el('circle', { r: 1.8, fill: route.color, opacity: 0.4 });
      pulsesLayer.appendChild(head);
      pulsesLayer.appendChild(glow);
      pulsesLayer.appendChild(tail);
      const start = performance.now();
      function step (now) {
        const t = Math.min(1, (now - start) / route.dur);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const hp = path.getPointAtLength(L * e);
        const tp = path.getPointAtLength(L * Math.max(0, e - 0.05));
        head.setAttribute('cx', hp.x); head.setAttribute('cy', hp.y);
        glow.setAttribute('cx', hp.x); glow.setAttribute('cy', hp.y);
        tail.setAttribute('cx', tp.x); tail.setAttribute('cy', tp.y);
        const fade = t > 0.9 ? (1 - (t - 0.9) / 0.1) : 1;
        head.setAttribute('opacity', fade);
        glow.setAttribute('opacity', String(0.22 * fade));
        tail.setAttribute('opacity', String(0.4 * fade));
        if (t < 1 && running) requestAnimationFrame(step);
        else { head.remove(); glow.remove(); tail.remove(); }
      }
      requestAnimationFrame(step);
    }

    let active = 0;
    let running = false;
    let spawnTimer = null;
    let haloPhase = 0;
    let haloTimer = null;
    function tick () {
      if (!running) return;
      while (active < cfg.maxPulses) {
        const r = pool[Math.floor(Math.random() * pool.length)];
        active++;
        pulse(r);
        setTimeout(() => active--, r.dur);
      }
      spawnTimer = setTimeout(tick, cfg.spawnMin + Math.random() * (cfg.spawnMax - cfg.spawnMin));
    }
    function start () {
      if (running) return;
      running = true;
      tick();
      haloTimer = setInterval(() => {
        haloPhase += 0.045;
        aiHalo.setAttribute('opacity', String(0.28 + Math.sin(haloPhase) * 0.16));
      }, 60);
    }
    function stop () {
      running = false;
      if (spawnTimer) { clearTimeout(spawnTimer); spawnTimer = null; }
      if (haloTimer)  { clearInterval(haloTimer); haloTimer = null; }
    }

    mount.appendChild(svg);
    return { svg: svg, start: start, stop: stop };
  }

  // Wire up card 07 inline bridge (gated by IntersectionObserver)
  (function initAutomationsCardBridge () {
    const mount = document.querySelector('[data-card-bridge]');
    if (!mount) return;
    const bridge = buildBridge(mount, { maxPulses: 10, spawnMin: 180, spawnMax: 360, labelSize: 9 });
    if (!bridge) return;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => e.isIntersecting ? bridge.start() : bridge.stop());
      }, { threshold: 0.05 });
      io.observe(mount);
    } else {
      bridge.start();
    }
  })();

  // Wire up automations.html full-bleed hero bridge
  (function initAutomationsHeroBridge () {
    const mount = document.querySelector('[data-hero-bridge]');
    if (!mount) return;
    const bridge = buildBridge(mount, { maxPulses: 16, spawnMin: 100, spawnMax: 240, labelSize: 11 });
    if (!bridge) return;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => e.isIntersecting ? bridge.start() : bridge.stop());
      }, { threshold: 0.02 });
      io.observe(mount);
    } else {
      bridge.start();
    }
  })();


  /* ── (retired) VENOM BIND placeholder — initial venom-button
     transition has been retired; card 05 now uses a clean anchor link to websites.html.
     The remaining .venom-page CSS class is still in use on
     websites.html for layout/typography, but the .venom-btn,
     .venom-overlay, .venom-cursor styles are dead code that can
     be cleaned up in a future pass. */
  (function initVenomBind_retired () {
    const btn = document.querySelector('[data-venom-bind]');
    if (!btn) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let busy = false;

    function makeSymbioteCursor () {
      const cur = document.createElement('div');
      cur.className = 'venom-cursor';
      cur.innerHTML = ''
        + '<svg viewBox="0 0 22 22" style="width:100%; height:100%; overflow:visible;">'
        +   '<path d="M 11,2 L 16,11 L 11,20 L 6,11 Z" fill="#000" stroke="#b8b0e8" stroke-width="0.8"/>'
        +   '<path d="M 11,4 L 13,11 L 11,18 L 9,11 Z" fill="#1a0e26"/>'
        +   '<circle cx="11" cy="11" r="1.4" fill="#b8b0e8"/>'
        +   '<path d="M 11,11 Q 11,18 7,24 Q 5,28 8,32" stroke="#000" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.7"/>'
        +   '<path d="M 11,11 Q 13,18 17,22" stroke="#000" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.45"/>'
        + '</svg>';
      document.body.appendChild(cur);

      function move (e) {
        cur.style.left = e.clientX + 'px';
        cur.style.top = e.clientY + 'px';
      }
      document.addEventListener('mousemove', move, { passive: true });
      // remember so we can clean up if user releases
      cur._move = move;
      return cur;
    }

    function makeSymbioteCursor () {
      const cur = document.createElement('div');
      cur.className = 'venom-cursor';
      cur.innerHTML = ''
        + '<svg viewBox="0 0 22 22" style="width:100%; height:100%; overflow:visible;">'
        +   '<path d="M 11,2 L 16,11 L 11,20 L 6,11 Z" fill="#000" stroke="#b8b0e8" stroke-width="0.8"/>'
        +   '<path d="M 11,4 L 13,11 L 11,18 L 9,11 Z" fill="#1a0e26"/>'
        +   '<circle cx="11" cy="11" r="1.4" fill="#b8b0e8"/>'
        +   '<path d="M 11,11 Q 11,18 7,24 Q 5,28 8,32" stroke="#000" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.7"/>'
        +   '<path d="M 11,11 Q 13,18 17,22" stroke="#000" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.45"/>'
        + '</svg>';
      document.body.appendChild(cur);
      function move (e) { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; }
      document.addEventListener('mousemove', move, { passive: true });
      return cur;
    }

    function bind () {
      if (busy) return;
      busy = true;

      // Reduced-motion users get a quiet fade-through.
      if (reduce) {
        document.body.style.transition = 'opacity 360ms';
        document.body.style.opacity = '0';
        setTimeout(() => { window.location.href = 'websites.html'; }, 380);
        return;
      }

      const r = btn.getBoundingClientRect();
      const ox = r.left + r.width / 2;
      const oy = r.top + r.height / 2;

      // Canvas-backed overlay (canvas accumulates strokes naturally,
      // which is what gives the mold its filled-in body).
      const overlay = document.createElement('div');
      overlay.className = 'venom-overlay';
      overlay.innerHTML = ''
        + '<canvas class="venom-overlay__canvas"></canvas>'
        + '<div class="venom-overlay__goo"></div>';
      document.body.appendChild(overlay);

      const canvas = overlay.querySelector('.venom-overlay__canvas');
      const ctx = canvas.getContext('2d');
      const goo = overlay.querySelector('.venom-overlay__goo');

      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const W = window.innerWidth, H = window.innerHeight;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#000';
      ctx.strokeStyle = '#000';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      requestAnimationFrame(() => overlay.classList.add('is-active'));

      // Cursor takeover during the bind, gone again on arrival.
      document.body.classList.add('venom-bound');
      const cursor = makeSymbioteCursor();
      setTimeout(() => cursor.classList.add('is-on'), 1200);

      // ── SLIME-MOLD NETWORK GROWTH (Physarum-style) ──────────
      // Reference: Physarum polycephalum time-lapse — the mold
      // doesn't pick a direction and walk; it senses food points
      // and routes between them, forming a hierarchical network
      // of thick arteries (near the centre) tapering into fine
      // capillaries (at the leading front).
      //
      // Algorithm:
      //   1. Scatter ~280 invisible food points across the viewport
      //      (with edge bias so the mold reaches the corners).
      //   2. Seed the central blob at the click origin (consumed,
      //      depth 0).
      //   3. Each "consumed" point becomes a growth source for its
      //      lifetime — periodically emits a vein toward its nearest
      //      unconsumed neighbour within reach.
      //   4. When a vein reaches its target, that target gets
      //      consumed → becomes a new source → cascade continues.
      //   5. Vein width tapers with depth (artery → vein → capillary).
      //   6. Slight perpendicular curve on each vein for organic feel.

      const foods = [];
      const TARGET_COUNT = 280;

      // Stratified random with edge bias so the mold has reason to
      // spread outward all the way to the viewport corners.
      for (let i = 0; i < TARGET_COUNT; i++) {
        let x, y;
        if (Math.random() < 0.40) {
          const side = Math.floor(Math.random() * 4);
          if (side === 0)       { x = Math.random() * W;             y = Math.random() * H * 0.32; }
          else if (side === 1)  { x = W - Math.random() * W * 0.32;  y = Math.random() * H; }
          else if (side === 2)  { x = Math.random() * W;             y = H - Math.random() * H * 0.32; }
          else                  { x = Math.random() * W * 0.32;      y = Math.random() * H; }
        } else {
          x = Math.random() * W;
          y = Math.random() * H;
        }
        foods.push({ x: x, y: y, consumed: false, targeted: false, depth: -1, frameConsumed: -1, isRoot: false });
      }

      // Origin point — already consumed at frame 0, depth 0.
      const root = { x: ox, y: oy, consumed: true, targeted: true, depth: 0, frameConsumed: 0, isRoot: true };
      foods.push(root);

      const veins = [];

      function bezier (x0, y0, x1, y1, x2, y2, t) {
        const u = 1 - t;
        return {
          x: u * u * x0 + 2 * u * t * x1 + t * t * x2,
          y: u * u * y0 + 2 * u * t * y1 + t * t * y2
        };
      }

      let frame = 0;
      const TOTAL_FRAMES = 600; // ~10 seconds at 60fps

      function tick () {
        frame++;

        // STEP A — emit new veins from active growth sources.
        for (let i = 0; i < foods.length; i++) {
          const src = foods[i];
          if (!src.consumed) continue;
          const age = frame - src.frameConsumed;
          // Source stays active for a window after being consumed.
          if (age > 280) continue;

          // Emission rate decays with age. Root is more prolific.
          const rate = src.isRoot
            ? (age < 80  ? 0.060 : 0.020)
            : (age < 60  ? 0.045 : 0.012);
          if (Math.random() > rate) continue;

          // Find candidate targets — nearest unconsumed/untargeted
          // food points within a depth-dependent reach radius.
          const maxReach = src.isRoot ? 180 : Math.max(40, 120 - src.depth * 12);
          const cand = [];
          for (let j = 0; j < foods.length; j++) {
            const f = foods[j];
            if (f.consumed || f.targeted) continue;
            const dx = f.x - src.x;
            const dy = f.y - src.y;
            const d = Math.hypot(dx, dy);
            if (d > 20 && d < maxReach) cand.push({ f: f, d: d });
          }
          if (cand.length === 0) continue;

          // Sort by distance, pick from closest few with bias (so
          // the network doesn't always pick literal nearest — some
          // variation lets the network look organic).
          cand.sort(function (a, b) { return a.d - b.d; });
          const top = Math.min(5, cand.length);
          const pick = cand[Math.floor(Math.random() * top)];
          pick.f.targeted = true;

          // Width tapers with depth — artery → vein → capillary.
          const baseW = Math.max(0.55, 5.2 * Math.pow(0.78, src.depth));

          // Slight perpendicular curve for organic feel.
          const dx = pick.f.x - src.x;
          const dy = pick.f.y - src.y;
          const dist = pick.d;
          const px = -dy / dist;
          const py =  dx / dist;
          const perp = (Math.random() - 0.5) * Math.min(dist * 0.28, 36);
          const ctrlX = (src.x + pick.f.x) / 2 + px * perp;
          const ctrlY = (src.y + pick.f.y) / 2 + py * perp;

          veins.push({
            from: src, to: pick.f,
            ctrlX: ctrlX, ctrlY: ctrlY,
            progress: 0, prevProgress: 0,
            width: baseW,
            depth: src.depth + 1
          });
        }

        // STEP B — advance + draw all growing veins.
        for (let v = 0; v < veins.length; v++) {
          const vein = veins[v];
          if (vein.progress >= 1) continue;

          vein.prevProgress = vein.progress;
          vein.progress = Math.min(1, vein.progress + 0.020); // ~50 frames per vein at full distance

          // Sample 3 sub-steps along the bezier for a smooth curve.
          const steps = 3;
          ctx.lineWidth = vein.width;
          for (let s = 1; s <= steps; s++) {
            const t1 = vein.prevProgress + (vein.progress - vein.prevProgress) * ((s - 1) / steps);
            const t2 = vein.prevProgress + (vein.progress - vein.prevProgress) * (s / steps);
            const p1 = bezier(vein.from.x, vein.from.y, vein.ctrlX, vein.ctrlY, vein.to.x, vein.to.y, t1);
            const p2 = bezier(vein.from.x, vein.from.y, vein.ctrlX, vein.ctrlY, vein.to.x, vein.to.y, t2);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }

          // Active growth bloom — a small lavender flicker at the
          // current leading tip, fading. Gives the active front a
          // living glow without persisting on the canvas.
          if (vein.progress < 0.97) {
            const tip = bezier(vein.from.x, vein.from.y, vein.ctrlX, vein.ctrlY, vein.to.x, vein.to.y, vein.progress);
            const grad = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 6);
            grad.addColorStop(0, 'rgba(184, 176, 232, 0.45)');
            grad.addColorStop(1, 'rgba(184, 176, 232, 0)');
            ctx.save();
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(tip.x, tip.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // On arrival — consume the target → it becomes a new source.
          if (vein.progress >= 1 && !vein.to.consumed) {
            vein.to.consumed = true;
            vein.to.depth = vein.depth;
            vein.to.frameConsumed = frame;
          }
        }

        if (frame < TOTAL_FRAMES) requestAnimationFrame(tick);
      }

      // Root blob grows first (the "wound" through which the network
      // emerges). Drawn as a softly-eased fill that completes before
      // the network starts emitting.
      const rootStart = performance.now();
      function drawRoot (now) {
        const e = now - rootStart;
        if (e > 1800) return;
        const k = Math.min(1, e / 1100);
        const r = 28 * (1 - Math.pow(1 - k, 3));
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        requestAnimationFrame(drawRoot);
      }
      requestAnimationFrame(drawRoot);

      // Start network growth after the root has visibly formed —
      // it should look like the body emerges first, then the network.
      setTimeout(function () { requestAnimationFrame(tick); }, 600);

      // Goo overlay fades in near the end to fill any negative space
      // the network didn't fully colonise — the screen needs to be
      // solid before navigation.
      setTimeout(function () { goo.classList.add('is-on'); }, 8800);

      // Navigate at the end. websites.html is a clean dark service
      // page — no eye-mask, no custom cursor.
      setTimeout(function () { window.location.href = 'websites.html'; }, 10000);
    }

    btn.addEventListener('click', bind);
  })();

  /* ── WEBSITES POV PAGE — eye-mask, breathing edges, cursor
     The websites.html page loads with body.venom-pov. We set up:
       - the SVG eye-mask that follows the viewport
       - the symbiote cursor (always on, even after release option)
       - the "release / re-bind" toggle that removes the framing
       - subtle parallax — eye-mask drifts a few px with mouse */
  (function initVenomPovPage () {
    if (!document.body.classList.contains('venom-pov')) return;

    const ns = 'http://www.w3.org/2000/svg';

    function sharpEyePath (cx, cy, hw, hh, side) {
      const sharpX = side === 'L' ? cx - hw : cx + hw;
      const innerX = side === 'L' ? cx + hw * 0.85 : cx - hw * 0.85;
      const innerOffset = side === 'L' ? -10 : 10;
      return [
        'M', sharpX, cy,
        'L', cx - hw * 0.5, cy - hh,
        'Q', cx, cy - hh * 1.05, innerX, cy - hh * 0.55,
        'L', innerX + innerOffset, cy,
        'L', innerX, cy + hh * 0.55,
        'Q', cx, cy + hh * 1.05, cx - hw * 0.5, cy + hh,
        'Z'
      ].join(' ');
    }

    // Build the mask scaffold (black overlay with two eye-shaped holes).
    const maskWrap = document.createElement('div');
    maskWrap.className = 'venom-pov-mask';
    document.body.appendChild(maskWrap);

    const W = window.innerWidth, H = window.innerHeight;
    const maskSvg = document.createElementNS(ns, 'svg');
    maskSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    maskSvg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    maskSvg.innerHTML = ''
      + '<defs>'
      +   '<mask id="vnPovMask">'
      +     '<rect width="100%" height="100%" fill="white"/>'
      +     '<path id="vn-pov-eye-l" fill="black"/>'
      +     '<path id="vn-pov-eye-r" fill="black"/>'
      +   '</mask>'
      + '</defs>'
      + '<rect width="100%" height="100%" fill="#04060e" mask="url(#vnPovMask)"/>'
      + '<path id="vn-pov-rim-l" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linejoin="miter" opacity="0.92"/>'
      + '<path id="vn-pov-rim-r" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linejoin="miter" opacity="0.92"/>';
    maskWrap.appendChild(maskSvg);

    // Edge tendrils — separate SVG, drawn on top of the mask so they
    // creep across the corners of the viewport regardless of scroll.
    const edge = document.createElement('div');
    edge.className = 'venom-pov-edge';
    document.body.appendChild(edge);
    const edgeSvg = document.createElementNS(ns, 'svg');
    edgeSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    edgeSvg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    edgeSvg.innerHTML = ''
      + '<path d="M 0,0 Q 60,40 50,110 Q 42,180 70,260" stroke-width="16"/>'
      + '<path d="M ' + W + ',0 Q ' + (W - 60) + ',40 ' + (W - 50) + ',110 Q ' + (W - 42) + ',180 ' + (W - 70) + ',260" stroke-width="16"/>'
      + '<path d="M 0,' + H + ' Q 60,' + (H - 40) + ' 50,' + (H - 110) + ' Q 42,' + (H - 180) + ' 70,' + (H - 260) + '" stroke-width="14"/>'
      + '<path d="M ' + W + ',' + H + ' Q ' + (W - 60) + ',' + (H - 40) + ' ' + (W - 50) + ',' + (H - 110) + ' Q ' + (W - 42) + ',' + (H - 180) + ' ' + (W - 70) + ',' + (H - 260) + '" stroke-width="14"/>'
      + '<path d="M 80,0 Q 110,50 90,100" stroke-width="9"/>'
      + '<path d="M ' + (W - 80) + ',0 Q ' + (W - 110) + ',50 ' + (W - 90) + ',100" stroke-width="9"/>';
    edge.appendChild(edgeSvg);

    function paintEyes (offsetX, offsetY) {
      const w = window.innerWidth, h = window.innerHeight;
      // Eyes centered in the viewport, sized relative to screen
      const cxL = w * 0.34 + offsetX;
      const cyL = h * 0.52 + offsetY;
      const cxR = w * 0.66 + offsetX;
      const cyR = h * 0.52 + offsetY;
      const hw = Math.min(w * 0.26, 340);
      const hh = Math.min(h * 0.28, 220);

      const dL = sharpEyePath(cxL, cyL, hw, hh, 'L');
      const dR = sharpEyePath(cxR, cyR, hw, hh, 'R');
      maskWrap.querySelector('#vn-pov-eye-l').setAttribute('d', dL);
      maskWrap.querySelector('#vn-pov-eye-r').setAttribute('d', dR);
      maskWrap.querySelector('#vn-pov-rim-l').setAttribute('d', dL);
      maskWrap.querySelector('#vn-pov-rim-r').setAttribute('d', dR);
    }
    paintEyes(0, 0);

    // Resize handler — repaint mask + edge for new viewport.
    window.addEventListener('resize', () => {
      const w2 = window.innerWidth, h2 = window.innerHeight;
      maskSvg.setAttribute('viewBox', '0 0 ' + w2 + ' ' + h2);
      edgeSvg.setAttribute('viewBox', '0 0 ' + w2 + ' ' + h2);
      paintEyes(0, 0);
    });

    // Subtle parallax — eyes follow the cursor a few pixels.
    let targetOX = 0, targetOY = 0, curOX = 0, curOY = 0;
    document.addEventListener('mousemove', (e) => {
      const dx = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      const dy = (e.clientY - window.innerHeight / 2) / window.innerHeight;
      targetOX = dx * 18;
      targetOY = dy * 12;
    }, { passive: true });
    function loop () {
      curOX += (targetOX - curOX) * 0.06;
      curOY += (targetOY - curOY) * 0.06;
      paintEyes(curOX, curOY);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // Symbiote cursor — always on while in POV mode.
    const cur = document.createElement('div');
    cur.className = 'venom-cursor is-on';
    cur.innerHTML = ''
      + '<svg viewBox="0 0 22 22" style="width:100%; height:100%; overflow:visible;">'
      +   '<path d="M 11,2 L 16,11 L 11,20 L 6,11 Z" fill="#000" stroke="#b8b0e8" stroke-width="0.8"/>'
      +   '<path d="M 11,4 L 13,11 L 11,18 L 9,11 Z" fill="#1a0e26"/>'
      +   '<circle cx="11" cy="11" r="1.4" fill="#b8b0e8"/>'
      +   '<path d="M 11,11 Q 11,18 7,24 Q 5,28 8,32" stroke="#000" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.7"/>'
      +   '<path d="M 11,11 Q 13,18 17,22" stroke="#000" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.45"/>'
      + '</svg>';
    document.body.appendChild(cur);
    document.body.classList.add('venom-bound');
    document.addEventListener('mousemove', (e) => {
      cur.style.left = e.clientX + 'px';
      cur.style.top = e.clientY + 'px';
    }, { passive: true });

    // Release / re-bind toggle.
    const release = document.querySelector('[data-venom-release]');
    if (release) {
      let released = false;
      release.addEventListener('click', () => {
        released = !released;
        document.body.classList.toggle('is-released', released);
        release.textContent = released ? '◉ RE-BIND' : '↺ RELEASE';
      });
    }
  })();

  /* ── AUTOMATIONS PAGE — scroll reveals + anatomy highlighter
     Adds .is-in to .auto-reveal elements as they enter view, and
     toggles .is-active on the scroll-tied .auto-anatomy__panel
     elements so the sticky core card on the left can dim/light
     according to which panel is being read. */
  (function initAutomationsPage () {
    if (!document.querySelector('.auto-page')) return;

    // Generic reveal observer
    const reveals = document.querySelectorAll('.auto-reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
      reveals.forEach(el => io.observe(el));
    }

    // Anatomy panels — switch active panel + recolor the sticky core card
    const panels = document.querySelectorAll('[data-anatomy-panel]');
    const coreCard = document.querySelector('[data-anatomy-core]');
    if (panels.length && coreCard && 'IntersectionObserver' in window) {
      const corePresets = {
        crm:  { dot: '#ef9f27', label: 'Mittiva CRM',  sub: 'The source of truth. Every contact, every conversation, every deal stage in one place.', meta: [['ROLE','System of record'],['NODE','170, 80'],['LATENCY','< 50ms'],['RETENTION','Forever']] },
        ai:   { dot: '#a59cff', label: 'AI',           sub: 'The orchestrator. Decides what should happen, when, and through which channel.', meta: [['ROLE','Decisioning'],['NODE','340, 245'],['LATENCY','< 800ms'],['MODEL','Mittiva Mind v3']] },
        meta: { dot: '#378add', label: 'Meta',         sub: 'Reach and delivery. Instagram, WhatsApp, Facebook, and Ads — one connected layer.', meta: [['ROLE','Reach + delivery'],['NODE','510, 80'],['LATENCY','Realtime'],['SURFACES','IG · WA · FB · Ads']] }
      };
      function paintCore (which) {
        const p = corePresets[which];
        if (!p) return;
        coreCard.setAttribute('data-core', which);
        const h = coreCard.querySelector('.auto-anatomy__core-h');
        const s = coreCard.querySelector('.auto-anatomy__core-sub');
        const ml = coreCard.querySelector('.auto-anatomy__core-meta');
        if (h) h.textContent = p.label;
        if (s) s.textContent = p.sub;
        if (ml) {
          ml.innerHTML = '';
          p.meta.forEach(([k, v]) => {
            const dt = document.createElement('dt'); dt.textContent = k;
            const dd = document.createElement('dd'); dd.textContent = v;
            ml.appendChild(dt); ml.appendChild(dd);
          });
        }
      }
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            panels.forEach(p => p.classList.toggle('is-active', p === e.target));
            paintCore(e.target.getAttribute('data-anatomy-panel'));
          }
        });
      }, { threshold: 0.55 });
      panels.forEach(p => io.observe(p));
    }
  })();
})();
