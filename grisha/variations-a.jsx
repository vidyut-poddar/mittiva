// Variations A: V1 Foyer, V2 Cinematic scroll, V3 Floor plan
// Each variation exposes Desktop + Mobile frame components.

// ====================================================================
// V1 — CLASSIC FOYER (hotspot illustration, doors open inline)
// ====================================================================

const V1_Desktop_01 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      <div style={{ position: 'absolute', inset: 0, padding: 28 }}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div className="sk-cap sk-mono" style={{ fontSize: 9, color: 'var(--ink-faint)', letterSpacing: 4 }}>KOLKATA · EST. 2014</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, letterSpacing: 6, marginTop: 4 }}>GRISHA</div>
        </div>
        <div style={{ position: 'relative', height: 'calc(100% - 100px)', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '62%', height: '100%' }}>
            <Doors open={0} label="GRISHA" />
          </div>
          <Callout style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', fontSize: 16 }}>
            ✦ push to enter ✦
          </Callout>
        </div>
      </div>
      <Caption idx="1" title="Arrival — closed glass doors">
        Hero. Hover the doors → faint inward shadow. Click anywhere → doors swing open.
      </Caption>
    </Stage>
  </DesktopFrame>
);

const V1_Desktop_02 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      {/* Doors framing the scene */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', left: 0, top: 22, bottom: 0, width: '14%', borderRight: '1.5px solid var(--ink)', background: 'rgba(0,0,0,0.02)' }} />
        <div style={{ position: 'absolute', right: 0, top: 22, bottom: 0, width: '14%', borderLeft: '1.5px solid var(--ink)', background: 'rgba(0,0,0,0.02)' }} />
        <div style={{ position: 'absolute', left: '15%', right: '15%', top: 30, bottom: 60 }}>
          <ImgPh label="foyer · marble · brass" />
          {/* Three doorway placeholders */}
          <Box style={{ position: 'absolute', left: 18, top: 24, width: 70, height: 110 }} className="sk-hatch-dense">
            <div style={{ position: 'absolute', bottom: -16, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: 'var(--ink)' }}>Heritage</div>
          </Box>
          <Box style={{ position: 'absolute', right: 18, top: 24, width: 70, height: 110 }} className="sk-hatch-dense">
            <div style={{ position: 'absolute', bottom: -16, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: 'var(--ink)' }}>Atelier</div>
          </Box>
          <Box style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 10, width: 90, height: 60 }} className="sk-hatch">
            <div style={{ position: 'absolute', bottom: -16, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: 'var(--ink)' }}>Lookbook</div>
          </Box>
          {/* Reception counter */}
          <div style={{
            position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
            width: '60%', height: 46, border: '1.5px solid var(--ink)', borderRadius: 4,
            background: 'var(--paper-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Book width={120} height={32} label="GRISHA" />
            <Note style={{ position: 'absolute', right: -90, top: -10, width: 80 }} rotate={4}>
              click the book →
            </Note>
          </div>
        </div>
      </div>
      <Caption idx="2" title="Foyer — interactive scene">
        Doors fade off‑screen. Hotspots: Reception (book), 3 archways → Heritage / Atelier / Lookbook.
      </Caption>
    </Stage>
  </DesktopFrame>
);

const V1_Desktop_03 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '78%', height: '70%', position: 'relative' }}>
          <Book width="100%" height="100%" label="GRISHA · CATALOGUE" openPage={3} />
          <Note style={{ position: 'absolute', top: -22, left: 30, width: 130 }}>
            page-flip animation · drag corner
          </Note>
          <div style={{
            position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)',
            padding: '8px 18px', border: '1.5px solid var(--accent)', color: 'var(--accent)',
            fontFamily: 'Kalam, cursive', borderRadius: 3, background: 'var(--paper)'
          }}>
            ↗ enter the shop
          </div>
        </div>
      </div>
      <Caption idx="3" title="Catalog — book opens fullscreen">
        Modal-style. Each spread = a category teaser. CTA → opens the GHL funnel subdomain.
      </Caption>
    </Stage>
  </DesktopFrame>
);

