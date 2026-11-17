/* Woodshed — Web Audio: plucked strings (Karplus-Strong), bass, drums, metronome click.

   Signal flow:  lead voices -> drive -> tone filter -> lead bus ┐
                 band (bass, comping)               -> band bus  ├-> master -> compressor -> out
                 drums                              -> drum bus  │        ^
                 click                              -> click bus ┘        └ reverb send from each bus */
(function () {
  const GP = (window.GP = window.GP || {});
  const T = GP.theory;

  let ctx = null;
  let master = null;
  let noise = null;
  const bus = {};
  const lead = {};
  const cache = new Map();
  const live = new Set();
  const VARIANTS = 4;

  function track(node) {
    live.add(node);
    node.onended = () => live.delete(node);
  }

  function impulse(secs, decay) {
    const len = Math.floor(ctx.sampleRate * secs);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC({ latencyHint: 'interactive' });
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.ratio.value = 3.5;
      comp.attack.value = 0.004;
      comp.release.value = 0.2;
      master = ctx.createGain();
      master.gain.value = 0.85;
      master.connect(comp);
      comp.connect(ctx.destination);

      const verb = ctx.createConvolver();
      verb.buffer = impulse(1.9, 3.2);
      const verbIn = ctx.createGain();
      const verbOut = ctx.createGain();
      verbOut.gain.value = 0.32;
      verbIn.connect(verb);
      verb.connect(verbOut);
      verbOut.connect(master);

      for (const [name, level, send] of [['lead', 1, 0.55], ['band', 0.75, 0.6], ['drums', 0.8, 0.35], ['click', 0.9, 0]]) {
        const g = ctx.createGain();
        g.gain.value = level;
        g.connect(master);
        if (send) {
          const s = ctx.createGain();
          s.gain.value = send;
          g.connect(s);
          s.connect(verbIn);
        }
        bus[name] = g;
      }
      // lead tone chain: drive (wave shaper) and a cabinet / body filter
      lead.input = ctx.createGain();
      lead.shaper = ctx.createWaveShaper();
      lead.shaper.oversample = '2x';
      lead.post = ctx.createGain();
      lead.tone = ctx.createBiquadFilter();
      lead.tone.type = 'lowpass';
      lead.tone.Q.value = 0.7;
      lead.input.connect(lead.shaper);
      lead.shaper.connect(lead.post);
      lead.post.connect(lead.tone);
      lead.tone.connect(bus.lead);
      setTone('clean');

      noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const nd = noise.getChannelData(0);
      for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* Tone presets for the lead guitar, chosen by style. */
  const TONES = {
    clean: { drive: 0, cut: 9000, gain: 1 },
    archtop: { drive: 0, cut: 3200, gain: 1.15 },      // jazz: warm, dark
    acoustic: { drive: 0, cut: 11000, gain: 1 },        // bluegrass, Gypsy jazz
    nylon: { drive: 0, cut: 4200, gain: 1.1 },          // classical
    crunch: { drive: 3, cut: 5200, gain: 0.8 },         // blues
    lead: { drive: 2, cut: 6000, gain: 0.85 },           // jam
    metal: { drive: 14, cut: 4800, gain: 0.5 },          // high gain
  };
  function setTone(name) {
    if (!ctx) ensure();
    const t = TONES[name] || TONES.clean;
    const n = 1024;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      curve[i] = t.drive ? Math.tanh(x * t.drive) / Math.tanh(t.drive) : x;
    }
    lead.shaper.curve = curve;
    lead.tone.frequency.setValueAtTime(t.cut, ctx.currentTime);
    lead.post.gain.setValueAtTime(t.gain, ctx.currentTime);
  }

  /* Plucked-string buffers: several excitations per semitone so repeated notes differ. */
  function stringBuffer(midiInt, variant) {
    const key = midiInt * 8 + variant;
    if (cache.has(key)) return cache.get(key);
    const sr = ctx.sampleRate;
    const f = T.midiFreq(midiInt);
    const N = Math.max(2, Math.round(sr / f));
    const secs = Math.max(1.4, Math.min(4, 4.2 - (midiInt - 40) * 0.055));
    const len = Math.floor(sr * secs);
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    // excitation: softened noise, comb-filtered for pick position (where along the string it was struck)
    const ex = new Float32Array(N);
    let prev = 0;
    const soft = 0.35 + variant * 0.08;
    for (let i = 0; i < N; i++) {
      prev = prev * soft + (Math.random() * 2 - 1) * (1 - soft);
      ex[i] = prev;
    }
    const P = Math.max(1, Math.round(N * (0.1 + variant * 0.035)));
    let peak = 0;
    for (let i = 0; i < N; i++) {
      d[i] = ex[i] - ex[(i - P + N) % N];
      peak = Math.max(peak, Math.abs(d[i]));
    }
    for (let i = 0; i < N; i++) d[i] /= peak || 1;
    const decay = midiInt < 45 ? 0.9978 : midiInt < 52 ? 0.997 : midiInt < 64 ? 0.9962 : 0.995;
    for (let i = N; i < len; i++) d[i] = decay * 0.5 * (d[i - N] + d[i - N + 1]);
    const fade = Math.floor(sr * 0.05);
    for (let i = 0; i < fade; i++) d[len - 1 - i] *= i / fade;
    const out = { buf, rate: (f * N) / sr };
    cache.set(key, out);
    return out;
  }

  /* Play a plucked note and return a voice that can be choked or continued legato.
     o: { vel, bright (0..1), mute, bus, pan, release,
          from, changeAt, glide          start on another pitch and move to `midi` (grace, slide-in)
          bend, bendAt, bendTime         bend up by semitones
          vib: { depth, rate, at } }      vibrato (depth in semitones) */
  function pluck(midi, when, dur, o) {
    ensure();
    o = o || {};
    const vel = o.vel == null ? 0.7 : o.vel;
    const base = Math.round(midi);
    const { buf, rate } = stringBuffer(base, Math.floor(Math.random() * VARIANTS));
    const rateOf = (m) => rate * Math.pow(2, (m - base) / 12);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const pr = src.playbackRate;
    if (o.from != null) {
      pr.setValueAtTime(rateOf(o.from), when);
      const at = Math.max(when + 0.005, o.changeAt);
      if (o.glide) {
        pr.setValueAtTime(rateOf(o.from), Math.max(when, at - o.glide));
        pr.linearRampToValueAtTime(rateOf(midi), at);
      } else {
        pr.setValueAtTime(rateOf(midi), at);
      }
    } else {
      pr.setValueAtTime(rateOf(midi), when);
    }
    if (o.bend) {
      const bt = o.bendAt || when + 0.03;
      pr.setValueAtTime(rateOf(midi), bt);
      pr.linearRampToValueAtTime(rateOf(midi + o.bend), bt + (o.bendTime || 0.12));
    }
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.Q.value = o.mute ? 1.2 : 0.6;
    const bright = Math.max(0, Math.min(1, o.bright == null ? 0.3 + vel * 0.6 : o.bright));
    const f0 = o.mute ? 380 + bright * 600 : 650 * Math.pow(2, bright * 3.6);
    filt.frequency.setValueAtTime(f0, when);
    filt.frequency.setTargetAtTime(f0 * (o.mute ? 0.7 : 0.6), when + 0.01, o.mute ? 0.04 : 0.3);
    const g = ctx.createGain();
    const peak = vel * (o.mute ? 1.15 : 0.85);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(peak, when + 0.0025);
    const rel = o.release == null ? (o.mute ? 0.025 : 0.06) : o.release;
    g.gain.setTargetAtTime(0, when + dur, rel);
    src.connect(filt);
    filt.connect(g);
    let out = g;
    if (o.pan && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = o.pan;
      g.connect(p);
      out = p;
    }
    out.connect(o.bus ? bus[o.bus] : lead.input);
    let vibOsc = null;
    if (o.vib) addVibrato(o.vib, rateOf(midi + (o.bend || 0)), when + dur + rel * 4);
    function addVibrato(v, r, stopAt) {
      vibOsc = ctx.createOscillator();
      vibOsc.frequency.value = v.rate || 5.5;
      const depth = ctx.createGain();
      depth.gain.setValueAtTime(0, when);
      depth.gain.setValueAtTime(0, v.at);
      depth.gain.linearRampToValueAtTime(r * (Math.pow(2, v.depth / 12) - 1), v.at + 0.22);
      vibOsc.connect(depth);
      depth.connect(pr);
      vibOsc.start(when);
      vibOsc.stop(stopAt);
      track(vibOsc);
    }
    src.start(when);
    const stopAt = when + dur + rel * 6 + 0.05;
    src.stop(stopAt);
    track(src);

    const voice = {
      midi: midi + (o.bend || 0), end: when + dur,
      /* Stop this note at `at` (the next note on the same string). */
      choke(at) {
        g.gain.cancelScheduledValues(at);
        g.gain.setTargetAtTime(0, at, 0.012);
      },
      /* Hammer-on, pull-off or slide: same string keeps ringing, pitch moves. */
      legatoTo(m, at, glide, newDur, lvl, vib) {
        pr.cancelScheduledValues(at);
        pr.setValueAtTime(rateOf(voice.midi), at);
        if (glide) pr.linearRampToValueAtTime(rateOf(m), at + glide);
        else pr.setValueAtTime(rateOf(m), at + 0.002);
        g.gain.cancelScheduledValues(at);
        g.gain.setValueAtTime(peak * (lvl == null ? 0.8 : lvl), at + 0.004);
        g.gain.setTargetAtTime(0, at + newDur, rel);
        filt.frequency.cancelScheduledValues(at);
        filt.frequency.setTargetAtTime(f0 * 0.5, at, 0.2);
        if (vib) addVibrato(Object.assign({}, vib, { at: Math.max(at, vib.at) }), rateOf(m), at + newDur + rel * 4);
        voice.midi = m;
        voice.end = at + newDur;
        src.stop(at + newDur + rel * 6 + 0.05);
      },
    };
    return voice;
  }

  /* Several notes, strummed. dir 'up' plays high to low. */
  function strum(midis, when, dur, o) {
    o = o || {};
    const order = o.dir === 'up' ? midis.slice().sort((a, b) => b - a) : midis.slice().sort((a, b) => a - b);
    const spread = o.spread == null ? 0.018 : o.spread;
    return order.map((m, i) => pluck(m, when + i * spread, Math.max(0.03, dur - i * spread), Object.assign({}, o, { vel: (o.vel == null ? 0.6 : o.vel) * (1 - i * 0.04) })));
  }

  /* ---------------- drums ---------------- */
  function noiseHit(when, o) {
    ensure();
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.playbackRate.value = o.speed || 1;
    const f = ctx.createBiquadFilter();
    f.type = o.type || 'bandpass';
    f.frequency.value = o.freq;
    f.Q.value = o.q == null ? 0.8 : o.q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.vel), when + (o.attack || 0.001));
    g.gain.exponentialRampToValueAtTime(0.0001, when + (o.attack || 0.001) + o.decay);
    src.connect(f);
    f.connect(g);
    let out = g;
    if (o.pan && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = o.pan;
      g.connect(p);
      out = p;
    }
    out.connect(bus[o.bus || 'drums']);
    const offset = Math.random() * 0.5;
    src.start(when, offset);
    src.stop(when + o.decay + 0.05);
    track(src);
  }
  function toneHit(when, o) {
    ensure();
    const osc = ctx.createOscillator();
    osc.type = o.wave || 'sine';
    osc.frequency.setValueAtTime(o.freq, when);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, when + (o.sweep || 0.08));
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.vel), when + (o.attack || 0.002));
    g.gain.exponentialRampToValueAtTime(0.0001, when + o.decay);
    osc.connect(g);
    let out = g;
    if (o.pan && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = o.pan;
      g.connect(p);
      out = p;
    }
    out.connect(bus[o.bus || 'drums']);
    osc.start(when);
    osc.stop(when + o.decay + 0.05);
    track(osc);
  }

  const drum = {
    ride(t, v) {
      noiseHit(t, { type: 'highpass', freq: 5200, q: 0.5, vel: v * 0.2, decay: 0.55, pan: 0.35 });
      noiseHit(t, { type: 'bandpass', freq: 3200, q: 3, vel: v * 0.07, decay: 0.3, pan: 0.35 });
      toneHit(t, { wave: 'triangle', freq: 3600, vel: v * 0.02, decay: 0.35, pan: 0.35 });
    },
    hat(t, v) { noiseHit(t, { type: 'highpass', freq: 7600, vel: v * 0.22, decay: 0.045, pan: -0.3 }); },
    hatOpen(t, v) { noiseHit(t, { type: 'highpass', freq: 7000, vel: v * 0.2, decay: 0.32, pan: -0.3 }); },
    pedal(t, v) { noiseHit(t, { type: 'bandpass', freq: 7000, q: 1, vel: v * 0.16, decay: 0.035, attack: 0.004, pan: -0.3 }); },
    snare(t, v) {
      noiseHit(t, { type: 'bandpass', freq: 1900, q: 0.7, vel: v * 0.55, decay: 0.14 });
      toneHit(t, { wave: 'triangle', freq: 200, to: 165, vel: v * 0.4, decay: 0.09 });
    },
    brush(t, v) { noiseHit(t, { type: 'bandpass', freq: 3000, q: 0.5, vel: v * 0.2, decay: 0.2, attack: 0.012 }); },
    kick(t, v) {
      toneHit(t, { freq: 120, to: 44, sweep: 0.09, vel: v * 0.95, decay: 0.32 });
      noiseHit(t, { type: 'lowpass', freq: 2200, vel: v * 0.14, decay: 0.012 });
    },
    crash(t, v) { noiseHit(t, { type: 'highpass', freq: 3600, q: 0.4, vel: v * 0.28, decay: 1.5, pan: -0.15 }); },
    stick(t, v) {
      toneHit(t, { wave: 'triangle', freq: 1750, vel: v * 0.3, decay: 0.03, bus: 'click' });
      noiseHit(t, { type: 'bandpass', freq: 2600, q: 2, vel: v * 0.18, decay: 0.02, bus: 'click' });
    },
    doum(t, v) {
      toneHit(t, { freq: 108, to: 72, sweep: 0.12, vel: v * 0.85, decay: 0.38 });
      noiseHit(t, { type: 'lowpass', freq: 600, vel: v * 0.18, decay: 0.05 });
    },
    tek(t, v) {
      noiseHit(t, { type: 'bandpass', freq: 4300, q: 2.2, vel: v * 0.55, decay: 0.045, pan: 0.15 });
      toneHit(t, { wave: 'triangle', freq: 1150, vel: v * 0.16, decay: 0.03, pan: 0.15 });
    },
    ka(t, v) { noiseHit(t, { type: 'bandpass', freq: 3500, q: 2, vel: v * 0.3, decay: 0.035, pan: -0.15 }); },
  };

  function click(when, level) {
    ensure();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(level === 2 ? 1760 : level === 1 ? 1175 : 880, when);
    const peak = level === 2 ? 0.55 : level === 1 ? 0.38 : 0.2;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(peak, when + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
    osc.connect(g);
    g.connect(bus.click);
    osc.start(when);
    osc.stop(when + 0.07);
    track(osc);
  }

  function stopAll() {
    for (const n of Array.from(live)) {
      try {
        n.stop();
      } catch (e) { /* already stopped */ }
    }
    live.clear();
  }

  GP.audio = {
    ensure, pluck, strum, click, drum, setTone, stopAll,
    get ctx() { return ctx; },
    now() { return ensure().currentTime; },
    setVolume(v) { ensure(); master.gain.value = v; },
  };
})();
