/* Woodshed — rhythm section. Generates bass, comping and drum parts for a lick in its style,
   following its chord symbols. Everything is produced in ticks (480 per quarter note) on the
   lick's bar grid; the transport applies swing and turns ticks into time. */
(function () {
  const GP = (window.GP = window.GP || {});
  const T = GP.theory;

  /* ---------- drum grooves (also used by the metronome) ---------- */
  function groupStarts(m) {
    const out = [];
    let acc = 0;
    for (const g of m.groups) {
      out.push(acc);
      acc += g * (m.den === 8 ? 240 : 1920 / m.den);
    }
    return out;
  }

  /* One bar of drums. m: { num, den, groups }. Returns [{ tick, name, vel }]. */
  function drumBar(groove, m, barIndex) {
    const out = [];
    const add = (tick, name, vel) => out.push({ tick, name, vel });
    const bt = m.num * (1920 / m.den);
    const four = m.den === 4 || m.den === 2;
    const beats = four ? m.num : 0;
    const starts = groupStarts(m);
    const eighths = (fn) => { for (let t = 0; t < bt; t += 240) fn(t, t % 480 === 0); };
    switch (groove) {
      case 'swing':
        if (four) {
          for (let b = 0; b < beats; b++) {
            add(b * 480, 'ride', b % 2 ? 0.62 : 0.5);
            if (b % 2) {
              add(b * 480 + 240, 'ride', 0.36);
              add(b * 480, 'pedal', 0.55);
            }
          }
          if (barIndex % 2 === 1 && beats === 4) add(1440 + 240, 'snare', 0.13);
          if (barIndex % 4 === 3 && beats === 4) add(720, 'snare', 0.1);
        } else starts.forEach((t, i) => add(t, 'ride', i ? 0.45 : 0.55));
        break;
      case 'shuffle':
        if (four) {
          for (let b = 0; b < beats; b++) {
            add(b * 480, 'hat', 0.45);
            add(b * 480 + 240, 'hat', 0.28);
            if (b % 2) add(b * 480, 'snare', 0.62);
            else add(b * 480, 'kick', b === 0 ? 0.6 : 0.45);
          }
        }
        break;
      case 'rock':
        eighths((t, on) => add(t, 'hat', on ? 0.34 : 0.22));
        if (four) {
          for (let b = 0; b < beats; b++) if (b % 2) add(b * 480, 'snare', 0.55);
          add(0, 'kick', 0.6);
          if (beats === 4) {
            add(960 + 240, 'kick', 0.38);
            add(1200 + 120 * 0, 'snare', 0.08);
          }
        }
        break;
      case 'metal':
        eighths((t) => add(t, 'kick', 0.55));
        eighths((t, on) => add(t, 'hat', on ? 0.32 : 0.2));
        if (four) for (let b = 0; b < beats; b++) if (b % 2) add(b * 480, 'snare', 0.72);
        if (barIndex % 4 === 0) add(0, 'crash', 0.5);
        break;
      case 'greek':
        if (four) {
          for (let b = 0; b < beats; b++) {
            add(b * 480, b % 2 ? 'tek' : 'doum', b % 2 ? 0.55 : 0.7);
            add(b * 480 + 240, 'ka', 0.22);
          }
        } else {
          starts.forEach((t, i) => add(t, i === 0 ? 'doum' : 'tek', i === 0 ? 0.75 : 0.55));
          eighths((t) => { if (!starts.includes(t)) add(t, 'ka', 0.18); });
        }
        break;
      case 'baladi':
        if (four && beats === 4) {
          [[0, 'doum', 0.75], [240, 'doum', 0.6], [720, 'tek', 0.55], [960, 'doum', 0.7], [1440, 'tek', 0.55],
            [480, 'ka', 0.18], [1200, 'ka', 0.22], [1680, 'ka', 0.25]].forEach((x) => add(...x));
          break;
        }
      // falls through to maqsum for other meters
      case 'arabic':
        if (four && beats === 4) {
          [[0, 'doum', 0.75], [240, 'tek', 0.55], [720, 'tek', 0.5], [960, 'doum', 0.7], [1440, 'tek', 0.55],
            [480, 'ka', 0.16], [1200, 'ka', 0.2], [1680, 'ka', 0.25]].forEach((x) => add(...x));
        } else if (m.num === 10 && m.den === 8) {
          // sama'i thaqil: dum - - tek - dum dum tek - -
          [[0, 'doum', 0.78], [720, 'tek', 0.55], [1200, 'doum', 0.68], [1440, 'doum', 0.62], [1680, 'tek', 0.55],
            [240, 'ka', 0.15], [480, 'ka', 0.15], [960, 'ka', 0.18], [1920, 'ka', 0.2], [2160, 'ka', 0.22]].forEach((x) => add(...x));
        } else {
          starts.forEach((t, i) => add(t, i === 0 ? 'doum' : 'tek', i === 0 ? 0.75 : 0.5));
          eighths((t) => { if (!starts.includes(t)) add(t, 'ka', 0.16); });
        }
        break;
      default:
        break;
    }
    return out;
  }

  /* ---------- harmony helpers ---------- */
  function fallbackChord(lick) {
    let root = lick.scale && lick.scale.root;
    if (!root && lick.key) {
      const m = /^([A-G][#b]?)/.exec(lick.key);
      root = m && m[1];
    }
    if (!root) return null;
    const sc = lick.scale && T.scaleById(lick.scale.id);
    const iv = sc ? sc.iv.map(Math.floor) : [0, 4, 7];
    const minor = iv.includes(3) && !iv.includes(4);
    const dom = !minor && iv.includes(10) && lick.style !== 'greek' && lick.style !== 'lebanese';
    return root + (minor ? 'm' : dom ? '7' : '');
  }

  function timeline(parsed, lick) {
    const tl = [];
    for (const e of parsed.events) {
      if (!e.chord) continue;
      const c = T.parseChord(e.chord);
      if (c) tl.push({ tick: e.start, sym: e.chord, c });
    }
    if (!tl.length) {
      const sym = fallbackChord(lick);
      if (sym) tl.push({ tick: 0, sym, c: T.parseChord(sym) });
    }
    return tl;
  }
  function chordAt(tl, tick) {
    let cur = tl[0];
    for (const x of tl) {
      if (x.tick <= tick + 1) cur = x;
      else break;
    }
    return cur;
  }
  function near(pc, target, lo, hi) {
    let best = null;
    for (let m = lo; m <= hi; m++) {
      if (((m % 12) + 12) % 12 !== ((pc % 12) + 12) % 12) continue;
      if (best == null || Math.abs(m - target) < Math.abs(best - target)) best = m;
    }
    return best;
  }
  /* Upper-structure voicing (no bass) inside [lo, hi]. */
  function upper(c, lo, hi, maxNotes) {
    const tones = c.iv.slice(1).map((v) => (c.root + v) % 12);
    if (c.iv.length <= 3) tones.push(c.root);
    const out = [];
    let prev = lo - 1;
    for (const pc of tones.slice(0, maxNotes || 4)) {
      let m = lo + ((pc - lo) % 12 + 12) % 12;
      while (m <= prev) m += 12;
      if (m > hi) m -= 12;
      if (!out.includes(m)) out.push(m);
      prev = Math.max(prev, m);
    }
    return out.sort((a, b) => a - b);
  }
  function full(c, lo) {
    const bassPc = c.bass == null ? c.root : c.bass;
    return [near(bassPc, lo + 4, lo, lo + 11)].concat(upper(c, lo + 9, lo + 26, 4));
  }

  /* ---------- the band ---------- */
  const GROOVE_FOR = { jazz: 'swing', gypsy: 'pompe', bluegrass: 'bluegrass', blues: 'shuffle', jam: 'rock', metal: 'metal', greek: 'greek', lebanese: 'arabic', classical: 'classical' };

  /* Items for bars [from, to] of the lick. Returns [{ tick, kind, ... }]:
       { kind: 'bass', midi, ticks, vel }
       { kind: 'chord', midis, ticks, vel, dir, spread, bright, pan }
       { kind: 'drum', name, vel } */
  function part(parsed, lick, from, to) {
    const groove = lick.groove || GROOVE_FOR[lick.style] || 'swing';
    const drumGroove = { swing: 'swing', shuffle: 'shuffle', rock: 'rock', metal: 'metal', greek: 'greek', arabic: 'arabic', baladi: 'baladi' }[groove] || null;
    const tl = timeline(parsed, lick);
    const m = parsed.meter;
    const bt = parsed.barTicks;
    const four = m.den === 4 || m.den === 2;
    const beat = four ? 1920 / m.den : 240;
    const beats = four ? m.num : m.num;
    const starts = groupStarts({ num: m.num, den: m.den, groups: parsed.groups });
    const items = [];
    const bass = (tick, midi, ticks, vel) => items.push({ tick, kind: 'bass', midi, ticks, vel });
    const chord = (tick, midis, ticks, vel, o) => items.push(Object.assign({ tick, kind: 'chord', midis, ticks, vel }, o));
    let prevBass = 38;

    for (let bi = from; bi <= to; bi++) {
      const g0 = bi === 0 ? 0 : parsed.bars[bi].start;
      if (drumGroove) for (const d of drumBar(drumGroove, { num: m.num, den: m.den, groups: parsed.groups }, bi)) items.push({ tick: g0 + d.tick, kind: 'drum', name: d.name, vel: d.vel });
      if (!tl.length) continue;
      const at = (t) => chordAt(tl, g0 + t).c;
      const changed = (t) => t === 0 || chordAt(tl, g0 + t) !== chordAt(tl, g0 + t - beat);

      switch (groove) {
        case 'swing': {
          // walking bass in quarter notes
          for (let b = 0; b < beats; b++) {
            const t = b * 480;
            const c = at(t);
            const nextT = t + 480;
            const next = nextT >= bt ? chordAt(tl, g0 + bt).c : at(nextT);
            const nextRoot = near(next.root, prevBass, 31, 46);
            let n;
            if (changed(t)) n = near(c.bass == null ? c.root : c.bass, prevBass, 31, 46);
            else if (next !== c || b === beats - 1) n = nextRoot + (prevBass > nextRoot ? 1 : -1);
            else {
              const cands = c.iv.slice(1, 4).map((v) => near(c.root + v, prevBass, 31, 47)).filter((x) => x !== prevBass);
              cands.sort((a, b2) => Math.abs(a - (prevBass + nextRoot) / 2) - Math.abs(b2 - (prevBass + nextRoot) / 2));
              n = cands[0] == null ? prevBass + 2 : cands[0];
            }
            bass(g0 + t, n, 440, b === 0 ? 0.62 : 0.54);
            prevBass = n;
          }
          // comping: rhythms vary bar to bar
          const PATS = [[[0, 360], [720, 200]], [[480 + 240, 200], [1440, 300]], [[240, 200], [1200, 240]], [[960 + 240, 400]]];
          const pat = PATS[bi % PATS.length];
          for (const [t, len] of pat) {
            if (t >= bt) continue;
            chord(g0 + t, upper(at(t), 52, 72, 4), len, t % 480 ? 0.36 : 0.3, { spread: 0.006, bright: 0.32, pan: 0.25 });
          }
          break;
        }
        case 'pompe': {
          for (let b = 0; b < beats; b++) {
            const t = b * 480;
            const c = at(t);
            const v = full(c, 45);
            if (b % 2 === 0) chord(g0 + t, v, 200, 0.4, { spread: 0.012, bright: 0.45, pan: -0.2 });
            else {
              chord(g0 + t - 160, v.slice(1), 40, 0.1, { dir: 'up', spread: 0.004, bright: 0.3, pan: -0.2 });
              chord(g0 + t, v, 70, 0.55, { spread: 0.008, bright: 0.72, pan: -0.2 });
            }
            if (b % 2 === 0) {
              const pc = b === 0 || changed(t) ? c.root : c.root + 7;
              const n = near(pc, prevBass, 31, 46);
              bass(g0 + t, n, 360, 0.55);
              prevBass = n;
            }
          }
          break;
        }
        case 'bluegrass': {
          for (let b = 0; b < beats; b++) {
            const t = b * 480;
            const c = at(t);
            if (b % 2 === 0) {
              const pc = changed(t) || b === 0 ? c.root : c.root + 7;
              bass(g0 + t, near(pc, 38, 31, 45), 420, 0.55);
              chord(g0 + t, [near(pc, 47, 40, 52)], 400, 0.42, { bright: 0.55, pan: -0.25 });
            } else {
              chord(g0 + t, upper(c, 52, 67, 3), 160, 0.36, { spread: 0.01, bright: 0.6, pan: -0.25 });
              chord(g0 + t, upper(c, 62, 77, 4), 30, 0.38, { spread: 0.003, bright: 0.95, pan: 0.35 });
            }
          }
          break;
        }
        case 'shuffle': {
          const deg = bi % 2 === 0 ? [0, 4, 7, 9] : [10, 9, 7, 4];
          for (let b = 0; b < beats; b++) {
            const c = at(b * 480);
            const root = near(c.root, 36, 28, 40);
            bass(g0 + b * 480, root + deg[b % 4], 400, b === 0 ? 0.62 : 0.52);
            const r5 = [near(c.root, 47, 40, 52)];
            chord(g0 + b * 480, [r5[0], r5[0] + 7], 200, 0.24, { spread: 0.004, bright: 0.25, pan: -0.3 });
            chord(g0 + b * 480 + 240, [r5[0], r5[0] + 9], 180, 0.2, { spread: 0.004, bright: 0.22, pan: -0.3 });
          }
          break;
        }
        case 'rock': {
          const c0 = at(0);
          const root = near(c0.root, 38, 31, 45);
          bass(g0, root, 560, 0.6);
          if (beats === 4) {
            bass(g0 + 720, root + 7, 200, 0.45);
            bass(g0 + 960, near(at(960).root, root, 31, 45), 360, 0.55);
            const nx = chordAt(tl, g0 + bt).c;
            bass(g0 + 1440 + 240, near(nx.root, root, 31, 45) - 2, 200, 0.42);
            chord(g0 + 720, upper(at(720), 55, 72, 3), 160, 0.3, { dir: 'up', spread: 0.01, bright: 0.55, pan: 0.3 });
            chord(g0 + 1440, upper(at(1440), 55, 72, 3), 200, 0.28, { spread: 0.01, bright: 0.5, pan: 0.3 });
          }
          break;
        }
        case 'metal': {
          for (let t = 0; t < bt; t += 240) bass(g0 + t, near(at(t).root, 33, 28, 40), 170, t % 480 ? 0.42 : 0.5);
          break;
        }
        case 'greek': {
          if (four) {
            for (let b = 0; b < beats; b++) {
              const c = at(b * 480);
              if (b % 2 === 0) bass(g0 + b * 480, near(b === 0 || changed(b * 480) ? c.root : c.root + 7, 40, 33, 47), 400, 0.55);
              else chord(g0 + b * 480, upper(c, 55, 72, 3), 180, 0.34, { spread: 0.008, bright: 0.7, pan: 0.25 });
            }
          } else {
            starts.forEach((t, i) => {
              const c = at(t);
              if (i === 0) bass(g0 + t, near(c.root, 40, 33, 47), parsed.groups[0] * 240 - 60, 0.58);
              else chord(g0 + t, upper(c, 55, 72, 3), 160, 0.34, { spread: 0.008, bright: 0.7, pan: 0.25 });
            });
          }
          break;
        }
        case 'arabic':
        case 'baladi': {
          // drone on the tonic under the doum strokes
          const c = at(0);
          const n = near(c.root, 40, 33, 47);
          bass(g0, n, Math.min(bt, 900), 0.42);
          if (four && beats === 4) bass(g0 + 960, n, 400, 0.36);
          if (m.num === 10) bass(g0 + 1200, n, 400, 0.34);
          break;
        }
        case 'classical': {
          const points = four ? (beats === 4 ? [0, 960] : [0]) : [0];
          for (const t of points) {
            if (t && !changed(t)) continue;
            const c = at(t);
            const end = points.find((x) => x > t) || bt;
            const len = end - t;
            bass(g0 + t, near(c.bass == null ? c.root : c.bass, 40, 33, 47), len * 0.95, 0.4);
            chord(g0 + t + 60, upper(c, 52, 67, 3), len * 0.9, 0.16, { spread: 0.06, bright: 0.3, pan: 0.2 });
          }
          break;
        }
        default:
          break;
      }
    }
    return items;
  }

  GP.band = { drumBar, part, groupStarts, GROOVE_FOR };
})();