const V1_Desktop_04 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      <div style={{ position: 'absolute', inset: 0 }}>
        {/* Left half: receding boutique */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', overflow: 'hidden' }}>
          <ImgPh label="boutique · fading" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 40%, var(--paper) 100%)' }} />
        </div>
        {/* Right half: GHL shop preview */}
        <div style={{ position: 'absolute', right: 0, top: 0, width: '52%', height: '100%', padding: 16, background: 'var(--paper-warm)' }}>
          <div className="sk-mono" style={{ fontSize: 10, color: 'var(--ink-faint)' }}>shop.grisha.in</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 18, height: 'calc(100% - 80px)' }}>
            <ImgPh label="product" />
            <ImgPh label="product" />
            <ImgPh label="product" />
            <ImgPh label="product" />
          </div>
        </div>
        {/* portal seam */}
        <div className="sk-portal-edge" style={{ position: 'absolute', left: '48%', top: 0, bottom: 0, width: 2, height: '100%', background: 'transparent', borderLeft: '2px dashed var(--accent)' }} />
        <Note style={{ position: 'absolute', top: 18, left: '40%', width: 140 }} rotate={-3}>
          smooth wipe transition to GHL funnel sub-domain
        </Note>
      </div>
      <Caption idx="4" title="Hand-off — wipe to shop.grisha.in">
        Boutique slides left, shop slides in from right. Subdomain swap masked by the wipe.
      </Caption>
    </Stage>
  </DesktopFrame>
);

const V1_Mobile = ({ frame }) => (
  <MobileFrame>
    <Stage grid={false}>
      {frame === 1 && (
        <div style={{ position: 'absolute', inset: 0, padding: 12, display: 'flex', flexDirection: 'column' }}>
          <div style={{ textAlign: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 22, letterSpacing: 4, marginTop: 6 }}>GRISHA</div>
          <div style={{ flex: 1, marginTop: 10, marginBottom: 28 }}>
            <Doors open={0} />
          </div>
          <Callout style={{ textAlign: 'center', fontSize: 13 }}>tap to enter ✦</Callout>
        </div>
      )}
      {frame === 2 && (
        <div style={{ position: 'absolute', inset: 0, padding: 10 }}>
          <ImgPh label="foyer" style={{ height: '70%' }} />
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <Box className="sk-hatch" style={{ flex: 1, height: 36 }}><div style={{ fontSize: 10, position: 'absolute', bottom: 2, left: 4 }}>Heritage</div></Box>
            <Box className="sk-hatch" style={{ flex: 1, height: 36 }}><div style={{ fontSize: 10, position: 'absolute', bottom: 2, left: 4 }}>Lookbook</div></Box>
            <Box className="sk-hatch" style={{ flex: 1, height: 36 }}><div style={{ fontSize: 10, position: 'absolute', bottom: 2, left: 4 }}>Atelier</div></Box>
          </div>
          <div style={{ marginTop: 8, border: '1.5px solid var(--accent)', color: 'var(--accent)', padding: 8, textAlign: 'center', borderRadius: 3, fontSize: 13 }}>
            📖 open the catalog
          </div>
        </div>
      )}
      {frame === 3 && (
        <div style={{ position: 'absolute', inset: 0, padding: 10 }}>
          <Book width="100%" height="86%" />
          <div style={{ marginTop: 6, border: '1.5px solid var(--accent)', color: 'var(--accent)', padding: 6, textAlign: 'center', borderRadius: 3, fontSize: 12 }}>
            ↗ enter shop
          </div>
        </div>
      )}
    </Stage>
  </MobileFrame>
);

// ====================================================================
// V2 — CINEMATIC SCROLL WALK-IN
// ====================================================================

