/* Woodshed — Web Audio: plucked-string synth (Karplus-Strong), metronome click. */
(function () {
  const GP = (window.GP = window.GP || {});
  const T = GP.theory;

  let ctx = null;
  let master = null;
  const cache = new Map();
  const live = new Set();

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC({ latencyHint: 'interactive' });
      master = ctx.createGain();
      master.gain.value = 0.9;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      master.connect(comp);
      comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* One plucked-string buffer per semitone, pitch-corrected with playbackRate. */
  function stringBuffer(midiInt) {
    if (cache.has(midiInt)) return cache.get(midiInt);
    const sr = ctx.sampleRate;
    const f = T.midiFreq(midiInt);
    const N = Math.max(2, Math.round(sr / f));
    const secs = Math.max(1.2, Math.min(3.5, 3.6 - (midiInt - 40) * 0.05));
    const len = Math.floor(sr * secs);
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    // excitation: noise burst, softened so the attack is round rather than harsh
    let prev = 0;
    for (let i = 0; i < N; i++) {
      const n = Math.random() * 2 - 1;
      prev = prev * 0.45 + n * 0.55;
      d[i] = prev;
    }
    const decay = midiInt < 52 ? 0.9965 : midiInt < 64 ? 0.9955 : 0.994;
    for (let i = N; i < len; i++) {
      d[i] = decay * 0.5 * (d[i - N] + d[i - N + 1 < i ? i - N + 1 : i - N]);
    }
    // fade the tail to avoid a click at the buffer end
    const fade = Math.floor(sr * 0.05);
    for (let i = 0; i < fade; i++) d[len - 1 - i] *= i / fade;
    const out = { buf, rate: (f * N) / sr };
    cache.set(midiInt, out);
    return out;
  }

  /* Play a plucked note. midi may be fractional (quarter tones). bend = semitones to glide up. */
  function pluck(midi, when, dur, vel, bend) {
    ensure();
    const base = Math.round(midi);
    const { buf, rate } = stringBuffer(base);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const r0 = rate * Math.pow(2, (midi - base) / 12);
    src.playbackRate.setValueAtTime(r0, when);
    if (bend) {
      const glide = Math.min(0.22, dur * 0.6);
      src.playbackRate.setValueAtTime(r0, when + 0.02);
      src.playbackRate.linearRampToValueAtTime(r0 * Math.pow(2, bend / 12), when + 0.02 + glide);
    }
    const g = ctx.createGain();
    g.gain.setValueAtTime(vel == null ? 0.7 : vel, when);
    g.gain.setTargetAtTime(0, when + dur, 0.06);
    src.connect(g);
    g.connect(master);
    src.start(when);
    src.stop(when + dur + 0.5);
    live.add(src);
    src.onended = () => live.delete(src);
  }

  /* Strum several notes low to high. */
  function strum(midis, when, dur, vel, spread) {
    midis.forEach((m, i) => pluck(m, when + i * (spread == null ? 0.018 : spread), dur, vel));
  }

  function click(when, level) {
    // level: 2 = bar accent, 1 = beat, 0 = subdivision
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
    g.connect(master);
    osc.start(when);
    osc.stop(when + 0.07);
    live.add(osc);
    osc.onended = () => live.delete(osc);
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
    ensure, pluck, strum, click, stopAll,
    get ctx() { return ctx; },
    now() { return ensure().currentTime; },
    setVolume(v) { ensure(); master.gain.value = v; },
  };
})();
