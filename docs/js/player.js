/* Woodshed — transport: schedules a parsed lick (notes, click, backing chords) against
   the audio clock, with count-in, looping, bar ranges, swing and a speed trainer. */
(function () {
  const GP = (window.GP = window.GP || {});
  const A = GP.audio;
  const T = GP.theory;

  const LOOKAHEAD = 0.16;

  function Transport() {
    this.playing = false;
    this.timer = null;
    this.raf = null;
  }

  /* opts: { bpm, loop, countIn, click, guide, backing, swing, fromBar, toBar, rampBpm, rampMax,
             onEvent(i), onPass(n, bpm), onEnd(), onExpect({i, time, dur, midis}) } */
  Transport.prototype.start = function (parsed, opts) {
    this.stop();
    A.ensure();
    this.parsed = parsed;
    this.opts = opts;
    this.bpm = opts.bpm;
    this.pass = 0;
    this.playing = true;
    this.visual = [];
    this.startedAt = A.now();

    const bars = parsed.bars;
    const from = Math.max(0, Math.min(bars.length - 1, opts.fromBar == null ? 0 : opts.fromBar));
    const to = Math.max(from, Math.min(bars.length - 1, opts.toBar == null ? bars.length - 1 : opts.toBar));
    this.range = { from, to };
    // range origin: start of the (virtual) full bar holding the first bar in range
    this.originTick = from === 0 ? 0 : bars[from].start;
    const last = bars[to];
    this.endTick = Math.max(last.start + last.ticks, to === bars.length - 1 && from !== to ? 0 : 0);
    // round the end up to a whole bar so loops stay in time
    const bt = parsed.barTicks;
    const span = this.endTick - this.originTick;
    this.spanTicks = Math.ceil((span - 1) / bt) * bt;

    const countTicks = opts.countIn ? bt : 0;
    this.passStart = A.now() + 0.12 + this.secs(countTicks);
    this.buildPass(countTicks);
    this.timer = setInterval(() => this.pump(), 25);
    this.pump();
    const frame = () => {
      if (!this.playing) return;
      const now = A.now();
      while (this.visual.length && this.visual[0].time <= now) {
        const v = this.visual.shift();
        if (v.end) {
          this.finish();
          return;
        }
        if (v.pass != null && opts.onPass) opts.onPass(v.pass, v.bpm);
        if (v.i != null && opts.onEvent) opts.onEvent(v.i);
      }
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  };

  Transport.prototype.secs = function (ticks) {
    return (ticks / 480) * (60 / this.bpm);
  };

  Transport.prototype.swingTick = function (tick) {
    if (!this.opts.swing || this.parsed.meter.den !== 4) return tick;
    const inBeat = ((tick % 480) + 480) % 480;
    return Math.abs(inBeat - 240) < 1 ? tick + 80 : tick;
  };

  /* Build the time-sorted item list for one pass, relative to passStart. */
  Transport.prototype.buildPass = function (countTicks) {
    const p = this.parsed;
    const o = this.opts;
    const items = [];
    const bt = p.barTicks;
    const eighth = 1920 / p.meter.den;
    const groupTicks = p.groups.map((g) => g * (p.meter.den === 4 || p.meter.den === 2 ? 1920 / p.meter.den : eighth));

    const addClicks = (startTick, lenTicks) => {
      for (let b = 0; b * bt < lenTicks - 1; b++) {
        let off = 0;
        groupTicks.forEach((g, gi) => {
          const tk = startTick + b * bt + off;
          if (tk < startTick + lenTicks - 1) items.push({ t: this.secs(tk), click: gi === 0 ? 2 : 1 });
          off += g;
        });
      }
    };
    if (countTicks) addClicks(-countTicks, countTicks);
    if (o.click) addClicks(0, this.spanTicks);

    let lastChord = null;
    for (let bi = this.range.from; bi <= this.range.to; bi++) {
      for (const i of p.bars[bi].events) {
        const ev = p.events[i];
        const rel = ev.start - this.originTick;
        const t = this.secs(this.swingTick(rel));
        const dur = this.secs(ev.ticks);
        items.push({ t, ev, dur });
        if (ev.chord && ev.chord !== lastChord) {
          items.push({ t, chord: ev.chord });
          lastChord = ev.chord;
        }
      }
    }
    items.sort((a, b) => a.t - b.t);
    this.items = items;
    this.ptr = 0;
    this.passDur = this.secs(this.spanTicks);
    this.visual.push({ time: this.passStart, pass: this.pass, bpm: this.bpm });
  };

  Transport.prototype.pump = function () {
    if (!this.playing) return;
    const o = this.opts;
    const horizon = A.now() + LOOKAHEAD;
    for (;;) {
      while (this.ptr < this.items.length && this.passStart + this.items[this.ptr].t < horizon) {
        const it = this.items[this.ptr++];
        const when = Math.max(A.now(), this.passStart + it.t);
        if (it.click != null) {
          A.click(when, it.click);
        } else if (it.chord) {
          if (o.backing) A.strum(T.chordVoicing(it.chord), when, this.secs(this.parsed.barTicks) * 0.95, 0.16, 0.012);
        } else {
          const ev = it.ev;
          this.visual.push({ time: when, i: ev.i });
          if (ev.rest || ev.tie) continue;
          // tied notes ring through the events that hold them
          let dur = it.dur;
          let j = ev.i + 1;
          while (this.parsed.events[j] && this.parsed.events[j].tie) {
            dur += this.secs(this.parsed.events[j].ticks);
            j++;
          }
          if (o.onExpect) {
            const midis = [];
            ev.notes.forEach((n) => {
              midis.push(n.midi + ev.bend);
              if (ev.bend) midis.push(n.midi);
            });
            o.onExpect({ i: ev.i, time: when, dur, midis, pass: this.pass });
          }
          if (o.guide) {
            const soft = ev.techs.includes('h') || ev.techs.includes('p') || ev.techs.includes('s');
            ev.notes.forEach((n, k) => {
              const quarter = ev.bend === 0.5;
              A.pluck(n.midi + (quarter ? 0.5 : 0), when + k * 0.008, Math.max(0.09, dur * 0.98), soft ? 0.5 : 0.72, quarter ? 0 : ev.bend);
            });
          }
        }
      }
      if (this.ptr < this.items.length) return;
      // pass finished: loop or end
      const passEnd = this.passStart + this.passDur;
      if (!o.loop) {
        if (!this.endQueued) {
          this.endQueued = true;
          this.visual.push({ time: passEnd, end: true });
        }
        return;
      }
      if (passEnd > horizon) return;
      this.pass++;
      if (o.rampBpm) this.bpm = Math.min(o.rampMax || 400, this.bpm + o.rampBpm);
      this.passStart = passEnd;
      this.buildPass(0);
    }
  };

  Transport.prototype.finish = function () {
    const cb = this.opts && this.opts.onEnd;
    this.stop(true);
    if (cb) cb();
  };

  Transport.prototype.stop = function (natural) {
    if (this.timer) clearInterval(this.timer);
    if (this.raf) cancelAnimationFrame(this.raf);
    this.timer = this.raf = null;
    this.endQueued = false;
    if (this.playing && !natural) A.stopAll();
    this.playing = false;
  };

  Transport.prototype.elapsed = function () {
    return this.startedAt ? Math.max(0, A.now() - this.startedAt) : 0;
  };

  GP.Transport = Transport;
})();