const V2_Desktop_01 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      <div style={{ position: 'absolute', inset: 0, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="sk-cap sk-mono" style={{ fontSize: 9, color: 'var(--ink-faint)', letterSpacing: 4 }}>SCROLL TO ENTER</div>
        <div style={{ flex: 1, width: '70%', margin: '12px 0' }}>
          <Doors open={0.05} />
        </div>
        {/* scroll indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 14, height: 22, border: '1.5px solid var(--ink)', borderRadius: 7, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', width: 2, height: 5, background: 'var(--ink)' }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>↓ scroll</span>
        </div>
        <Note style={{ position: 'absolute', right: 16, top: 60, width: 140 }} rotate={2}>
          scroll position drives door angle &amp; camera zoom — like a long scroll-jacked story
        </Note>
      </div>
      <Caption idx="1" title="0% scroll — doors front-and-center" />
    </Stage>
  </DesktopFrame>
);

const V2_Desktop_02 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      <div style={{ position: 'absolute', inset: 0, padding: 28 }}>
        {/* doors at far end */}
        <div style={{ position: 'absolute', left: '50%', top: '20%', transform: 'translateX(-50%)', width: 110, height: 90 }}>
          <Doors open={0.6} />
        </div>
        {/* corridor perspective lines */}
        <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 500 280" preserveAspectRatio="none">
          <line x1="0" y1="280" x2="250" y2="90" stroke="var(--ink-faint)" strokeDasharray="4 4" strokeWidth="1" />
          <line x1="500" y1="280" x2="250" y2="90" stroke="var(--ink-faint)" strokeDasharray="4 4" strokeWidth="1" />
          <line x1="0" y1="50" x2="250" y2="90" stroke="var(--ink-faint)" strokeDasharray="4 4" strokeWidth="1" />
          <line x1="500" y1="50" x2="250" y2="90" stroke="var(--ink-faint)" strokeDasharray="4 4" strokeWidth="1" />
        </svg>
        <div style={{ position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <div className="sk-cap" style={{ fontSize: 10, letterSpacing: 3, color: 'var(--ink-faint)' }}>EST. 2014 · KOLKATA</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, letterSpacing: 4, marginTop: 4 }}>welcome to grisha</div>
        </div>
      </div>
      <Caption idx="2" title="50% — camera moves through doorway">
        Pinned section. Doors recede, type fades in over the parallax foyer.
      </Caption>
    </Stage>
  </DesktopFrame>
);

const V2_Desktop_03 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      <div style={{ position: 'absolute', inset: 0, padding: 24 }}>
        <ImgPh label="foyer · receding into reception" style={{ height: '70%' }} />
        <div style={{
          position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)',
          width: '60%', display: 'flex', justifyContent: 'center'
        }}>
          <div style={{
            border: '1.5px solid var(--ink)', borderRadius: 3, padding: 8, background: 'var(--paper-warm)',
            display: 'flex', gap: 8, alignItems: 'center'
          }}>
            <Book width={100} height={50} />
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', maxWidth: 110 }}>
              The catalogue.<br/><span style={{ color: 'var(--accent)' }}>flip a page →</span>
            </div>
          </div>
        </div>
      </div>
      <Caption idx="3" title="80% — reception desk locks center, catalog appears" />
    </Stage>
  </DesktopFrame>
);

const V2_Desktop_04 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '82%', height: '78%', position: 'relative', transform: 'rotate(-0.5deg)' }}>
          <Book width="100%" height="100%" openPage={2} />
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 60, right: 24 }}>
        <div style={{ padding: '8px 16px', background: 'var(--accent)', color: 'var(--paper)', borderRadius: 3, fontFamily: 'Kalam, cursive' }}>
          shop this page →
        </div>
      </div>
      <Caption idx="4" title="100% — book takes over, scroll → page-flip" />
    </Stage>
  </DesktopFrame>
);

const V2_Mobile = ({ frame }) => (
  <MobileFrame>
    <Stage grid={false}>
      {frame === 1 && (
        <div style={{ position: 'absolute', inset: 0, padding: 12 }}>
          <div style={{ height: '78%' }}><Doors open={0.05} /></div>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--ink-faint)' }}>↓ scroll to step inside</div>
        </div>
      )}
      {frame === 2 && (
        <div style={{ position: 'absolute', inset: 0, padding: 12 }}>
          <div style={{ height: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: 80, height: 70 }}><Doors open={0.6} /></div>
          </div>
          <div style={{ textAlign: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 18, letterSpacing: 3 }}>welcome</div>
          <ImgPh label="foyer" style={{ height: '35%', marginTop: 12 }} />
        </div>
      )}
      {frame === 3 && (
        <div style={{ position: 'absolute', inset: 0, padding: 12 }}>
          <Book width="100%" height="80%" />
          <div style={{ marginTop: 6, padding: 6, background: 'var(--accent)', color: 'var(--paper)', textAlign: 'center', borderRadius: 3, fontSize: 12 }}>
            shop this page →
          </div>
        </div>
      )}
    </Stage>
  </MobileFrame>
);

