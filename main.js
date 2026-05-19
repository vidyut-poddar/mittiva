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

  /* ───── ACTIVE NAV ───── */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.menu-overlay__links a').forEach((a) => {
    if (a.getAttribute('href') === path) a.classList.add('is-active');
  });
})();
