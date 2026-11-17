/* Metal: rhythm figures, neoclassical sequences, sweeps.
   Rhythm notes: straight and tight, palm-muted low strings (m) against accented
   open chords, sixteenth-note groupings accented in fours or sixes. */
(function () {
  const L = window.GP.library;
  const AM = '5/12> 4/10 3/9 2/10 1/8 1/12h 1/8p 2/10 3/9 4/10 5/12 4/10';
  const F = '5/8> 4/7 3/5 2/6 1/5 1/8h 1/5p 2/6 3/5 4/7 5/8 4/7';
  const E = '5/11> 4/9 3/9 2/9 1/7 1/12h 1/7p 2/9 3/9 4/9 5/11 4/9';

  L.add('metal', [
    {
      id: 'mt-gallop', title: 'Gallop riff in E Phrygian', source: 'Original study', key: 'E Phrygian', tempo: 120,
      scale: { root: 'E', id: 'phrygian' },
      about: 'The eighth-plus-two-sixteenths gallop on the palm-muted open E, broken up by accented, open F5 and G5 power chords. Pick down-down-up on each gallop, keep the muting hand planted at the bridge, and lift it for the chords.',
      notes: 'e 6/0m> s 6/0m 6/0m e 6/0m s 6/0m 6/0m e 6/1+5/3> s 6/0m 6/0m e 6/3+5/5> 6/1+5/3 | e 6/0m> s 6/0m 6/0m e 6/0m s 6/0m 6/0m e 6/3+5/5> s 6/0m 6/0m q 6/1+5/3>~ |',
    },
    {
      id: 'mt-harm-minor-seq', title: 'Harmonic minor sequence in fours', source: 'Original study (neoclassical vocabulary)', key: 'A harmonic minor', tempo: 100,
      scale: { root: 'A', id: 'harm_minor' },
      about: 'Descending groups of four, each starting one scale step lower: the staple sequence of neoclassical playing. Accent the first note of each group so the four-note shapes are audible. The G# is what separates this from plain A minor.',
      notes: '@7 s e5> d5 c5 b4 d5> c5 b4 a4 c5> b4 a4 g#4 b4> a4 g#4 f4 | @5 s a4> g#4 f4 e4 g#4> f4 e4 d4 f4> e4 d4 c4 e4> d4 c4 b3 | h a3~> r |',
    },
    {
      id: 'mt-pedal-point', title: 'Pedal-point lick in E minor', source: 'Original study (after Bach\'s pedal-point writing)', key: 'E minor', tempo: 96,
      scale: { root: 'E', id: 'aeolian' },
      about: 'A melody on the first string with the open E returning between every note. Baroque violin writing turned into a metal device. Accent the melody notes and keep the open E lighter so the tune stands out.',
      notes: 's 1/12> 1/0 1/10> 1/0 1/8> 1/0 1/7> 1/0 1/8> 1/0 1/7> 1/0 1/5> 1/0 1/7> 1/0 | s 1/3> 1/0 1/5> 1/0 1/7> 1/0 1/8> 1/0 1/7> 1/0 1/5> 1/0 1/3> 1/0 1/2> 1/0 | h 3/0+2/0+1/0> r |',
    },
    {
      id: 'mt-sweep', title: 'Sweep arpeggios: Am, F, E', source: 'Original study', key: 'A minor', tempo: 60,
      about: 'Five-string arpeggio shapes in sixteenth-note sextuplets, accented on each new shape. One continuous pick motion down across the strings going up, one upstroke coming back, with a hammer-on and pull-off at the top. Mute each note as you leave it.',
      notes: `[Am] st ${AM} ${AM} | [F] st ${F} ${F} | [E] st ${E} ${E} | [Am] h 5/12~> r |`,
    },
    {
      id: 'mt-3nps', title: 'Three-notes-per-string run in E minor', source: 'Original study', key: 'E minor', tempo: 92,
      scale: { root: 'E', id: 'aeolian' },
      about: 'E natural minor three notes to a string from the 12th fret, accented in groups of three across the sixteenths so the accent shifts against the beat. It ends with a half-step bend from B up to C, held with vibrato.',
      notes: 's 6/12> 6/14 6/15 5/12> 5/14 5/15 4/12> 4/14 4/16 3/12> 3/14 3/16 2/13> 2/15 2/17 1/14> | s 1/15 1/17 1/15 1/14 e 1/17 1/19> h 1/19b1~ |',
    },
    {
      id: 'mt-phrygian-dominant', title: 'Phrygian dominant run in E', source: 'Original study', key: 'E Phrygian dominant', tempo: 88,
      scale: { root: 'E', id: 'phryg_dom' },
      about: 'The same notes as Greek Hitzaz and Arabic Hijaz, at metal speed. Up the octave and back in sixteenths, accented on the beats, turning on the F natural above the tonic and finishing on a held E.',
      notes: '@12 s e4> f4 g#4 a4 b4> c5 d5 e5 d5> c5 b4 a4 g#4> f4 e4 f4 | h e4~> r |',
    },
    {
      id: 'mt-paganini-24', title: 'Caprice No. 24, theme', source: 'Niccolo Paganini, Op. 1 No. 24 (opening phrase)', key: 'A minor', meter: '2/4', tempo: 84,
      scale: { root: 'A', id: 'harm_minor' },
      about: 'The four-bar phrase that launched a thousand variations. The dotted figure snaps: a long accented note, a quick pickup, then crisp sixteenths. Play the sixteenths short (staccato), as a violinist would.',
      notes: '@5 [Am] e. a4> s a4. a4. c5. b4. a4. | [E] e. e5> s e4. e4. g#4. f#4. e4. | [Am] e. a4> s a4. a4. c5. b4. a4. | [E] e. e5> s e4. e4. g#4. f#4. e4. |',
    },
  ]);
})();