// ====================================================================
// V3 — FLOOR PLAN (top-down spatial nav)
// ====================================================================

const V3_Desktop_01 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      <div style={{ position: 'absolute', inset: 0, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, letterSpacing: 5 }}>GRISHA</div>
        <div className="sk-cap sk-mono" style={{ fontSize: 9, color: 'var(--ink-faint)', letterSpacing: 4, marginTop: -2 }}>BALLYGUNGE · KOLKATA</div>
        <div style={{ flex: 1, width: '55%', marginTop: 14 }}>
          <Doors open={0} />
        </div>
        <Callout style={{ marginTop: 10 }}>push ✦</Callout>
      </div>
      <Caption idx="1" title="Doors — same entry beat" />
    </Stage>
  </DesktopFrame>
);

const V3_Desktop_02 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      <div style={{ position: 'absolute', inset: 0, padding: 22 }}>
        <div className="sk-cap sk-mono" style={{ fontSize: 9, color: 'var(--ink-faint)', letterSpacing: 3 }}>FLOOR PLAN · click a room</div>
        {/* Floor plan */}
        <div style={{ position: 'absolute', inset: 40, border: '2px solid var(--ink)', background: 'var(--paper-warm)' }}>
          {/* Entry south */}
          <div style={{ position: 'absolute', bottom: -2, left: '45%', width: '10%', height: 8, background: 'var(--paper-warm)', borderLeft: '2px solid var(--ink)', borderRight: '2px solid var(--ink)' }} />
          <div style={{ position: 'absolute', bottom: -22, left: '40%', fontSize: 11, color: 'var(--ink-faint)' }}>entrance</div>

          {/* Reception (center) */}
          <Box variant="accent" style={{ position: 'absolute', left: '38%', top: '40%', width: '24%', height: '25%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
            <div style={{ textAlign: 'center', fontSize: 12 }}>RECEPTION<br/><span style={{ fontSize: 10, color: 'var(--ink-faint)' }}>📖 catalog</span></div>
          </Box>

          {/* Heritage NW */}
          <Box style={{ position: 'absolute', left: '4%', top: '8%', width: '28%', height: '34%' }} className="sk-hatch">
            <div style={{ position: 'absolute', top: 6, left: 6, fontSize: 11 }}>Heritage</div>
          </Box>
          {/* Atelier NE */}
          <Box style={{ position: 'absolute', right: '4%', top: '8%', width: '28%', height: '34%' }} className="sk-hatch">
            <div style={{ position: 'absolute', top: 6, right: 6, fontSize: 11 }}>Atelier</div>
          </Box>
          {/* Lookbook S left */}
          <Box style={{ position: 'absolute', left: '4%', bottom: '8%', width: '28%', height: '34%' }} className="sk-hatch">
            <div style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 11 }}>Lookbook</div>
          </Box>
          {/* Shop S right */}
          <Box variant="accent" style={{ position: 'absolute', right: '4%', bottom: '8%', width: '28%', height: '34%', background: 'var(--paper)' }}>
            <div style={{ position: 'absolute', bottom: 6, right: 6, fontSize: 11, color: 'var(--accent)' }}>SHOP →</div>
          </Box>

          {/* Cursor avatar */}
          <div style={{ position: 'absolute', bottom: 6, left: '47%', width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)' }} />
          <svg style={{ position: 'absolute', inset: 0 }}>
            <path d="M 50% 95% Q 50% 70% 50% 52%" stroke="var(--accent)" strokeDasharray="3 3" fill="none" />
          </svg>
        </div>
        <Note style={{ position: 'absolute', top: 28, right: 28, width: 130 }} rotate={3}>
          arrow keys / cursor move dot · rooms = clickable
        </Note>
      </div>
      <Caption idx="2" title="Floor plan reveals — top-down map" />
    </Stage>
  </DesktopFrame>
);

