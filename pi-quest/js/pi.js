/* Pi Quest — the virtual GPIO board and the Python runner (Skulpt). */
(function () {
  'use strict';

  /* ---------- Virtual board ---------- */
  const COLORS = { 17: 'red', 27: 'amber', 22: 'green', 4: 'blue', 18: 'blue', 23: 'red', 24: 'amber', 25: 'green' };
  let audioCtx = null;
  const sound = { on: true };

  class Board {
    constructor(el) {
      this.el = el;
      el.classList.add('board');
      el.innerHTML = '<div class="board-head"><span class="silk">GPIO BOARD</span><button type="button" class="silk board-sound" hidden></button><span class="silk dim">SIMULATED</span></div><div class="board-parts"></div>';
      this.partsEl = el.querySelector('.board-parts');
      this.soundBtn = el.querySelector('.board-sound');
      this.soundBtn.addEventListener('click', () => { sound.on = !sound.on; this.syncSound(); if (!sound.on) this.silence(); });
      this.parts = new Map();
      this.events = [];
      this.timers = new Set();
      this.t0 = performance.now();
      this.onEvent = null;
      el.hidden = true;
    }
    syncSound() { this.soundBtn.textContent = sound.on ? 'SOUND ON' : 'SOUND OFF'; this.soundBtn.setAttribute('aria-pressed', String(sound.on)); }
    layout(spec) {
      this.endRun();
      this.parts.clear(); this.partsEl.innerHTML = '';
      (spec || []).forEach((p) => this.add(p.pin, p.kind, p.color));
      this.el.hidden = !this.parts.size;
    }
    add(pin, kind, color) {
      const old = this.parts.get(pin);
      if (old) { if (old.kind === kind) return old; old.el.remove(); }
      const part = { pin, kind, value: 0, pressed: false, color: color || COLORS[pin] || 'red' };
      let el;
      if (kind === 'button') {
        el = document.createElement('button'); el.type = 'button';
        el.className = 'part part-button';
        el.innerHTML = '<span class="cap"></span><span class="silk">GPIO' + pin + '</span><span class="part-name">hold to press</span>';
        const set = (v) => { if (part.pressed === v) return; part.pressed = v; el.classList.toggle('down', v); this.log(part, v ? 1 : 0); };
        el.addEventListener('pointerdown', (e) => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (x) { /* fine */ } set(true); });
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((n) => el.addEventListener(n, () => set(false)));
        el.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); set(true); } });
        el.addEventListener('keyup', () => set(false));
        el.addEventListener('contextmenu', (e) => e.preventDefault());
      } else {
        el = document.createElement('div');
        el.className = 'part part-' + kind + (kind === 'led' ? ' c-' + part.color : '');
        el.innerHTML = (kind === 'buzzer' ? '<span class="buzz"><i></i></span>' : '<span class="bulb"></span>') + '<span class="silk">GPIO' + pin + '</span><span class="part-name">' + (kind === 'buzzer' ? 'buzzer' : part.color + ' LED') + '</span>';
      }
      part.el = el;
      this.parts.set(pin, part);
      // keep parts in pin order so the layout stays put
      const after = [...this.parts.values()].filter((p) => p !== part && p.el.isConnected && p.pin > pin).sort((a, b) => a.pin - b.pin)[0];
      this.partsEl.insertBefore(el, after ? after.el : null);
      if (kind === 'buzzer') { this.soundBtn.hidden = false; this.syncSound(); }
      this.el.hidden = false;
      return part;
    }
    log(part, value) {
      this.events.push({ t: (performance.now() - this.t0) / 1000, pin: part.pin, kind: part.kind, value });
      if (this.onEvent) this.onEvent();
    }
    startRun() {
      this.endRun();
      this.events = []; this.t0 = performance.now();
      for (const p of this.parts.values()) if (p.kind !== 'button') { p.value = 0; this.render(p); }
    }
    endRun() { for (const t of this.timers) clearTimeout(t); this.timers.clear(); this.silence(); }
    setup(pin, kind) { this.add(pin, kind); }
    write(pin, v) {
      const p = this.parts.get(pin); if (!p || p.kind === 'button') return;
      v = Math.max(0, Math.min(1, Number(v) || 0));
      if (v === p.value) return;
      p.value = v; this.render(p); this.log(p, v);
    }
    read(pin) { const p = this.parts.get(pin); return !!(p && p.pressed); }
    blink(pin, onTime, offTime, n) {
      let count = 0;
      const step = (on) => {
        this.write(pin, on ? 1 : 0);
        if (!on && n > 0 && ++count >= n) return;
        const t = setTimeout(() => { this.timers.delete(t); step(!on); }, Math.max(0.02, on ? onTime : offTime) * 1000);
        this.timers.add(t);
      };
      step(true);
    }
    render(p) {
      p.el.classList.toggle('lit', p.value > 0);
      p.el.style.setProperty('--level', String(p.value));
      if (p.kind === 'buzzer') { if (p.value > 0) this.beep(p); else this.unbeep(p); }
    }
    beep(p) {
      if (!sound.on || p.osc) return;
      try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'square'; osc.frequency.value = 740; gain.gain.value = 0.035;
        osc.connect(gain).connect(audioCtx.destination); osc.start();
        p.osc = osc;
      } catch (e) { /* no audio available: the picture still shows it */ }
    }
    unbeep(p) { if (p.osc) { try { p.osc.stop(); } catch (e) { /* already stopped */ } p.osc = null; } }
    silence() { for (const p of this.parts.values()) this.unbeep(p); }
    static unlockAudio() {
      try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); } catch (e) { /* ignore */ }
    }
  }

  /* ---------- gpiozero, re-created for the virtual board ---------- */
  const GPIOZERO = `
import _pi
from time import sleep, time

_buttons = []

def _check(pin):
    if not isinstance(pin, int):
        raise ValueError("The pin must be a number, like LED(17)")
    if pin < 2 or pin > 27:
        raise ValueError("GPIO" + str(pin) + " does not exist. Pick a pin from 2 to 27.")

class _Output:
    _kind = "led"
    def __init__(self, pin=None):
        if pin is None:
            raise ValueError("Which pin? Put the GPIO number in the brackets, like LED(17)")
        _check(pin)
        self.pin = pin
        self._v = 0
        _pi.setup(pin, self._kind)
    def on(self):
        self._v = 1
        _pi.write(self.pin, 1)
    def off(self):
        self._v = 0
        _pi.write(self.pin, 0)
    def toggle(self):
        if self._v:
            self.off()
        else:
            self.on()
    @property
    def is_lit(self):
        return self._v > 0
    @property
    def is_active(self):
        return self._v > 0
    @property
    def value(self):
        return self._v
    @value.setter
    def value(self, v):
        self._v = v
        _pi.write(self.pin, v)
    def blink(self, on_time=1, off_time=1, n=None, background=True):
        if background:
            _pi.blink(self.pin, on_time, off_time, -1 if n is None else n)
        else:
            count = 0
            while n is None or count < n:
                self.on()
                sleep(on_time)
                self.off()
                sleep(off_time)
                count += 1
    def close(self):
        self.off()

class LED(_Output):
    pass

class PWMLED(_Output):
    pass

class Buzzer(_Output):
    _kind = "buzzer"
    def beep(self, on_time=1, off_time=1, n=None, background=True):
        self.blink(on_time, off_time, n, background)

class Button:
    def __init__(self, pin=None, pull_up=True, bounce_time=None, hold_time=1):
        if pin is None:
            raise ValueError("Which pin? Put the GPIO number in the brackets, like Button(2)")
        _check(pin)
        self.pin = pin
        self.when_pressed = None
        self.when_released = None
        self._last = False
        _pi.setup(pin, "button")
        _buttons.append(self)
    @property
    def is_pressed(self):
        return _pi.read(self.pin)
    @property
    def is_active(self):
        return _pi.read(self.pin)
    @property
    def value(self):
        return 1 if _pi.read(self.pin) else 0
    def wait_for_press(self, timeout=None):
        start = time()
        while not _pi.read(self.pin):
            sleep(0.02)
            if timeout is not None and time() - start >= timeout:
                return False
        return True
    def wait_for_release(self, timeout=None):
        start = time()
        while _pi.read(self.pin):
            sleep(0.02)
            if timeout is not None and time() - start >= timeout:
                return False
        return True

class TrafficLights:
    def __init__(self, red=None, amber=None, green=None):
        self.red = LED(red)
        self.amber = LED(amber)
        self.yellow = self.amber
        self.green = LED(green)
    def on(self):
        self.red.on()
        self.amber.on()
        self.green.on()
    def off(self):
        self.red.off()
        self.amber.off()
        self.green.off()

def _poll():
    for b in _buttons:
        now = _pi.read(b.pin)
        if now and not b._last and b.when_pressed is not None:
            b.when_pressed()
        if b._last and not now and b.when_released is not None:
            b.when_released()
        b._last = now
`;
  const SIGNAL = 'from time import sleep\nimport gpiozero\n\ndef pause():\n    while True:\n        gpiozero._poll()\n        sleep(0.02)\n';
  const PI_JS = `var $builtinmodule = function (name) {
    var mod = { __name__: new Sk.builtin.str("_pi") };
    var js = Sk.ffi.remapToJs, none = Sk.builtin.none.none$;
    mod.setup = new Sk.builtin.func(function (pin, kind) { window.PiBridge.setup(js(pin), js(kind)); return none; });
    mod.write = new Sk.builtin.func(function (pin, v) { window.PiBridge.write(js(pin), js(v)); return none; });
    mod.read = new Sk.builtin.func(function (pin) { return window.PiBridge.read(js(pin)) ? Sk.builtin.bool.true$ : Sk.builtin.bool.false$; });
    mod.blink = new Sk.builtin.func(function (pin, a, b, n) { window.PiBridge.blink(js(pin), js(a), js(b), js(n)); return none; });
    return mod;
};`;

  /* ---------- Friendly error messages ---------- */
  const TIPS = [
    [/EOL while scanning|unterminated string/i, 'A piece of text is missing its closing quote. Text needs a quote at both ends: "like this"'],
    [/IndentationError|unindent|expected an indented block/i, 'The spaces at the start of a line are wrong. Lines inside if, for, while and def need 4 spaces in front, and they must line up.'],
    [/SyntaxError|bad input|ParseError/i, 'Python could not read that line. Look for a missing bracket ), a missing quote ", or a missing colon : at the end of an if / for / while / def line.'],
    [/NameError/i, 'Python does not know that name. Check the spelling (capital letters matter). If you meant words, put them in "quotes".'],
    [/ZeroDivisionError/i, 'You cannot divide by zero.'],
    [/IndexError/i, 'That spot in the list does not exist. Counting starts at 0, so a list of 3 things has spots 0, 1 and 2.'],
    [/ImportError|ModuleNotFoundError|No module named/i, 'Python could not find that module. Check the spelling of the import line.'],
    [/AttributeError/i, 'That thing cannot do that. Check the spelling after the dot.'],
    [/TypeError/i, 'Two things do not fit together, like adding text to a number. Use int("5") to turn text into a number, or str(5) to turn a number into text.'],
    [/ValueError/i, 'The value is the wrong kind. For example int("hello") fails because hello is not a number.'],
  ];
  const IMPORTS = { LED: 'gpiozero', Button: 'gpiozero', Buzzer: 'gpiozero', PWMLED: 'gpiozero', TrafficLights: 'gpiozero', sleep: 'time', time: 'time', pause: 'signal', uniform: 'random', randint: 'random', choice: 'random', random: 'random' };
  /* Skulpt only says "bad input" for most typing mistakes, so look at the line ourselves. */
  function diagnose(code, line) {
    const rows = code.split('\n');
    const bare = (l) => (l || '').replace(/"[^"\n]*"|'[^'\n]*'/g, 'S').replace(/#.*$/, '');
    const cur = rows[line - 1] || '', b = bare(cur);
    let prev = ''; for (let i = line - 2; i >= 0; i--) if (rows[i].trim()) { prev = rows[i]; break; }
    const indent = (l) => l.match(/^ */)[0].length;
    const open = (l) => (l.match(/[([]/g) || []).length - (l.match(/[)\]]/g) || []).length;
    if (/["']/.test(b)) return 'A piece of text is missing a quote. Text needs a quote at both ends: "like this"';
    if (/["']/.test(bare(prev))) return 'The line above is missing a quote. Text needs a quote at both ends: "like this"';
    if (/^\s*(if|elif|else|for|while|def)\b/.test(b) && !/:\s*$/.test(b)) return 'This line needs a colon : at the very end.';
    if (/:\s*$/.test(bare(prev)) && cur.trim() && indent(cur) <= indent(prev)) return 'The line after a colon : must be pushed in. Put 4 spaces at the start of line ' + line + '.';
    if (open(b) > 0) return 'A bracket is still open on this line. Every ( needs a ) and every [ needs a ].';
    if (open(bare(prev)) > 0) return 'A bracket is still open on the line above. Every ( needs a ) and every [ needs a ].';
    if (open(b) < 0) return 'There is one closing bracket too many on this line.';
    if (/^\s*print\s+[^(\s=]/.test(b)) return 'print needs brackets, like this: print("hello")';
    if (/^\s*(if|elif|while)\b[^=!<>]*[^=!<>]=[^=]/.test(b)) return 'To ask "are these the same?" use two equals signs: ==';
    if (cur.trim() && indent(cur) % 4 && indent(cur) !== indent(prev)) return 'Check the spaces at the start of this line. Use 4 spaces for each level.';
    return null;
  }
  function describe(e, code) {
    let type = '', text = '', line = null, fromLib = false, msg;
    try { msg = e.toString(); } catch (x) { msg = String(e); }
    try {
      const tb = e.traceback || [];
      const mine = tb.find((t) => t.filename === '__main__.py');
      line = (mine || tb[0] || {}).lineno || null;
      fromLib = !!mine && tb[0] !== mine;
      type = e.tp$name || ''; text = String(Sk.ffi.remapToJs(e.args)[0] || '');
      if (type && text) msg = type + ': ' + text + (line ? ' on line ' + line : '');
    } catch (x) { /* keep the plain message */ }
    let tip = '';
    const name = (text.match(/^name '(\w+)' is not defined/) || [])[1];
    if (type === 'SyntaxError' && line) tip = diagnose(code || '', line) || '';
    if (!tip && name && IMPORTS[name]) tip = 'Python has not been told about ' + name + ' yet. Add this line at the top: from ' + IMPORTS[name] + ' import ' + name;
    else if (!tip && name && /^(true|false|none)$/.test(name)) tip = 'True, False and None start with a capital letter in Python.';
    if (!tip && !fromLib) tip = (TIPS.find(([re]) => re.test(msg)) || [])[1] || '';
    return { message: msg, tip, line };
  }

  /* ---------- Python runner ---------- */
  const STOP = { stop: true };
  const PiPy = {
    running: false,
    ready() { return typeof window.Sk !== 'undefined' && !!window.Sk.builtinFiles; },
    init() {
      if (this._init) return; this._init = true;
      const files = Sk.builtinFiles.files;
      delete files['src/lib/signal.js'];
      files['src/lib/signal.py'] = SIGNAL;
      files['src/lib/gpiozero.py'] = GPIOZERO;
      files['src/lib/_pi.js'] = PI_JS;
      window.PiBridge = {
        setup: (pin, kind) => this.board && this.board.setup(pin, kind),
        write: (pin, v) => this.board && this.board.write(pin, v),
        read: (pin) => (this.board ? this.board.read(pin) : false),
        blink: (pin, a, b, n) => this.board && this.board.blink(pin, a, b, n),
      };
    },
    /* opts: { print(text), input(prompt) -> Promise<string>, board } */
    async run(code, opts) {
      if (!this.ready()) return { error: { message: 'Python is still loading. Check your internet connection and try again.', tip: '' } };
      if (this.running) return { error: { message: 'A program is already running. Stop it first.', tip: '' } };
      this.init();
      this.running = true; this._stopped = false; this.board = opts.board || null;
      let stopReject; const stopPromise = new Promise((_, rej) => { stopReject = rej; });
      stopPromise.catch(() => {});
      this._stopNow = () => { this._stopped = true; stopReject(STOP); };
      if (this.board) this.board.startRun();
      Sk.configure({
        output: (t) => opts.print(t),
        read: (x) => { if (Sk.builtinFiles.files[x] === undefined) throw "File not found: '" + x + "'"; return Sk.builtinFiles.files[x]; },
        inputfun: (p) => opts.input(p),
        inputfunTakesPrompt: true,
        __future__: Sk.python3,
        killableWhile: true, killableFor: true, yieldLimit: 80,
      });
      Sk.execStart = new Date();
      const result = { error: null, stopped: false };
      try {
        await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('__main__', false, code.replace(/\t/g, '    '), true), {
          '*': () => { if (this._stopped) throw STOP; },
          'Sk.promise': (r) => {
            if (this._stopped) throw STOP;
            return Promise.race([r.data.promise, stopPromise]).then(
              (x) => { r.data.result = x; return r.resume(); },
              (err) => { if (err === STOP) throw STOP; r.data.error = err; return r.resume(); });
          },
        });
      } catch (e) {
        if (e === STOP || this._stopped) result.stopped = true; else result.error = describe(e, code);
      } finally {
        this.running = false; this._stopNow = null;
        if (this.board) this.board.endRun();
      }
      return result;
    },
    stop() { if (this._stopNow) this._stopNow(); },
  };

  window.PiBoard = Board;
  window.PiPy = PiPy;
})();
