// Variations B: V4 Split-screen Theatre, V5 (WILDCARD) First-person POV

// ====================================================================
// V4 — SPLIT-SCREEN RECEPTION (theatrical)
// Doors open → screen parts horizontally → left receptionist copy,
// right open catalog. Both columns live in same scene.
// ====================================================================

const V4_Desktop_01 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      <div style={{ position: 'absolute', inset: 0, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 30, letterSpacing: 5, marginTop: 6 }}>GRISHA</div>
        <div style={{ flex: 1, width: '64%', marginTop: 14 }}>
          <Doors open={0} />
        </div>
        <Callout>push to enter ✦</Callout>
      </div>
      <Caption idx="1" title="Closed doors — single CTA" />
    </Stage>
  </DesktopFrame>
);

const V4_Desktop_02 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        {/* LEFT: receptionist column */}
        <div style={{ flex: 1, padding: 22, position: 'relative', borderRight: '1.5px dashed var(--ink-faint)' }}>
          <ImgPh label="receptionist · portrait" style={{ position: 'absolute', top: 22, left: 22, width: 100, height: 130 }} />
          <div style={{ marginLeft: 130, marginTop: 18, fontFamily: 'Cormorant Garamond, serif', fontSize: 18, lineHeight: 1.35, color: 'var(--ink)' }}>
            "Namaskar.<br/>I'm Anaya —<br/>may I show you<br/>the collection?"
          </div>
          <div style={{ position: 'absolute', bottom: 56, left: 22, right: 22 }}>
            <div className="sk-cap sk-mono" style={{ fontSize: 9, color: 'var(--ink-faint)', letterSpacing: 3, marginBottom: 8 }}>OR — CHOOSE A ROOM</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Box style={{ padding: '5px 10px', fontSize: 12 }}>↳ Heritage</Box>
              <Box style={{ padding: '5px 10px', fontSize: 12 }}>↳ Atelier · Bespoke</Box>
              <Box style={{ padding: '5px 10px', fontSize: 12 }}>↳ Lookbook S/S '26</Box>
              <Box variant="accent" style={{ padding: '5px 10px', fontSize: 12, background: 'var(--paper)' }}>↳ The Shop ↗</Box>
            </div>
          </div>
        </div>
        {/* RIGHT: catalog column */}
        <div style={{ flex: 1, padding: 22, position: 'relative', background: 'var(--paper-warm)' }}>
          <div className="sk-cap sk-mono" style={{ fontSize: 9, color: 'var(--ink-faint)', letterSpacing: 3 }}>THE CATALOGUE</div>
          <div style={{ marginTop: 12, height: 'calc(100% - 90px)' }}>
            <Book width="100%" height="100%" openPage={2} />
          </div>
          <Note style={{ position: 'absolute', bottom: 60, right: 14, width: 130 }} rotate={2}>
            hover corner to flip · click spread to enter that room
          </Note>
        </div>
      </div>
      <Caption idx="2" title="Split reveal — receptionist + catalog">
        Two columns slide apart from center as doors swing. Both narrative + interaction at once.
      </Caption>
    </Stage>
  </DesktopFrame>
);

