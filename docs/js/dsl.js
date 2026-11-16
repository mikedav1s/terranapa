/* Woodshed — lick notation parser.

   A lick's `notes` string is a list of space-separated tokens:

     w h q e s x        set the duration: whole, half, quarter, eighth, 16th, 32nd
     q.  e.             dotted            et  st  qt   triplet
     6/3                string 6, fret 3  (strings: 1 = high E ... 6 = low E)
     g3  c#4  bb3       a pitch by name (sounding octave; open strings are
                        E2 A2 D3 G3 B3 E4) — the fret is chosen near the current position
     @5                 set the position (fret) used to place named pitches
     5/3+4/2+3/0        several notes at once (a chord or double stop)
     r                  rest               -    tie: hold the previous note on
     |                  bar line           [Am7] chord symbol over the next note
     suffixes on a note: h hammer-on, p pull-off, s slide, ~ vibrato,
                         b bend a whole step (b1 = half step), q bend a quarter tone
*/
(function () {
  const GP = (window.GP = window.GP || {});
  const T = GP.theory;

  const BASE = { w: 1920, h: 960, q: 480, e: 240, s: 120, x: 60 };
  const VF_DUR = { w: 'w', h: 'h', q: 'q', e: '8', s: '16', x: '32' };
  const SUFFIX = /((?:h|p|s|~|b1|b2|b|q)*)$/;
  const RE_DUR = /^([whqesx])(\.|t)?$/;
  const RE_FRET = /^([1-6])\/(\d{1,2})$/;
  const RE_PITCH = /^([a-g])(#|b)?(\d)$/;

  function splitSuffix(tok, isPitch) {
    // Pitch tokens end in a digit before any suffix, fret tokens too — so strip letters after the last digit.
    const m = /^(.*\d)([a-z~0-9]*)$/.exec(tok);
    if (!m) return { core: tok, techs: [] };
    let core = m[1];
    let suf = m[2];
    // "b1"/"b2" suffixes contain digits; re-scan from the left of the suffix region.
    const full = tok;
    const sm = /^(.*?\d)((?:h|p|s|~|b1|b2|b|q)+)$/.exec(full);
    if (sm && (RE_FRET.test(sm[1]) || RE_PITCH.test(sm[1]))) {
      core = sm[1];
      suf = sm[2];
    } else {
      core = full;
      suf = '';
    }
    const techs = suf ? suf.match(/b1|b2|h|p|s|~|b|q/g) : [];
    return { core, techs };
  }

  function placePitch(midi, pos) {
    let best = null;
    for (let s = 1; s <= 6; s++) {
      const fret = midi - T.OPEN[s];
      if (fret < 0 || fret > 22) continue;
      let cost;
      if (fret === 0) cost = pos <= 4 ? 0.1 : 4;
      else if (fret < pos) cost = (pos - fret) * 1.5;
      else cost = Math.max(0, fret - (pos + 3)) * 1.5;
      if (pos === 0 && fret > 0) cost += fret * 0.01;
      if (!best || cost < best.cost) best = { string: s, fret, cost };
    }
    return best;
  }

  function parseMeter(m) {
    const [num, den] = (m || '4/4').split('/').map(Number);
    return { num, den, barTicks: num * (1920 / den) };
  }

  function defaultGroups(meter) {
    const { num, den } = meter;
    if (den === 4 || den === 2) return Array(num).fill(1);
    if (num % 3 === 0) return Array(num / 3).fill(3);
    if (num === 7) return [3, 2, 2];
    if (num === 5) return [3, 2];
    if (num === 10) return [3, 2, 2, 3];
    return Array(num).fill(1);
  }

  function parseLick(lick) {
    const meter = parseMeter(lick.meter);
    const flats = !!lick.flats;
    const errors = [];
    const events = [];
    const bars = [];
    let cur = { events: [], ticks: 0 };
    let dur = { ticks: 480, base: 'q', dots: 0, tuplet: false };
    let pos = lick.pos || 0;
    let pendingChord = null;

    const tokens = (lick.notes || '').trim().split(/\s+/).filter(Boolean);
    for (const raw of tokens) {
      if (raw === '|') {
        if (cur.events.length) bars.push(cur);
        cur = { events: [], ticks: 0 };
        continue;
      }
      let m;
      if ((m = RE_DUR.exec(raw))) {
        const base = BASE[m[1]];
        dur = {
          base: m[1],
          dots: m[2] === '.' ? 1 : 0,
          tuplet: m[2] === 't',
          ticks: m[2] === '.' ? base * 1.5 : m[2] === 't' ? (base * 2) / 3 : base,
        };
        continue;
      }
      if (raw[0] === '@' && /^@\d+$/.test(raw)) {
        pos = Number(raw.slice(1));
        continue;
      }
      if (raw[0] === '[' && raw[raw.length - 1] === ']') {
        pendingChord = raw.slice(1, -1);
        continue;
      }
      const ev = {
        i: events.length, bar: bars.length, ticks: dur.ticks, base: dur.base, dots: dur.dots, tuplet: dur.tuplet,
        vf: VF_DUR[dur.base], rest: false, tie: false, notes: [], techs: [], bend: 0, chord: null,
      };
      if (pendingChord) {
        ev.chord = pendingChord;
        pendingChord = null;
      }
      if (raw === 'r') {
        ev.rest = true;
      } else if (raw === '-') {
        const prev = events[events.length - 1];
        if (!prev || prev.rest) errors.push('Tie "-" with nothing to hold');
        else {
          ev.tie = true;
          ev.notes = prev.notes.map((n) => Object.assign({}, n));
          ev.bend = prev.bend;
        }
      } else {
        for (const part of raw.split('+')) {
          const { core, techs } = splitSuffix(part);
          let note = null;
          if ((m = RE_FRET.exec(core))) {
            const string = Number(m[1]);
            const fret = Number(m[2]);
            const midi = T.fretMidi(string, fret);
            const nm = T.pcName(midi, flats);
            note = { string, fret, midi, letter: nm[0].toLowerCase(), acc: nm.slice(1) };
          } else if ((m = RE_PITCH.exec(core))) {
            const pc = T.LETTER_PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
            const midi = (Number(m[3]) + 1) * 12 + pc;
            const p = placePitch(midi, pos);
            if (!p) errors.push('Pitch out of range: ' + core);
            else note = { string: p.string, fret: p.fret, midi, letter: m[1], acc: m[2] || '' };
          } else {
            errors.push('Unknown token: ' + raw);
          }
          if (note) {
            // written octave for guitar notation is one above sounding
            const letterPc = T.LETTER_PC[note.letter];
            const natural = note.midi - (note.acc === '#' ? 1 : note.acc === 'b' ? -1 : 0);
            note.oct = Math.floor(natural / 12) - 1 + 1;
            if (((natural % 12) + 12) % 12 !== letterPc) errors.push('Spelling error at ' + raw);
            ev.notes.push(note);
          }
          for (const t of techs) {
            if (t === 'b' || t === 'b2') ev.bend = 2;
            else if (t === 'b1') ev.bend = 1;
            else if (t === 'q') ev.bend = 0.5;
            ev.techs.push(t);
          }
        }
        if (!ev.notes.length) continue;
        const used = new Set();
        for (const n of ev.notes) {
          if (used.has(n.string)) errors.push('Two notes on string ' + n.string + ' at ' + raw);
          used.add(n.string);
        }
        ev.notes.sort((a, b) => a.midi - b.midi);
      }
      cur.events.push(ev.i);
      cur.ticks += ev.ticks;
      events.push(ev);
    }
    if (cur.events.length) bars.push(cur);

    // Absolute start ticks. A short first bar is a pickup: it sits at the end of a full bar.
    const barTicks = meter.barTicks;
    const lead = bars.length > 1 && bars[0].ticks < barTicks - 1 ? barTicks - bars[0].ticks : 0;
    let t = lead;
    bars.forEach((bar, bi) => {
      bar.start = t;
      bar.index = bi;
      for (const i of bar.events) {
        events[i].start = t;
        events[i].bar = bi;
        t += events[i].ticks;
      }
      const isEdge = bi === 0 || bi === bars.length - 1;
      if (Math.abs(bar.ticks - barTicks) > 1 && !(isEdge && bar.ticks < barTicks)) {
        errors.push('Bar ' + (bi + 1) + ' has ' + (bar.ticks / 480).toFixed(2) + ' beats, expected ' + barTicks / 480);
      }
    });

    return {
      lick, meter, groups: lick.groups || defaultGroups(meter), events, bars, barTicks, lead,
      totalTicks: t, errors, flats,
    };
  }

  /* Convert pasted ASCII tab (six lines, high e on top) to notation tokens.
     Rhythm is not encoded in ASCII tab, so every note gets the same duration. */
  function asciiTabToNotes(text, durTok) {
    const lines = text.split(/\r?\n/).map((l) => l.replace(/\s+$/, ''));
    const tabLines = lines.filter((l) => /[-–—]/.test(l) && /^[\sA-Ga-g#b|:]*[|:]?[-–—\d|hpbrs/\\~x()\s.^]+$/.test(l) && (l.match(/[-–—]/g) || []).length >= 3);
    const systems = [];
    for (let i = 0; i + 5 < tabLines.length + 0; i += 6) {
      const sys = tabLines.slice(i, i + 6);
      if (sys.length === 6) systems.push(sys);
    }
    if (!systems.length) return { notes: '', count: 0, error: 'No six-line tab found. Paste the six string lines, high e on top.' };
    const out = [durTok || 'e'];
    let count = 0;
    for (const sys of systems) {
      const body = sys.map((l) => {
        const k = l.search(/[|:]/);
        return k >= 0 && k < 4 ? l.slice(k) : l;
      });
      const width = Math.max(...body.map((l) => l.length));
      let col = 0;
      while (col < width) {
        const parts = [];
        let adv = 1;
        let isBar = false;
        body.forEach((l, si) => {
          const ch = l[col];
          if (ch === '|') isBar = true;
          if (ch >= '0' && ch <= '9' && !(col > 0 && l[col - 1] >= '0' && l[col - 1] <= '9')) {
            let numStr = ch;
            const nx = l[col + 1];
            if (nx >= '0' && nx <= '9' && Number(ch + nx) <= 24) {
              numStr += nx;
              adv = 2;
            }
            let tech = '';
            const before = l[col - 1];
            if (before === 'h') tech = 'h';
            else if (before === 'p') tech = 'p';
            else if (before === '/' || before === '\\' || before === 's') tech = 's';
            const after = l[col + numStr.length];
            if (after === 'b' || after === '^') tech += 'b';
            if (after === '~') tech += '~';
            parts.push(si + 1 + '/' + Number(numStr) + tech);
          }
        });
        if (parts.length) {
          out.push(parts.join('+'));
          count++;
        } else if (isBar && out.length > 1 && out[out.length - 1] !== '|') {
          out.push('|');
        }
        col += adv;
      }
      if (out[out.length - 1] !== '|') out.push('|');
    }
    while (out[out.length - 1] === '|') out.pop();
    return { notes: out.join(' '), count };
  }

  GP.dsl = { parseLick, parseMeter, defaultGroups, asciiTabToNotes, placePitch };
})();
