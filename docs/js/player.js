/* Woodshed — transport: schedules a parsed lick (melody, band, click) against the audio clock,
   with swing, phrasing and micro-timing from feel.js, count-in, looping, bar ranges and a
   speed trainer. */
(function () {
  const GP = (window.GP = window.GP || {});
  const A = GP.audio;
  const F = GP.feel;

  const LOOKAHEAD = 0.18;

  function Transport() {
    this.playing = false;
    this.timer = null;
    this.raf = null;
  }

  /* opts: { bpm, swing (ratio), style, humanize, loop, countIn, click, guide, band, fromBar, toBar,
             rampBpm, rampMax, lick, onEvent(i), onPass(n, bpm), onEnd(), onExpect({i, time, dur, midis}) } */
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
    this.S = F.style(opts.style);
    this.phr = F.phrase(parsed, opts.style);
    this.straight = F.straightBeats(parsed);
    this.ratio = opts.swing || 0.5;
    A.setTone(this.S.tone);

    const bars = parsed.bars;
    const from = Math.max(0, Math.min(bars.length - 1, opts.fromBar == null ? 0 : opts.fromBar));
    const to = Math.max(from, Math.min(bars.length - 1, opts.toBar == null ? bars.length - 1 : opts.toBar));
    this.range = { from, to };
    this.originTick = from === 0 ? 0 : bars[from].start;
    const last = bars[to];
    const bt = parsed.barTicks;
    this.spanTicks = Math.ceil((last.start + last.ticks - this.originTick - 1) / bt) * bt;
    this.bandItems = opts.band ? GP.band.part(parsed, opts.lick, from, to) : [];

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

  /* Tick -> seconds from the start of the range, with swing. Melody beats in 16ths/tuplets stay straight. */
  Transport.prototype.timeOf = function (tick, melody) {
    const sw = melody && this.straight.has(Math.floor(tick / 480)) ? 0.5 : this.ratio;
    return this.secs(F.warp(tick, sw) - F.warp(this.originTick, this.ratio));
  };

  /* Build the time-sorted item list for one pass, relative to passStart. */
  Transport.prototype.buildPass = function (countTicks) {
    const p = this.parsed;
    const o = this.opts;
    const items = [];
    const bt = p.barTicks;
    const unit = p.meter.den === 4 || p.meter.den === 2 ? 1920 / p.meter.den : 240;
    const groupTicks = p.groups.map((g) => g * unit);

    const addClicks = (startTick, lenTicks, sticks) => {
      for (let b = 0; b * bt < lenTicks - 1; b++) {
        let off = 0;
        groupTicks.forEach((g, gi) => {
          const tk = startTick + b * bt + off;
          if (tk < startTick + lenTicks - 1) items.push({ t: this.secs(tk), click: gi === 0 ? 2 : 1, sticks });
          off += g;
        });
      }
    };
    if (countTicks) addClicks(-countTicks, countTicks, o.band && !o.click);
    if (o.click) addClicks(0, this.spanTicks);

    const endTick = this.originTick + this.spanTicks;
    for (const it of this.bandItems) {
      if (it.tick < this.originTick || it.tick >= endTick) continue;
      const t = this.timeOf(it.tick, false);
      const dur = it.ticks ? this.timeOf(it.tick + it.ticks, false) - t : 0;
      items.push({ t, band: it, dur });
    }

    for (let bi = this.range.from; bi <= this.range.to; bi++) {
      for (const i of p.bars[bi].events) {
        const ev = p.events[i];
        const t = this.timeOf(ev.start, true);
        let endTick = ev.start + ev.ticks;
        let j = ev.i + 1;
        while (p.events[j] && p.events[j].tie && p.events[j].bar <= this.range.to) {
          endTick += p.events[j].ticks;
          j++;
        }
        items.push({ t, ev, dur: this.timeOf(endTick, true) - t });
      }
    }
    items.sort((a, b) => a.t - b.t);
    this.items = items;
    this.ptr = 0;
    this.voices = {};
    this.passDur = this.timeOf(endTick, false);
    this.visual.push({ time: this.passStart, pass: this.pass, bpm: this.bpm });
  };

  Transport.prototype.playBand = function (it, when) {
    const b = it.band;
    const hum = this.opts.humanize ? F.rnd() * 0.004 : 0;
    const v = b.vel * (this.opts.humanize ? 1 + F.rnd() * 0.06 : 1);
    if (b.kind === 'drum') {
      if (A.drum[b.name]) A.drum[b.name](when + hum, v);
    } else if (b.kind === 'bass') {
      A.pluck(b.midi, when + hum, Math.max(0.06, it.dur), { vel: v * 1.05, bright: 0.12, bus: 'band', release: 0.05 });
    } else if (b.kind === 'chord') {
      A.strum(b.midis, when + hum, Math.max(0.04, it.dur), { vel: v, bright: b.bright, dir: b.dir, spread: b.spread, bus: 'band', pan: b.pan, release: 0.03 });
    }
  };

  Transport.prototype.playNote = function (it, when) {
    const ev = it.ev;
    const o = this.opts;
    const S = this.S;
    const ph = this.phr[ev.i] || { vel: 0.6, len: 0.95, bright: 0.6 };
    let vel = ph.vel;
    let at = when;
    if (o.humanize) {
      at += S.lay + F.rnd() * S.jit;
      vel *= 1 + F.rnd() * S.vj;
    }
    vel = Math.max(0.08, Math.min(1, vel)) * (o.guideLevel == null ? 1 : o.guideLevel);
    const next = this.parsed.events[ev.i + 1];
    const legatoNext = next && next.legato && !next.rest && next.notes.length === 1 && ev.notes.length === 1 && next.notes[0].string === ev.notes[0].string;
    let dur = Math.max(0.05, it.dur * (legatoNext ? 1.02 : ph.len));
    const quarterTone = ev.bend === 0.5;
    const bendTime = S.slowBend ? Math.min(0.32, Math.max(0.12, dur * 0.4)) : Math.min(0.2, Math.max(0.07, dur * 0.3));
    const wantsVib = ev.techs.includes('~') || (!ev.stacc && !ev.mute && !ev.ghost && dur >= S.autoVib);
    const vib = wantsVib && ev.notes.length < 3
      ? { depth: S.vib.depth * (ev.techs.includes('~') ? 1.3 : 1), rate: S.vib.rate, at: at + Math.max(0.12, Math.min(0.35, dur * 0.35)) + (ev.bend && !quarterTone ? bendTime : 0) }
      : null;

    // hammer-on / pull-off / slide: keep the string ringing and move its pitch
    if (ev.legato && ev.notes.length === 1) {
      const n = ev.notes[0];
      const prev = this.voices[n.string];
      if (prev && prev.end >= at - 0.03) {
        prev.legatoTo(n.midi + (quarterTone ? 0.5 : 0), at, ev.legato === 's' ? Math.min(0.07, dur * 0.4) : 0, dur, ev.legato === 's' ? 0.85 : 0.7, vib);
        return;
      }
    }

    const up = ph.up;
    const notes = up ? ev.notes.slice().reverse() : ev.notes;
    const spread = ev.notes.length > 2 ? (S.tone === 'metal' ? 0.006 : 0.014) : 0.006;
    notes.forEach((n, k) => {
      const t0 = at + k * spread;
      const prev = this.voices[n.string];
      if (prev) prev.choke(t0);
      const opts = {
        vel: vel * (ev.notes.length > 1 ? 0.92 - k * 0.03 : 1), bright: ph.bright, mute: ev.mute,
        bend: quarterTone ? 0 : ev.bend, bendAt: t0 + 0.02, bendTime,
        vib: k === notes.length - 1 ? vib : null,
      };
      let start = t0;
      if (ev.grace && k === 0) {
        const g = ev.grace.note;
        const gl = S.slowBend ? 0.075 : 0.055;
        start = t0 - gl;
        Object.assign(opts, { from: g.midi, changeAt: t0, glide: ev.grace.slide ? gl * 0.8 : 0 });
        if (this.voices[g.string] && g.string !== n.string) this.voices[g.string].choke(start);
      }
      const v = A.pluck(n.midi + (quarterTone ? 0.5 : 0), start, dur + (t0 - start), opts);
      this.voices[n.string] = v;
    });
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
          if (it.sticks) A.drum.stick(when, it.click === 2 ? 0.9 : 0.7);
          else A.click(when, it.click);
        } else if (it.band) {
          this.playBand(it, when);
        } else {
          const ev = it.ev;
          this.visual.push({ time: when, i: ev.i });
          if (ev.rest || ev.tie) continue;
          if (o.onExpect) {
            const midis = [];
            ev.notes.forEach((n) => {
              midis.push(n.midi + ev.bend);
              if (ev.bend) midis.push(n.midi);
            });
            o.onExpect({ i: ev.i, time: when, dur: it.dur, midis, pass: this.pass });
          }
          if (o.guide) this.playNote(it, when);
        }
      }
      if (this.ptr < this.items.length) return;
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