const V4_Desktop_03 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      <div style={{ position: 'absolute', inset: 0, padding: 18, display: 'flex', gap: 12 }}>
        {/* Catalog inflates */}
        <div style={{ flex: 2, position: 'relative' }}>
          <Book width="100%" height="86%" openPage={6} label="ATELIER · BESPOKE" />
          <Note style={{ position: 'absolute', top: -4, left: 30, width: 130 }}>
            spread shows the chosen room
          </Note>
        </div>
        {/* Mini sidebar */}
        <div style={{ width: 130, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Box style={{ padding: 6, fontSize: 11 }}>Heritage</Box>
          <Box variant="accent" style={{ padding: 6, fontSize: 11, background: 'var(--paper)' }}>Atelier ●</Box>
          <Box style={{ padding: 6, fontSize: 11 }}>Lookbook</Box>
          <div style={{ flex: 1 }} />
          <div style={{ padding: '8px 10px', background: 'var(--accent)', color: 'var(--paper)', fontSize: 13, borderRadius: 3, textAlign: 'center' }}>
            enter shop ↗
          </div>
        </div>
      </div>
      <Caption idx="3" title="Catalog focused — pick a page, ship to GHL" />
    </Stage>
  </DesktopFrame>
);

const V4_Mobile = ({ frame }) => (
  <MobileFrame>
    <Stage grid={false}>
      {frame === 1 && (
        <div style={{ position: 'absolute', inset: 0, padding: 12 }}>
          <div style={{ textAlign: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 22, letterSpacing: 4 }}>GRISHA</div>
          <div style={{ height: '74%', marginTop: 10 }}><Doors open={0} /></div>
        </div>
      )}
      {frame === 2 && (
        <div style={{ position: 'absolute', inset: 0, padding: 10 }}>
          {/* Vertical stack on mobile (split becomes top/bottom) */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <ImgPh label="anaya" style={{ width: 56, height: 70 }} />
            <div style={{ flex: 1, fontFamily: 'Cormorant Garamond, serif', fontSize: 13, lineHeight: 1.3 }}>
              "Namaskar. May I show you the collection?"
            </div>
          </div>
          <Book width="100%" height="50%" />
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--ink-faint)' }} className="sk-cap">CHOOSE</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <Box style={{ flex: 1, padding: 4, fontSize: 10 }}>Heritage</Box>
            <Box style={{ flex: 1, padding: 4, fontSize: 10 }}>Atelier</Box>
            <Box style={{ flex: 1, padding: 4, fontSize: 10 }}>Look</Box>
          </div>
        </div>
      )}
      {frame === 3 && (
        <div style={{ position: 'absolute', inset: 0, padding: 10 }}>
          <Book width="100%" height="78%" />
          <div style={{ marginTop: 6, padding: 6, background: 'var(--accent)', color: 'var(--paper)', textAlign: 'center', borderRadius: 3, fontSize: 12 }}>
            enter shop ↗
          </div>
        </div>
      )}
    </Stage>
  </MobileFrame>
);

// ====================================================================
// V5 — WILDCARD: FIRST-PERSON POV WALK-IN
// Two hand silhouettes push doors apart; camera moves through; cursor
// parallax look-around; book floats up to face.
// ====================================================================

const V5_Desktop_01 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      <div style={{ position: 'absolute', inset: 0 }}>
        {/* full-bleed glass doors */}
        <Doors open={0.15} style={{ position: 'absolute', inset: 0 }} />
        {/* Hand silhouettes reaching in foreground */}
        <div style={{ position: 'absolute', left: '15%', bottom: 30, width: 90, height: 110 }}>
          <div className="sk-hatch-dense sk-box" style={{ width: '100%', height: '70%', borderRadius: '40% 30% 20% 20% / 30% 60% 30% 20%' }} />
          <div style={{ position: 'absolute', bottom: -12, left: 0, fontSize: 10, color: 'var(--ink-faint)' }} className="sk-mono">your L hand</div>
        </div>
        <div style={{ position: 'absolute', right: '15%', bottom: 30, width: 90, height: 110 }}>
          <div className="sk-hatch-dense sk-box" style={{ width: '100%', height: '70%', borderRadius: '30% 40% 20% 20% / 60% 30% 20% 30%' }} />
          <div style={{ position: 'absolute', bottom: -12, right: 0, fontSize: 10, color: 'var(--ink-faint)' }} className="sk-mono">your R hand</div>
        </div>
        <Note style={{ position: 'absolute', top: 18, left: 20, width: 160 }} rotate={-2}>
          first-person · two hands enter from below, reach for handles
        </Note>
        <Callout style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)' }}>
          ✦ drag to push open ✦
        </Callout>
      </div>
      <Caption idx="1" title="POV — reach for the doors" />
    </Stage>
  </DesktopFrame>
);