const V3_Desktop_03 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      {/* dimmed floor plan behind */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.25, padding: 22 }}>
        <div style={{ position: 'absolute', inset: 40, border: '2px solid var(--ink)', background: 'var(--paper-warm)' }} />
      </div>
      {/* Catalog overlay */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '72%', height: '78%', position: 'relative' }}>
          <Book width="100%" height="100%" openPage={4} label="GRISHA · ROOMS" />
          <div style={{
            position: 'absolute', top: 12, right: 12, width: 24, height: 24,
            border: '1px solid var(--ink)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--paper)', fontSize: 13
          }}>×</div>
          <div style={{
            position: 'absolute', bottom: -32, left: '50%', transform: 'translateX(-50%)',
            padding: '8px 18px', background: 'var(--accent)', color: 'var(--paper)',
            fontFamily: 'Kalam', borderRadius: 3
          }}>
            ↗ open shop
          </div>
        </div>
      </div>
      <Caption idx="3" title="Reception clicked — catalog overlay" />
    </Stage>
  </DesktopFrame>
);

const V3_Mobile = ({ frame }) => (
  <MobileFrame>
    <Stage grid={false}>
      {frame === 1 && (
        <div style={{ position: 'absolute', inset: 0, padding: 12 }}>
          <div style={{ textAlign: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 20, letterSpacing: 3 }}>GRISHA</div>
          <div style={{ height: '74%', marginTop: 10 }}><Doors open={0} /></div>
        </div>
      )}
      {frame === 2 && (
        <div style={{ position: 'absolute', inset: 0, padding: 10 }}>
          <div style={{ position: 'absolute', inset: 14, border: '2px solid var(--ink)', background: 'var(--paper-warm)' }}>
            <Box className="sk-hatch" style={{ position: 'absolute', left: 6, top: 6, width: '44%', height: '30%' }}>
              <div style={{ position: 'absolute', top: 4, left: 4, fontSize: 9 }}>Heritage</div>
            </Box>
            <Box className="sk-hatch" style={{ position: 'absolute', right: 6, top: 6, width: '44%', height: '30%' }}>
              <div style={{ position: 'absolute', top: 4, right: 4, fontSize: 9 }}>Atelier</div>
            </Box>
            <Box variant="accent" style={{ position: 'absolute', left: '20%', top: '40%', width: '60%', height: '22%', background: 'var(--paper)' }}>
              <div style={{ textAlign: 'center', fontSize: 10, marginTop: 14, color: 'var(--accent)' }}>RECEPTION</div>
            </Box>
            <Box className="sk-hatch" style={{ position: 'absolute', left: 6, bottom: 6, width: '44%', height: '30%' }}>
              <div style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 9 }}>Lookbook</div>
            </Box>
            <Box variant="accent" style={{ position: 'absolute', right: 6, bottom: 6, width: '44%', height: '30%', background: 'var(--paper)' }}>
              <div style={{ position: 'absolute', bottom: 4, right: 4, fontSize: 9, color: 'var(--accent)' }}>SHOP →</div>
            </Box>
          </div>
        </div>
      )}
      {frame === 3 && (
        <div style={{ position: 'absolute', inset: 0, padding: 10 }}>
          <Book width="100%" height="86%" />
          <div style={{ marginTop: 6, padding: 6, background: 'var(--accent)', color: 'var(--paper)', textAlign: 'center', borderRadius: 3, fontSize: 12 }}>open shop ↗</div>
        </div>
      )}
    </Stage>
  </MobileFrame>
);

Object.assign(window, {
  V1_Desktop_01, V1_Desktop_02, V1_Desktop_03, V1_Desktop_04, V1_Mobile,
  V2_Desktop_01, V2_Desktop_02, V2_Desktop_03, V2_Desktop_04, V2_Mobile,
  V3_Desktop_01, V3_Desktop_02, V3_Desktop_03, V3_Mobile,
});
