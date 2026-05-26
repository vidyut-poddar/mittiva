/* ============================================================
   Jeevi Herbals — shared client script
   Cart (session-scoped) · Mobile nav · Cookie banner · Toast
============================================================ */

(function () {
  'use strict';

  // ---------------- Product catalog (single source of truth) ----------------
  const CATALOG = {
    'herbs-hair-oil':         { name: 'Herbs Hair Oil',              cat: 'Hair',     price: 550,  priceLabel: '₹550 – ₹1,100', rating: 4.9, reviews: 412 },
    'goat-milk-soap':         { name: 'Goat Milk Soap',              cat: 'Skin',     price: 190,  priceLabel: '₹190',          rating: 4.8, reviews: 287 },
    'karuppu-kavuni':         { name: 'Karuppu Kavuni Kanji Mix',    cat: 'Wellness', price: 850,  priceLabel: '₹850',          rating: 4.9, reviews: 98  },
    'dandruff-hair-oil':      { name: 'Dandruff Hair Oil',           cat: 'Hair',     price: 750,  priceLabel: '₹750 – ₹1,500', rating: 4.7, reviews: 156 },
    'hibiscus-shampoo':       { name: 'Hibiscus Shampoo',            cat: 'Hair',     price: 580,  priceLabel: '₹580',          rating: 4.8, reviews: 142 },
    'aloe-shampoo':           { name: 'Aloe Vera Shampoo',           cat: 'Hair',     price: 580,  priceLabel: '₹580',          rating: 4.7, reviews: 89  },
    'hair-wash-powder':       { name: 'Hair Wash Powder',            cat: 'Hair',     price: 550,  priceLabel: '₹550',          rating: 4.6, reviews: 67  },
    'herbal-dandruff-powder': { name: 'Herbal Dandruff Powder',      cat: 'Hair',     price: 580,  priceLabel: '₹580',          rating: 4.7, reviews: 54  },
    'herbal-hair-dye':        { name: 'Herbal Hair Dye',             cat: 'Hair',     price: 220,  priceLabel: '₹220',          rating: 4.8, reviews: 203 },
    'aloe-soap':              { name: 'Aloe Vera Soap',              cat: 'Skin',     price: 190,  priceLabel: '₹190',          rating: 4.7, reviews: 124 },
    'charcoal-soap':          { name: 'Charcoal Soap',               cat: 'Skin',     price: 190,  priceLabel: '₹190',          rating: 4.6, reviews: 98  },
    'vetiver-soap':           { name: 'Vetiver Soap',                cat: 'Skin',     price: 190,  priceLabel: '₹190',          rating: 4.8, reviews: 76  },
    'kuppaimeni-soap':        { name: 'Kuppaimeni Soap',             cat: 'Skin',     price: 190,  priceLabel: '₹190',          rating: 4.7, reviews: 81  },
    'multani-soap':           { name: 'Multani Mitti Soap',          cat: 'Skin',     price: 190,  priceLabel: '₹190',          rating: 4.6, reviews: 92  },
    'nalangu-soap':           { name: 'Nalangu Maavu Soap',          cat: 'Skin',     price: 190,  priceLabel: '₹190',          rating: 4.8, reviews: 104 },
    'face-pack-powder':       { name: 'Face Pack Powder',            cat: 'Skin',     price: 220,  priceLabel: '₹220',          rating: 4.7, reviews: 138 },
    'kasthuri-manjal':        { name: 'Kasthuri Manjal Powder',      cat: 'Skin',     price: 220,  priceLabel: '₹220',          rating: 4.8, reviews: 167 },
    'bath-powder':            { name: 'Bath Powder (Nalangu Maavu)', cat: 'Skin',     price: 550,  priceLabel: '₹550',          rating: 4.7, reviews: 73  },
    'health-mix':             { name: 'Health Mix Powder',           cat: 'Wellness', price: 550,  priceLabel: '₹550',          rating: 4.8, reviews: 116 },
    'sukku-coffee':           { name: 'Sukku Coffee Powder',         cat: 'Wellness', price: 220,  priceLabel: '₹220',          rating: 4.9, reviews: 145 },
    'tooth-powder':           { name: 'Tooth Powder',                cat: 'Wellness', price: 220,  priceLabel: '₹220',          rating: 4.6, reviews: 89  },
    'spirulina':              { name: 'Spirulina Capsules',          cat: 'Wellness', price: 580,  priceLabel: '₹580',          rating: 4.7, reviews: 62  },
    'sambarani-powder':       { name: 'Herbs Sambarani Powder',      cat: 'Wellness', price: 350,  priceLabel: '₹350',          rating: 4.8, reviews: 47  },
    'knee-pain-oil':          { name: 'Knee Pain Oil',               cat: 'Wellness', price: 520,  priceLabel: '₹520',          rating: 4.7, reviews: 71  }
  };

  // ---------------- Cart (sessionStorage-backed) ----------------
  const CART_KEY = 'jh_cart_v1';

  function loadCart () {
    try {
      const raw = sessionStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function saveCart (cart) {
    try { sessionStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  }
  function cartCount () {
    return loadCart().reduce((sum, item) => sum + item.qty, 0);
  }
  function cartTotal () {
    return loadCart().reduce((sum, item) => {
      const p = CATALOG[item.id];
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  }
  function updateBadges () {
    const count = cartCount();
    document.querySelectorAll('[data-cart-badge]').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? '' : 'none';
    });
  }
  function addToCart (id, qty = 1) {
    if (!CATALOG[id]) return;
    const cart = loadCart();
    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty += qty;
    else cart.push({ id, qty });
    saveCart(cart);
    updateBadges();
    renderDrawer();
    toast(`${CATALOG[id].name} added to cart`);
  }
  function updateQty (id, delta) {
    const cart = loadCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      saveCart(cart.filter(i => i.id !== id));
    } else {
      saveCart(cart);
    }
    updateBadges();
    renderDrawer();
  }
  function removeFromCart (id) {
    saveCart(loadCart().filter(i => i.id !== id));
    updateBadges();
    renderDrawer();
  }

  // ---------------- Drawer rendering ----------------
  function renderDrawer () {
    const list = document.getElementById('cartItems');
    const foot = document.getElementById('cartFoot');
    if (!list || !foot) return;
    const cart = loadCart();
    if (cart.length === 0) {
      list.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 7h14l-1.5 11a2 2 0 0 1-2 1.7H8.5a2 2 0 0 1-2-1.7L5 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>
          <p>Your cart is empty.</p>
          <a class="btn btn-ghost" href="shop.html">Browse the shop</a>
        </div>`;
      foot.style.display = 'none';
      return;
    }
    foot.style.display = '';
    list.innerHTML = cart.map(item => {
      const p = CATALOG[item.id];
      if (!p) return '';
      return `
        <div class="cart-item">
          <div class="img">${productSwatch(item.id)}</div>
          <div>
            <p class="name">${escape(p.name)}</p>
            <p class="cat">${escape(p.cat)}</p>
            <div class="qty">
              <button type="button" aria-label="Decrease quantity" data-act="dec" data-id="${item.id}">−</button>
              <span>${item.qty}</span>
              <button type="button" aria-label="Increase quantity" data-act="inc" data-id="${item.id}">+</button>
            </div>
          </div>
          <div>
            <div class="price">₹${(p.price * item.qty).toLocaleString('en-IN')}</div>
            <button class="remove" type="button" data-act="rm" data-id="${item.id}">Remove</button>
          </div>
        </div>`;
    }).join('');

    const subtotal = cartTotal();
    const shipping = subtotal >= 1499 ? 0 : 60;
    document.getElementById('cartSubtotal').textContent = '₹' + subtotal.toLocaleString('en-IN');
    document.getElementById('cartShipping').textContent = shipping === 0 ? 'Free' : '₹' + shipping;
    document.getElementById('cartTotal').textContent = '₹' + (subtotal + shipping).toLocaleString('en-IN');
  }

  // ---------------- Tiny stylised SVG swatches per product ----------------
  // Used in the drawer thumbnails — keeps zero image requests.
  function productSwatch (id) {
    const palettes = {
      Hair:     ['#3A4A38', '#D8CFB7'],
      Skin:     ['#F0E8D5', '#D6C9A8'],
      Wellness: ['#2A2620', '#A89A78']
    };
    const cat = (CATALOG[id] && CATALOG[id].cat) || 'Skin';
    const [a, b] = palettes[cat] || palettes.Skin;
    return `<svg viewBox="0 0 72 90" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="g-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs>
      <rect width="72" height="90" fill="url(#g-${id})"/>
      <rect x="22" y="14" width="28" height="64" rx="2" fill="#2A2620" opacity="0.65"/>
      <rect x="28" y="40" width="16" height="22" fill="#FAF8F4" opacity="0.9"/>
    </svg>`;
  }

  function escape (s) {
    return String(s).replace(/[&<>"']/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]));
  }

  // ---------------- Drawer open/close ----------------
  function openDrawer () {
    document.getElementById('cartDrawer').setAttribute('open', '');
    document.getElementById('cartScrim').setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    renderDrawer();
  }
  function closeDrawer () {
    document.getElementById('cartDrawer').removeAttribute('open');
    document.getElementById('cartScrim').removeAttribute('open');
    document.body.style.overflow = '';
  }

  // ---------------- Mobile nav ----------------
  function openMenu () {
    const nav = document.getElementById('mobileNav');
    if (!nav) return;
    nav.setAttribute('open', '');
    const toggle = document.querySelector('[data-menu-toggle]');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  }
  function closeMenu () {
    const nav = document.getElementById('mobileNav');
    if (!nav) return;
    nav.removeAttribute('open');
    const toggle = document.querySelector('[data-menu-toggle]');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  // ---------------- Cookie ----------------
  function dismissCookie () {
    const el = document.getElementById('cookieBanner');
    if (el) el.hidden = true;
    try { sessionStorage.setItem('jh_cookie_dismissed', '1'); } catch (e) {}
  }
  function initCookie () {
    const el = document.getElementById('cookieBanner');
    if (!el) return;
    try {
      if (sessionStorage.getItem('jh_cookie_dismissed') === '1') el.hidden = true;
    } catch (e) {}
  }

  // ---------------- Toast ----------------
  let toastTimer;
  function toast (msg) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.setAttribute('show', '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.removeAttribute('show'), 2400);
  }

  // ---------------- Newsletter ----------------
  function handleNewsletter (form) {
    const btn = form.querySelector('button');
    const input = form.querySelector('input[type=email]');
    if (btn) btn.textContent = 'Welcome ✓';
    if (input) input.value = '';
    setTimeout(() => { if (btn) btn.textContent = 'Subscribe →'; }, 3000);
  }

  // ---------------- Contact form ----------------
  function handleContact (form) {
    form.querySelectorAll('input, textarea').forEach(i => i.disabled = true);
    const btn = form.querySelector('button[type=submit]');
    if (btn) { btn.textContent = 'Sent ✓'; btn.disabled = true; }
    toast("Thanks — we'll reply within 24 hours.");
  }

  // ---------------- Highlight active nav ----------------
  function markActiveNav () {
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('[data-nav]').forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  // ---------------- Delegated event listener ----------------
  document.addEventListener('click', function (e) {
    const t = e.target.closest('[data-action]');
    if (t) {
      const action = t.getAttribute('data-action');
      if (action === 'add-to-cart') {
        e.preventDefault();
        const id = t.getAttribute('data-id');
        const qty = parseInt(t.getAttribute('data-qty') || '1', 10);
        addToCart(id, qty);
      } else if (action === 'open-cart') {
        e.preventDefault(); openDrawer();
      } else if (action === 'close-cart') {
        e.preventDefault(); closeDrawer();
      } else if (action === 'open-menu') {
        e.preventDefault(); openMenu();
      } else if (action === 'close-menu') {
        e.preventDefault(); closeMenu();
      } else if (action === 'cookie-accept' || action === 'cookie-decline') {
        e.preventDefault(); dismissCookie();
      } else if (action === 'checkout') {
        e.preventDefault();
        toast('Checkout integration coming soon — pay via UPI to complete.');
      }
    }

    // Cart item controls (event delegation inside the drawer)
    const ctl = e.target.closest('[data-act]');
    if (ctl) {
      const act = ctl.getAttribute('data-act');
      const id = ctl.getAttribute('data-id');
      if (act === 'inc') updateQty(id, +1);
      else if (act === 'dec') updateQty(id, -1);
      else if (act === 'rm') removeFromCart(id);
    }

    // Close menu when clicking a link inside it
    if (e.target.closest('#mobileNav a')) closeMenu();
  });

  // Form submissions
  document.addEventListener('submit', function (e) {
    if (e.target.matches('[data-form="newsletter"]')) {
      e.preventDefault(); handleNewsletter(e.target);
    }
    if (e.target.matches('[data-form="contact"]')) {
      e.preventDefault(); handleContact(e.target);
    }
  });

  // ESC closes drawer / menu
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeDrawer(); closeMenu(); }
  });

  // ---------------- Boot ----------------
  document.addEventListener('DOMContentLoaded', function () {
    updateBadges();
    initCookie();
    markActiveNav();
    renderDrawer();
  });

  // Expose for debugging / external triggers
  window.JeeviCart = { add: addToCart, open: openDrawer, count: cartCount };
})();