const V5_Desktop_02 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      <div style={{ position: 'absolute', inset: 0 }}>
        {/* doors swung wide */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: '22%', height: '100%' }} className="sk-door-pane" />
        <div style={{ position: 'absolute', right: 0, top: 0, width: '22%', height: '100%' }} className="sk-door-pane" />
        {/* Interior — parallax layers */}
        <div style={{ position: 'absolute', left: '22%', right: '22%', top: 0, bottom: 0, overflow: 'hidden' }}>
          {/* far wall */}
          <ImgPh label="far wall · chandelier" style={{ position: 'absolute', inset: 0 }} />
          {/* mid: reception desk */}
          <div style={{
            position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)',
            width: '60%', height: 50, background: 'var(--paper-warm)', border: '1.5px solid var(--ink)', borderRadius: 3
          }}>
            <Book width={70} height={28} style={{ position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)' }} />
          </div>
        </div>
        {/* Cursor / gaze indicator */}
        <div style={{ position: 'absolute', left: '46%', top: '40%', width: 16, height: 16, border: '1.5px solid var(--accent)', borderRadius: '50%' }}>
          <div style={{ position: 'absolute', inset: 5, background: 'var(--accent)', borderRadius: '50%' }} />
        </div>
        <Note style={{ position: 'absolute', top: 14, right: 14, width: 150 }} rotate={3}>
          mouse moves = scene parallaxes. cursor is your gaze.
        </Note>
      </div>
      <Caption idx="2" title="Inside — parallax look-around" />
    </Stage>
  </DesktopFrame>
);

const V5_Desktop_03 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <ImgPh label="interior · dim · soft focus" style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(251,250,246,0.7)' }} />
        {/* Book floats up to face */}
        <div style={{ position: 'absolute', left: '8%', right: '8%', top: '12%', bottom: '14%', transform: 'rotate(-1deg)' }}>
          <Book width="100%" height="100%" openPage={5} label="THE CATALOGUE" />
        </div>
        <Note style={{ position: 'absolute', top: 8, right: 14, width: 140 }} rotate={-3}>
          book lifts to face · pages flip with cursor drag
        </Note>
        <div style={{
          position: 'absolute', bottom: 50, right: 24,
          padding: '10px 18px', background: 'var(--accent)', color: 'var(--paper)',
          fontFamily: 'Kalam', borderRadius: 3, transform: 'rotate(1deg)'
        }}>
          enter the shop ↗
        </div>
      </div>
      <Caption idx="3" title="Catalog rises — handoff to shop" />
    </Stage>
  </DesktopFrame>
);

const V5_Desktop_04 = () => (
  <DesktopFrame>
    <Stage grid={false}>
      <div style={{ position: 'absolute', inset: 0 }}>
        {/* zoom into book becomes shop */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <ImgPh label="shop.grisha.in" />
        </div>
        <div style={{ position: 'absolute', inset: 0, padding: 18 }}>
          <div className="sk-mono" style={{ fontSize: 10, color: 'var(--ink-faint)' }}>shop.grisha.in</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12, height: 'calc(100% - 50px)' }}>
            {[...Array(8)].map((_, i) => <ImgPh key={i} label="product" />)}
          </div>
        </div>
        <Note style={{ position: 'absolute', top: 28, right: 14, width: 150 }} rotate={2}>
          book zooms in → pages dissolve into product grid · subdomain swaps mid-fade
        </Note>
      </div>
      <Caption idx="4" title="Zoom-through → GHL funnel" />
    </Stage>
  </DesktopFrame>
);

const V5_Mobile = ({ frame }) => (
  <MobileFrame>
    <Stage grid={false}>
      {frame === 1 && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <Doors open={0.15} />
          <div style={{ position: 'absolute', left: 16, bottom: 18, width: 36, height: 50 }} className="sk-hatch-dense sk-box" />
          <div style={{ position: 'absolute', right: 16, bottom: 18, width: 36, height: 50 }} className="sk-hatch-dense sk-box" />
          <Callout style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', fontSize: 11 }}>swipe apart →</Callout>
        </div>
      )}
      {frame === 2 && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <ImgPh label="interior POV" />
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 12, height: 12, border: '1.5px solid var(--accent)', borderRadius: '50%' }}>
            <div style={{ position: 'absolute', inset: 3, background: 'var(--accent)', borderRadius: '50%' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: 'var(--ink-faint)' }}>tilt phone = look around</div>
        </div>
      )}
      {frame === 3 && (
        <div style={{ position: 'absolute', inset: 0, padding: 10 }}>
          <Book width="100%" height="80%" />
          <div style={{ marginTop: 6, padding: 6, background: 'var(--accent)', color: 'var(--paper)', textAlign: 'center', borderRadius: 3, fontSize: 12 }}>enter shop ↗</div>
        </div>
      )}
    </Stage>
  </MobileFrame>
);

Object.assign(window, {
  V4_Desktop_01, V4_Desktop_02, V4_Desktop_03, V4_Mobile,
  V5_Desktop_01, V5_Desktop_02, V5_Desktop_03, V5_Desktop_04, V5_Mobile,
});
