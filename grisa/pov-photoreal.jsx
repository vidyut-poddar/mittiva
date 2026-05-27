// Grisa — Photoreal POV (image-slot driven storyboard)
// 6 scenes, each a full-bleed <image-slot>. Drop your AI-generated photos in.
// Smooth cross-dissolves + Ken Burns motion + a door-opening overlay on scene 0.

const { useState, useEffect, useRef, useCallback } = React;

// ===================================================================
// SCENES — id, label, ken-burns motion, optional title quote, prompt
// ===================================================================
const SCENES = [
  {
    id: 'storefront',
    label: '00 / Outside',
    kb: 'subtle',
    title: null,
    promptName: 'Storefront — exterior at night',
    prompt:
      'A high-end fashion boutique storefront in Ballygunge, Kolkata at dusk. ' +
      'Dark teal (forest green) metal-framed glass double doors, brass handles, soft etched "GRISA" wordmark. ' +
      'Polished concrete approach, warm interior glow visible faintly through tinted glass. ' +
      'Industrial-meets-luxury, minimal signage, cinematic 35mm photograph, warm tungsten + cool dusk mix, ' +
      'shallow depth of field, eye-level, hyper-realistic. Aspect 16:9.',
  },
  {
    id: 'threshold',
    label: '01 / Threshold',
    kb: 'dolly-fwd',
    title: { quote: '"Aaiye, Grisa mein swagat hai."', by: '— SOFTLY, AS YOU STEP IN' },
    promptName: 'Threshold — just inside the open doors',
    prompt:
      'First-person POV stepping through dark teal metal-framed glass doors into a high-end Indian boutique. ' +
      'Looking down a corridor: warm cream/beige walls, polished concrete floor with subtle seams, ' +
      'industrial dark ceiling with a thin red accent strip and warm track lights, ' +
      'garment rack with neutral-tone tops on the left, a large ficus-with-handbags emerging at the far end. ' +
      'Atmosphere: contemporary minimal, hand-curated, warm tungsten light. Cinematic 35mm, hyper-realistic. 16:9.',
  },
  {
    id: 'foyer',
    label: '02 / The Foyer',
    kb: 'pan-right',
    title: null,
    promptName: 'Foyer — wide interior shot',
    prompt:
      'Wide eye-level shot of a contemporary minimal Indian boutique interior. ' +
      'Warm cream walls, polished concrete floor, exposed dark industrial ceiling with thin red accent strip, ' +
      'track spotlights pooling warm light, garment racks mounted on the walls (neutral & dusty colours), ' +
      'beige soffit-and-jali ceiling detail. No people. ' +
      'Quiet luxury aesthetic, hand-made feel, Sabyasachi-adjacent but more minimal. ' +
      'Cinematic 35mm, hyper-realistic, soft warm light, 16:9.',
  },
  {
    id: 'tree',
    label: '03 / The Tree',
    kb: 'zoom-in',
    defaultImg: 'photos/scene-03-tree.png',
    title: { quote: '"A boutique grows like a garden —\neach piece, a fruit of someone\'s hand."', by: '— THE GRISA TREE' },
    promptName: 'The signature tree with handbags',
    prompt:
      'Eye-level photograph of a large indoor faux ficus tree, full lush green canopy, ' +
      'standing in the center of a high-end Indian boutique on a polished concrete floor. ' +
      'Hand-made designer handbags (raffia, woven, leather in earth tones) hang from the branches like fruit. ' +
      'Warm tungsten boutique lighting, cream walls behind, soft bokeh. ' +
      'Contemporary minimal, Sabyasachi-adjacent, hyper-realistic, cinematic 35mm, 16:9.',
  },
  {
    id: 'reception',
    label: '04 / Reception',
    kb: 'pan-up',
    defaultImg: 'photos/scene-04-reception.png',
    title: { quote: '"The catalogue is here.\nShall I open it for you?"', by: '— ANAYA, AT RECEPTION' },
    promptName: 'Reception — counter with the catalogue',
    prompt:
      'A dark warm-wood reception counter inside a high-end Indian boutique, in a soft pool of warm spotlight. ' +
      'A cream-bound hardcover catalogue book sits on the counter, brass-trimmed corners, slight tilt. ' +
      'Behind: pillars, a fitting room curtain, a glimpse of dressing area. ' +
      'Warm cream walls, polished concrete floor. No people. ' +
      'Quiet luxury, cinematic 35mm, hyper-realistic, shallow DOF on the book, 16:9.',
  },
  {
    id: 'book',
    label: '05 / The Catalogue',
    kb: 'zoom-in',
    defaultImg: 'photos/scene-05-book.png',
    title: null,
    promptName: 'Catalogue cover (close-up)',
    prompt:
      'Close-up overhead shot of a cream linen-bound hardcover book on a dark walnut counter. ' +
      'Front cover embossed in brass: "GRISA — The Catalogue, S/S 2026, Kolkata". ' +
      'Soft warm light from one side, deep shadow on the other, polished concrete floor faintly visible. ' +
      'Editorial, quiet luxury, hyper-realistic, 35mm, 16:9.',
  },
];

