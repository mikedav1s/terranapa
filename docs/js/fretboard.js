/* Woodshed — SVG fretboard diagram. */
(function () {
  const GP = (window.GP = window.GP || {});
  const NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs, text) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  /* markers: [{ string, fret, label, kind }]  kind: 'root' | 'tone' | 'ghost' | 'quarter' | 'now' */
  function draw(container, opts) {
    const frets = opts.frets || 15;
    const fw = 54;
    const sh = 26;
    const left = 34;
    const topPad = 16;
    const W = left + frets * fw + 16;
    const H = topPad + sh * 6 + 30;
    const svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'fb', role: 'img', 'aria-label': opts.label || 'Fretboard' });
    svg.style.minWidth = Math.min(W, 620) + 'px';

    svg.appendChild(el('rect', { x: left, y: topPad, width: frets * fw, height: sh * 6, class: 'fb-board' }));
    // inlays
    [3, 5, 7, 9, 12, 15, 17, 19, 21].forEach((f) => {
      if (f > frets) return;
      const cx = left + (f - 0.5) * fw;
      if (f === 12) {
        svg.appendChild(el('circle', { cx, cy: topPad + sh * 2, r: 3.5, class: 'fb-inlay' }));
        svg.appendChild(el('circle', { cx, cy: topPad + sh * 4, r: 3.5, class: 'fb-inlay' }));
      } else {
        svg.appendChild(el('circle', { cx, cy: topPad + sh * 3, r: 3.5, class: 'fb-inlay' }));
      }
      svg.appendChild(el('text', { x: cx, y: H - 8, class: 'fb-num' }, f));
    });
    for (let f = 0; f <= frets; f++) {
      const x = left + f * fw;
      svg.appendChild(el('line', { x1: x, y1: topPad, x2: x, y2: topPad + sh * 6, class: f === 0 ? 'fb-nut' : 'fb-fret' }));
    }
    for (let s = 1; s <= 6; s++) {
      const y = topPad + (s - 0.5) * sh;
      svg.appendChild(el('line', { x1: left, y1: y, x2: left + frets * fw, y2: y, class: 'fb-string', 'stroke-width': 0.8 + s * 0.28 }));
      svg.appendChild(el('text', { x: 10, y: y + 4, class: 'fb-open' }, 'EBGDAE'[s - 1]));
    }
    const layer = el('g', {});
    svg.appendChild(layer);
    container.innerHTML = '';
    container.appendChild(svg);

    function xy(string, fret) {
      return { x: fret === 0 ? left - 11 : left + (fret - 0.5) * fw, y: topPad + (string - 0.5) * sh };
    }
    function setMarkers(markers) {
      layer.innerHTML = '';
      for (const m of markers) {
        if (m.fret > frets) continue;
        const p = xy(m.string, m.fret);
        const g = el('g', { class: 'fb-m fb-' + (m.kind || 'tone') });
        g.appendChild(el('circle', { cx: p.x, cy: p.y, r: 10.5 }));
        if (m.label != null) g.appendChild(el('text', { x: p.x, y: p.y + 3.6 }, m.label));
        if (opts.onPick) {
          g.style.cursor = 'pointer';
          g.addEventListener('click', () => opts.onPick(m));
        }
        layer.appendChild(g);
      }
    }
    if (opts.markers) setMarkers(opts.markers);
    return { setMarkers };
  }

  GP.fretboard = { draw };
})();
