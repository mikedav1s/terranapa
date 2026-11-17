/* Woodshed — music theory helpers: notes, tuning, scales/modes, chord symbols. */
(function () {
  const GP = (window.GP = window.GP || {});

  const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const LETTER_PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  // Standard tuning, sounding MIDI numbers, indexed by string number (1 = high E).
  const OPEN = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 };

  function pcName(pc, flats) {
    pc = ((Math.round(pc) % 12) + 12) % 12;
    return (flats ? FLAT : SHARP)[pc];
  }
  function midiName(midi, flats) {
    const m = Math.round(midi);
    return pcName(m, flats) + (Math.floor(m / 12) - 1);
  }
  function midiFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  function freqMidi(freq) {
    return 69 + 12 * Math.log2(freq / 440);
  }
  function namePc(name) {
    const m = /^([A-Ga-g])([#b]?)/.exec(name);
    if (!m) return null;
    let pc = LETTER_PC[m[1].toLowerCase()];
    if (m[2] === '#') pc += 1;
    if (m[2] === 'b') pc -= 1;
    return (pc + 12) % 12;
  }
  function fretMidi(string, fret) {
    return OPEN[string] + fret;
  }

  /* ---------- Scales & modes ----------
     Intervals are semitones above the tonic. Fractions (x.5) are quarter tones,
     used by the Arabic maqamat; on guitar they are played as a slight bend. */
  const SCALES = [
    // Western
    { id: 'major', group: 'Major modes', name: 'Major (Ionian)', iv: [0, 2, 4, 5, 7, 9, 11], about: 'The reference scale. Fiddle tunes, classical themes and most bluegrass melodies live here.' },
    { id: 'dorian', group: 'Major modes', name: 'Dorian', iv: [0, 2, 3, 5, 7, 9, 10], about: 'Minor with a bright 6th. The sound of modal jazz (Impressions, So What) and minor-key Dead jams.' },
    { id: 'phrygian', group: 'Major modes', name: 'Phrygian', iv: [0, 1, 3, 5, 7, 8, 10], about: 'Minor with a flat 2nd. Metal riffing and flamenco colour; identical to Greek Ousak and Arabic Kurd on a fretted guitar.' },
    { id: 'lydian', group: 'Major modes', name: 'Lydian', iv: [0, 2, 4, 6, 7, 9, 11], about: 'Major with a raised 4th. Floating, unresolved major sound.' },
    { id: 'mixolydian', group: 'Major modes', name: 'Mixolydian', iv: [0, 2, 4, 5, 7, 9, 10], about: 'Major with a flat 7th. Dominant chords, Jerry Garcia vamps, old-time modal tunes.' },
    { id: 'aeolian', group: 'Major modes', name: 'Natural minor (Aeolian)', iv: [0, 2, 3, 5, 7, 8, 10], about: 'The plain minor scale.' },
    { id: 'locrian', group: 'Major modes', name: 'Locrian', iv: [0, 1, 3, 5, 6, 8, 10], about: 'Fits half-diminished (m7b5) chords, the ii chord of a minor ii-V.' },
    { id: 'maj_pent', group: 'Pentatonic & blues', name: 'Major pentatonic', iv: [0, 2, 4, 7, 9], about: 'Five notes, no half steps. Country, bluegrass and the sweet side of Jerry.' },
    { id: 'min_pent', group: 'Pentatonic & blues', name: 'Minor pentatonic', iv: [0, 3, 5, 7, 10], about: 'The first scale of blues and rock. Coltrane stacked these from different chord degrees.' },
    { id: 'blues', group: 'Pentatonic & blues', name: 'Blues scale', iv: [0, 3, 5, 6, 7, 10], about: 'Minor pentatonic plus the flat 5 "blue note".' },
    { id: 'maj_blues', group: 'Pentatonic & blues', name: 'Major blues', iv: [0, 2, 3, 4, 7, 9], about: 'Major pentatonic plus the flat 3rd. The b3-to-3 slide of bluegrass G-runs and Tony Rice.' },
    { id: 'harm_minor', group: 'Minor & jazz', name: 'Harmonic minor', iv: [0, 2, 3, 5, 7, 8, 11], about: 'Minor with a raised 7th. Neoclassical metal, Gypsy jazz over the V7 chord, Bach.' },
    { id: 'mel_minor', group: 'Minor & jazz', name: 'Melodic minor (jazz)', iv: [0, 2, 3, 5, 7, 9, 11], about: 'Minor with major 6 and 7. Parent of the altered and Lydian-dominant scales.' },
    { id: 'phryg_dom', group: 'Minor & jazz', name: 'Phrygian dominant', iv: [0, 1, 4, 5, 7, 8, 10], about: 'Fifth mode of harmonic minor. Same notes as Greek Hitzaz and Arabic Hijaz.' },
    { id: 'lyd_dom', group: 'Minor & jazz', name: 'Lydian dominant', iv: [0, 2, 4, 6, 7, 9, 10], about: 'Dominant scale with a #11. Tritone substitutes and non-resolving 7th chords.' },
    { id: 'altered', group: 'Minor & jazz', name: 'Altered (super-Locrian)', iv: [0, 1, 3, 4, 6, 8, 10], about: 'Every tension on a V7 chord: b9, #9, #11, b13. Resolves hard to the I.' },
    { id: 'dim_hw', group: 'Minor & jazz', name: 'Diminished (half-whole)', iv: [0, 1, 3, 4, 6, 7, 9, 10], about: 'Symmetric scale for 7b9 chords. Repeats every three frets.' },
    { id: 'dim_wh', group: 'Minor & jazz', name: 'Diminished (whole-half)', iv: [0, 2, 3, 5, 6, 8, 9, 11], about: 'Symmetric scale for diminished 7th chords. A Django staple.' },
    { id: 'whole_tone', group: 'Minor & jazz', name: 'Whole tone', iv: [0, 2, 4, 6, 8, 10], about: 'All whole steps. Augmented and 7#5 chords.' },
    { id: 'bebop_dom', group: 'Minor & jazz', name: 'Bebop dominant', iv: [0, 2, 4, 5, 7, 9, 10, 11], about: 'Mixolydian with an added major 7 passing tone, so chord tones land on the beat in eighth-note lines.' },
    { id: 'bebop_maj', group: 'Minor & jazz', name: 'Bebop major', iv: [0, 2, 4, 5, 7, 8, 9, 11], about: 'Major scale with a #5 passing tone.' },
    { id: 'hung_minor', group: 'Minor & jazz', name: 'Hungarian (Gypsy) minor', iv: [0, 2, 3, 6, 7, 8, 11], about: 'Harmonic minor with a raised 4th. Same notes as Greek Niavent.' },
    // Greek dromoi (as played on the tempered bouzouki / guitar)
    { id: 'gr_rast', group: 'Greek dromoi', name: 'Rast', iv: [0, 2, 4, 5, 7, 9, 11], about: 'The major dromos. Ascends like a major scale; descending phrases often lower the 7th.' },
    { id: 'gr_ousak', group: 'Greek dromoi', name: 'Ousak', iv: [0, 1, 3, 5, 7, 8, 10], about: 'Minor with a flat 2nd that leans down onto the tonic. Many zeibekika use it.' },
    { id: 'gr_hitzaz', group: 'Greek dromoi', name: 'Hitzaz', iv: [0, 1, 4, 5, 7, 8, 10], about: 'The classic "eastern" sound: a three-fret gap between the 2nd and 3rd degrees. Usually played from D.' },
    { id: 'gr_hitzazkiar', group: 'Greek dromoi', name: 'Hitzazkiar', iv: [0, 1, 4, 5, 7, 8, 11], about: 'Two Hitzaz tetrachords stacked (double harmonic). The mode of Misirlou.' },
    { id: 'gr_piraiotikos', group: 'Greek dromoi', name: 'Piraiotikos', iv: [0, 1, 4, 6, 7, 8, 11], about: 'Hitzazkiar with a raised 4th. Named for the Piraeus rebetiko school.' },
    { id: 'gr_nikriz', group: 'Greek dromoi', name: 'Nikriz', iv: [0, 2, 3, 6, 7, 9, 10], about: 'Minor third with a raised 4th and major 6th.' },
    { id: 'gr_niavent', group: 'Greek dromoi', name: 'Niavent', iv: [0, 2, 3, 6, 7, 8, 11], about: 'Harmonic minor with a raised 4th.' },
    { id: 'gr_sabah', group: 'Greek dromoi', name: 'Sabah', iv: [0, 2, 3, 4, 7, 8, 10], about: 'Minor with a lowered 4th, giving a crying, unstable middle.' },
    { id: 'gr_kiourdi', group: 'Greek dromoi', name: 'Kiourdi', iv: [0, 2, 3, 5, 6, 9, 10], about: 'Minor with a flat 5th and major 6th.' },
    { id: 'gr_houseini', group: 'Greek dromoi', name: 'Houseini', iv: [0, 2, 3, 5, 7, 9, 10], about: 'Dorian-like going up; the 6th is often lowered coming down.' },
    // Arabic maqamat common in Lebanese music (x.5 = quarter tone)
    { id: 'ar_rast', group: 'Arabic maqamat', name: 'Maqam Rast', iv: [0, 2, 3.5, 5, 7, 9, 10.5], tonic: 'C', about: 'The "home" maqam. The 3rd and 7th sit a quarter tone below major: fret the minor 3rd and bend it up slightly.' },
    { id: 'ar_bayati', group: 'Arabic maqamat', name: 'Maqam Bayati', iv: [0, 1.5, 3, 5, 7, 8, 10], tonic: 'D', about: 'The everyday maqam of Levantine song and dabke. The 2nd is half-flat: fret the flat 2nd and bend a quarter tone.' },
    { id: 'ar_hijaz', group: 'Arabic maqamat', name: 'Maqam Hijaz', iv: [0, 1, 4, 5, 7, 8, 10], tonic: 'D', about: 'Flat 2nd with a wide step to the major 3rd. Plays in tune on a fretted guitar.' },
    { id: 'ar_nahawand', group: 'Arabic maqamat', name: 'Maqam Nahawand', iv: [0, 2, 3, 5, 7, 8, 11], tonic: 'C', about: 'Close to harmonic minor (the 7th drops to natural when descending). Lamma Bada Yatathanna is the classic study.' },
    { id: 'ar_kurd', group: 'Arabic maqamat', name: 'Maqam Kurd', iv: [0, 1, 3, 5, 7, 8, 10], tonic: 'D', about: 'Phrygian. Common in modern Lebanese pop and Rahbani songs; fully fretted.' },
    { id: 'ar_saba', group: 'Arabic maqamat', name: 'Maqam Saba', iv: [0, 1.5, 3, 4, 7, 8, 10], tonic: 'D', about: 'Half-flat 2nd and a lowered 4th. The saddest colour in the system.' },
    { id: 'ar_ajam', group: 'Arabic maqamat', name: 'Maqam Ajam', iv: [0, 2, 4, 5, 7, 9, 11], tonic: 'C', about: 'Equivalent to the major scale.' },
    { id: 'ar_hijazkar', group: 'Arabic maqamat', name: 'Maqam Hijaz Kar', iv: [0, 1, 4, 5, 7, 8, 11], tonic: 'C', about: 'Two Hijaz tetrachords. Same notes as Greek Hitzazkiar.' },
    { id: 'ar_nikriz', group: 'Arabic maqamat', name: 'Maqam Nikriz', iv: [0, 2, 3, 6, 7, 9, 10], tonic: 'C', about: 'Raised 4th over a minor 3rd.' },
  ];
  const scaleById = (id) => SCALES.find((s) => s.id === id);

  const DEGREE = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
  function degreeName(semis) {
    const whole = Math.floor(semis + 1e-6);
    const frac = semis - whole;
    const base = DEGREE[((whole % 12) + 12) % 12];
    return frac > 0.25 ? base + '+' : base;
  }

  /* ---------- Chord symbols -> pitch classes (for backing chords) ---------- */
  const QUAL = [
    [/^(maj7|M7|Δ7?|maj9|M9)/, [0, 4, 7, 11]],
    [/^(m7b5|ø7?|min7b5)/, [0, 3, 6, 10]],
    [/^(dim7|o7|°7)/, [0, 3, 6, 9]],
    [/^(dim|o|°)/, [0, 3, 6]],
    [/^(m\(?maj7\)?|mM7)/, [0, 3, 7, 11]],
    [/^(m6|min6)/, [0, 3, 7, 9]],
    [/^(m9|min9)/, [0, 3, 7, 10, 14]],
    [/^(m7|min7|-7)/, [0, 3, 7, 10]],
    [/^(m|min|-)/, [0, 3, 7]],
    [/^(6\/9|69)/, [0, 4, 7, 9, 14]],
    [/^6/, [0, 4, 7, 9]],
    [/^7alt/, [0, 4, 10, 13, 20]],
    [/^7#9/, [0, 4, 10, 15]],
    [/^7b9/, [0, 4, 10, 13]],
    [/^7#5|^\+7|^aug7/, [0, 4, 8, 10]],
    [/^7b5/, [0, 4, 6, 10]],
    [/^13/, [0, 4, 10, 14, 21]],
    [/^9/, [0, 4, 7, 10, 14]],
    [/^7sus4?/, [0, 5, 7, 10]],
    [/^7/, [0, 4, 7, 10]],
    [/^sus4?/, [0, 5, 7]],
    [/^sus2/, [0, 2, 7]],
    [/^(aug|\+)/, [0, 4, 8]],
    [/^5/, [0, 7]],
    [/^/, [0, 4, 7]],
  ];
  function parseChord(sym) {
    const m = /^([A-G][#b]?)(.*)$/.exec(sym.trim());
    if (!m) return null;
    const root = namePc(m[1]);
    let rest = m[2];
    let bass = null;
    const slash = /\/([A-G][#b]?)$/.exec(rest);
    if (slash) {
      bass = namePc(slash[1]);
      rest = rest.slice(0, slash.index);
    }
    let iv = [0, 4, 7];
    for (const [re, v] of QUAL) {
      if (re.test(rest)) {
        iv = v;
        break;
      }
    }
    return { root, bass, iv };
  }
  /* A compact guitar-register voicing (MIDI numbers) for a chord symbol. */
  function chordVoicing(sym) {
    const c = parseChord(sym);
    if (!c) return [];
    const bassPc = c.bass == null ? c.root : c.bass;
    let bass = 40 + ((bassPc - 40 % 12 + 12) % 12); // E2..D#3
    if (bass > 47) bass -= 0;
    const out = [bass];
    let prev = bass + 5;
    // spread upper voices: 3rd/7th first, then the rest, each above the previous
    const order = c.iv.slice(1).sort((a, b) => {
      const rank = (x) => ([3, 4, 10, 11, 9].includes(x % 12) ? 0 : 1);
      return rank(a) - rank(b) || a - b;
    });
    for (const semi of order) {
      let n = 48 + ((c.root + semi) % 12);
      while (n <= prev) n += 12;
      if (n > 72) n -= 12;
      out.push(n);
      prev = n;
    }
    return out.sort((a, b) => a - b);
  }

  GP.theory = {
    SHARP, FLAT, OPEN, LETTER_PC, SCALES, scaleById,
    pcName, midiName, midiFreq, freqMidi, namePc, fretMidi, degreeName, parseChord, chordVoicing,
  };
})();
