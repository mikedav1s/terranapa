/* Woodshed — chord library data and chord-box diagrams.
   Shapes list strings low E -> high e. Open shapes use absolute frets; movable
   shapes use offsets from the fret where the root sits on its root string. */
(function () {
  const GP = (window.GP = window.GP || {});
  const T = GP.theory;
  const NS = 'http://www.w3.org/2000/svg';
  const X = null;

  const OPEN_SHAPES = [
    ['C', 'x32010'], ['C7', 'x32310'], ['Cmaj7', 'x32000'], ['Cadd9', 'x32030'],
    ['D', 'xx0232'], ['D7', 'xx0212'], ['Dm', 'xx0231'], ['Dm7', 'xx0211'], ['Dmaj7', 'xx0222'], ['Dsus4', 'xx0233'],
    ['E', '022100'], ['E7', '020100'], ['Em', '022000'], ['Em7', '022030'],
    ['F', '133211'], ['Fmaj7', 'xx3210'],
    ['G', '320003'], ['G (bluegrass)', '320033'], ['G7', '320001'],
    ['A', 'x02220'], ['A7', 'x02020'], ['Am', 'x02210'], ['Am7', 'x02010'], ['Amaj7', 'x02120'], ['Asus2', 'x02200'],
    ['B7', 'x21202'], ['Bm', 'x24432'],
  ];

  const MOVABLE = {
    barre: {
      label: 'Barre chords',
      note: 'The E-shape and A-shape barre forms. Slide them to any root.',
      shapes: [
        ['', 6, [0, 2, 2, 1, 0, 0]], ['m', 6, [0, 2, 2, 0, 0, 0]], ['7', 6, [0, 2, 0, 1, 0, 0]], ['m7', 6, [0, 2, 0, 0, 0, 0]],
        ['', 5, [X, 0, 2, 2, 2, 0]], ['m', 5, [X, 0, 2, 2, 1, 0]], ['7', 5, [X, 0, 2, 0, 2, 0]], ['m7', 5, [X, 0, 2, 0, 1, 0]],
        ['maj7', 5, [X, 0, 2, 1, 2, 0]], ['sus4', 5, [X, 0, 2, 2, 3, 0]],
      ],
    },
    power: {
      label: 'Power chords',
      note: 'Root and fifth (and octave). Palm-mute at the bridge for metal rhythm parts.',
      shapes: [
        ['5', 6, [0, 2, 2, X, X, X]], ['5', 5, [X, 0, 2, 2, X, X]], ['5', 4, [X, X, 0, 2, 3, X]],
        ['5 (two-note)', 6, [0, 2, X, X, X, X]], ['5 (inverted, 4th)', 5, [0, 0, X, X, X, X]],
        ['5add9', 6, [0, 2, 4, X, X, X]],
      ],
    },
    shell: {
      label: 'Jazz shells',
      note: 'Root, 3rd and 7th only. The left hand of jazz guitar: comp with these, add melody on top.',
      shapes: [
        ['maj7', 6, [0, X, 1, 1, X, X]], ['7', 6, [0, X, 0, 1, X, X]], ['m7', 6, [0, X, 0, 0, X, X]], ['6', 6, [0, X, -1, 1, X, X]], ['m6', 6, [0, X, -1, 0, X, X]],
        ['maj7', 5, [X, 0, -1, 1, X, X]], ['7', 5, [X, 0, -1, 0, X, X]], ['m7', 5, [X, 0, -2, 0, X, X]],
      ],
    },
    jazz: {
      label: 'Jazz voicings',
      note: 'Four-note drop-2 and drop-3 grips, plus the common extensions and altered dominants.',
      shapes: [
        ['maj7', 6, [0, X, 1, 1, 0, X]], ['7', 6, [0, X, 0, 1, 0, X]], ['m7', 6, [0, X, 0, 0, 0, X]], ['m7b5', 6, [0, X, 0, 0, -1, X]],
        ['dim7', 6, [0, X, -1, 0, -1, X]], ['13', 6, [0, X, 0, 1, 2, X]], ['7#5', 6, [0, X, 0, 1, 1, X]],
        ['maj7', 5, [X, 0, 2, 1, 2, X]], ['7', 5, [X, 0, 2, 0, 2, X]], ['m7', 5, [X, 0, 2, 0, 1, X]], ['m7b5', 5, [X, 0, 1, 0, 1, X]],
        ['dim7', 5, [X, 0, 1, -1, 1, X]], ['9', 5, [X, 0, -1, 0, 0, X]], ['maj9', 5, [X, 0, -1, 1, 0, X]], ['m9', 5, [X, 0, -2, 0, 0, X]],
        ['7#9', 5, [X, 0, -1, 0, 1, X]], ['7b9', 5, [X, 0, -1, 0, -1, X]], ['6/9', 5, [X, 0, -1, -1, 0, 0]],
      ],
    },
    gypsy: {
      label: 'Gypsy jazz',
      note: 'Django-style grips for la pompe rhythm: sixths and 6/9s instead of major 7ths, minor 6 instead of minor 7.',
      shapes: [
        ['6/9', 6, [0, X, -1, -1, 0, 0]], ['6', 6, [0, X, -1, 1, 0, X]], ['m6', 6, [0, X, -1, 0, 0, X]], ['7', 6, [0, X, 0, 1, X, X]],
        ['m6', 5, [X, 0, -2, -1, 1, X]], ['7', 5, [X, 0, -1, 0, -2, X]], ['9', 5, [X, 0, -1, 0, 0, X]], ['dim7', 4, [X, X, 0, 1, 0, 1]],
      ],
    },
    triad: {
      label: 'Triads (top strings)',
      note: 'Three inversions of each triad on strings 3-2-1. Connecting these across the neck is the fastest route to seeing chord tones while you solo.',
      shapes: [
        ['(root on 3)', 3, [X, X, X, 0, 0, -2]], ['(root on 2)', 2, [X, X, X, -1, 0, -1]], ['(root on 1)', 1, [X, X, X, 1, 0, 0]],
        ['m (root on 3)', 3, [X, X, X, 0, -1, -2]], ['m (root on 2)', 2, [X, X, X, -1, 0, -2]], ['m (root on 1)', 1, [X, X, X, 0, 0, 0]],
      ],
    },
  };

  const CATEGORIES = [
    { id: 'open', label: 'Open chords', note: 'First-position chords. The bluegrass G keeps the 3rd fret on the B string for a fuller, ringing fifth.' },
  ].concat(Object.keys(MOVABLE).map((id) => ({ id, label: MOVABLE[id].label, note: MOVABLE[id].note })));

  function chordsFor(category, rootName) {
    if (category === 'open') {
      return OPEN_SHAPES.map(([name, s]) => ({
        name, frets: s.split('').map((c) => (c === 'x' ? null : parseInt(c, 36))), rootPc: T.namePc(name),
      }));
    }
    const rootPc = T.namePc(rootName);
    return MOVABLE[category].shapes.map(([suffix, rootString, offs]) => {
      const strIdx = 6 - rootString; // index into low->high array
      const openPc = T.OPEN[rootString] % 12;
      let R = (rootPc - openPc + 12) % 12;
      const minOff = Math.min(...offs.filter((o) => o != null));
      if (R + minOff < 0) R += 12;
      const frets = offs.map((o) => (o == null ? null : R + o));
      const sep = suffix.startsWith('(') || suffix.startsWith('m (') ? ' ' : '';
      const name = suffix.startsWith('m (') ? rootName + 'm ' + suffix.slice(2) : rootName + sep + suffix;
      return { name, frets, rootPc, rootString: 6 - strIdx };
    });
  }

  function midisOf(chord) {
    const out = [];
    chord.frets.forEach((f, i) => {
      if (f != null) out.push(T.OPEN[6 - i] + f);
    });
    return out;
  }

  function el(name, attrs, text) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  function diagram(chord) {
    const fretted = chord.frets.filter((f) => f != null && f > 0);
    const max = fretted.length ? Math.max(...fretted) : 1;
    const min = fretted.length ? Math.min(...fretted) : 1;
    const base = max <= 4 ? 1 : min;
    const rows = Math.max(4, max - base + 1);
    const gx = 22, gy = 26, sw = 17, fh = 21;
    const W = gx * 2 + sw * 5 + 14;
    const H = gy + fh * rows + 26;
    const svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'chord-svg', role: 'img', 'aria-label': chord.name + ' chord diagram' });
    for (let r = 0; r <= rows; r++) {
      svg.appendChild(el('line', { x1: gx, y1: gy + r * fh, x2: gx + sw * 5, y2: gy + r * fh, class: r === 0 && base === 1 ? 'cd-nut' : 'cd-line' }));
    }
    for (let s = 0; s < 6; s++) {
      svg.appendChild(el('line', { x1: gx + s * sw, y1: gy, x2: gx + s * sw, y2: gy + rows * fh, class: 'cd-line' }));
    }
    if (base > 1) svg.appendChild(el('text', { x: gx + sw * 5 + 7, y: gy + fh * 0.5 + 4, class: 'cd-fr' }, base + 'fr'));
    chord.frets.forEach((f, i) => {
      const x = gx + i * sw;
      if (f == null) {
        svg.appendChild(el('text', { x, y: gy - 8, class: 'cd-top' }, '×'));
        return;
      }
      const pc = (T.OPEN[6 - i] + f) % 12;
      const isRoot = pc === chord.rootPc;
      if (f === 0) {
        svg.appendChild(el('circle', { cx: x, cy: gy - 11, r: 4, class: isRoot ? 'cd-open cd-root-open' : 'cd-open' }));
        return;
      }
      const y = gy + (f - base + 0.5) * fh;
      svg.appendChild(el('circle', { cx: x, cy: y, r: 7, class: isRoot ? 'cd-dot cd-root' : 'cd-dot' }));
    });
    // note names under each string
    chord.frets.forEach((f, i) => {
      if (f == null) return;
      svg.appendChild(el('text', { x: gx + i * sw, y: gy + rows * fh + 15, class: 'cd-note' }, T.pcName(T.OPEN[6 - i] + f, /b|dim/.test(chord.name) || [0, 5, 10, 3, 8, 1].includes(chord.rootPc) || /m(?!aj)/.test(chord.name))));
    });
    return svg;
  }

  GP.chords = { CATEGORIES, chordsFor, midisOf, diagram };
})();
