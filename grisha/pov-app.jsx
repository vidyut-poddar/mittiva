// Grisha POV — CSS 3D walkthrough
// Brand-DNA reconstruction: cream walls, teal door, polished concrete,
// red ceiling strip, signature tree, brass. No photos, no hands.
// Smooth camera dolly through the boutique on click.

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ===================================================================
// Stylized tree (SVG, brand emblem)
// ===================================================================
const TreeSVG = () => (
  <svg viewBox="0 0 600 1240" preserveAspectRatio="xMidYMax meet">
    <defs>
      <radialGradient id="foliage-a" cx="0.5" cy="0.5" r="0.8">
        <stop offset="0%" stopColor="#4a6c4a" />
        <stop offset="60%" stopColor="#345030" />
        <stop offset="100%" stopColor="#1f3320" />
      </radialGradient>
      <radialGradient id="foliage-b" cx="0.4" cy="0.4" r="0.7">
        <stop offset="0%" stopColor="#5a7c5a" />
        <stop offset="60%" stopColor="#3a5638" />
        <stop offset="100%" stopColor="#243a24" />
      </radialGradient>
      <linearGradient id="trunk" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%"  stopColor="#3a2818" />
        <stop offset="50%" stopColor="#6b4a26" />
        <stop offset="100%" stopColor="#3a2818" />
      </linearGradient>
    </defs>

    {/* Trunk */}
    <path d="M 295 1240
             Q 305 1000 295 800
             Q 285 650 305 500
             L 300 400"
          stroke="url(#trunk)" strokeWidth="44" fill="none"
          strokeLinecap="round" />

    {/* Pot / base */}
    <ellipse cx="300" cy="1230" rx="120" ry="22" fill="#2a201a" opacity="0.7" />
    <rect x="225" y="1180" width="150" height="60"
          fill="#3a2a1c" stroke="#1a1208" strokeWidth="1.5" />

    {/* Foliage clusters — layered ellipses */}
    <g>
      <ellipse cx="280" cy="320" rx="240" ry="180" fill="url(#foliage-a)" />
      <ellipse cx="370" cy="270" rx="220" ry="160" fill="url(#foliage-b)" />
      <ellipse cx="220" cy="280" rx="190" ry="140" fill="url(#foliage-a)" opacity="0.9" />
      <ellipse cx="410" cy="380" rx="170" ry="120" fill="url(#foliage-b)" opacity="0.85" />
      <ellipse cx="180" cy="400" rx="160" ry="110" fill="url(#foliage-a)" opacity="0.9" />
      <ellipse cx="320" cy="200" rx="180" ry="130" fill="url(#foliage-b)" opacity="0.85" />
    </g>

    {/* Hanging handbags — strings + bags as small rectangles */}
    {[
      { x: 230, y: 540, w: 52, h: 64, c: '#c4a878', hangFrom: 470 },
      { x: 310, y: 580, w: 46, h: 56, c: '#9d7a55', hangFrom: 480 },
      { x: 180, y: 600, w: 42, h: 52, c: '#5a4030', hangFrom: 470 },
      { x: 380, y: 520, w: 50, h: 60, c: '#d8c098', hangFrom: 460 },
      { x: 280, y: 660, w: 46, h: 54, c: '#6a5040', hangFrom: 540 },
      { x: 420, y: 620, w: 44, h: 50, c: '#a08868', hangFrom: 510 },
    ].map((b, i) => (
      <g key={i}>
        <line x1={b.x + b.w / 2} y1={b.hangFrom} x2={b.x + b.w / 2} y2={b.y}
              stroke="#7a6045" strokeWidth="1.4" opacity="0.7" />
        <rect x={b.x} y={b.y} width={b.w} height={b.h}
              fill={b.c} rx="3" stroke="#3a2a18" strokeWidth="0.6"
              filter="url(#bag-shadow)" />
        {/* tiny handle on top */}
        <path d={`M ${b.x + 6} ${b.y + 2} Q ${b.x + b.w/2} ${b.y - 8} ${b.x + b.w - 6} ${b.y + 2}`}
              stroke={b.c} strokeWidth="2" fill="none" opacity="0.8" />
      </g>
    ))}

    <defs>
      <filter id="bag-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
        <feOffset dy="3" />
        <feComponentTransfer><feFuncA type="linear" slope="0.5" /></feComponentTransfer>
        <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  </svg>
);