// Optional book-spread interior images (one per spread)
const SPREADS = [
  {
    eyebrow: 'Cover',
    title: 'Grisa\nThe Catalogue',
    body: 'A boutique grows like a garden. This is its season.',
    meta: 'S/S · 2026 · KOLKATA',
    slotId: 'spread-cover',
    placeholder: 'Catalogue cover artwork',
    isShop: false,
  },
  {
    eyebrow: 'Heritage',
    title: 'A Quiet\nHouse',
    body: 'Founded in Ballygunge as a workshop for women who dressed themselves without asking permission. Eleven years in, we are still working the same way — slowly, by hand, in small numbers.',
    meta: 'EST. 2014 · 23 OF OUR OWN ARTISANS',
    slotId: 'spread-heritage',
    placeholder: 'Hands at work / atelier B&W',
  },
  {
    eyebrow: 'The Atelier',
    title: 'Bespoke,\nstill.',
    body: 'A consultation in the back room. Fabric chosen, body measured, drape considered. Six to eight weeks in our hands, then it\'s yours, forever.',
    meta: 'BY APPOINTMENT · 011-XXXX',
    slotId: 'spread-atelier',
    placeholder: 'Fabric, scissors, sewing detail',
  },
  {
    eyebrow: 'Lookbook',
    title: 'Spring\n— Summer',
    body: 'Sixteen looks. Soft cottons in dusk colours, drape that moves with you, embroidery from our karkhana.',
    meta: 'S/S 2026 · 16 LOOKS',
    slotId: 'spread-lookbook',
    placeholder: 'Editorial model in S/S look',
  },
  {
    eyebrow: 'Featured',
    title: 'The Tree\nCarries It',
    body: 'A signature of the shop: handbags hang from the ficus like fruit. This season\'s edit — woven raffia, brushed metal clasps, hand-stitched leather.',
    meta: '14 PIECES · ₹6,800 — ₹38,000',
    slotId: 'spread-bags',
    placeholder: 'Handbag still life',
  },
  {
    eyebrow: 'Enter The Shop',
    title: 'Come,\nshop the shelf.',
    body: 'Everything you\'ve seen — and more — live on the shop floor at shop.grisa.in.',
    meta: 'SHOP.GRISA.IN',
    slotId: 'spread-shop',
    placeholder: 'Wardrobe / closet still life',
    isShop: true,
  },
];

// ===================================================================
// ImageSlot wrapper — renders a stylised empty state behind it
// ===================================================================
const Slot = ({ id, kbClass, placeholderName, label, defaultImg }) => (
  <>
    <div className={`kb ${kbClass}`}>
      {/* Stylised default that shows when no image is dropped */}
      <div className="slot-default">
        <div className="label">{label}</div>
        <div className="name serif">{placeholderName}</div>
        <div className="hint">
          Drop a generated photo on this slot (or click to browse).
          Your image persists across reloads.
        </div>
      </div>
      {/* The actual image-slot — overlays the default when filled */}
      <image-slot id={id} shape="rect"
                  src={defaultImg || undefined}
                  placeholder={placeholderName}
                  style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
    </div>
    <div className="grade" />
    <div className="vignette" />
  </>
);

// ===================================================================
// Door overlay — sits on top of scene 0
// ===================================================================
const DoorOverlay = ({ open, pushed }) => (
  <div className="door-overlay">
    <div className="door-backdrop" />
    <div className={`door-frame ${open ? 'opened' : ''}`}>
      <div className="brand-above">
        <div className="name">GRISA</div>
        <div className="sub">Ballygunge · Kolkata</div>
      </div>
      <div className={`door-pane left ${open ? 'open' : ''}`}>
        <div className="door-etch">G&nbsp;R&nbsp;I</div>
        <div className="door-handle" />
      </div>
      <div className={`door-pane right ${open ? 'open' : ''}`}>
        <div className="door-etch">S&nbsp;H&nbsp;A</div>
        <div className="door-handle" />
      </div>
      <div className="door-glow" />
    </div>
  </div>
);

