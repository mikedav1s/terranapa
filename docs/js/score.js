/* Woodshed — standard notation + tablature rendering (VexFlow), with a playback cursor
   and per-note result marks drawn on top. */
(function () {
  const GP = (window.GP = window.GP || {});
  const NS = 'http://www.w3.org/2000/svg';

  const STAVE_TOP = 34;      // room for chord symbols above the notation stave
  const TAB_OFFSET = 92;     // notation stave top -> tab stave top
  const ROW_HEIGHT = 250;

  function svgEl(name, attrs) {
    const el = document.createElementNS(NS, name);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function vfDuration(ev) {
    return ev.vf + (ev.dots ? 'd' : '');
  }

  function render(container, parsed, opts) {
    opts = opts || {};
    const VF = window.Vex.Flow;
    container.innerHTML = '';
    const showNotation = opts.notation !== false;
    const showTab = opts.tab !== false;
    const cw = Math.max(280, container.clientWidth || 800);
    const scale = cw < 560 ? 0.78 : 1;
    const W = cw / scale;

    // ---- lay bars out into rows ----
    const widths = parsed.bars.map((bar) => {
      let w = 26;
      for (const i of bar.events) {
        const ev = parsed.events[i];
        w += ev.ticks >= 480 ? 34 : ev.ticks >= 240 ? 29 : 25;
        if (ev.notes.some((n) => n.acc)) w += 7;
        if (ev.chord) w += 6;
      }
      return Math.max(70, w);
    });
    const rows = [];
    let row = null;
    widths.forEach((w, bi) => {
      const first = !row || row.used + w > W - 2;
      if (first) {
        row = { bars: [], used: rows.length === 0 ? 88 : 62 };
        rows.push(row);
      }
      row.bars.push(bi);
      row.used += w;
    });
    const rowH = (showNotation && showTab ? ROW_HEIGHT : showNotation ? 150 : 150);
    const H = rows.length * rowH + 8;
    const totalW = Math.max(W, ...rows.map((r) => r.used));

    const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
    renderer.resize(totalW, H);
    const ctx = renderer.getContext();
    const svg = container.querySelector('svg');
    svg.setAttribute('viewBox', '0 0 ' + totalW + ' ' + H);
    svg.setAttribute('width', totalW * scale);
    svg.setAttribute('height', H * scale);
    svg.style.width = totalW * scale + 'px';
    svg.style.height = H * scale + 'px';
    svg.style.maxWidth = 'none';

    const pos = new Array(parsed.events.length).fill(null);
    const beatGroups = parsed.groups.map((g) => new VF.Fraction(g, parsed.meter.den));
    const lastBar = parsed.bars.length - 1;
    let prevStaveNote = null; // for ties
    let prevRow = -1;

    rows.forEach((r, ri) => {
      const y = ri * rowH + STAVE_TOP;
      const tabY = showNotation ? y + TAB_OFFSET : y;
      const lead = ri === 0 ? 88 : 62;
      const natural = r.used;
      // stretch to the full width unless the row is short
      const wantFull = ri < rows.length - 1 || natural > W * 0.6;
      const stretch = wantFull ? Math.min(2.2, (W - 2 - lead) / (natural - lead)) : 1;
      let x = 0;
      r.bars.forEach((bi, k) => {
        const bar = parsed.bars[bi];
        const w = widths[bi] * stretch + (k === 0 ? lead : 0);
        let stave = null;
        let tab = null;
        if (showNotation) {
          stave = new VF.Stave(x, y, w);
          if (k === 0) stave.addClef('treble', 'default', '8vb');
          if (bi === 0) stave.addTimeSignature(parsed.meter.num + '/' + parsed.meter.den);
          if (bi === lastBar) stave.setEndBarType(VF.Barline.type.END);
          stave.setContext(ctx).draw();
        }
        if (showTab) {
          tab = new VF.TabStave(x, tabY, w);
          if (k === 0) tab.addClef('tab');
          if (bi === lastBar) tab.setEndBarType(VF.Barline.type.END);
          tab.setContext(ctx).draw();
        }
        const startX = Math.max(stave ? stave.getNoteStartX() : 0, tab ? tab.getNoteStartX() : 0, x + (k === 0 ? lead - 6 : 12));
        if (stave) stave.setNoteStartX(startX);
        if (tab) tab.setNoteStartX(startX);

        const sNotes = [];
        const tNotes = [];
        const ties = [];
        const sTuplets = [];
        let tupS = [];
        let tupT = [];
        bar.events.forEach((i) => {
          const ev = parsed.events[i];
          const dur = vfDuration(ev);
          let sn = null;
          let tn = null;
          if (showNotation) {
            if (ev.rest) {
              sn = new VF.StaveNote({ keys: ['b/4'], duration: dur + 'r' });
            } else {
              sn = new VF.StaveNote({
                keys: ev.notes.map((n) => n.letter + n.acc + '/' + n.oct),
                duration: dur, auto_stem: true,
              });
            }
            if (ev.dots) VF.Dot.buildAndAttach([sn], { all: true });
            if (ev.tie && prevStaveNote) {
              const idx = ev.notes.map((_, j) => j);
              ties.push({ first: prevStaveNote.note, firstRow: prevStaveNote.row, last: sn, idx });
            }
            sNotes.push(sn);
            if (!ev.rest) prevStaveNote = { note: sn, row: ri };
          }
          if (showTab) {
            if (ev.rest || ev.tie) {
              tn = new VF.GhostNote({ duration: dur });
            } else {
              tn = new VF.TabNote({
                positions: ev.notes.map((n) => ({ str: n.string, fret: n.fret })),
                duration: dur,
              });
              for (const t of ev.techs) {
                if (t === 'b' || t === 'b2') tn.addModifier(new VF.Bend('Full'), 0);
                else if (t === 'b1') tn.addModifier(new VF.Bend('1/2'), 0);
                else if (t === 'q') tn.addModifier(new VF.Bend('1/4'), 0);
                else if (t === '~') tn.addModifier(new VF.Vibrato(), 0);
                else {
                  const label = t === 'h' ? 'H' : t === 'p' ? 'P' : 'sl';
                  const an = new VF.Annotation(label);
                  an.setFont('Arial', 9, 'normal', 'italic');
                  an.setVerticalJustification(VF.Annotation.VerticalJustify.TOP);
                  tn.addModifier(an, 0);
                }
              }
            }
            tNotes.push(tn);
          }
          if (ev.tuplet) {
            if (sn) tupS.push(sn);
            if (tn) tupT.push(tn);
            const full = Math.max(tupS.length, tupT.length) === 3;
            if (full) {
              if (tupS.length) sTuplets.push(new VF.Tuplet(tupS, { num_notes: 3, notes_occupied: 2 }));
              if (tupT.length) new VF.Tuplet(tupT, { num_notes: 3, notes_occupied: 2 });
              tupS = [];
              tupT = [];
            }
          }
          pos[i] = { sn, tn, row: ri };
        });

        const voices = [];
        let sVoice = null;
        let tVoice = null;
        const voiceSpec = { num_beats: parsed.meter.num, beat_value: parsed.meter.den };
        if (showNotation) {
          sVoice = new VF.Voice(voiceSpec).setMode(VF.Voice.Mode.SOFT).addTickables(sNotes);
          VF.Accidental.applyAccidentals([sVoice], 'C');
          voices.push(sVoice);
        }
        if (showTab) {
          tVoice = new VF.Voice(voiceSpec).setMode(VF.Voice.Mode.SOFT).addTickables(tNotes);
          voices.push(tVoice);
        }
        let beams = [];
        if (showNotation) {
          try {
            beams = VF.Beam.generateBeams(sNotes, { groups: beatGroups, beam_rests: false, maintain_stem_directions: false });
          } catch (e) { beams = []; }
        }
        const fmt = new VF.Formatter();
        voices.forEach((v) => fmt.joinVoices([v]));
        fmt.format(voices, Math.max(30, x + w - startX - 14));
        if (sVoice) sVoice.draw(ctx, stave);
        if (tVoice) tVoice.draw(ctx, tab);
        beams.forEach((b) => b.setContext(ctx).draw());
        sTuplets.forEach((t) => t.setContext(ctx).draw());
        ties.forEach((t) => {
          const sameRow = t.firstRow === ri;
          new VF.StaveTie({
            first_note: sameRow ? t.first : null, last_note: t.last,
            first_indices: t.idx, last_indices: t.idx,
          }).setContext(ctx).draw();
        });

        // chord symbols and geometry
        bar.events.forEach((i) => {
          const ev = parsed.events[i];
          const p = pos[i];
          const ref = p.sn || p.tn;
          let nx;
          try {
            nx = ref.getAbsoluteX() + (p.sn ? 6 : 4);
          } catch (e) { nx = startX; }
          p.x = nx;
          p.y = y;
          if (ev.chord) {
            const txt = svgEl('text', { x: nx - 5, y: y - 6, class: 'gp-chord' });
            txt.textContent = ev.chord;
            svg.appendChild(txt);
          }
        });
        if (ri !== prevRow || k === 0) {
          const num = svgEl('text', { x: x + 2, y: y + 32, class: 'gp-barnum' });
          num.textContent = bi + 1;
          if (k === 0 && bi > 0) svg.appendChild(num);
          prevRow = ri;
        }
        x += w;
      });
    });

    // ---- overlay: cursor + result marks ----
    const overlay = svgEl('g', { class: 'gp-overlay' });
    svg.insertBefore(overlay, svg.firstChild);
    const top = svgEl('g', { class: 'gp-marks' });
    svg.appendChild(top);
    const cursorH = showNotation && showTab ? 190 : 118;
    const markY = showNotation && showTab ? 213 : 140;
    const cursor = svgEl('rect', { class: 'gp-cursor', x: -100, y: 0, width: 20, height: cursorH, rx: 5 });
    overlay.appendChild(cursor);
    const marks = new Map();
    let lastRow = -1;

    return {
      rows: rows.length,
      setCursor(i, follow) {
        const p = i == null ? null : pos[i];
        if (!p) {
          cursor.setAttribute('x', -100);
          return;
        }
        cursor.setAttribute('x', p.x - 10);
        cursor.setAttribute('y', p.y + 14);
        if (follow && p.row !== lastRow && rows.length > 1) {
          const box = container.getBoundingClientRect();
          const rowTop = box.top + (p.row * rowH) * scale;
          const rowBottom = rowTop + rowH * scale;
          if (rowBottom > window.innerHeight - 20 || rowTop < 70) {
            window.scrollBy({ top: rowTop - 110, behavior: 'smooth' });
          }
        }
        lastRow = p.row;
      },
      mark(i, kind) {
        const p = pos[i];
        if (!p) return;
        let m = marks.get(i);
        if (!m) {
          m = svgEl('circle', { cx: p.x, cy: p.y + markY, r: 5 });
          top.appendChild(m);
          marks.set(i, m);
        }
        m.setAttribute('class', 'gp-mark gp-mark-' + kind);
      },
      clearMarks() {
        marks.forEach((m) => m.remove());
        marks.clear();
      },
    };
  }

  GP.score = { render };
})();
