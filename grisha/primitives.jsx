// Sketch primitives — reusable wireframe pieces

const Box = ({ children, style, className = '', variant = 'dashed', ...rest }) => {
  const cls = variant === 'solid' ? 'sk-box-solid'
    : variant === 'soft' ? 'sk-box-soft'
    : variant === 'accent' ? 'sk-box-accent'
    : 'sk-box';
  return <div className={`${cls} ${className}`} style={style} {...rest}>{children}</div>;
};

const Note = ({ children, style, rotate = -1.2 }) => (
  <div className="sk-note" style={{ ...style, transform: `rotate(${rotate}deg)` }}>{children}</div>
);

const Callout = ({ children, style }) => (
  <div className="sk-callout" style={style}>{children}</div>
);

// Inline sketchy arrow between two points (relative to a positioned parent)
const Arrow = ({ from, to, curve = 30, dashed = false, color = 'var(--ink)', label, labelOffset = -10 }) => {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - curve;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  const id = React.useId();
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
      <defs>
        <marker id={`ah-${id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>
      <path d={d} stroke={color} strokeWidth="1.6" fill="none"
        strokeDasharray={dashed ? '5 4' : 'none'} markerEnd={`url(#ah-${id})`} />
      {label && (
        <text x={mx} y={my + labelOffset} textAnchor="middle" fontFamily="Kalam, cursive" fontSize="13" fill={color}>{label}</text>
      )}
    </svg>
  );
};

// Frame headers
const DesktopFrame = ({ children, style }) => (
  <div className="sk-frame-desktop" style={{ width: '100%', height: '100%', ...style }}>
    <div className="sk-titlebar">
      <span className="dot" /><span className="dot" /><span className="dot" />
      <span className="sk-mono" style={{ fontSize: 10, color: 'var(--ink-faint)', marginLeft: 8 }}>grisha.in</span>
    </div>
    <div style={{ position: 'relative', height: 'calc(100% - 22px)' }}>{children}</div>
  </div>
);

const MobileFrame = ({ children, style }) => (
  <div className="sk-frame-mobile" style={{ width: '100%', height: '100%', ...style }}>
    <div style={{
      height: 26, display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
      paddingBottom: 4, borderBottom: '1px dashed var(--ink-faint)'
    }}>
      <div style={{ width: 60, height: 14, borderRadius: 7, background: 'var(--ink)' }} />
    </div>
    <div style={{ position: 'relative', height: 'calc(100% - 26px)' }}>{children}</div>
  </div>
);

// Glass doors graphic — `open` 0..1 controls how open they appear
const Doors = ({ open = 0, width = '100%', height = '100%', label = 'GRISHA', style }) => {
  const angle = open * 22; // perspective swing
  const shift = open * 18;
  return (
    <div style={{ position: 'relative', width, height, perspective: 900, ...style }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%',
        transformOrigin: 'left center',
        transform: `rotateY(-${angle}deg) translateX(-${shift}%)`,
        transition: 'transform 0.4s ease',
      }} className="sk-door-pane">
        <div className="sk-door-handle" style={{ right: 6, top: '40%', height: '20%' }} />
        <div style={{
          position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%) rotate(-90deg)',
          fontFamily: 'Kalam, cursive', fontSize: 16, letterSpacing: 6, color: 'var(--ink)'
        }}>{label.slice(0, 3)}</div>
      </div>
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%',
        transformOrigin: 'right center',
        transform: `rotateY(${angle}deg) translateX(${shift}%)`,
        transition: 'transform 0.4s ease',
      }} className="sk-door-pane">
        <div className="sk-door-handle" style={{ left: 6, top: '40%', height: '20%' }} />
        <div style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%) rotate(-90deg)',
          fontFamily: 'Kalam, cursive', fontSize: 16, letterSpacing: 6, color: 'var(--ink)'
        }}>{label.slice(3)}</div>
      </div>
    </div>
  );
};

// Open catalog book on a counter
const Book = ({ width = 220, height = 140, openPage = 1, style, label = 'CATALOG' }) => (
  <div style={{ position: 'relative', width, height, ...style }}>
    <div className="sk-book-spine" style={{ position: 'absolute', inset: 0, borderRadius: 3 }}>
      <div style={{
        position: 'absolute', left: 8, right: '52%', top: 8, bottom: 8,
        padding: 8, fontSize: 10, color: 'var(--ink-soft)', lineHeight: 1.3
      }}>
        <div style={{ borderBottom: '1px solid var(--ink-faint)', paddingBottom: 4, marginBottom: 6, fontSize: 9, letterSpacing: 1 }} className="sk-cap">{label}</div>
        <div style={{ height: 6, background: 'rgba(26,23,20,0.1)', marginBottom: 4, width: '70%' }} />
        <div style={{ height: 6, background: 'rgba(26,23,20,0.1)', marginBottom: 4, width: '90%' }} />
        <div style={{ height: 6, background: 'rgba(26,23,20,0.1)', marginBottom: 4, width: '60%' }} />
        <div style={{ height: 6, background: 'rgba(26,23,20,0.1)', marginBottom: 4, width: '80%' }} />
      </div>
      <div style={{
        position: 'absolute', right: 8, left: '52%', top: 8, bottom: 8,
        padding: 8
      }}>
        <div className="sk-hatch" style={{ width: '100%', height: '60%', border: '1px dashed var(--ink-faint)' }} />
        <div style={{ fontSize: 9, color: 'var(--ink-faint)', marginTop: 6, textAlign: 'center' }} className="sk-mono">pg. {openPage * 2}</div>
      </div>
    </div>
  </div>
);

// Sketchy "image placeholder" with diagonal cross
const ImgPh = ({ width = '100%', height = '100%', label, style, dense = false }) => (
  <div style={{ position: 'relative', width, height, ...style }} className={`sk-box ${dense ? 'sk-hatch-dense' : 'sk-hatch'}`}>
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <line x1="0" y1="0" x2="100%" y2="100%" stroke="var(--ink-faint)" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="100%" y1="0" x2="0" y2="100%" stroke="var(--ink-faint)" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
    {label && (
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--ink-soft)',
        background: 'rgba(251,250,246,0.7)', margin: 'auto', height: 18, width: 'fit-content',
        padding: '0 8px', borderRadius: 3
      }}>{label}</div>
    )}
  </div>
);

// Frame caption strip (bottom of every artboard)
const Caption = ({ idx, title, children }) => (
  <div style={{
    position: 'absolute', left: 12, right: 12, bottom: 10,
    display: 'flex', alignItems: 'flex-start', gap: 10,
    fontFamily: 'Kalam, cursive'
  }}>
    <div style={{
      flex: '0 0 auto', minWidth: 22, height: 22, borderRadius: '50%',
      border: '1.5px solid var(--accent)', color: 'var(--accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, background: 'var(--paper)'
    }}>{idx}</div>
    <div>
      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{title}</div>
      {children && <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 1 }}>{children}</div>}
    </div>
  </div>
);

// Stage — a paper background for placing things absolutely
const Stage = ({ children, style, grid = true }) => (
  <div className={grid ? 'sk-paper' : 'sk-paper-clean'} style={{ width: '100%', height: '100%', ...style }}>
    {children}
  </div>
);

Object.assign(window, {
  Box, Note, Callout, Arrow, DesktopFrame, MobileFrame,
  Doors, Book, ImgPh, Caption, Stage
});