// ===================================================================
// Catalog overlay
// ===================================================================
const CatalogOverlay = ({ open, onClose, onShop }) => {
  const [page, setPage] = useState(0);
  const max = SPREADS.length - 1;

  const flip = useCallback((dir) => {
    setPage(p => {
      const next = Math.max(0, Math.min(max, p + dir));
      if (next !== p && window.POVAudio) window.POVAudio.pageFlip();
      return next;
    });
  }, [max]);

  useEffect(() => { if (open) setPage(0); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') flip(1);
      else if (e.key === 'ArrowLeft') flip(-1);
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, flip, onClose]);

  const spread = SPREADS[page];

  return (
    <div className={`catalog-overlay ${open ? 'visible' : ''}`}>
      <button className="catalog-close" onClick={onClose}>×</button>
      <div className="book">
        <div className="book-page left">
          <div className="spread">
            <div className="eyebrow">{spread.eyebrow}</div>
            <div className="title">{spread.title}</div>
            <div className="body">{spread.body}</div>
            {spread.isShop ? (
              <button className="shop-cta" onClick={onShop}>
                Enter the shop <span>↗</span>
              </button>
            ) : (
              <div className="chip">page {String(page * 2 + 1).padStart(2, '0')} / {String(SPREADS.length * 2).padStart(2, '0')}</div>
            )}
            <div className="meta">{spread.meta}</div>
            <div className="page-no">{String(page * 2 + 1).padStart(3, '0')}</div>
          </div>
        </div>
        <div className="book-page right">
          <div className="spread-illus">
            <image-slot id={spread.slotId} shape="rect"
                        placeholder={spread.placeholder}
                        style={{ width: '100%', height: '100%' }} />
          </div>
          <div className="page-no">{String(page * 2 + 2).padStart(3, '0')}</div>
        </div>

        <button className={`flip prev ${page === 0 ? 'disabled' : ''}`} onClick={() => flip(-1)}>‹</button>
        <button className={`flip next ${page === max ? 'disabled' : ''}`} onClick={() => flip(1)}>›</button>

        <div className="book-dots">
          {SPREADS.map((_, i) => (
            <div key={i} className={`dot ${i === page ? 'active' : ''}`}
                 onClick={() => { setPage(i); if (window.POVAudio) window.POVAudio.pageFlip(); }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// Cursor
// ===================================================================
const Cursor = ({ x, y, overAction }) => (
  <div className={`pov-cursor ${overAction ? 'over-action' : ''}`}
       style={{ left: x, top: y }} />
);

// ===================================================================
// APP
// ===================================================================
const App = () => {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [doorPushed, setDoorPushed] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [wipe, setWipe] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hoverAction, setHoverAction] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  // While the user is dragging a file over the window, drop the click-catcher
  // so the drag events reach the image-slot underneath.
  const [isDragging, setIsDragging] = useState(false);
  // True once the user has dropped a photo into scene 00 (or it loaded from a
  // sidecar). When true the CSS door overlay is suppressed and entering the
  // boutique becomes a smooth camera dolly into the photo's own doorway.
  const [scene0HasPhoto, setScene0HasPhoto] = useState(false);
  // Direction of the last scene change — drives the transition style.
  //  +1 = stepping forward (current scene dollies away, next fades in)
  //  -1 = stepping backward (current scene retreats, previous returns from depth)
  const [direction, setDirection] = useState(1);
  // True during the "punch through the doorway" effect on scene 0.
  const [dollying, setDollying] = useState(false);

  // ---- Tell the preloader we're mounted. We wait one paint so the first
  //      scene actually has pixels on screen before the loading screen fades.
  useEffect(() => {
    let raf1 = requestAnimationFrame(() => {
      let raf2 = requestAnimationFrame(() => {
        try { window.dispatchEvent(new Event('grisa:ready')); } catch (e) {}
      });
      // eslint-disable-next-line no-unused-vars
      raf1 = raf2;
    });
    return () => cancelAnimationFrame(raf1);
  }, []);

  // ---- Watch scene 0's image-slot for a dropped photo so we can decide
  //      whether to draw the CSS door overlay or trust the photo to carry it.
  useEffect(() => {
    const slot = document.querySelector('image-slot#storefront');
    if (!slot) return;
    const check = () => setScene0HasPhoto(slot.hasAttribute('data-filled'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(slot, { attributes: true, attributeFilter: ['data-filled'] });
    return () => obs.disconnect();
  }, []);

  // ---- Drag-over-window detection (counts enters/leaves; resets on drop) ----
  useEffect(() => {
    let depth = 0;
    const onEnter = (e) => { depth++; setIsDragging(true); };
    const onLeave = (e) => { depth = Math.max(0, depth - 1); if (depth === 0) setIsDragging(false); };
    const onDropOrEnd = () => { depth = 0; setIsDragging(false); };
    window.addEventListener('dragenter', onEnter);
    window.addEventListener('dragleave', onLeave);
    window.addEventListener('drop', onDropOrEnd);
    window.addEventListener('dragend', onDropOrEnd);
    return () => {
      window.removeEventListener('dragenter', onEnter);
      window.removeEventListener('dragleave', onLeave);
      window.removeEventListener('drop', onDropOrEnd);
      window.removeEventListener('dragend', onDropOrEnd);
    };
  }, []);

  // ---- Block double-click reframe on image-slot (keeps the natural Ken-Burns
  //      drift intact and prevents the user from accidentally repositioning) ----
  useEffect(() => {
    const blockDbl = (e) => {
      const path = (typeof e.composedPath === 'function') ? e.composedPath() : [];
      const fromSlot = (e.target && e.target.tagName && e.target.tagName.toLowerCase() === 'image-slot')
        || path.some(el => el && el.tagName && el.tagName.toLowerCase() === 'image-slot');
      if (fromSlot) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    };
    window.addEventListener('dblclick', blockDbl, true);
    return () => window.removeEventListener('dblclick', blockDbl, true);
  }, []);

  // Mouse + hover detection
  useEffect(() => {
    const onMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    const onOver = (e) => {
      const t = e.target;
      const isAction = !!(t && t.closest && t.closest('.flip, .shop-cta, .catalog-close, .hud-bottom-right button, image-slot'));
      setHoverAction(isAction);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, []);

  // Title fade-in/out when scene changes
  useEffect(() => {
    const scene = SCENES[sceneIdx];
    if (scene?.title) {
      const t1 = setTimeout(() => setTitleVisible(true), 1200);
      const t2 = setTimeout(() => setTitleVisible(false), 5800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setTitleVisible(false);
    }
  }, [sceneIdx]);

  // Advance scene
  const advance = useCallback(() => {
    setSceneIdx(i => {
      const next = Math.min(SCENES.length - 1, i + 1);
      if (next !== i) {
        setDirection(1);
        if (window.POVAudio) window.POVAudio.footstep();
      }
      return next;
    });
  }, []);

  const back = useCallback(() => {
    setSceneIdx(i => {
      const prev = Math.max(0, i - 1);
      if (prev !== i) {
        setDirection(-1);
        if (window.POVAudio) window.POVAudio.footstep();
      }
      return prev;
    });
  }, []);

  // Main click — the click-catcher above each scene fires this on plain clicks.
  const onStageClick = useCallback((e) => {
    // Skip clicks inside HUD / overlays / panels (their own handlers run).
    if (e && e.target && e.target.closest && e.target.closest('.catalog-overlay, .hud-bottom-right, .handoff')) return;

    if (sceneIdx === 0 && !doorPushed) {
      // First click — enter the boutique.
      setDoorPushed(true);
      if (window.POVAudio) window.POVAudio.doorOpen();
      if (true /* always treat scene 0 as photo-driven — the CSS green door
              is intentionally suppressed; only uploaded imagery shows */) {
        // Slow, gentle walk through the doorway: ~3.5s. Feels like you're
        // stepping in, not snapping to the next slide.
        setDollying(true);
        setTimeout(() => setSceneIdx(1), 2200);   // crossfade mid-walk
        setTimeout(() => setDollying(false), 3700);
      } else {
        // (unreachable — retained for fallback safety)
        // No photo — swing the stylised CSS doors open.
        setTimeout(() => setDoorOpen(true), 80);
        setTimeout(() => setSceneIdx(1), 1100);
      }
      return;
    }

    if (sceneIdx === SCENES.length - 1) {
      // Last scene (the book) — open the catalog
      if (window.POVAudio) window.POVAudio.tick();
      setCatalogOpen(true);
      return;
    }

    if (sceneIdx > 0) {
      advance();
    }
  }, [sceneIdx, doorPushed, advance, scene0HasPhoto]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (catalogOpen) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        onStageClick({ target: document.body });
      } else if (e.key === 'ArrowLeft') {
        back();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onStageClick, back, catalogOpen]);

  // Catalog → Shop handoff
  const onShop = useCallback(() => {
    if (window.POVAudio) window.POVAudio.chime();
    setWipe(true);
    setTimeout(() => {
      setCatalogOpen(false);
      setHandoff(true);
      setTimeout(() => setWipe(false), 80);
    }, 500);
  }, []);

  const restart = useCallback(() => {
    setWipe(true);
    setTimeout(() => {
      setSceneIdx(0);
      setDoorPushed(false);
      setDoorOpen(false);
      setDollying(false);
      setCatalogOpen(false);
      setHandoff(false);
      setTimeout(() => setWipe(false), 80);
    }, 400);
  }, []);

  const onMute = () => {
    setMuted(m => {
      const next = !m;
      if (window.POVAudio) window.POVAudio.setMuted(next);
      return next;
    });
  };

  const scene = SCENES[sceneIdx];

  return (
    <div className="stage" onClick={onStageClick}>
      <Cursor x={mouse.x} y={mouse.y} overAction={hoverAction} />

      <div className="hud-top">{scene.label} &nbsp;·&nbsp; grisa</div>

      {/* All scenes mounted simultaneously; .active controls visibility for smooth cross-fades */}
      {SCENES.map((s, i) => {
        const isActive = i === sceneIdx;
        // Inactive layers sit on one of two sides depending on direction so
        // the active layer crossfades cleanly from "ahead" or "behind" the camera.
        let pos = '';
        if (!isActive) {
          if (direction === 1) {
            // Walking forward: scenes that already passed sit behind us, scenes
            // ahead sit in the depth ahead.
            pos = i < sceneIdx ? 'behind' : 'ahead';
          } else {
            // Walking backward: scenes ahead are receding away, scenes behind
            // (lower index) are returning from depth.
            pos = i < sceneIdx ? 'ahead' : 'behind';
          }
        }
        return (
          <div key={s.id}
               className={`scene-layer ${isActive ? 'active' : ''} ${pos} dir-${direction === 1 ? 'fwd' : 'bwd'} ${i === 0 && dollying ? 'dolly-through' : ''}`}>
            <Slot id={s.id} kbClass={s.kb} placeholderName={s.promptName} label={s.label} defaultImg={s.defaultImg} />
            {/* Click-catcher above the slot — receives clicks for scene advance.
                Dropped to pointer-events:none while a file is being dragged so
                the drop reaches the image-slot underneath. */}
            <div
              className="click-catcher"
              style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
              onClick={onStageClick}
            />
          </div>
        );
      })}

      {/* CSS door overlay is intentionally removed — the experience now uses
          ONLY uploaded photography. Scene 0 shows whatever image is dropped
          into the storefront slot. */}

      {/* Warm threshold glow — fades in as we punch through scene 0 and out
          once scene 1 is settled, masking the crossfade in warm light. */}
      <div className={`threshold-glow ${dollying ? 'on' : ''}`} />

      {/* Scene title quote */}
      <div className={`scene-title ${titleVisible && scene.title ? 'visible' : ''}`}>
        {scene.title && (
          <>
            <div className="quote">{scene.title.quote}</div>
            <div className="by">{scene.title.by}</div>
          </>
        )}
      </div>

      {/* Prompts */}
      {sceneIdx === 0 && (
        <div className={`prompt ${doorPushed ? 'gone' : ''}`}>
          <span className="glyph">✦</span>Click to enter<span className="glyph">✦</span>
        </div>
      )}
      {sceneIdx > 0 && sceneIdx < SCENES.length - 1 && (
        <div className="prompt">
          <span className="glyph">→</span>Click to keep walking<span className="glyph">→</span>
        </div>
      )}
      {sceneIdx === SCENES.length - 1 && !catalogOpen && (
        <div className="prompt">
          <span className="glyph">✦</span>Click the catalogue<span className="glyph">✦</span>
        </div>
      )}

      {/* Progress bar */}
      <div className="progress">
        <div className="progress-fill" style={{ width: `${((sceneIdx + 1) / SCENES.length) * 100}%` }} />
      </div>

      {/* Catalog */}
      <CatalogOverlay
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        onShop={onShop}
      />

      {/* Handoff */}
      <div className={`handoff ${handoff ? 'visible' : ''}`}>
        <div className="handoff-card">
          <div className="url">shop.grisa.in</div>
          <div className="head">Stepping into the shop</div>
          <div className="sub">Routing to the funnel</div>
          <div className="handoff-dots"><span /><span /><span /></div>
        </div>
      </div>

      {/* Wipe */}
      <div className={`wipe ${wipe ? 'on' : ''}`} />

      {/* HUD */}
      <div className="hud-bottom-right">
        {(sceneIdx > 0 || handoff) && (
          <button title="Restart" onClick={(e) => { e.stopPropagation(); restart(); }}>↻</button>
        )}
        <button title={muted ? 'Unmute' : 'Mute'} onClick={(e) => { e.stopPropagation(); onMute(); }}>{muted ? '○' : '♪'}</button>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
