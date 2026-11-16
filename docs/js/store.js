/* Woodshed — local persistence (practice history, preferences, your own licks).
   Everything stays in this browser's localStorage. */
(function () {
  const GP = (window.GP = window.GP || {});
  const PREFIX = 'woodshed.';
  const mem = {};

  function get(key, def) {
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      if (raw != null) return JSON.parse(raw);
    } catch (e) { /* storage blocked: fall back to memory */ }
    return key in mem ? mem[key] : def;
  }
  function set(key, val) {
    mem[key] = val;
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(val));
    } catch (e) { /* ignore */ }
  }

  /* session: { id, t, mode: 'play' | 'along' | 'step', bpm, target, acc, timing, secs } */
  function sessions() {
    return get('sessions', []);
  }
  function addSession(s) {
    const all = sessions();
    all.push(s);
    if (all.length > 3000) all.splice(0, all.length - 3000);
    set('sessions', all);
  }

  function summary(id) {
    const mine = sessions().filter((s) => s.id === id);
    const scored = mine.filter((s) => s.acc != null);
    let best = null;
    let topBpm = 0;
    for (const s of scored) {
      if (best == null || s.acc > best) best = s.acc;
      if (s.acc >= 0.9 && s.mode === 'along' && s.bpm > topBpm) topBpm = s.bpm;
    }
    return {
      count: mine.length, scored, best, topBpm,
      secs: mine.reduce((a, s) => a + (s.secs || 0), 0),
      last: mine.length ? mine[mine.length - 1].t : null,
    };
  }

  function customLicks() {
    return get('custom', []);
  }
  function saveCustom(lick) {
    const all = customLicks().filter((l) => l.id !== lick.id);
    all.push(lick);
    set('custom', all);
  }
  function deleteCustom(id) {
    set('custom', customLicks().filter((l) => l.id !== id));
  }

  GP.store = { get, set, sessions, addSession, summary, customLicks, saveCustom, deleteCustom };
})();
