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
    const lockDeck = () => deckWrap && deckWrap.classList.add('is-locked');
    const unlockDeck = () => deckWrap && deckWrap.classList.remove('is-locked');

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

    // Click on a card → open it (if not already active). Clicking INSIDE an
    // already-active card does nothing — that lets the user interact with
    // the card's content (e.g. the Voice AI widget's call button) without
    // accidentally flipping the card back down. To close the active card,
    // the user clicks outside it (handled below).
    deckCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a, button, input, textarea, select')) return;
        if (isCardActive(card)) return;     // Already open → ignore inside clicks
        // Close any other active card first
        deckCards.forEach((c) => { if (isCardActive(c)) flipOut(c); });
        // Open this one
        flipIn(card);
      });
    });

    // Esc closes whatever's open
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        deckCards.forEach((c) => { if (isCardActive(c)) flipOut(c); });
      }
    });

    // Click outside any card → close. CSS then collapses the deck.
    // The Mitti chat panel lives OUTSIDE the deck but is visually paired
    // with card 04 — clicks inside it must NOT collapse the deck.
    document.addEventListener('click', (e) => {
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
})();
