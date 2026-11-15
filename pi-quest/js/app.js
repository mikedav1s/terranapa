/* Pi Quest — screens, progress and the glue between lessons, terminal and Python. */
(function () {
  'use strict';
  const { TRACKS, MISSIONS, DRILLS, LEVELS, BASE } = window.PiLessons;
  const { Shell, D0, D1 } = window.PiShell;
  const Board = window.PiBoard, PiPy = window.PiPy;

  const XP_STEP = 10, XP_MISSION = 30, XP_DRILL = 5, XP_LEVEL = 220;
  const app = document.getElementById('app');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const frag = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const byId = (id) => MISSIONS.find((m) => m.id === id);
  const straighten = (s) => s.replace(/[“”„″]/g, '"').replace(/[‘’′]/g, "'").replace(/—/g, '--').replace(/–/g, '-').replace(/ /g, ' ');

  /* ---------- saved progress (this device only) ---------- */
  const store = {
    d: { xp: 0, done: {}, step: {}, code: {}, drill: {}, best: 0, playCode: '', fs: null },
    load() { try { const raw = localStorage.getItem('piquest.v1'); if (raw) Object.assign(this.d, JSON.parse(raw)); } catch (e) { /* start fresh */ } },
    save() { try { localStorage.setItem('piquest.v1', JSON.stringify(this.d)); } catch (e) { /* storage off: progress lasts until the page closes */ } },
    wipe() { this.d = { xp: 0, done: {}, step: {}, code: {}, drill: {}, best: 0, playCode: '', fs: null }; try { localStorage.removeItem('piquest.v1'); } catch (e) { /* ignore */ } },
  };
  store.load();

  const junior = () => store.d.junior !== false; // "Age 7 to 9" helpers: read-aloud, tap-to-type, pick-the-answer drills
  const canSpeak = 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance !== 'undefined';
  function hush() { try { if (canSpeak) window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
  function readAloud(text) {
    try {
      if (window.speechSynthesis.speaking) { hush(); return; }
      const u = new window.SpeechSynthesisUtterance(text.replace(/\.\./g, ' dot dot ').replace(/~/g, ' the squiggle ').replace(/>>/g, ' two arrows ').replace(/>/g, ' arrow ').replace(/\s+/g, ' '));
      u.rate = 0.88; u.lang = 'en';
      window.speechSynthesis.speak(u);
    } catch (e) { /* no voice on this device */ }
  }
  const level = () => Math.min(Math.floor(store.d.xp / XP_LEVEL), LEVELS.length - 1);
  const nextMission = () => MISSIONS.find((m) => !store.d.done[m.id]) || null;
  function addXp(n) { store.d.xp += n; store.save(); paintRank(); }

  /* ---------- small UI helpers ---------- */
  let toastTimer;
  function toast(html) {
    const t = document.getElementById('toast');
    t.innerHTML = html; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }
  function confetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('canvas'); c.id = 'confetti'; document.body.appendChild(c);
    const w = (c.width = innerWidth), h = (c.height = innerHeight), g = c.getContext('2d');
    const cols = ['#bd1848', '#efbe45', '#35e06b', '#4aa3ff', '#ffffff'];
    const bits = Array.from({ length: 90 }, () => ({ x: w / 2 + (Math.random() - .5) * 120, y: h * .45, vx: (Math.random() - .5) * 13, vy: -Math.random() * 13 - 3, s: 5 + Math.random() * 6, c: cols[(Math.random() * cols.length) | 0], r: Math.random() * 6 }));
    let n = 0;
    (function tick() {
      g.clearRect(0, 0, w, h);
      for (const b of bits) { b.x += b.vx; b.y += b.vy; b.vy += .38; b.r += .2; g.save(); g.translate(b.x, b.y); g.rotate(b.r); g.fillStyle = b.c; g.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * .6); g.restore(); }
      if (++n < 110) requestAnimationFrame(tick); else c.remove();
    })();
  }
  function rankHtml() {
    const lv = level(), into = store.d.xp - lv * XP_LEVEL, pct = lv === LEVELS.length - 1 ? 100 : Math.min(100, (into / XP_LEVEL) * 100);
    return '<span class="rank-name">' + LEVELS[lv] + '</span><span class="rank-bar" role="img" aria-label="Progress to next level"><i style="width:' + pct + '%"></i></span><span class="rank-xp">' + store.d.xp + ' XP</span>';
  }
  function paintRank() { const r = document.querySelector('.rank'); if (r) r.innerHTML = rankHtml(); }
  function topBar(current) {
    const link = (hash, label) => '<a href="#' + hash + '"' + (current === hash ? ' aria-current="page"' : '') + '>' + label + '</a>';
    return '<header class="top"><div class="wrap top-in"><a class="logo" href="#home"><span class="logo-mark"></span>Pi Quest</a><nav class="nav" aria-label="Main">' +
      link('home', 'Missions') + link('drills', 'Drills') + link('sheet', 'Cheat sheet') + link('play', 'Playground') + '</nav><div class="rank">' + rankHtml() + '</div></div></header>';
  }

  /* ---------- typing helpers for code boxes ---------- */
  function insertText(ta, text) {
    ta.focus();
    ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function shiftLines(ta, out) {
    const v = ta.value, s = ta.selectionStart, e = ta.selectionEnd;
    if (!out && s === e) { const col = s - (v.lastIndexOf('\n', s - 1) + 1); insertText(ta, ' '.repeat(4 - (col % 4))); return; }
    const ls = v.lastIndexOf('\n', s - 1) + 1; let le = v.indexOf('\n', Math.max(e - (e > s && v[e - 1] === '\n' ? 1 : 0), ls)); if (le < 0) le = v.length;
    const block = v.slice(ls, le).split('\n').map((l) => (out ? l.replace(/^ {1,4}/, '') : l.trim() ? '    ' + l : l)).join('\n');
    ta.focus(); ta.setRangeText(block, ls, le, s === e ? 'end' : 'select');
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function fixQuotes(input) {
    input.addEventListener('input', () => {
      const fixed = straighten(input.value);
      if (fixed !== input.value) { const p = input.selectionStart + (fixed.length - input.value.length); input.value = fixed; try { input.setSelectionRange(p, p); } catch (e) { /* not focusable yet */ } }
    });
  }
  function codeKeys(ta) {
    fixQuotes(ta);
    ta.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const v = ta.value, s = ta.selectionStart, same = s === ta.selectionEnd;
      if (e.key === 'Tab') { e.preventDefault(); shiftLines(ta, e.shiftKey); }
      else if (e.key === 'Enter' && same) {
        e.preventDefault();
        const line = v.slice(v.lastIndexOf('\n', s - 1) + 1, s);
        let ind = (line.match(/^ */) || [''])[0];
        if (/:\s*(#.*)?$/.test(line)) ind += '    ';
        insertText(ta, '\n' + ind);
      } else if (e.key === 'Backspace' && same) {
        const ls = v.lastIndexOf('\n', s - 1) + 1, before = v.slice(ls, s);
        if (before.length && /^ +$/.test(before)) { e.preventDefault(); const n = ((before.length - 1) % 4) + 1; ta.setRangeText('', s - n, s, 'end'); ta.dispatchEvent(new Event('input', { bubbles: true })); }
      }
    });
  }
  function keybar(keys, onKey) {
    const bar = frag('<div class="keybar" role="toolbar" aria-label="Extra keys"></div>');
    for (const k of keys) {
      const b = frag('<button type="button" class="key' + (k.wide ? ' key-wide' : '') + '">' + esc(k.label) + '</button>');
      if (k.title) b.setAttribute('aria-label', k.title);
      b.addEventListener('pointerdown', (e) => e.preventDefault()); // keep the keyboard open on tablets
      b.addEventListener('mousedown', (e) => e.preventDefault());
      b.addEventListener('click', () => onKey(k));
      bar.appendChild(b);
    }
    return bar;
  }

  /* ---------- terminal widget ---------- */
  let uid = 0;
  class Term {
    constructor(cls, label) {
      this.el = frag('<div class="term ' + (cls || '') + '" tabindex="0"><div class="term-out" role="log" aria-live="polite"></div><form class="term-line" autocomplete="off"><span class="term-prompt"></span><input class="term-in" id="term-in-' + ++uid + '" type="text" autocapitalize="none" autocorrect="off" autocomplete="off" spellcheck="false" enterkeyhint="send" aria-label="' + esc(label || 'Type a command') + '"></form></div>');
      this.out = this.el.querySelector('.term-out'); this.form = this.el.querySelector('form');
      this.promptEl = this.el.querySelector('.term-prompt'); this.input = this.el.querySelector('input');
      this.buf = []; this.pending = null; this.onLine = null;
      fixQuotes(this.input);
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = straighten(this.input.value); this.input.value = '';
        if (this.pending) { const r = this.pending; this.pending = null; this.print(this.promptEl.textContent + v + '\n', 'echo'); this.form.hidden = this.hideAfterAsk; r(v); }
        else if (this.onLine) this.onLine(v);
      });
      this.el.addEventListener('click', () => { if (!String(window.getSelection()) && !this.form.hidden) this.input.focus({ preventScroll: true }); });
    }
    print(text, cls) {
      if (!text) return;
      this.buf.push([text, cls || '']);
      if (!this.raf) this.raf = requestAnimationFrame(() => this.flush());
    }
    flush() {
      this.raf = 0;
      if (!this.buf.length) return;
      const f = document.createDocumentFragment();
      // keep only the tail of a flood so the page stays fast
      for (const [text, cls] of this.buf.slice(-400)) {
        const parts = text.split(new RegExp(D0 + '([^' + D1 + ']*)' + D1));
        parts.forEach((p, i) => { if (!p) return; const s = document.createElement('span'); if (i % 2) s.className = 'dir'; else if (cls) s.className = cls; s.textContent = p; f.appendChild(s); });
      }
      this.buf = [];
      this.out.appendChild(f);
      while (this.out.childNodes.length > 700) this.out.removeChild(this.out.firstChild);
      this.el.scrollTop = this.el.scrollHeight;
    }
    clear() { this.buf = []; this.out.textContent = ''; }
    setPrompt(t) { this.promptEl.textContent = t; }
    showLine(on) { this.form.hidden = !on; if (on) this.el.scrollTop = this.el.scrollHeight; }
    focus() { if (!this.form.hidden) this.input.focus({ preventScroll: true }); }
    ask(promptText, hideAfter) {
      this.flush();
      this.hideAfterAsk = hideAfter;
      this.setPrompt(promptText || '');
      this.showLine(true); this.input.focus({ preventScroll: true });
      return new Promise((res) => { this.pending = res; });
    }
    cancelAsk() { if (this.pending) { this.pending = null; this.input.value = ''; } }
  }

  function pyErrorText(err, file) {
    return 'Traceback (most recent call last):\n  File "' + file + '"' + (err.line ? ', line ' + err.line : '') + '\n' + err.message + '\n' + (err.tip ? '\nTip: ' + err.tip + '\n' : '');
  }

  /* ---------- nano look-alike ---------- */
  function openNano(path, text, snippet) {
    return new Promise((resolve) => {
      const name = path.split('/').pop();
      const el = frag('<div class="nano-back"><div class="nano" role="dialog" aria-modal="true" aria-label="nano editor"><div class="nano-title"><span>GNU nano 7.2</span><span>' + esc(name) + '</span><span class="nano-mod"></span></div>' +
        '<textarea class="code" id="nano-text" wrap="off" autocapitalize="none" autocorrect="off" autocomplete="off" spellcheck="false" aria-label="File contents"></textarea>' +
        '<div class="nano-status" aria-live="polite"></div><div class="nano-keys">' +
        '<button type="button" class="nano-key" data-a="save"><b>^O</b>Save</button><button type="button" class="nano-key" data-a="exit"><b>^X</b>Exit</button>' +
        '<button type="button" class="nano-key" data-a="in"><b>Tab</b>Indent</button><button type="button" class="nano-key" data-a="out">Un-indent</button>' + (snippet ? '<button type="button" class="nano-key" data-a="fill">Type it for me</button>' : '') + '</div></div></div>');
      const ta = el.querySelector('textarea'), status = el.querySelector('.nano-status'), mod = el.querySelector('.nano-mod');
      let saved = null, dirty = false;
      ta.value = text; codeKeys(ta);
      ta.addEventListener('input', () => { dirty = true; mod.textContent = 'Modified'; });
      const save = () => { saved = ta.value.endsWith('\n') || !ta.value ? ta.value : ta.value + '\n'; dirty = false; mod.textContent = ''; status.textContent = '[ Wrote ' + (saved ? saved.split('\n').length - 1 : 0) + ' lines to ' + name + ' ]'; ta.focus(); };
      const close = () => { document.removeEventListener('keydown', onKey, true); el.remove(); resolve(saved); };
      const exit = () => {
        if (!dirty) return close();
        status.innerHTML = 'Save your changes before you exit? ';
        [['Yes, save', () => { save(); close(); }], ['No', close], ['Cancel', () => { status.textContent = ''; ta.focus(); }]].forEach(([label, fn]) => {
          const b = frag('<button type="button" class="nano-key">' + label + '</button>'); b.addEventListener('click', fn); status.appendChild(b);
        });
      };
      el.querySelectorAll('.nano-keys button').forEach((b) => {
        b.addEventListener('pointerdown', (e) => e.preventDefault());
        b.addEventListener('click', () => ({ save, exit, in: () => shiftLines(ta, false), out: () => shiftLines(ta, true), fill: () => { ta.value = snippet; ta.dispatchEvent(new Event('input', { bubbles: true })); ta.focus(); } }[b.dataset.a]()));
      });
      function onKey(e) {
        if (!(e.ctrlKey || e.metaKey)) return;
        const k = e.key.toLowerCase();
        if (k === 'o' || k === 's') { e.preventDefault(); save(); } else if (k === 'x') { e.preventDefault(); exit(); }
      }
      document.addEventListener('keydown', onKey, true);
      document.body.appendChild(el);
      ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
    });
  }

  /* ---------- a terminal workspace ---------- */
  let cleanup = [];
  function terminalSession(opts) {
    const root = frag('<div class="work-term" style="display:grid;gap:10px;min-width:0"></div>');
    const term = new Term('', 'Terminal. Type a command');
    const boardEl = document.createElement('div'); const board = new Board(boardEl);
    let busy = false, hIdx = null, draft = '';
    const io = {
      print: (t, c) => term.print(t, c), clear: () => term.clear(), editor: (path, text) => openNano(path, text, opts.nanoText ? opts.nanoText() : null),
      python: async (code, name) => {
        Board.unlockAudio();
        const res = await PiPy.run(code, { print: (t) => { term.print(t); sh.last.out += t; }, input: (p) => term.ask(p, true), board });
        term.cancelAsk(); term.showLine(false);
        if (res.stopped) term.print('^C\nKeyboardInterrupt\n', 'err');
        if (res.error) term.print(pyErrorText(res.error, name), 'err');
        return res;
      },
    };
    const sh = new Shell(io);
    sh.reset(opts.tree, opts.cwd);
    if (opts.saved) sh.load(opts.saved);
    term.setPrompt(sh.prompt());
    term.print(opts.banner || 'Raspberry Pi OS (practice mode)\nType help to see what you can do.\n\n', 'echo');

    term.onLine = async (line) => {
      term.print(sh.prompt() + line + '\n', 'echo'); hIdx = null;
      busy = true; term.showLine(false); term.el.focus({ preventScroll: true });
      const last = await sh.exec(line);
      busy = false; term.setPrompt(sh.prompt()); term.showLine(true); term.focus();
      if (opts.onSave) opts.onSave(sh.toJSON());
      if (opts.onCommand) opts.onCommand(Object.assign({}, last, { sh, events: board.events }));
    };
    const hist = (dir) => {
      if (term.pending || busy || !sh.history.length) return;
      if (hIdx === null) { if (dir > 0) return; draft = term.input.value; hIdx = sh.history.length; }
      hIdx = Math.max(0, Math.min(sh.history.length, hIdx + dir));
      term.input.value = hIdx === sh.history.length ? draft : sh.history[hIdx];
      const n = term.input.value.length; try { term.input.setSelectionRange(n, n); } catch (e) { /* ignore */ }
    };
    const tab = () => {
      if (term.pending || busy) return;
      const r = sh.complete(term.input.value);
      if (r.options && r.line === term.input.value) term.print(sh.prompt() + term.input.value + '\n' + r.options.join('  ') + '\n', 'echo');
      if (r.line) term.input.value = r.line;
    };
    const ctrlC = () => { if (PiPy.running) PiPy.stop(); else if (!busy) { term.print(sh.prompt() + term.input.value + '^C\n', 'echo'); term.input.value = ''; } };
    term.el.addEventListener('keydown', (e) => {
      if (e.key === 'c' && e.ctrlKey) { e.preventDefault(); ctrlC(); }
      else if (e.target !== term.input) return;
      else if (e.key === 'ArrowUp') { e.preventDefault(); hist(-1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); hist(1); }
      else if (e.key === 'Tab') { e.preventDefault(); tab(); }
      else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); term.clear(); }
    });
    const bar = keybar([
      { label: 'Tab', wide: 1, a: tab, title: 'Tab: finish the name' }, { label: '↑', a: () => hist(-1), title: 'Previous command' }, { label: '↓', a: () => hist(1), title: 'Next command' },
      { label: '~' }, { label: '/' }, { label: '-' }, { label: '.' }, { label: '>' }, { label: '"' }, { label: '_' }, { label: '|' },
      { label: 'Ctrl+C', wide: 1, a: ctrlC, title: 'Control C: stop the program' },
    ], (k) => { if (k.a) k.a(); else if (!term.form.hidden) insertText(term.input, k.label); term.focus(); });
    root.append(bar, term.el, boardEl);
    cleanup.push(() => PiPy.stop());
    const type = (text) => { if (busy || term.form.hidden || term.pending) return; term.input.value = text; term.focus(); term.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
    return { el: root, term, sh, board, type };
  }

  /* ---------- a Python workspace ---------- */
  function pythonSession(opts) {
    const root = frag('<div class="work-py" style="display:grid;gap:10px;min-width:0">' +
      '<div class="ed-bar"><button type="button" class="btn btn-run" data-a="run">▶ Run</button><button type="button" class="btn" data-a="stop" disabled>■ Stop</button><span class="ed-status" aria-live="polite"></span><button type="button" class="btn btn-small btn-quiet" data-a="reset">Reset code</button></div>' +
      '<div class="ed-wrap"><div class="gutter" aria-hidden="true"></div><textarea class="code" id="code-' + ++uid + '" wrap="off" autocapitalize="none" autocorrect="off" autocomplete="off" spellcheck="false" aria-label="Python code"></textarea></div>' +
      '<div class="keys-slot"></div><div class="board-slot"></div><div><div class="panel-label"><span class="silk">Output</span></div><div class="out-slot"></div></div></div>');
    const ta = root.querySelector('textarea'), gutter = root.querySelector('.gutter'), status = root.querySelector('.ed-status');
    const runBtn = root.querySelector('[data-a=run]'), stopBtn = root.querySelector('[data-a=stop]');
    const term = new Term('console', 'Type your answer');
    term.showLine(false);
    root.querySelector('.out-slot').appendChild(term.el);
    const board = new Board(root.querySelector('.board-slot'));
    board.layout(opts.board);
    let badLine = null;
    const paintGutter = () => {
      const n = ta.value.split('\n').length; let h = '';
      for (let i = 1; i <= n; i++) h += '<div' + (i === badLine ? ' class="bad"' : '') + '>' + i + '</div>';
      gutter.innerHTML = h; gutter.scrollTop = ta.scrollTop;
    };
    codeKeys(ta);
    ta.value = opts.code || '';
    ta.addEventListener('input', () => { badLine = null; paintGutter(); if (opts.onChange) opts.onChange(ta.value); });
    ta.addEventListener('scroll', () => { gutter.scrollTop = ta.scrollTop; });
    paintGutter();
    root.querySelector('.keys-slot').appendChild(keybar([
      { label: '⇥ indent', wide: 1, a: () => shiftLines(ta, false), title: 'Indent: push the line in' }, { label: '⇤', a: () => shiftLines(ta, true), title: 'Un-indent' },
      { label: ':' }, { label: '(' }, { label: ')' }, { label: '"' }, { label: '=' }, { label: '.' }, { label: '_' }, { label: '[' }, { label: ']' }, { label: '#' }, { label: '<' }, { label: '>' }, { label: '{' }, { label: '}' },
    ], (k) => { if (k.a) k.a(); else insertText(ta, k.label); }));

    async function run() {
      if (PiPy.running) return;
      Board.unlockAudio();
      if (!PiPy.ready()) { term.clear(); term.print('Python has not loaded yet. Check the internet connection, then reload the page.\n', 'err'); return; }
      term.clear(); badLine = null; paintGutter();
      if (!board.el.hidden) board.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      const ctx = { code: ta.value, out: '', events: board.events, finished: false, stopped: false, error: null, inputs: 0, passed: false };
      runBtn.disabled = true; stopBtn.disabled = false; status.textContent = 'Running…';
      let queued = false;
      board.onEvent = () => { ctx.events = board.events; if (queued) return; queued = true; Promise.resolve().then(() => { queued = false; if (opts.onRun) opts.onRun(ctx, true); }); };
      const p = PiPy.run(ta.value, {
        print: (t) => { term.print(t); if (ctx.out.length < 200000) ctx.out += t; },
        input: (q) => term.ask(q, true).then((v) => { ctx.inputs++; return v; }),
        board,
      });
      ctx.events = board.events;
      const res = await p;
      term.cancelAsk(); term.showLine(false); board.onEvent = null;
      ctx.error = res.error; ctx.stopped = res.stopped; ctx.finished = !res.error && !res.stopped; ctx.events = board.events;
      if (res.error) { term.print('\n' + res.error.message + '\n' + (res.error.tip ? '\nTip: ' + res.error.tip + '\n' : ''), 'err'); badLine = res.error.line; paintGutter(); }
      status.textContent = res.error ? 'Stopped by an error' : res.stopped ? 'Stopped' : 'Finished';
      if (ctx.finished && !ctx.out.trim() && !board.events.length) term.print('(The program ran, but it did not print anything.)\n', 'echo');
      runBtn.disabled = false; stopBtn.disabled = true;
      if (opts.onRun) opts.onRun(ctx, false);
    }
    runBtn.addEventListener('click', run);
    stopBtn.addEventListener('click', () => PiPy.stop());
    root.querySelector('[data-a=reset]').addEventListener('click', () => { PiPy.stop(); setCode(opts.resetCode ? opts.resetCode() : opts.code || ''); toast('Code reset'); });
    ta.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); } });
    function setCode(v) { ta.value = v; badLine = null; paintGutter(); ta.scrollTop = 0; if (opts.onChange) opts.onChange(v); }
    cleanup.push(() => PiPy.stop());
    const addCode = (text, full) => {
      if (full) setCode(full); else { const v = ta.value.replace(/\s+$/, ''); setCode((v ? v + '\n' : '') + text.replace(/\s+$/, '') + '\n'); }
      ta.scrollTop = ta.scrollHeight; gutter.scrollTop = ta.scrollTop;
      ta.closest('.ed-wrap').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
    return { el: root, setCode, addCode, getCode: () => ta.value, board, term };
  }

  /* ---------- screens ---------- */
  function viewHome() {
    const next = nextMission();
    const started = store.d.xp > 0;
    const doneCount = MISSIONS.filter((m) => store.d.done[m.id]).length;
    let html = topBar('home') + '<main><div class="wrap hero"><div>' +
      '<h1>Learn to <em>command</em> a Raspberry Pi.</h1>' +
      '<p class="hero-sub">Type real commands. Write real Python. Blink a light, read a button, build a game. One small mission at a time.</p>' +
      '<div class="hero-cta">' + (next
        ? '<a class="btn btn-go" href="#' + next.id + '">' + (started ? 'Continue: ' : 'Start: ') + esc(next.title) + ' →</a>'
        : '<a class="btn btn-go" href="#play">All missions done. Open the Playground →</a>') +
      '<span class="hero-meta">' + doneCount + ' of ' + MISSIONS.length + ' missions done</span></div>' +
      '<div class="age" role="group" aria-label="Who is learning?"><span class="silk">Who is learning?</span><div class="age-btns"><button type="button" class="age-btn" data-j="1" aria-pressed="' + junior() + '">Age 7 to 9</button><button type="button" class="age-btn" data-j="0" aria-pressed="' + !junior() + '">Age 10 and up</button></div>' +
      '<span class="age-note">' + (junior() ? 'Bigger words, read-aloud, tap-to-type, and pick-the-answer drills.' : 'Type everything yourself. Drills are typed from memory.') + '</span></div></div>' +
      '<div class="demo" aria-hidden="true"><div class="demo-line"><span class="p">pi@raspberrypi:~ $</span> cd projects/blink</div><div class="demo-line"><span class="p">pi@raspberrypi:~/projects/blink $</span> python3 blink.py<span class="cursor"></span></div>' +
      '<div class="demo-board"><span class="demo-led"></span><span class="silk">GPIO17 &nbsp;led.on()</span></div></div></div>' +
      '<div class="wrap tracks">';
    for (const t of TRACKS) {
      const ms = MISSIONS.filter((m) => m.track === t.id);
      html += '<section><div class="track-head"><span class="silk">' + t.tag + '</span><h2>' + t.name + '</h2><p>' + t.blurb + '</p><span class="track-count">' + ms.filter((m) => store.d.done[m.id]).length + ' / ' + ms.length + ' done</span></div><ol class="trace">';
      ms.forEach((m, i) => {
        const done = store.d.done[m.id], isNext = next && next.id === m.id, step = store.d.step[m.id] || 0;
        const state = done ? 'DONE' : isNext ? (step ? 'CONTINUE' : 'NEXT') : step ? step + '/' + m.steps.length : '';
        html += '<li class="' + (done ? 'done' : isNext ? 'next' : step ? 'part-way' : '') + '"><a class="m-card" href="#' + m.id + '"><span class="m-num">' + String(i + 1).padStart(2, '0') + '</span><span class="m-title">' + esc(m.title) + '</span>' +
          (state ? '<span class="m-state">' + state + '</span>' : '') + '<span class="m-goal">' + esc(m.goal) + '</span></a></li>';
      });
      html += '</ol></section>';
    }
    html += '</div><div class="wrap grownups"><details><summary>For grown-ups</summary><div class="grownups-body">' +
      '<p>Pi Quest is a safe practice space. The terminal and the Raspberry Pi board are simulated inside this page, so nothing on this device can be changed or deleted. The Python is real and runs in the browser.</p>' +
      '<p>Every mission follows the same rhythm: a short idea, a task to type, and a check. The last step of most missions is done from memory. <b>Drills</b> bring back old commands for quick repetition, and the <b>Cheat sheet</b> fills in as missions are finished. The Pi Projects use the same <code>gpiozero</code> code that runs on a real Raspberry Pi, and each one ends with wiring notes.</p>' +
      '<p>Progress is saved in this browser on this device only.</p>' +
      '<div class="row"><button type="button" class="btn btn-small" id="wipe">Erase progress on this device</button><span id="wipe-confirm" hidden>Are you sure? <button type="button" class="btn btn-small btn-go" id="wipe-yes">Yes, erase it</button> <button type="button" class="btn btn-small" id="wipe-no">Keep it</button></span></div>' +
      '</div></details></div></main>';
    app.innerHTML = html;
    app.querySelectorAll('.age-btn').forEach((b) => b.addEventListener('click', () => { store.d.junior = b.dataset.j === '1'; store.save(); document.body.classList.toggle('junior', junior()); viewHome(); }));
    const wc = document.getElementById('wipe-confirm');
    document.getElementById('wipe').addEventListener('click', () => { wc.hidden = false; });
    document.getElementById('wipe-no').addEventListener('click', () => { wc.hidden = true; });
    document.getElementById('wipe-yes').addEventListener('click', () => { store.wipe(); viewHome(); toast('Progress erased'); });
  }

  function starterFor(m, idx) {
    for (let i = Math.min(idx, m.steps.length - 1); i >= 0; i--) if (m.steps[i].starter) return m.steps[i].starter;
    return m.starter || '';
  }

  function viewMission(m) {
    const track = TRACKS.find((t) => t.id === m.track);
    const num = MISSIONS.filter((x) => x.track === m.track).indexOf(m) + 1;
    app.innerHTML = '<header class="top m-top"><div class="wrap m-top-in"><a class="back" href="#home">← Missions</a><div class="m-name"><span class="silk">' + track.name + ' ' + String(num).padStart(2, '0') + '</span><h1>' + esc(m.title) + '</h1></div><div class="rank">' + rankHtml() + '</div></div></header>' +
      '<main class="wrap m-grid"><aside class="brief" aria-live="polite"></aside><section class="work"></section></main>';
    const brief = app.querySelector('.brief'), work = app.querySelector('.work');
    let idx = store.d.done[m.id] ? m.steps.length : Math.min(store.d.step[m.id] || 0, m.steps.length - 1);
    let misses = 0, session, showHint = () => {};

    function paintBrief() {
      if (idx >= m.steps.length) {
        const after = MISSIONS[MISSIONS.indexOf(m) + 1];
        brief.innerHTML = '<div class="done-card"><span class="silk" style="color:var(--gold)">Mission complete</span><h2>You did it!</h2><p>' + esc(m.goal) + '</p>' +
          '<div><span class="silk" style="color:var(--muted)">You can now use</span><div class="chips" style="margin-top:6px">' + m.learn.map((l) => '<code>' + esc(l[0]) + '</code>').join('') + '</div></div>' +
          (m.wiring ? '<div class="wiring"><span class="silk">Build it on a real Pi</span>' + m.wiring + ' The same code works.</div>' : '') +
          '<div class="done-actions">' + (after ? '<a class="btn btn-go" href="#' + after.id + '">Next: ' + esc(after.title) + ' →</a>' : '<a class="btn btn-go" href="#play">Open the Playground →</a>') +
          '<a class="btn" href="#drills">Quick drill</a><button type="button" class="btn btn-quiet" id="again">Practice again</button></div>' +
          '<p style="color:var(--muted);font-size:.92rem">Keep playing here if you like. Try changing things to see what happens.</p></div>';
        brief.querySelector('#again').addEventListener('click', () => { idx = 0; store.d.step[m.id] = 0; store.save(); misses = 0; build(); });
        return;
      }
      const s = m.steps[idx];
      brief.innerHTML = '<div class="dots" role="img" aria-label="Step ' + (idx + 1) + ' of ' + m.steps.length + '">' + m.steps.map((_, i) => '<i class="' + (i < idx ? 'd' : i === idx ? 'c' : '') + '"></i>').join('') + '<span>Step ' + (idx + 1) + ' of ' + m.steps.length + '</span></div>' +
        '<div class="say">' + s.say + '</div><div class="task"><span class="silk">Your task</span><div class="task-do">' + s.do + '</div></div>' +
        '<div class="tap-note" hidden></div><div class="nudge" hidden></div><div class="hint-text" hidden></div>' +
        '<div class="help">' + (canSpeak ? '<button type="button" class="btn btn-small" id="read">Read to me</button>' : '') + '<button type="button" class="btn btn-small" id="hint">Hint</button><button type="button" class="btn btn-small btn-quiet" id="answer"' + (junior() ? '' : ' hidden') + '>Show me the answer</button></div>';
      const hintBox = brief.querySelector('.hint-text'), ansBtn = brief.querySelector('#answer');
      showHint = () => { if (hintBox.hidden) { hintBox.hidden = false; hintBox.textContent = s.hint; ansBtn.hidden = false; } };
      brief.querySelector('#hint').addEventListener('click', showHint);
      if (canSpeak) brief.querySelector('#read').addEventListener('click', () => readAloud(brief.querySelector('.say').innerText + '. Your task. ' + brief.querySelector('.task-do').innerText));
      if (junior()) {
        const note = brief.querySelector('.tap-note');
        const taps = m.kind === 'terminal' ? brief.querySelectorAll('.task-do code:not(.n)') : brief.querySelectorAll('.task-do pre');
        taps.forEach((t) => {
          t.classList.add('tap'); t.setAttribute('role', 'button'); t.tabIndex = 0;
          const go = () => {
            const text = straighten(t.textContent);
            if (m.kind === 'terminal') session.type(text);
            else { session.addCode(text, s.tapCode || (s.tapReplace !== undefined ? (s.tapReplace === true ? '' : s.tapReplace) + text + '\n' : null)); toast('Added to your code'); }
          };
          t.addEventListener('click', go);
          t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        });
        if (taps.length) { note.hidden = false; note.textContent = m.kind === 'terminal' ? 'Tap a green box to type it for you. Then press Enter.' : 'Tap the code box to put it in your program. Then press Run.'; }
      }
      ansBtn.addEventListener('click', () => { hintBox.hidden = false; hintBox.innerHTML = esc(s.hint) + '<pre></pre>'; hintBox.querySelector('pre').textContent = s.answer; ansBtn.hidden = true; });
    }
    function nudge(text) { const n = brief.querySelector('.nudge'); if (n) { n.textContent = text; n.hidden = false; } }

    function pass() {
      idx++; misses = 0; hush();
      store.d.step[m.id] = idx;
      if (idx >= m.steps.length) {
        const first = !store.d.done[m.id];
        store.d.done[m.id] = true; store.d.step[m.id] = 0;
        addXp(first ? XP_STEP + XP_MISSION : 0);
        toast('Mission complete!' + (first ? ' <b>+' + (XP_STEP + XP_MISSION) + ' XP</b>' : '')); confetti();
      } else {
        const first = !store.d.done[m.id];
        addXp(first ? XP_STEP : 0);
        toast('Nice work!' + (first ? ' <b>+' + XP_STEP + ' XP</b>' : ''));
        const s = m.steps[idx];
        if (m.kind === 'python' && s.starter) { PiPy.stop(); session.setCode(s.starter); }
      }
      store.save();
      paintBrief();
      if (window.matchMedia('(max-width: 900px)').matches) brief.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    function attempt(c, onMiss) {
      if (idx >= m.steps.length) return;
      if (c.startIdx === undefined) c.startIdx = idx; // a Python run can pass one step only
      let ok = false;
      try { ok = !!m.steps[idx].check(c); } catch (e) { ok = false; }
      if (ok) pass(); else if (onMiss) onMiss();
    }

    function build() {
      cleanup.forEach((f) => f()); cleanup = [];
      work.innerHTML = '';
      if (m.kind === 'terminal') {
        session = terminalSession({
          tree: m.tree, cwd: m.cwd,
          nanoText: () => (junior() && idx < m.steps.length ? m.steps[idx].nanoText || null : null),
          onCommand: (c) => attempt(c, () => { misses++; if (junior() && misses >= 2) showHint(); if (misses >= 3) nudge('Stuck? Read the task once more, or tap Hint. Exploring is fine too.'); }),
        });
      } else {
        const start = Math.min(idx, m.steps.length - 1);
        session = pythonSession({
          code: store.d.code[m.id] !== undefined && idx > 0 ? store.d.code[m.id] : starterFor(m, start),
          board: m.board,
          resetCode: () => starterFor(m, idx),
          onChange: (v) => { store.d.code[m.id] = v; store.save(); },
          onRun: (ctx, live) => {
            if (ctx.passed) return;
            attempt(ctx, live ? null : () => { if (junior() && !ctx.stopped) showHint(); nudge(ctx.error ? 'Errors are clues, not failures. Read the red message, look at the marked line, and try again.' : ctx.stopped ? 'Stopped. Run it again when you are ready.' : 'Your program ran, but the task is not done yet. Read it once more, or tap Hint.'); });
            if (idx > ctx.startIdx) ctx.passed = true;
          },
        });
      }
      work.appendChild(session.el);
      paintBrief();
    }
    build();
  }

  function viewDrills() {
    const unlocked = DRILLS.filter((d) => store.d.done[d.after]);
    const pool = unlocked.length >= 4 ? unlocked : DRILLS.filter((d) => d.after === 'cli-look' || store.d.done[d.after]);
    const score = (d) => { const s = store.d.drill[d.id] || [0, 0]; return s[0] - 2 * s[1] + Math.random() * 1.5; };
    const cards = pool.slice().sort((a, b) => score(a) - score(b)).slice(0, Math.min(8, pool.length)).sort(() => Math.random() - .5);
    app.innerHTML = topBar('drills') + '<main class="wrap page"><div class="page-head"><h1>Drills</h1><p>Quick-fire practice. ' + (junior() ? 'Tap the right answer.' : 'Type each answer from memory.') + ' Cards you miss come back more often. Finishing missions unlocks more cards (' + unlocked.length + ' of ' + DRILLS.length + ' unlocked).</p></div><div class="drill"></div></main>';
    const box = app.querySelector('.drill');
    let i = 0, right = 0, streak = 0, retry = false;
    function card() {
      if (i >= cards.length) {
        box.innerHTML = '<div class="drill-end" style="display:grid;gap:12px"><span class="silk" style="color:var(--gold)">Round over</span><div class="big-num">' + right + ' / ' + cards.length + '</div><h2>' + (right === cards.length ? 'Perfect round!' : right >= cards.length / 2 ? 'Solid work.' : 'Good practice. It gets easier each round.') + '</h2><p style="color:var(--muted)">Best streak ever: ' + store.d.best + '</p><div class="done-actions"><button type="button" class="btn btn-go" id="more">Go again</button><a class="btn" href="#home">Back to missions</a></div></div>';
        box.querySelector('#more').addEventListener('click', viewDrills);
        if (right === cards.length) confetti();
        return;
      }
      const d = cards[i]; retry = false;
      box.innerHTML = '<div class="drill-meta"><span>Card ' + (i + 1) + ' of ' + cards.length + '</span><span>Streak: ' + streak + '</span></div><div class="drill-q">' + esc(d.q) + '</div>' +
        (junior() ? '<div class="choices"></div>' : '<form class="drill-form" autocomplete="off"><input class="drill-in" id="drill-answer" type="text" autocapitalize="none" autocorrect="off" autocomplete="off" spellcheck="false" aria-label="Your answer"><button class="btn btn-go" type="submit">Check</button></form>') + '<div class="drill-fb" aria-live="polite"></div>';
      if (junior()) {
        const kind = (x) => (/^(Python|Pi):/.test(x.q) ? 'py' : 'cli');
        const others = DRILLS.filter((x) => x.answer !== d.answer && kind(x) === kind(d) && !d.re.test(x.answer)).sort(() => Math.random() - .5).slice(0, 2);
        const fbj = box.querySelector('.drill-fb'), wrap = box.querySelector('.choices');
        [d, ...others].sort(() => Math.random() - .5).forEach((o) => {
          const b = frag('<button type="button" class="choice"></button>'); b.textContent = o.answer;
          b.addEventListener('click', () => {
            const rec = store.d.drill[d.id] || (store.d.drill[d.id] = [0, 0]);
            if (o === d) {
              if (!retry) { right++; streak++; rec[0]++; store.d.best = Math.max(store.d.best, streak); addXp(XP_DRILL); toast('Correct! <b>+' + XP_DRILL + ' XP</b>'); }
              store.save(); i++; card();
            } else {
              if (!retry) { rec[1]++; streak = 0; store.save(); }
              retry = true; b.disabled = true;
              fbj.className = 'drill-fb bad'; fbj.textContent = 'Not that one. Have another go.';
              box.querySelector('.drill-meta span:last-child').textContent = 'Streak: 0';
            }
          });
          wrap.appendChild(b);
        });
        return;
      }
      const input = box.querySelector('input'), fb = box.querySelector('.drill-fb');
      fixQuotes(input); input.focus();
      box.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = straighten(input.value).trim().replace(/\s+/g, ' ');
        if (!v) return;
        const rec = store.d.drill[d.id] || (store.d.drill[d.id] = [0, 0]);
        if (d.re.test(v)) {
          if (!retry) { right++; streak++; rec[0]++; store.d.best = Math.max(store.d.best, streak); addXp(XP_DRILL); toast('Correct! <b>+' + XP_DRILL + ' XP</b>'); }
          store.save(); i++; card();
        } else {
          if (!retry) { rec[1]++; streak = 0; store.save(); }
          retry = true;
          fb.className = 'drill-fb bad';
          fb.innerHTML = 'Not quite. The answer is <code></code><br>Type it once to lock it in.';
          fb.querySelector('code').textContent = d.answer;
          box.querySelector('.drill-meta span:last-child').textContent = 'Streak: 0';
          input.value = ''; input.focus();
        }
      });
    }
    card();
  }

  function viewSheet() {
    let html = topBar('sheet') + '<main class="wrap page"><div class="page-head"><h1>Cheat sheet</h1><p>Everything you have learned so far. Faded cards fill in when you finish their mission. Even experts look things up.</p></div>';
    for (const t of TRACKS) {
      html += '<h2 class="sheet-track">' + t.name + '</h2><div class="sheet-grid">';
      for (const m of MISSIONS.filter((x) => x.track === t.id)) {
        const done = store.d.done[m.id];
        html += '<div class="sheet-block ' + (done ? 'learned' : 'todo') + '"><h3><a href="#' + m.id + '" style="text-decoration:none">' + esc(m.title) + '</a><span class="silk">' + (done ? 'Learned' : 'Not yet') + '</span></h3><dl>' +
          m.learn.map((l) => '<div><dt>' + esc(l[0]) + '</dt><dd>' + esc(l[1]) + '</dd></div>').join('') + '</dl></div>';
      }
      html += '</div>';
    }
    html += '<section class="kit"><span class="silk">When you are ready</span><h2>Move to a real Raspberry Pi</h2><div class="kit-cols">' +
      '<div><h3>What you need</h3><ul><li>A Raspberry Pi with Raspberry Pi OS</li><li>A breadboard and jumper wires</li><li>LEDs (red, amber, green)</li><li>330 Ω resistors, one for each LED</li><li>A push button and a small buzzer</li></ul></div>' +
      '<div><h3>First steps</h3><ol><li>Open the <b>Terminal</b> app on the Pi.</li><li>Update it: <code>sudo apt update</code></li><li>Make a folder: <code>mkdir projects</code></li><li>Write code: <code>nano blink.py</code></li><li>Run it: <code>python3 blink.py</code></li><li>Stop it: <kbd style="color:var(--ink)">Ctrl</kbd> + <kbd style="color:var(--ink)">C</kbd></li></ol></div>' +
      '<div><h3>Safety rules</h3><ul><li>Every LED needs a resistor.</li><li>Never join a 5V pin to a GPIO pin.</li><li>Check your wiring before you plug in the power.</li><li>GPIO numbers are not pin numbers. Type <code>pinout</code> on the Pi to see the map.</li><li>Ask a grown-up before you change any wiring.</li></ul></div></div></section></main>';
    app.innerHTML = html;
  }

  const PLAY_CODE = '# The Playground. Try anything!\n# LEDs: 17 (red), 27 (amber), 22 (green)\n# Button: 2    Buzzer: 3\nfrom gpiozero import LED, Button, Buzzer\nfrom time import sleep\n\nred = LED(17)\n\nfor i in range(3):\n    red.on()\n    sleep(0.3)\n    red.off()\n    sleep(0.3)\n\nprint("Your turn. Change me!")\n';
  const PLAY_BOARD = [{ pin: 2, kind: 'button' }, { pin: 3, kind: 'buzzer' }, { pin: 17, kind: 'led', color: 'red' }, { pin: 27, kind: 'led', color: 'amber' }, { pin: 22, kind: 'led', color: 'green' }];
  let playTab = 'py';
  function viewPlay() {
    app.innerHTML = topBar('play') + '<main class="wrap page"><div class="page-head"><h1>Playground</h1><p>No tasks and no checks. Build whatever you like. Your work here is saved on this device.</p></div>' +
      '<div><div class="tabs" role="tablist"><button type="button" class="tab" role="tab" data-t="py">Python + board</button><button type="button" class="tab" role="tab" data-t="term">Terminal</button></div><div class="play-body" style="border-top:2px solid var(--pcb);padding-top:14px"></div></div></main>';
    const body = app.querySelector('.play-body');
    const show = (t) => {
      playTab = t; cleanup.forEach((f) => f()); cleanup = [];
      app.querySelectorAll('.tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.t === t)));
      body.innerHTML = '';
      if (t === 'py') body.appendChild(pythonSession({ code: store.d.playCode || PLAY_CODE, board: PLAY_BOARD, resetCode: () => PLAY_CODE, onChange: (v) => { store.d.playCode = v; store.save(); } }).el);
      else body.appendChild(terminalSession({ tree: BASE, saved: store.d.fs, onSave: (fs) => { store.d.fs = fs; store.save(); } }).el);
    };
    app.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => show(b.dataset.t)));
    show(playTab);
  }

  /* ---------- routing ---------- */
  function route() {
    cleanup.forEach((f) => f()); cleanup = [];
    hush(); document.body.classList.toggle('junior', junior());
    document.querySelectorAll('.nano-back').forEach((n) => n.remove());
    const h = (location.hash || '').replace(/^#/, '');
    const m = byId(h);
    if (m) viewMission(m);
    else if (h === 'drills') viewDrills();
    else if (h === 'sheet') viewSheet();
    else if (h === 'play') viewPlay();
    else viewHome();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) { /* offline support is optional */ }
  }
})();