// ===================================================================
// Garment rack — wall-mounted bar with hanging garments
// ===================================================================
const GarmentRack = ({ palette }) => {
  // palette: array of hex colors. Auto-generates 14-18 garment shapes.
  const garments = useMemo(() => {
    const out = [];
    let x = 6;
    while (x < 1080) {
      const w = 38 + Math.random() * 14;
      const h = 220 + Math.random() * 140;
      const c = palette[Math.floor(Math.random() * palette.length)];
      out.push({ x, w, h, c });
      x += w + 6 + Math.random() * 4;
    }
    return out;
  }, [palette]);
  return (
    <>
      <div className="rack-shelf" />
      <div className="rack-bar" />
      {garments.map((g, i) => (
        <div
          key={i}
          className="garment"
          style={{
            left: g.x + 'px',
            width: g.w + 'px',
            height: g.h + 'px',
            background: `linear-gradient(to bottom, ${g.c} 0%, ${shade(g.c, -20)} 80%, ${shade(g.c, -40)} 100%)`,
            clipPath: 'polygon(50% 0%, 70% 8%, 100% 18%, 100% 100%, 0 100%, 0 18%, 30% 8%)',
          }}
        />
      ))}
    </>
  );
};

// Darken a hex color by `amount` (negative makes darker).
function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amount;
  let g = ((n >> 8) & 0xff) + amount;
  let b = (n & 0xff) + amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// ===================================================================
