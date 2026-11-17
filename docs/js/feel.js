/* Woodshed — feel: how written notes become played notes.

   Notation says what and when; this file decides how. For each style it sets
   - swing: how the off-beat eighth is delayed (0.5 = straight, 0.667 = triplet shuffle).
     Jazz swing flattens out as the tempo rises, as it does with real players.
   - accents: metric weight, off-beat accents (bebop), phrase shape (classical arch,
     louder toward high notes), short accented phrase endings ("doo-dat").
   - micro-timing: soloists sit slightly behind the beat in blues and jazz, on top in bluegrass;
     small random spread when Humanize is on.
   - articulation: note length, palm mutes, ghost notes, legato for hammer-ons and slides.
   - tone: pick brightness, vibrato on held notes, strum direction on chords. */
(function () {
  const GP = (window.GP = window.GP || {});

  const STYLE = {
    jazz:      { swing: 'auto', tone: 'archtop',  lay: 0.012, jit: 0.007, vj: 0.06, metric: 0.03, up: 0.1,  contour: 0.1,  dat: true, bright: 0.75, vib: { depth: 0.14, rate: 5.6 }, autoVib: 0.7, quarterShort: true, groove: 'swing' },
    gypsy:     { swing: 0.6,    tone: 'acoustic', lay: 0.004, jit: 0.006, vj: 0.05, metric: 0.05, up: 0.07, contour: 0.1,  dat: true, bright: 1.05, vib: { depth: 0.32, rate: 6.4 }, autoVib: 0.45, groove: 'pompe' },
    bluegrass: { swing: 0.54,   tone: 'acoustic', lay: -0.004, jit: 0.005, vj: 0.04, metric: 0.11, up: -0.02, contour: 0.06, bright: 1, vib: { depth: 0.1, rate: 5 }, autoVib: 9, groove: 'bluegrass' },
    blues:     { swing: 0.67,   tone: 'crunch',   lay: 0.018, jit: 0.009, vj: 0.07, metric: 0.05, up: 0.03, contour: 0.08, bright: 0.9, vib: { depth: 0.38, rate: 5.2 }, autoVib: 0.32, slowBend: true, groove: 'shuffle' },
    jam:       { swing: 0.55,   tone: 'lead',     lay: 0.006, jit: 0.007, vj: 0.05, metric: 0.05, up: 0.04, contour: 0.08, bright: 0.95, vib: { depth: 0.22, rate: 5.4 }, autoVib: 0.5, groove: 'rock' },
    metal:     { swing: 0.5,    tone: 'metal',    lay: 0, jit: 0.003, vj: 0.03, metric: 0.08, up: 0, contour: 0.05, bright: 0.9, vib: { depth: 0.35, rate: 6.6 }, autoVib: 0.4, groove: 'metal' },
    greek:     { swing: 0.5,    tone: 'acoustic', lay: 0.004, jit: 0.006, vj: 0.05, metric: 0.13, up: 0, contour: 0.08, bright: 1.05, vib: { depth: 0.2, rate: 6.2 }, autoVib: 0.4, groove: 'greek' },
    lebanese:  { swing: 0.5,    tone: 'nylon',    lay: 0.006, jit: 0.006, vj: 0.05, metric: 0.13, up: 0, contour: 0.08, bright: 0.95, vib: { depth: 0.22, rate: 5.6 }, autoVib: 0.4, groove: 'arabic' },
    classical: { swing: 0.5,    tone: 'nylon',    lay: 0, jit: 0.005, vj: 0.035, metric: 0.1, up: 0, contour: 0.14, arch: true, bright: 0.85, vib: { depth: 0.12, rate: 5.5 }, autoVib: 0.6, groove: 'classical' },
  };
  const FEELS = [
    { id: 'auto', label: 'Style default' },
    { id: 'straight', label: 'Straight' },
    { id: 'light', label: 'Light swing' },
    { id: 'swing', label: 'Swing' },
    { id: 'hard', label: 'Shuffle (triplet)' },
  ];

  function style(id) {
    return STYLE[id] || STYLE.jazz;
  }

  /* Swing ratio: the share of the beat taken by the on-beat eighth. */
  function jazzRatio(bpm) {
    return Math.max(0.55, Math.min(0.69, 0.7 - (bpm - 80) * 0.0011));
  }
  function ratio(lick, bpm, mode) {
    const m = GP.dsl.parseMeter(lick.meter);
    if (m.den !== 4 && m.den !== 2) return 0.5;
    if (mode === 'straight') return 0.5;
    if (mode === 'light') return 0.57;
    if (mode === 'swing') return jazzRatio(bpm);
    if (mode === 'hard') return 0.667;
    if (lick.swing === false) return 0.5;
    if (typeof lick.swing === 'number') return lick.swing;
    const s = style(lick.style).swing;
    return s === 'auto' ? jazzRatio(bpm) : s;
  }
  function label(r) {
    if (r <= 0.51) return 'Straight';
    if (r >= 0.655) return 'Shuffle';
    if (r < 0.56) return 'Lilt ' + Math.round(r * 100) + ':' + Math.round((1 - r) * 100);
    return 'Swing ' + Math.round(r * 100) + ':' + Math.round((1 - r) * 100);
  }

  /* Piecewise-linear time warp inside each beat: the off-beat eighth moves from 50% to r. */
  function warp(tick, r) {
    if (r === 0.5) return tick;
    const b = Math.floor(tick / 480);
    const x = (tick - b * 480) / 480;
    const y = x <= 0.5 ? x * 2 * r : r + (x - 0.5) * 2 * (1 - r);
    return (b + y) * 480;
  }

  /* Beats where the melody moves in 16ths or tuplets are played straight (double-time lines are even). */
  function straightBeats(parsed) {
    const set = new Set();
    for (const e of parsed.events) {
      const inBeat = e.start % 480;
      if (e.tuplet || (inBeat !== 0 && inBeat !== 240) || (e.ticks < 240 && !e.rest)) {
        set.add(Math.floor(e.start / 480));
        set.add(Math.floor((e.start + e.ticks - 1) / 480));
      }
    }
    return set;
  }

  function metricWeight(tick, meter, groups) {
    const bar = meter.barTicks;
    const p = ((tick % bar) + bar) % bar;
    if (p === 0) return 1;
    if (meter.den === 4 || meter.den === 2) {
      if (meter.num === 4 && p === 960) return 0.75;
      if (p % 480 === 0) return 0.55;
      if (p % 240 === 0) return 0.3;
      return 0.15;
    }
    let acc = 0;
    for (const g of groups) {
      acc += g * 240;
      if (p === acc) return 0.7;
    }
    if (p % 240 === 0) return 0.35;
    return 0.15;
  }

  /* Deterministic phrasing for one lick in one style. Returns one entry per event. */
  function phrase(parsed, styleId) {
    const S = style(styleId);
    const ev = parsed.events;
    const out = ev.map(() => null);
    // phrases: runs of sounding notes split by rests and long notes
    const phrases = [];
    let cur = [];
    ev.forEach((e, i) => {
      if (e.rest) {
        if (cur.length) phrases.push(cur);
        cur = [];
        return;
      }
      if (e.tie) return;
      cur.push(i);
      if (e.ticks >= 960) {
        phrases.push(cur);
        cur = [];
      }
    });
    if (cur.length) phrases.push(cur);

    for (const ph of phrases) {
      const tops = ph.map((i) => Math.max(...ev[i].notes.map((n) => n.midi)));
      const mean = tops.reduce((a, b) => a + b, 0) / tops.length;
      let peak = 0;
      tops.forEach((m, k) => { if (m > tops[peak]) peak = k; });
      ph.forEach((i, k) => {
        const e = ev[i];
        const offEighth = e.start % 480 === 240 && !e.tuplet;
        let vel = e.dyn == null ? 0.6 : e.dyn;
        vel += S.metric * (metricWeight(e.start, parsed.meter, parsed.groups) - 0.45) * 2;
        if (offEighth) vel += S.up;
        else if (S.up > 0.05 && e.start % 480 === 0 && k > 0 && k < ph.length - 1) vel -= S.up * 0.4;
        vel += S.contour * Math.max(-1, Math.min(1, (tops[k] - mean) / 7));
        if (S.arch && ph.length > 2) vel += 0.12 * (1 - Math.abs(k - peak) / ph.length) - 0.05;
        let len = 0.95;
        if (k === 0) vel += 0.04;
        const last = k === ph.length - 1 && ph.length > 1;
        if (last) {
          if (S.dat && e.ticks <= 240) {
            vel += 0.08;
            len = 0.5;
          } else if (!S.dat) {
            vel -= 0.05;
          }
        }
        if (S.quarterShort && e.ticks === 480 && !last && !(ev[i + 1] && ev[i + 1].tie)) len = 0.7;
        if (e.accent) vel += 0.22;
        if (e.ghost) {
          vel -= 0.3;
          len = Math.min(len, 0.55);
        }
        if (e.stacc) len = Math.min(len, 0.42);
        if (e.legato) vel -= 0.1;
        if (e.bend >= 1) vel += 0.05;
        if (e.notes.length > 1) vel -= 0.04;
        vel = Math.max(0.1, Math.min(1, vel));
        let bright = Math.max(0.05, Math.min(1, (0.25 + vel * 0.65) * S.bright));
        if (e.accent) bright = Math.min(1, bright + 0.12);
        if (e.ghost) bright *= 0.6;
        if (e.mute) {
          len = 0.5;
          bright = 0.2 + (e.accent ? 0.15 : 0);
        }
        out[i] = { vel, len, bright, up: !(e.start % 480 === 0) && e.notes.length > 1 };
      });
    }
    return out;
  }

  /* Gaussian-ish random number in about [-1, 1]. */
  function rnd() {
    return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  }

  GP.feel = { STYLE, FEELS, style, ratio, label, warp, straightBeats, phrase, metricWeight, rnd };
})();
