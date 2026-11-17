/* Woodshed — UI: library/practice view, scales, chords, metronome, tuner, progress. */
(function () {
  const GP = window.GP;
  const { theory: T, dsl, audio: A, pitch: P, store: S, library: L } = GP;
  const $ = (id) => document.getElementById(id);
  const h = (tag, attrs, ...kids) => {
    const e = document.createElement(tag);
    for (const k in attrs || {}) {
      if (k === 'class') e.className = attrs[k];
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    for (const kid of kids) if (kid != null) e.append(kid);
    return e;
  };
  const pct = (x) => Math.round(x * 100) + '%';
  const NOTE_OPTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  function allLicks() {
    return L.licks.concat(S.customLicks());
  }
  const lickById = (id) => allLicks().find((l) => l.id === id);
  const styleLabel = (id) => (L.STYLES.find((s) => s.id === id) || { label: 'My licks' }).label;

  /* ================= routing ================= */
  const VIEWS = ['library', 'scales', 'chords', 'tools', 'progress'];
  function route() {
    const name = (location.hash || '#library').slice(1);
    const view = VIEWS.includes(name) ? name : 'library';
    VIEWS.forEach((v) => ($('view-' + v).hidden = v !== view));
    document.querySelectorAll('.nav a').forEach((a) => a.classList.toggle('on', a.dataset.view === view));
    if (view !== 'library') stopEverything();
    if (view === 'library') renderScoreOnly();
    if (view === 'scales') renderScale();
    if (view === 'chords') renderChords();
    if (view === 'progress') renderProgress();
  }
  window.addEventListener('hashchange', route);

  /* ================= library / practice ================= */
  const prefs = Object.assign(
    { style: 'all', tag: '', loop: true, countIn: true, click: false, guide: true, backing: true, humanize: true, feel: 'auto', notation: true, tab: true, alongGuide: false, latency: 60 },
    S.get('prefs', {})
  );
  const savePrefs = () => S.set('prefs', prefs);
  const st = { lick: null, parsed: null, score: null, fb: null, bpm: 100, mode: null, ear: false };
  const transport = new GP.Transport();

  function buildFilters() {
    const chips = $('style-chips');
    chips.innerHTML = '';
    const styles = [{ id: 'all', label: 'All' }].concat(L.STYLES, [{ id: 'custom', label: 'My licks' }]);
    styles.forEach((s) => {
      chips.append(h('button', {
        class: 'chip' + (prefs.style === s.id ? ' on' : ''), 'aria-pressed': prefs.style === s.id,
        onclick: () => {
          prefs.style = s.id;
          savePrefs();
          buildFilters();
          renderList();
        },
      }, s.label));
    });
    const sel = $('tag-select');
    sel.innerHTML = '';
    sel.append(h('option', { value: '' }, 'Any'));
    L.TAGS.forEach((t) => sel.append(h('option', { value: t }, t)));
    sel.value = prefs.tag;
  }

  function filtered() {
    const q = $('lib-search').value.trim().toLowerCase();
    return allLicks().filter((l) => {
      if (prefs.style !== 'all' && l.style !== prefs.style && !(prefs.style === 'custom' && l.custom)) return false;
      if (prefs.tag && !(l.tags || []).includes(prefs.tag)) return false;
      if (q && !(l.title + ' ' + (l.source || '') + ' ' + (l.tags || []).join(' ') + ' ' + styleLabel(l.style)).toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function lickItem(l, onPick) {
    const sum = S.summary(l.id);
    const badge = sum.best != null ? h('span', { class: 'badge ' + (sum.best >= 0.9 ? 'good' : sum.best >= 0.7 ? 'mid' : 'low') }, pct(sum.best)) : null;
    return h('li', {},
      h('button', { class: 'lick-item' + (st.lick && st.lick.id === l.id ? ' on' : ''), onclick: () => onPick(l) },
        h('span', { class: 'li-title' }, l.title),
        h('span', { class: 'li-sub' }, styleLabel(l.style) + ' · ' + (l.source || 'Your lick')),
        badge));
  }

  function renderList() {
    const list = $('lick-list');
    list.innerHTML = '';
    const items = filtered();
    if (!items.length) {
      list.append(h('li', { class: 'empty' }, prefs.style === 'custom' ? 'No licks of your own yet. Add one below.' : 'Nothing matches that filter.'));
    }
    items.forEach((l) => list.append(lickItem(l, (lick) => selectLick(lick, true))));
    // songs to know
    const songs = prefs.style !== 'all' && L.songs[prefs.style];
    $('songs-box').hidden = !songs;
    if (songs) {
      $('songs-title').textContent = 'Songs to know: ' + styleLabel(prefs.style);
      const ul = $('songs-list');
      ul.innerHTML = '';
      songs.forEach((s) => ul.append(h('li', {}, h('strong', {}, s.title), s.by ? ' — ' + s.by : '', s.note ? h('span', {}, s.note) : null)));
    }
  }

  function selectLick(lick, show) {
    stopEverything();
    st.lick = lick;
    st.parsed = dsl.parseLick(lick);
    st.bpm = S.get('bpm.' + lick.id, lick.tempo || 100);
    S.set('last', lick.id);
    $('editor').hidden = true;
    $('lick-view').hidden = false;
    if (show) document.querySelector('.lib').classList.add('detail');
    $('lick-style').textContent = styleLabel(lick.style) + (lick.tags && lick.tags.length ? ' · ' + lick.tags.join(', ') : '');
    $('lick-title').textContent = lick.title;
    const m = st.parsed.meter;
    $('lick-meta').textContent = [lick.source || 'Your lick', lick.key, m.num + '/' + m.den, 'target ' + (lick.tempo || 100) + ' bpm'].filter(Boolean).join(' · ');
    $('lick-about').textContent = lick.about || '';
    const actions = $('lick-actions');
    actions.innerHTML = '';
    if (lick.custom) {
      actions.append(h('button', { class: 'btn', onclick: () => openEditor(lick) }, 'Edit'));
      actions.append(h('button', { class: 'btn', onclick: () => {
        S.deleteCustom(lick.id);
        st.lick = null;
        renderList();
        selectLick(L.licks[0], false);
      } }, 'Delete'));
    }
    if (lick.scale) {
      actions.append(h('button', { class: 'btn', onclick: () => {
        scaleState.root = lick.scale.root;
        scaleState.id = lick.scale.id;
        location.hash = '#scales';
      } }, 'See the scale'));
    }
    $('bpm').value = st.bpm;
    $('bar-from').value = 1;
    $('bar-to').value = st.parsed.bars.length;
    $('bar-from').max = $('bar-to').max = st.parsed.bars.length;
    $('opt-feel').parentElement.hidden = m.den !== 4 && m.den !== 2;
    updateBpm();
    renderScoreOnly();
    renderHistory();
    renderList();
    $('listen-result').hidden = true;
    $('want-note').textContent = '–';
    $('live-score').textContent = '–';
  }

  function renderScoreOnly() {
    if (!st.parsed || $('view-library').hidden || $('lick-view').hidden) return;
    const errs = st.parsed.errors;
    $('lick-errors').hidden = !errs.length;
    $('lick-errors').textContent = errs.join(' · ');
    $('ear-cover').hidden = !st.ear;
    document.querySelector('#lick-view .score-scroll').hidden = st.ear;
    $('lick-fb').parentElement.hidden = st.ear;
    if (!st.ear) {
      try {
        const r = swingRatio();
        st.score = GP.score.render($('score'), st.parsed, { notation: prefs.notation || !prefs.tab, tab: prefs.tab, feel: r >= 0.56 ? (r >= 0.655 ? 'Shuffle' : 'Swing') : null });
      } catch (e) {
        st.score = null;
        $('lick-errors').hidden = false;
        $('lick-errors').textContent = 'Could not draw this lick: ' + e.message;
      }
      const maxFret = Math.max(12, ...st.parsed.events.flatMap((e) => e.notes.map((n) => n.fret)));
      st.fb = GP.fretboard.draw($('lick-fb'), { frets: Math.min(22, maxFret + 1), label: 'Where this phrase sits on the neck' });
      fbShow(null);
    } else {
      st.score = null;
    }
  }

  const spell = (n) => n.letter.toUpperCase() + n.acc;

  function fbShow(i) {
    if (!st.fb || !st.parsed) return;
    const seen = new Map();
    for (const e of st.parsed.events) {
      for (const n of e.notes) seen.set(n.string + ':' + n.fret, { string: n.string, fret: n.fret, label: spell(n), kind: 'ghost' });
    }
    if (i != null) {
      for (const n of st.parsed.events[i].notes) seen.set(n.string + ':' + n.fret, { string: n.string, fret: n.fret, label: spell(n), kind: 'now' });
    }
    st.fb.setMarkers(Array.from(seen.values()));
  }

  function setCursor(i) {
    if (st.score) st.score.setCursor(i, true);
    fbShow(i);
  }

  function updateBpm() {
    const target = st.lick.tempo || 100;
    $('bpm-out').textContent = st.bpm + ' bpm (' + pct(st.bpm / target) + ')';
    const r = swingRatio();
    $('feel-tag').textContent = GP.feel.label(r);
    document.querySelectorAll('#pct-btns button').forEach((b) => b.classList.toggle('on', Math.round(target * Number(b.dataset.pct)) === st.bpm));
  }

  function swingRatio() {
    return GP.feel.ratio(st.lick, st.bpm, prefs.feel);
  }

  function transportOpts(extra) {
    const from = Math.max(1, Number($('bar-from').value) || 1) - 1;
    const to = Math.max(from + 1, Number($('bar-to').value) || st.parsed.bars.length) - 1;
    return Object.assign({
      bpm: st.bpm, loop: prefs.loop, countIn: prefs.countIn, click: prefs.click, guide: prefs.guide,
      band: prefs.backing, swing: swingRatio(), style: st.lick.style, lick: st.lick, humanize: prefs.humanize,
      fromBar: from, toBar: to,
      rampBpm: Number($('ramp').value) || 0, rampMax: 300,
      onEvent: setCursor,
      onPass: (n, bpm) => {
        if (bpm !== st.bpm) {
          st.bpm = bpm;
          $('bpm').value = bpm;
          updateBpm();
          transport.ratio = swingRatio();
        }
      },
    }, extra);
  }

  function logPlay(mode, extra) {
    const secs = Math.round(transport.elapsed());
    if (secs < 3 && !extra) return;
    S.addSession(Object.assign({ id: st.lick.id, t: Date.now(), mode, bpm: st.bpm, target: st.lick.tempo || 100, secs }, extra));
  }

  function setPlayingUi(on) {
    $('play-btn').textContent = on ? '■ Stop' : '▶ Play';
    $('play-btn').classList.toggle('stop', on);
    $('along-btn').textContent = st.mode === 'along' ? '■ Stop' : '● Play along and score';
    $('step-btn').textContent = st.mode === 'step' ? '■ Stop' : 'Step through (waits for you)';
  }

  function stopEverything() {
    if (st.mode === 'play') logPlay('play');
    transport.stop();
    if (st.unlisten) st.unlisten();
    st.unlisten = null;
    if (st.mode === 'along' || st.mode === 'step') P.mic.stop();
    if (st.stepTimer) clearInterval(st.stepTimer);
    st.mode = null;
    setCursor(null);
    if ($('play-btn')) setPlayingUi(false);
    metro.stop();
    tuner.stop();
  }

  function togglePlay() {
    if (st.mode) {
      stopEverything();
      return;
    }
    st.mode = 'play';
    if (st.score) st.score.clearMarks();
    transport.start(st.parsed, transportOpts({
      onEnd: () => {
        logPlay('play');
        st.mode = null;
        setCursor(null);
        setPlayingUi(false);
      },
    }));
    setPlayingUi(true);
  }

  /* ----- listening mode ----- */
  function heard(frame) {
    $('level-bar').style.width = Math.min(100, frame.rms * 600) + '%';
    $('heard-note').textContent = frame.midi != null && frame.clarity > 0.8 ? T.midiName(frame.midi, st.parsed && st.parsed.flats) : '–';
  }

  async function startMic() {
    $('mic-error').hidden = true;
    try {
      await P.mic.start();
      return true;
    } catch (e) {
      $('mic-error').hidden = false;
      $('mic-error').textContent = micMessage(e);
      return false;
    }
  }
  function micMessage(e) {
    if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) {
      return 'The microphone is blocked here. Allow microphone access for this page in your browser, or open the app from its own address (GitHub Pages or a local server) rather than inside an embedded preview.';
    }
    if (e && e.name === 'NotFoundError') return 'No microphone was found on this device.';
    return 'Could not start the microphone: ' + ((e && e.message) || e);
  }

  function showResult(text, kind) {
    const r = $('listen-result');
    r.hidden = false;
    r.className = 'result ' + (kind || '');
    r.textContent = text;
  }

  async function startAlong() {
    if (st.mode) {
      stopEverything();
      return;
    }
    if (!(await startMic())) return;
    st.mode = 'along';
    if (st.score) st.score.clearMarks();
    $('listen-result').hidden = true;
    const lat = prefs.latency / 1000;
    const expect = [];
    let hits = 0;
    let done = 0;
    const errs = [];
    const windowEnd = (e) => e.time + Math.max(0.16, Math.min(e.dur, 0.6)) + 0.07;
    const settle = (e, hit, err) => {
      e.done = true;
      done++;
      if (hit) {
        hits++;
        errs.push(err);
      }
      if (st.score) st.score.mark(e.i, hit ? (Math.abs(err) <= 0.09 ? 'hit' : 'late') : 'miss');
      $('live-score').textContent = hits + ' / ' + done;
    };
    st.unlisten = P.mic.on((frame) => {
      heard(frame);
      const ft = frame.time - lat;
      for (const e of expect) {
        if (e.done) continue;
        if (ft > windowEnd(e)) {
          settle(e, false);
          continue;
        }
        if (ft < e.time - 0.07) break;
        if (frame.midi != null && frame.clarity > 0.75 && P.pitchMatches(frame.midi, e.midis, 0.7)) settle(e, true, ft - e.time);
      }
      const next = expect.find((e) => !e.done);
      $('want-note').textContent = next ? T.midiName(next.midis[0], st.parsed.flats) : '–';
    });
    transport.start(st.parsed, transportOpts({
      loop: false, countIn: true, rampBpm: 0, guide: prefs.alongGuide,
      onExpect: (e) => expect.push(e),
      onEnd: () => {
        setTimeout(() => {
          if (st.mode !== 'along') return;
          expect.forEach((e) => { if (!e.done) settle(e, false); });
          const acc = done ? hits / done : 0;
          const timing = errs.length ? Math.round((errs.reduce((a, b) => a + Math.abs(b), 0) / errs.length) * 1000) : null;
          const mean = errs.length ? errs.reduce((a, b) => a + b, 0) / errs.length : 0;
          logPlay('along', { acc, timing });
          const tend = timing == null ? '' : mean > 0.06 ? ' Notes are registering late: either you are dragging, or Microphone delay under Timing calibration needs raising.' : mean < -0.04 ? ' You tend to rush ahead of the beat.' : '';
          showResult(
            hits + ' of ' + done + ' notes (' + pct(acc) + ') at ' + st.bpm + ' bpm' + (timing != null ? ', average timing within ' + timing + ' ms.' : '.') + tend + ' ' +
            (acc >= 0.9 ? 'Solid. Raise the tempo or move on.' : acc >= 0.7 ? 'Close. Loop the bars with red dots, then try again.' : 'Slow it down or use Step through until the notes are under your fingers.'),
            acc >= 0.9 ? 'good' : acc >= 0.7 ? 'mid' : 'low');
          P.mic.stop();
          st.unlisten && st.unlisten();
          st.unlisten = null;
          st.mode = null;
          setCursor(null);
          setPlayingUi(false);
          renderHistory();
          renderList();
        }, 450);
      },
    }));
    setPlayingUi(true);
  }

  async function startStep() {
    if (st.mode) {
      stopEverything();
      return;
    }
    if (!(await startMic())) return;
    A.ensure();
    st.mode = 'step';
    if (st.score) st.score.clearMarks();
    $('listen-result').hidden = true;
    const evs = st.parsed.events.filter((e) => !e.rest && !e.tie);
    let k = 0;
    let wrong = 0;
    let stable = 0;
    let wrongRun = 0;
    let wrongPitch = null;
    let lastAdvance = 0;
    let lastPitch = null;
    let freshOnset = true;
    let struck = false;
    const began = A.now();
    const targets = (e) => e.notes.flatMap((n) => (e.bend ? [n.midi + e.bend, n.midi] : [n.midi]));
    const show = () => {
      setCursor(evs[k] ? evs[k].i : null);
      $('want-note').textContent = evs[k] ? T.midiName(evs[k].notes[0].midi + (evs[k].bend >= 1 ? evs[k].bend : 0), st.parsed.flats) : '–';
      $('live-score').textContent = k + ' / ' + evs.length;
    };
    show();
    st.unlisten = P.mic.on((frame) => {
      heard(frame);
      if (frame.onset) freshOnset = struck = true;
      const e = evs[k];
      if (!e) return;
      const ok = frame.midi != null && frame.clarity > 0.8 && P.pitchMatches(frame.midi, targets(e), 0.7);
      if (ok) {
        stable++;
        wrongRun = 0;
        const sameAsLast = lastPitch != null && P.pitchMatches(lastPitch, targets(e), 0.7);
        if (stable >= 2 && frame.time - lastAdvance > 0.06 && (!sameAsLast || freshOnset)) {
          if (st.score) st.score.mark(e.i, 'hit');
          lastPitch = frame.midi;
          lastAdvance = frame.time;
          freshOnset = struck = false;
          stable = 0;
          k++;
          show();
          if (k >= evs.length) {
            const secs = Math.round(A.now() - began);
            const acc = evs.length / (evs.length + wrong);
            S.addSession({ id: st.lick.id, t: Date.now(), mode: 'step', bpm: 0, target: st.lick.tempo || 100, acc, secs });
            showResult('All ' + evs.length + ' notes found in ' + secs + ' s with ' + wrong + ' wrong ' + (wrong === 1 ? 'note' : 'notes') + ' (' + pct(acc) + '). ' +
              (wrong === 0 ? 'Clean. Now try it in time with Play along.' : 'Run it again until it comes out clean.'), acc >= 0.9 ? 'good' : 'mid');
            stopEverything();
            renderHistory();
            renderList();
          }
        }
      } else {
        stable = 0;
        if (frame.midi != null && frame.clarity > 0.85 && frame.rms > 0.02) {
          const p = Math.round(frame.midi);
          // a wrong note is a newly struck, steady pitch that is neither the target nor the last note still ringing
          const isOld = lastPitch != null && P.pitchMatches(frame.midi, [lastPitch], 0.7);
          if (!isOld && struck) {
            wrongRun = p === wrongPitch ? wrongRun + 1 : 1;
            if (wrongRun === 5) {
              wrong++;
              struck = false;
              if (st.score) st.score.mark(e.i, 'miss');
            }
            wrongPitch = p;
          }
        }
      }
    });
    setPlayingUi(true);
  }

  function renderHistory() {
    const box = $('lick-history');
    box.innerHTML = '';
    if (!st.lick) return;
    const sum = S.summary(st.lick.id);
    if (!sum.count) {
      box.append(h('p', { class: 'hint' }, 'No practice logged for this piece yet.'));
      return;
    }
    const mins = Math.max(1, Math.round(sum.secs / 60));
    box.append(h('p', { class: 'meta' },
      'Practised ' + sum.count + (sum.count === 1 ? ' time, ' : ' times, ') + mins + ' min total' +
      (sum.best != null ? ' · best ' + pct(sum.best) : '') +
      (sum.topBpm ? ' · clean at ' + sum.topBpm + ' bpm' : '')));
    if (sum.scored.length > 1) box.append(sparkline(sum.scored.slice(-30).map((s) => s.acc)));
  }

  function sparkline(vals) {
    const W = 260, H = 46, NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('class', 'spark');
    const x = (i) => 6 + (i * (W - 12)) / Math.max(1, vals.length - 1);
    const y = (v) => H - 6 - v * (H - 12);
    const line = document.createElementNS(NS, 'polyline');
    line.setAttribute('points', vals.map((v, i) => x(i) + ',' + y(v)).join(' '));
    line.setAttribute('class', 'spark-line');
    svg.append(line);
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('cx', x(vals.length - 1));
    dot.setAttribute('cy', y(vals[vals.length - 1]));
    dot.setAttribute('r', 3.5);
    dot.setAttribute('class', 'spark-dot');
    svg.append(dot);
    return svg;
  }

  /* ----- editor ----- */
  let editing = null;
  function openEditor(lick) {
    stopEverything();
    editing = lick || null;
    document.querySelector('.lib').classList.add('detail');
    $('lick-view').hidden = true;
    $('editor').hidden = false;
    const sel = $('ed-style');
    sel.innerHTML = '';
    L.STYLES.forEach((s) => sel.append(h('option', { value: s.id }, s.label)));
    $('ed-title').value = lick ? lick.title : '';
    sel.value = lick ? lick.style : prefs.style !== 'all' && prefs.style !== 'custom' ? prefs.style : 'bluegrass';
    $('ed-meter').value = lick ? lick.meter : '4/4';
    $('ed-tempo').value = lick ? lick.tempo : 100;
    $('ed-notes').value = lick ? lick.notes : '';
    $('ed-ascii').value = '';
    previewEditor();
  }
  function editorLick() {
    return {
      id: editing ? editing.id : 'custom-' + Date.now(), custom: true,
      title: $('ed-title').value.trim() || 'Untitled lick', style: $('ed-style').value,
      meter: /^\d+\/\d+$/.test($('ed-meter').value.trim()) ? $('ed-meter').value.trim() : '4/4',
      tempo: Math.max(30, Math.min(260, Number($('ed-tempo').value) || 100)),
      notes: $('ed-notes').value, source: 'Your lick',
    };
  }
  function previewEditor() {
    const lick = editorLick();
    const parsed = dsl.parseLick(lick);
    const errs = parsed.errors.slice();
    $('ed-score').innerHTML = '';
    if (parsed.events.length) {
      try {
        GP.score.render($('ed-score'), parsed, {});
      } catch (e) {
        errs.push('Could not draw: ' + e.message);
      }
    }
    $('ed-errors').hidden = !errs.length;
    $('ed-errors').textContent = errs.join(' · ');
    return parsed;
  }

  /* ================= scales ================= */
  const scaleState = Object.assign({ root: 'A', id: 'min_pent', labels: 'note' }, S.get('scale', {}));
  function initScales() {
    NOTE_OPTS.forEach((n) => $('sc-root').append(h('option', {}, n)));
    const groups = {};
    T.SCALES.forEach((s) => {
      if (!groups[s.group]) {
        groups[s.group] = h('optgroup', { label: s.group });
        $('sc-scale').append(groups[s.group]);
      }
      groups[s.group].append(h('option', { value: s.id }, s.name));
    });
    $('sc-root').onchange = () => { scaleState.root = $('sc-root').value; renderScale(); };
    $('sc-scale').onchange = () => {
      scaleState.id = $('sc-scale').value;
      const sc = T.scaleById(scaleState.id);
      if (sc.tonic) scaleState.root = sc.tonic;
      renderScale();
    };
    $('sc-labels').onchange = () => { scaleState.labels = $('sc-labels').value; renderScale(); };
    $('sc-play').onclick = playScale;
  }
  function renderScale() {
    const sc = T.scaleById(scaleState.id) || T.SCALES[0];
    S.set('scale', scaleState);
    $('sc-root').value = scaleState.root;
    $('sc-scale').value = sc.id;
    $('sc-labels').value = scaleState.labels;
    const rootPc = T.namePc(scaleState.root);
    const flats = /b/.test(scaleState.root) || scaleState.root === 'F' || sc.iv.some((v) => [1, 3, 8, 10].includes(Math.floor(v)));
    $('sc-about').textContent = sc.about;
    $('sc-notes').textContent = scaleState.root + ' ' + sc.name + ':  ' +
      sc.iv.map((v) => T.pcName(rootPc + Math.floor(v), flats) + (v % 1 ? ' (quarter tone up)' : '')).join('  ·  ') +
      '      degrees: ' + sc.iv.map(T.degreeName).join(' ');
    const markers = [];
    for (let s = 1; s <= 6; s++) {
      for (let f = 0; f <= 17; f++) {
        const rel = ((T.OPEN[s] + f - rootPc) % 12 + 12) % 12;
        const v = sc.iv.find((x) => Math.floor(x) === rel);
        if (v == null) continue;
        const quarter = v % 1 !== 0;
        markers.push({
          string: s, fret: f, midi: T.OPEN[s] + f + (quarter ? 0.5 : 0),
          kind: quarter ? 'quarter' : rel === 0 ? 'root' : 'tone',
          label: scaleState.labels === 'degree' ? T.degreeName(v) : T.pcName(rootPc + rel, flats) + (quarter ? '+' : ''),
        });
      }
    }
    GP.fretboard.draw($('sc-fb'), { frets: 17, markers, label: scaleState.root + ' ' + sc.name, onPick: (m) => A.pluck(m.midi, A.now() + 0.01, 1.2, 0.7) });
    $('sc-quarter').hidden = !sc.iv.some((v) => v % 1);
    const rel = $('sc-licks');
    rel.innerHTML = '';
    const related = L.licks.filter((l) => l.scale && l.scale.id === sc.id);
    if (!related.length) rel.append(h('li', { class: 'empty' }, 'No studies use this scale yet. Write your own in the Library.'));
    related.forEach((l) => rel.append(lickItem(l, (lick) => {
      prefs.style = 'all';
      prefs.tag = '';
      $('lib-search').value = '';
      buildFilters();
      location.hash = '#library';
      selectLick(lick, true);
    })));
  }
  function playScale() {
    const sc = T.scaleById(scaleState.id);
    let root = 48 + ((T.namePc(scaleState.root) - 0 + 12) % 12);
    if (root < 52) root += 0;
    const up = sc.iv.concat([12]);
    const seq = up.concat(up.slice(0, -1).reverse());
    const t0 = A.now() + 0.05;
    seq.forEach((v, i) => A.pluck(root + v, t0 + i * 0.3, 0.32, 0.7));
  }

  /* ================= chords ================= */
  const chordState = Object.assign({ root: 'C', cat: 'open' }, S.get('chord', {}));
  function initChords() {
    NOTE_OPTS.forEach((n) => $('ch-root').append(h('option', {}, n)));
    $('ch-root').onchange = () => { chordState.root = $('ch-root').value; renderChords(); };
  }
  function renderChords() {
    S.set('chord', chordState);
    $('ch-root').value = chordState.root;
    $('ch-root').disabled = chordState.cat === 'open';
    const cats = $('ch-cats');
    cats.innerHTML = '';
    GP.chords.CATEGORIES.forEach((c) => cats.append(h('button', {
      class: 'chip' + (chordState.cat === c.id ? ' on' : ''), 'aria-pressed': chordState.cat === c.id,
      onclick: () => { chordState.cat = c.id; renderChords(); },
    }, c.label)));
    const cat = GP.chords.CATEGORIES.find((c) => c.id === chordState.cat);
    $('ch-note').textContent = cat.note + (chordState.cat === 'open' ? ' Open shapes are fixed; pick another family to move a shape to any root.' : '');
    const grid = $('ch-grid');
    grid.innerHTML = '';
    GP.chords.chordsFor(chordState.cat, chordState.root).forEach((ch) => {
      const card = h('button', { class: 'chord-card', onclick: () => A.strum(GP.chords.midisOf(ch), A.now() + 0.02, 2.2, 0.55, 0.03) }, h('span', { class: 'chord-name' }, ch.name));
      card.append(GP.chords.diagram(ch));
      grid.append(card);
    });
  }

  /* ================= metronome ================= */
  const metro = {
    on: false, timer: null, raf: null, queue: [],
    spec() {
      const v = $('m-meter').value;
      if (v === '9/8z') return { num: 9, den: 8, groups: [2, 2, 2, 3] };
      const m = dsl.parseMeter(v);
      return { num: m.num, den: m.den, groups: dsl.defaultGroups(m) };
    },
    drawBeats() {
      const box = $('m-beats');
      box.innerHTML = '';
      this.spec().groups.forEach((g, i) => box.append(h('span', { class: 'beat' + (i === 0 ? ' first' : ''), style: 'flex-grow:' + g })));
    },
    start() {
      A.ensure();
      this.on = true;
      this.bpm = Number($('m-bpm').value);
      this.next = A.now() + 0.1;
      this.beat = 0;
      this.bar = 0;
      this.drawBeats();
      this.timer = setInterval(() => this.pump(), 25);
      const frame = () => {
        if (!this.on) return;
        const now = A.now();
        while (this.queue.length && this.queue[0].t <= now) {
          const q = this.queue.shift();
          document.querySelectorAll('#m-beats .beat').forEach((b, i) => b.classList.toggle('on', i === q.beat));
          if (q.bpm) {
            $('m-bpm').value = q.bpm;
            $('m-bpm-out').textContent = q.bpm;
          }
        }
        this.raf = requestAnimationFrame(frame);
      };
      this.raf = requestAnimationFrame(frame);
      $('m-start').textContent = '■ Stop';
      $('m-start').classList.add('stop');
    },
    swing() {
      const v = $('m-swing').value;
      return v === 'auto' ? Math.max(0.55, Math.min(0.69, 0.7 - (this.bpm - 80) * 0.0011)) : Number(v);
    },
    pump() {
      const sp = this.spec();
      const sub = Number($('m-sub').value);
      const groove = $('m-groove').value;
      const sw = sp.den === 4 ? this.swing() : 0.5;
      // tempo counts quarter notes; in x/8 meters a group of g eighths lasts g/2 quarters
      while (this.next < A.now() + 0.15) {
        const g = sp.groups[this.beat % sp.groups.length];
        const len = (60 / this.bpm) * (sp.den === 8 ? g / 2 : 4 / sp.den);
        if (groove === 'click') {
          A.click(this.next, this.beat === 0 ? 2 : 1);
          const parts = sp.den === 8 ? g : sub;
          if (sub > 1) {
            for (let k = 1; k < parts; k++) {
              const x = parts === 2 ? sw : k / parts;
              A.click(this.next + len * x, 0);
            }
          }
        } else if (this.beat === 0) {
          const secs = (tk) => (tk / 480) * (60 / this.bpm);
          for (const d of GP.band.drumBar(groove, sp, this.bar)) {
            A.drum[d.name](this.next + secs(GP.feel.warp(d.tick, sw)), d.vel * (1 + GP.feel.rnd() * 0.05));
          }
        }
        this.queue.push({ t: this.next, beat: this.beat });
        this.next += len;
        this.beat++;
        if (this.beat >= sp.groups.length) {
          this.beat = 0;
          this.bar++;
          const inc = Number($('m-inc').value) || 0;
          const every = Math.max(1, Number($('m-every').value) || 4);
          if (inc && this.bar % every === 0) {
            this.bpm = Math.min(300, this.bpm + inc);
            this.queue.push({ t: this.next, beat: 0, bpm: this.bpm });
          }
        }
      }
    },
    stop() {
      if (!this.on) return;
      this.on = false;
      clearInterval(this.timer);
      cancelAnimationFrame(this.raf);
      this.queue = [];
      $('m-start').textContent = '▶ Start';
      $('m-start').classList.remove('stop');
      document.querySelectorAll('#m-beats .beat').forEach((b) => b.classList.remove('on'));
    },
  };
  function initMetro() {
    const setBpm = (v) => {
      v = Math.max(30, Math.min(300, Math.round(v)));
      $('m-bpm').value = v;
      $('m-bpm-out').textContent = v;
      metro.bpm = v;
      S.set('metroBpm', v);
    };
    setBpm(S.get('metroBpm', 100));
    $('m-bpm').oninput = () => setBpm(Number($('m-bpm').value));
    $('m-minus').onclick = () => setBpm(Number($('m-bpm').value) - 5);
    $('m-plus').onclick = () => setBpm(Number($('m-bpm').value) + 5);
    $('m-start').onclick = () => (metro.on ? metro.stop() : (tuner.stop(), metro.start()));
    $('m-meter').onchange = () => { metro.beat = 0; metro.drawBeats(); };
    let taps = [];
    $('m-tap').onclick = () => {
      const now = performance.now();
      taps = taps.filter((t) => now - t < 2500);
      taps.push(now);
      if (taps.length >= 2) setBpm(60000 / ((taps[taps.length - 1] - taps[0]) / (taps.length - 1)));
    };
    metro.drawBeats();
  }

  /* ================= tuner ================= */
  const tuner = {
    on: false, off: null,
    async start() {
      $('t-error').hidden = true;
      try {
        await P.mic.start();
      } catch (e) {
        $('t-error').hidden = false;
        $('t-error').textContent = micMessage(e);
        return;
      }
      this.on = true;
      $('t-start').textContent = 'Stop tuner';
      let smooth = null;
      this.off = P.mic.on((f) => {
        if (f.midi == null || f.clarity < 0.85) return;
        smooth = smooth == null || Math.abs(smooth - f.midi) > 0.8 ? f.midi : smooth * 0.7 + f.midi * 0.3;
        const near = Math.round(smooth);
        const cents = Math.round((smooth - near) * 100);
        $('t-note').textContent = T.midiName(near);
        $('t-needle').style.left = 50 + Math.max(-50, Math.min(50, cents)) + '%';
        $('t-needle').classList.toggle('ok', Math.abs(cents) <= 5);
        $('t-cents').textContent = Math.abs(cents) <= 5 ? 'In tune' : cents > 0 ? cents + ' cents sharp — tune down' : -cents + ' cents flat — tune up';
      });
    },
    stop() {
      if (!this.on) return;
      this.on = false;
      if (this.off) this.off();
      P.mic.stop();
      $('t-start').textContent = 'Start tuner';
    },
  };

  /* ================= progress ================= */
  function renderProgress() {
    const all = S.sessions();
    const days = new Set(all.map((s) => new Date(s.t).toDateString()));
    let streak = 0;
    for (let d = new Date(); days.has(d.toDateString()); d.setDate(d.getDate() - 1)) streak++;
    const secs = all.reduce((a, s) => a + (s.secs || 0), 0);
    const ids = Array.from(new Set(all.map((s) => s.id)));
    const sums = ids.map((id) => ({ lick: lickById(id), sum: S.summary(id) })).filter((x) => x.lick);
    const mastered = sums.filter((x) => x.sum.best != null && x.sum.best >= 0.9).length;
    const stats = $('pr-stats');
    stats.innerHTML = '';
    [
      [secs >= 3600 ? (secs / 3600).toFixed(1) + ' h' : Math.round(secs / 60) + ' min', 'time practised'],
      [days.size, days.size === 1 ? 'day practised' : 'days practised'],
      [streak, 'day streak'],
      [sums.length, 'pieces worked on'],
      [mastered, 'scored 90% or better'],
    ].forEach(([v, l]) => stats.append(h('div', { class: 'stat' }, h('span', { class: 'stat-v num' }, String(v)), h('span', { class: 'stat-l' }, l))));

    // accuracy chart: every scored session in order
    const chart = $('pr-chart');
    chart.innerHTML = '';
    const scored = all.filter((s) => s.acc != null).slice(-80);
    if (scored.length < 2) {
      chart.append(h('p', { class: 'hint' }, 'Score a few takes in Listening mode and your accuracy trend appears here.'));
    } else {
      chart.append(accuracyChart(scored));
    }

    const bars = $('pr-styles');
    bars.innerHTML = '';
    L.STYLES.forEach((sty) => {
      const total = L.licks.filter((l) => l.style === sty.id).length;
      const got = sums.filter((x) => x.lick.style === sty.id && x.sum.best != null && x.sum.best >= 0.9).length;
      const tried = sums.filter((x) => x.lick.style === sty.id).length;
      bars.append(h('div', { class: 'sbar' },
        h('span', { class: 'sbar-l' }, sty.label),
        h('span', { class: 'sbar-track' }, h('span', { class: 'sbar-tried', style: 'width:' + (100 * tried) / total + '%' }), h('span', { class: 'sbar-fill', style: 'width:' + (100 * got) / total + '%' })),
        h('span', { class: 'sbar-n num' }, got + ' / ' + total)));
    });

    const table = $('pr-table');
    table.innerHTML = '';
    if (!sums.length) {
      table.append(h('caption', {}, 'Nothing yet. Open the Library, pick a phrase and press Play.'));
    } else {
      table.append(h('thead', {}, h('tr', {}, ...['Piece', 'Style', 'Sessions', 'Time', 'Best', 'Clean at', 'Last played'].map((c) => h('th', {}, c)))));
      const body = h('tbody', {});
      sums.sort((a, b) => b.sum.last - a.sum.last).forEach(({ lick, sum }) => {
        body.append(h('tr', {},
          h('td', {}, h('a', { href: '#library', onclick: () => setTimeout(() => selectLick(lick, true), 0) }, lick.title)),
          h('td', {}, styleLabel(lick.style)),
          h('td', { class: 'num' }, String(sum.count)),
          h('td', { class: 'num' }, Math.max(1, Math.round(sum.secs / 60)) + ' min'),
          h('td', { class: 'num' }, sum.best != null ? pct(sum.best) : '–'),
          h('td', { class: 'num' }, sum.topBpm ? sum.topBpm + ' bpm' : '–'),
          h('td', {}, new Date(sum.last).toLocaleDateString())));
      });
      table.append(body);
    }
  }

  function accuracyChart(scored) {
    const NS = 'http://www.w3.org/2000/svg';
    const W = 720, H = 200, L0 = 40, R = 12, Tp = 12, B = 26;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('class', 'acc-chart');
    const mk = (n, a, txt) => {
      const e = document.createElementNS(NS, n);
      for (const k in a) e.setAttribute(k, a[k]);
      if (txt != null) e.textContent = txt;
      svg.append(e);
      return e;
    };
    const x = (i) => L0 + (i * (W - L0 - R)) / (scored.length - 1);
    const y = (v) => Tp + (1 - v) * (H - Tp - B);
    [0, 0.5, 0.9, 1].forEach((v) => {
      mk('line', { x1: L0, x2: W - R, y1: y(v), y2: y(v), class: v === 0.9 ? 'ac-goal' : 'ac-grid' });
      mk('text', { x: L0 - 6, y: y(v) + 4, class: 'ac-tick', 'text-anchor': 'end' }, pct(v));
    });
    const pts = scored.map((s, i) => x(i) + ',' + y(s.acc)).join(' ');
    mk('polygon', { points: L0 + ',' + y(0) + ' ' + pts + ' ' + x(scored.length - 1) + ',' + y(0), class: 'ac-area' });
    mk('polyline', { points: pts, class: 'ac-line' });
    scored.forEach((s, i) => {
      const c = mk('circle', { cx: x(i), cy: y(s.acc), r: 3.5, class: 'ac-dot' });
      const lick = lickById(s.id);
      const t = document.createElementNS(NS, 'title');
      t.textContent = (lick ? lick.title : s.id) + ' — ' + pct(s.acc) + (s.bpm ? ' at ' + s.bpm + ' bpm' : ' (step through)') + ', ' + new Date(s.t).toLocaleDateString();
      c.append(t);
    });
    mk('text', { x: L0, y: H - 6, class: 'ac-tick' }, new Date(scored[0].t).toLocaleDateString());
    mk('text', { x: W - R, y: H - 6, class: 'ac-tick', 'text-anchor': 'end' }, 'latest take');
    return svg;
  }

  /* ================= wiring ================= */
  function init() {
    buildFilters();
    $('lib-search').oninput = renderList;
    $('tag-select').onchange = () => { prefs.tag = $('tag-select').value; savePrefs(); renderList(); };
    $('lib-back').onclick = () => { stopEverything(); document.querySelector('.lib').classList.remove('detail'); };
    $('add-lick').onclick = () => openEditor(null);

    $('play-btn').onclick = togglePlay;
    $('along-btn').onclick = startAlong;
    $('step-btn').onclick = startStep;
    $('bpm').oninput = () => {
      st.bpm = Number($('bpm').value);
      S.set('bpm.' + st.lick.id, st.bpm);
      updateBpm();
    };
    document.querySelectorAll('#pct-btns button').forEach((b) => (b.onclick = () => {
      st.bpm = Math.round((st.lick.tempo || 100) * Number(b.dataset.pct));
      $('bpm').value = st.bpm;
      S.set('bpm.' + st.lick.id, st.bpm);
      updateBpm();
    }));
    const bind = (id, key, rerender) => {
      $(id).checked = !!prefs[key];
      $(id).onchange = () => {
        prefs[key] = $(id).checked;
        savePrefs();
        if (rerender) renderScoreOnly();
      };
    };
    bind('opt-loop', 'loop');
    bind('opt-count', 'countIn');
    bind('opt-click', 'click');
    bind('opt-guide', 'guide');
    bind('opt-backing', 'backing');
    bind('opt-human', 'humanize');
    GP.feel.FEELS.forEach((f) => $('opt-feel').append(h('option', { value: f.id }, f.label)));
    $('opt-feel').value = prefs.feel;
    $('opt-feel').onchange = () => {
      prefs.feel = $('opt-feel').value;
      savePrefs();
      updateBpm();
      renderScoreOnly();
      if (st.mode === 'play') transport.ratio = swingRatio();
    };
    bind('opt-notation', 'notation', true);
    bind('opt-tab', 'tab', true);
    bind('opt-along-guide', 'alongGuide');
    $('opt-ear').onchange = () => { st.ear = $('opt-ear').checked; renderScoreOnly(); };
    $('ramp').value = 0;
    $('latency').value = prefs.latency;
    $('latency-out').textContent = prefs.latency + ' ms';
    $('latency').oninput = () => {
      prefs.latency = Number($('latency').value);
      $('latency-out').textContent = prefs.latency + ' ms';
      savePrefs();
    };

    ['ed-title', 'ed-meter', 'ed-tempo', 'ed-notes'].forEach((id) => ($(id).oninput = previewEditor));
    $('ed-convert').onclick = () => {
      const r = dsl.asciiTabToNotes($('ed-ascii').value, $('ed-ascii-dur').value);
      if (r.error) {
        $('ed-errors').hidden = false;
        $('ed-errors').textContent = r.error;
        return;
      }
      $('ed-notes').value = r.notes;
      previewEditor();
    };
    $('ed-save').onclick = () => {
      const lick = editorLick();
      if (!dsl.parseLick(lick).events.length) {
        $('ed-errors').hidden = false;
        $('ed-errors').textContent = 'Add some notes first.';
        return;
      }
      S.saveCustom(lick);
      prefs.style = 'custom';
      savePrefs();
      buildFilters();
      selectLick(lick, true);
    };
    $('ed-cancel').onclick = () => {
      $('editor').hidden = true;
      $('lick-view').hidden = false;
      if (!st.lick) document.querySelector('.lib').classList.remove('detail');
      renderScoreOnly();
    };

    $('t-start').onclick = () => (tuner.on ? tuner.stop() : (metro.stop(), tuner.start()));
    $('pr-reset').onclick = () => ($('pr-confirm').hidden = false);
    $('pr-no').onclick = () => ($('pr-confirm').hidden = true);
    $('pr-yes').onclick = () => {
      S.set('sessions', []);
      $('pr-confirm').hidden = true;
      renderProgress();
    };

    initScales();
    initChords();
    initMetro();

    const first = lickById(S.get('last', '')) || L.licks[0];
    selectLick(first, false);
    route();

    let resizeTimer = null;
    let lastW = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (!st.mode) renderScoreOnly(); }, 200);
    });
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !/INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName) && !$('view-library').hidden && !$('lick-view').hidden) {
        e.preventDefault();
        togglePlay();
      }
    });
  }
  init();
})();
