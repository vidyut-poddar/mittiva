// Grisha — synthesized SFX (grand & chic, no creaks)

(function () {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  // ----- DOOR OPENING — grand, chic, hotel-lobby -----
  // Layers:
  //   1. Deep resonant swell (low sine 55 Hz + 110 Hz, slow envelope, ~3.5s)
  //   2. Soft whoosh of air (filtered noise, gentle attack, ~2.2s)
  //   3. Brass chime accents (sine bell at 880/1320/1760 Hz, struck at t=0)
  //   4. Subtle harmonic shimmer (high sine 2640 Hz, very quiet)
  function doorOpen() {
    if (muted) return;
    const c = ensure(); if (!c) return;
    const t0 = c.currentTime;
    const master = c.createGain();
    master.gain.value = 0.85;
    master.connect(c.destination);

    // ----- 1. Deep resonant swell -----
    [55, 110].forEach((f, i) => {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t0);
      const g = c.createGain();
      const peak = i === 0 ? 0.32 : 0.16;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(peak, t0 + 0.6);
      g.gain.linearRampToValueAtTime(peak * 0.6, t0 + 1.8);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 3.5);
      osc.connect(g).connect(master);
      osc.start(t0);
      osc.stop(t0 + 3.6);
    });

    // ----- 2. Soft whoosh — pink-ish noise through bandpass -----
    const dur = 2.2;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      // Pink-ish noise: cheap low-pass of white noise
      const white = Math.random() * 2 - 1;
      last = (last * 0.92 + white * 0.08);
      // Slow attack, gentle decay
      const t = i / data.length;
      const env = Math.pow(t, 0.6) * Math.pow(1 - t, 1.2);
      data[i] = last * env * 1.4;
    }
    const noise = c.createBufferSource();
    noise.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(450, t0);
    bp.frequency.exponentialRampToValueAtTime(280, t0 + dur);
    bp.Q.value = 0.7;
    const ng = c.createGain();
    ng.gain.value = 0.25;
    noise.connect(bp).connect(ng).connect(master);
    noise.start(t0 + 0.15);

    // ----- 3. Brass chime — bell-like struck tone -----
    [880, 1320, 1760].forEach((f, i) => {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = c.createGain();
      const peak = 0.08 / (i + 1);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(peak, t0 + 0.025 + i * 0.04);
      g.gain.exponentialRampToValueAtTime(0.0005, t0 + 2.4);
      osc.connect(g).connect(master);
      osc.start(t0 + i * 0.04);
      osc.stop(t0 + 2.5);
    });

    // ----- 4. High shimmer — very quiet, adds air -----
    const osc4 = c.createOscillator();
    osc4.type = 'sine';
    osc4.frequency.value = 2640;
    const g4 = c.createGain();
    g4.gain.setValueAtTime(0, t0);
    g4.gain.linearRampToValueAtTime(0.012, t0 + 0.4);
    g4.gain.exponentialRampToValueAtTime(0.0005, t0 + 2.0);
    osc4.connect(g4).connect(master);
    osc4.start(t0);
    osc4.stop(t0 + 2.1);
  }

  // ----- FOOTSTEP — soft thud, used during camera dolly -----
  function footstep() {
    if (muted) return;
    const c = ensure(); if (!c) return;
    const t0 = c.currentTime;
    // Low-frequency thud
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t0);
    osc.frequency.exponentialRampToValueAtTime(60, t0 + 0.18);
    const g = c.createGain();
    g.gain.setValueAtTime(0.18, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.25);
    osc.connect(g).connect(c.destination);
    osc.start(t0); osc.stop(t0 + 0.3);

    // Touch of noise (the slap)
    const bufSize = Math.floor(c.sampleRate * 0.05);
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 2);
    const src = c.createBufferSource(); src.buffer = buf;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 800;
    const ng = c.createGain(); ng.gain.value = 0.06;
    src.connect(lp).connect(ng).connect(c.destination);
    src.start(t0);
  }

  // ----- PAGE FLIP — subtle paper rustle -----
  function pageFlip() {
    if (muted) return;
    const c = ensure(); if (!c) return;
    const t0 = c.currentTime;
    const dur = 0.32;
    const bufSize = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + white) / 2;
      const env = Math.pow(1 - i / bufSize, 1.5);
      data[i] = last * env * 0.7;
    }
    const src = c.createBufferSource(); src.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.5;
    const g = c.createGain(); g.gain.value = 0.16;
    src.connect(bp).connect(g).connect(c.destination);
    src.start(t0);
  }

  // ----- CHIME — handoff success -----
  function chime() {
    if (muted) return;
    const c = ensure(); if (!c) return;
    const t0 = c.currentTime;
    const dur = 2.4;
    [880, 1320, 1760, 2640].forEach((f, i) => {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = c.createGain();
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.10 / (i + 1), t0 + 0.02 + i * 0.05);
      g.gain.exponentialRampToValueAtTime(0.0005, t0 + dur);
      osc.connect(g).connect(c.destination);
      osc.start(t0 + i * 0.04);
      osc.stop(t0 + dur + 0.05);
    });
  }

  // ----- SOFT TICK — hover/click feedback -----
  function tick() {
    if (muted) return;
    const c = ensure(); if (!c) return;
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1760;
    const g = c.createGain();
    g.gain.setValueAtTime(0.04, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
    osc.connect(g).connect(c.destination);
    osc.start(t0); osc.stop(t0 + 0.13);
  }

  window.POVAudio = {
    doorOpen, footstep, pageFlip, chime, tick,
    // backwards-compat alias used by older code
    doorCreak: doorOpen,
    setMuted(v) { muted = !!v; },
    isMuted() { return muted; },
  };
})();
