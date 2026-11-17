/* Woodshed — microphone input and monophonic pitch detection (YIN). */
(function () {
  const GP = (window.GP = window.GP || {});
  const T = GP.theory;

  /* YIN pitch detector. Returns { freq, clarity, rms } or freq = 0 when nothing is clear. */
  function detectPitch(buf, sampleRate, opts) {
    const minF = (opts && opts.minF) || 70;
    const maxF = (opts && opts.maxF) || 1400;
    const threshold = (opts && opts.threshold) || 0.15;
    const n = buf.length;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += buf[i] * buf[i];
    const rms = Math.sqrt(sum / n);
    if (rms < 0.006) return { freq: 0, clarity: 0, rms };

    const tauMax = Math.min(Math.floor(sampleRate / minF), Math.floor(n / 2));
    const tauMin = Math.max(2, Math.floor(sampleRate / maxF));
    const W = n - tauMax;
    const d = new Float32Array(tauMax + 1);
    for (let tau = 1; tau <= tauMax; tau++) {
      let s = 0;
      for (let i = 0; i < W; i++) {
        const x = buf[i] - buf[i + tau];
        s += x * x;
      }
      d[tau] = s;
    }
    // cumulative mean normalised difference
    let running = 0;
    d[0] = 1;
    for (let tau = 1; tau <= tauMax; tau++) {
      running += d[tau];
      d[tau] = running ? (d[tau] * tau) / running : 1;
    }
    let tau = -1;
    for (let t = tauMin; t <= tauMax; t++) {
      if (d[t] < threshold) {
        while (t + 1 <= tauMax && d[t + 1] < d[t]) t++;
        tau = t;
        break;
      }
    }
    if (tau < 0) {
      // no dip under the threshold: take the global minimum if it is reasonably deep
      let best = tauMin;
      for (let t = tauMin; t <= tauMax; t++) if (d[t] < d[best]) best = t;
      if (d[best] > 0.35) return { freq: 0, clarity: 1 - d[best], rms };
      tau = best;
    }
    // parabolic interpolation around the minimum
    let better = tau;
    if (tau > 1 && tau < tauMax) {
      const a = d[tau - 1], b = d[tau], c = d[tau + 1];
      const den = a + c - 2 * b;
      if (den !== 0) better = tau + (a - c) / (2 * den);
    }
    return { freq: sampleRate / better, clarity: 1 - d[tau], rms };
  }

  /* Microphone session: calls onFrame({ midi, freq, clarity, rms, time, onset }) about 50x per second. */
  const mic = {
    stream: null, source: null, analyser: null, timer: null, listeners: new Set(), buf: null,
    slow: 0, lastOnset: 0,
    get active() { return !!this.stream; },
    async start() {
      if (this.stream) return;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('This browser or page cannot use the microphone.');
      }
      const ctx = GP.audio.ensure();
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      this.source = ctx.createMediaStreamSource(this.stream);
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 60;
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.source.connect(hp);
      hp.connect(this.analyser);
      this.buf = new Float32Array(this.analyser.fftSize);
      this.timer = setInterval(() => this.tick(), 20);
    },
    stop() {
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
      if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
      if (this.source) this.source.disconnect();
      this.stream = this.source = this.analyser = null;
    },
    tick() {
      if (!this.analyser) return;
      const ctx = GP.audio.ctx;
      this.analyser.getFloatTimeDomainData(this.buf);
      const r = detectPitch(this.buf, ctx.sampleRate);
      const now = ctx.currentTime;
      // onset: level jumps well above its recent average
      const onset = r.rms > 0.012 && r.rms > this.slow * 1.7 && now - this.lastOnset > 0.07;
      if (onset) this.lastOnset = now;
      this.slow = this.slow * 0.85 + r.rms * 0.15;
      const frame = {
        freq: r.freq, clarity: r.clarity, rms: r.rms, onset,
        midi: r.freq ? T.freqMidi(r.freq) : null,
        time: now - this.analyser.fftSize / ctx.sampleRate / 2,
      };
      for (const fn of this.listeners) fn(frame);
    },
    on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  };

  /* Does a detected pitch match any expected pitch? Octave errors are forgiven. */
  function pitchMatches(detected, targets, tol) {
    if (detected == null) return false;
    for (const t of targets) {
      let diff = (detected - t) % 12;
      if (diff > 6) diff -= 12;
      if (diff < -6) diff += 12;
      if (Math.abs(diff) <= (tol || 0.6)) return true;
    }
    return false;
  }

  GP.pitch = { detectPitch, mic, pitchMatches };
})();