// The 3D world
// ===================================================================
const World3D = ({ camZ, lookX, doorOpen, doorOpening, atReception }) => {
  return (
    <div className="scene-3d">
      <div
        className="world-3d"
        style={{
          '--cam-z': camZ + 'px',
          '--look-x': lookX + 'deg',
        }}
      >
        {/* Architectural shell */}
        <div className="floor" />
        <div className="ceiling" />
        <div className="wall-left" />
        <div className="wall-right" />
        <div className="end-wall" />

        {/* Pillars near reception */}
        <div className="pillar left" />
        <div className="pillar right" />

        {/* Racks */}
        <div className="rack left-wall">
          <GarmentRack palette={['#e8d8b8', '#c4a878', '#a08868', '#7a5d3a', '#5a4030', '#d4b890', '#c89870', '#94735a']} />
        </div>
        <div className="rack right-wall">
          <GarmentRack palette={['#8a3a3a', '#5a2a4a', '#7c4a6a', '#b06070', '#8a4e3a', '#d68070', '#6a3a2a', '#404060']} />
        </div>

        {/* Reception greeting */}
        <div className="reception-text">
          <div className="greeting">
            "Aaiye, Grisha mein swagat hai.<br />
            Take a moment — the catalogue is here."
          </div>
          <div className="name">— Anaya · at Reception</div>
        </div>

        {/* Counter & book */}
        <div className="counter-3d" />
        <div className={`book-3d ${atReception ? 'glow' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="book-label">GRISHA &nbsp;·&nbsp; CATALOGUE</div>
          <div className="book-pulse" />
        </div>

        {/* Signature tree */}
        <div className="tree-3d">
          <TreeSVG />
        </div>

        {/* Doorway — last so it paints on top of corridor */}
        <div className={`doorway-3d ${doorOpen ? 'opened' : ''}`}>
          <div className="doorway-glow" />
          <div className={`door-pane left ${doorOpen ? 'open' : ''}`}>
            <div className="door-etch">G&nbsp;R&nbsp;I</div>
            <div className="door-handle" />
          </div>
          <div className={`door-pane right ${doorOpen ? 'open' : ''}`}>
            <div className="door-etch">S&nbsp;H&nbsp;A</div>
            <div className="door-handle" />
          </div>
        </div>

        {/* World vignette */}
        <div className="world-light" />
      </div>
    </div>
  );
};

// ===================================================================
// Catalog overlay (book opens on top of world)
// ===================================================================
const SPREADS = [
  {
    eyebrow: 'Cover',
    title: 'Grisha\nThe Catalogue',
    body: 'A boutique grows like a garden. This is its season.',
    meta: 'S/S · 2026 · KOLKATA',
    illus: 'cover',
  },
  {
    eyebrow: 'Heritage',
    title: 'A Quiet\nHouse',
    body: 'Founded in Ballygunge as a workshop for women who dressed themselves without asking permission. Eleven years in, we are still working the same way — slowly, by hand, in small numbers.',
    meta: 'EST. 2014 · 23 OF OUR OWN ARTISANS',
    illus: 'heritage',
  },
  {
    eyebrow: 'The Atelier',
    title: 'Bespoke,\nstill.',
    body: 'A consultation in the back room. Fabric chosen, body measured, drape considered. Six to eight weeks in our hands, then it\'s yours, forever.',
    meta: 'BY APPOINTMENT · 011-XXXX',
    illus: 'atelier',
  },
  {
    eyebrow: 'Lookbook',
    title: 'Spring\n— Summer',
    body: 'Sixteen looks. Soft cottons in dusk colours, drape that moves with you, embroidery from our karkhana. Worn here on the women of Kolkata in May.',
    meta: 'S/S 2026 · 16 LOOKS',
    illus: 'lookbook',
  },
  {
    eyebrow: 'Featured',
    title: 'The Tree\nCarries It',
    body: 'A signature of the shop: handbags hang from the ficus like fruit. This season\'s edit — woven raffia, brushed metal clasps, hand-stitched leather.',
    meta: '14 PIECES · ₹6,800 — ₹38,000',
    illus: 'tree',
  },
  {
    eyebrow: 'Enter The Shop',
    title: 'Come,\nshop the shelf.',
    body: 'Everything you\'ve seen — and ninety more pieces we haven\'t had room to show — live on the shop floor at shop.grisha.in. Same paper, same hand, just the cart added.',
    meta: 'SHOP.GRISHA.IN',
    illus: 'shop',
    isShop: true,
  },
];

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
          <div className={`spread-illus ${spread.illus}`} />
          <div className="page-no">{String(page * 2 + 2).padStart(3, '0')}</div>
        </div>

        <button className={`flip prev ${page === 0 ? 'disabled' : ''}`} onClick={() => flip(-1)}>‹</button>
        <button className={`flip next ${page === max ? 'disabled' : ''}`} onClick={() => flip(1)}>›</button>

        <div className="book-dots">
          {SPREADS.map((_, i) => (
            <div
              key={i}
              className={`dot ${i === page ? 'active' : ''}`}
              onClick={() => { setPage(i); if (window.POVAudio) window.POVAudio.pageFlip(); }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// HUD pieces
// ===================================================================
const Cursor = ({ x, y, overAction }) => (
  <div className={`pov-cursor ${overAction ? 'over-action' : ''}`}
       style={{ left: x, top: y }} />
);

// ===================================================================
// Camera-path waypoints (cam-z values applied to .world-3d)
// Higher = camera further forward into the boutique.
// ===================================================================
const PATH = [
  /* 0 outside  */ { z: 0 },
  /* 1 entered  */ { z: 900 },
  /* 2 mid hall */ { z: 1700 },
  /* 3 at tree  */ { z: 2400 },
  /* 4 past tree*/ { z: 3100 },
  /* 5 reception*/ { z: 3900 },
];
const LABELS = [
  '00 / Outside',
  '01 / Threshold',
  '02 / The Foyer',
  '03 / The Tree',
  '04 / Past The Tree',
  '05 / Reception',
];

// Each waypoint can render a centered title quote
const QUOTES = {
  2: { quote: '"Aaiye, Grisha mein swagat hai."', by: '— SOFTLY, AS YOU STEP IN' },
  3: { quote: '"A boutique grows like a garden —\neach piece, a fruit of someone\'s hand."', by: '— THE GRISHA TREE' },
  5: { quote: '"The catalogue is just here.\nShall I open it for you?"', by: '— ANAYA, AT RECEPTION' },
};

// ===================================================================
// APP
// ===================================================================
const App = () => {
  const [waypoint, setWaypoint] = useState(0);       // 0..PATH.length-1
  const [doorOpen, setDoorOpen] = useState(false);    // pane rotation
  const [doorPushed, setDoorPushed] = useState(false);// prompt gone
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [wipe, setWipe] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hoverAction, setHoverAction] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  const W = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const H = typeof window !== 'undefined' ? window.innerHeight : 800;
  // subtle cursor parallax look (limited so it doesn't break geometry)
  const lookX = ((mouse.x / W) - 0.5) * 6;  // -3..+3 deg

  // ---- Track mouse + hover targets ----
  useEffect(() => {
    const onMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    const onOver = (e) => {
      const t = e.target;
      const isAction = !!(t && t.closest && t.closest('.book-3d, .flip, .shop-cta, .catalog-close, .hud-bottom-right button, .doorway-3d, .book-dots .dot'));
      setHoverAction(isAction);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, []);

  // ---- Show scene title when waypoint changes (if there's a quote) ----
  useEffect(() => {
    const q = QUOTES[waypoint];
    if (q) {
      const t1 = setTimeout(() => setShowTitle(true), 800);
      const t2 = setTimeout(() => setShowTitle(false), 4800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setShowTitle(false);
    }
  }, [waypoint]);

  // ---- Advance the camera one waypoint forward ----
  const advance = useCallback(() => {
    setWaypoint(w => {
      const next = Math.min(PATH.length - 1, w + 1);
      if (next !== w && window.POVAudio) {
        // play a soft footstep on each advance (not on the initial push)
        if (w > 0) window.POVAudio.footstep();
      }
      return next;
    });
  }, []);

  const back = useCallback(() => {
    setWaypoint(w => Math.max(0, w - 1));
  }, []);

  // ---- Main click handler on the whole stage ----
  const onStageClick = useCallback((e) => {
    // Click on book → open catalog (handled by book click handler? Actually
    // stop the world from advancing if the click was on the book)
    if (e.target && e.target.closest && e.target.closest('.book-3d')) {
      if (waypoint >= 4) {
        if (window.POVAudio) window.POVAudio.tick();
        setCatalogOpen(true);
        return;
      }
    }

    if (waypoint === 0 && !doorPushed) {
      // First click: push the doors open
      setDoorPushed(true);
      if (window.POVAudio) window.POVAudio.doorOpen();
      // Doors start swinging at 80ms
      setTimeout(() => setDoorOpen(true), 80);
      // Then begin the walk forward at 800ms (mid-swing — feels natural)
      setTimeout(() => setWaypoint(1), 800);
      return;
    }

    // After the door is open: each click advances by one waypoint
    if (doorOpen && waypoint < PATH.length - 1) {
      advance();
    }
  }, [waypoint, doorPushed, doorOpen, advance]);

  // ---- Keyboard ----
  useEffect(() => {
    const onKey = (e) => {
      if (catalogOpen) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        if (waypoint === 0 && !doorPushed) {
          onStageClick({ target: document.body });
        } else {
          advance();
        }
      } else if (e.key === 'ArrowLeft') {
        back();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, back, waypoint, doorPushed, catalogOpen, onStageClick]);

  // ---- Catalog → shop handoff ----
  const onShop = useCallback(() => {
    if (window.POVAudio) window.POVAudio.chime();
    setWipe(true);
    setTimeout(() => {
      setCatalogOpen(false);
      setHandoff(true);
      setTimeout(() => setWipe(false), 80);
    }, 500);
  }, []);

  // ---- Restart ----
  const restart = useCallback(() => {
    setWipe(true);
    setTimeout(() => {
      setWaypoint(0);
      setDoorOpen(false);
      setDoorPushed(false);
      setCatalogOpen(false);
      setHandoff(false);
      setTimeout(() => setWipe(false), 80);
    }, 400);
  }, []);

  // ---- Mute ----
  const onMute = () => {
    setMuted(m => {
      const next = !m;
      if (window.POVAudio) window.POVAudio.setMuted(next);
      return next;
    });
  };

  const atReception = waypoint >= 4;
  const camZ = PATH[waypoint].z;
  const q = QUOTES[waypoint];

  return (
    <div className="stage" onClick={onStageClick}>
      <Cursor x={mouse.x} y={mouse.y} overAction={hoverAction} />

      <div className="hud-top">{LABELS[waypoint]} &nbsp;·&nbsp; grisha</div>

      <World3D
        camZ={camZ}
        lookX={lookX}
        doorOpen={doorOpen}
        doorOpening={doorPushed && !doorOpen}
        atReception={atReception}
      />

      {/* Centered quote overlay at certain waypoints */}
      <div className={`scene-title ${showTitle && q ? 'visible' : ''}`}>
        {q && (
          <>
            <div className="quote" style={{ whiteSpace: 'pre-line' }}>{q.quote}</div>
            <div className="by">{q.by}</div>
          </>
        )}
      </div>

      {/* "push to enter" prompt at waypoint 0 */}
      {waypoint === 0 && (
        <div className={`prompt ${doorPushed ? 'gone' : ''}`}>
          <span className="glyph">✦</span>
          Click to enter
          <span className="glyph">✦</span>
        </div>
      )}
      {/* Continue prompt during walk */}
      {waypoint > 0 && waypoint < PATH.length - 1 && (
        <div className="prompt">
          <span className="glyph">→</span>
          Click to walk forward
          <span className="glyph">→</span>
        </div>
      )}
      {/* At reception, prompt to open book */}
      {waypoint === PATH.length - 1 && !catalogOpen && (
        <div className="prompt">
          <span className="glyph">✦</span>
          Click the catalogue
          <span className="glyph">✦</span>
        </div>
      )}

      {/* Catalog */}
      <CatalogOverlay
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        onShop={onShop}
      />

      {/* Final handoff */}
      <div className={`handoff ${handoff ? 'visible' : ''}`}>
        <div className="handoff-card">
          <div className="url">shop.grisha.in</div>
          <div className="head">Stepping into the shop</div>
          <div className="sub">Routing to the funnel</div>
          <div className="handoff-dots"><span /><span /><span /></div>
        </div>
      </div>

      {/* Global wipe */}
      <div className={`wipe ${wipe ? 'on' : ''}`} />

      {/* HUD controls */}
      <div className="hud-bottom-right">
        {(waypoint > 0 || handoff) && (
          <button title="Restart" onClick={(e) => { e.stopPropagation(); restart(); }}>↻</button>
        )}
        <button title={muted ? 'Unmute' : 'Mute'} onClick={(e) => { e.stopPropagation(); onMute(); }}>{muted ? '○' : '♪'}</button>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
