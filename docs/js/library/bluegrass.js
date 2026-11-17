/* Bluegrass flatpicking + the Jerry Garcia / jam section.
   Rhythm notes: bluegrass eighths are nearly straight with a slight lilt and drive on the
   down-beats; runs often land early (anticipations tied over the bar). Garcia mixes eighths
   and triplets freely and likes to start phrases on the "and". */
(function () {
  const L = window.GP.library;
  const G = '3/0+2/0+1/3';
  const C = '4/2+3/0+2/1';
  const D = '3/2+2/3+1/2';

  L.add('bluegrass', [
    {
      id: 'bg-g-run', title: 'The G-run', source: 'Traditional lick (Lester Flatt)', key: 'G major', tempo: 104,
      scale: { root: 'G', id: 'maj_blues' },
      about: 'The punctuation mark of bluegrass guitar, in context. A bar of boom-chick-a (bass note, then a down-up strum), then the run: G, A, Bb hammered to B, D, E and the open G. The run starts on the beat and lands on beat 4; let that last G ring into a final strum.',
      notes: `[G] q 6/3> e ${G} ${G}_ q 4/0> e ${G} ${G}_ | e 6/3> 5/0 5/1 5/2h 4/0 4/2 q 3/0> | e r ${G}. q r h r |`,
    },
    {
      id: 'bg-runs-c-d', title: 'The run moved to C and D', source: 'Traditional lick', key: 'C / D', tempo: 100,
      about: 'The G-run is a shape of scale degrees: 1, 2, b3-3, 5, 6, 1. Here it moves to C and D, and each run lands an eighth early, on the "and" of 4, tied over the bar line. That anticipation is what makes a run push the band forward.',
      notes: `[C] e 5/3> 4/0 4/1 4/2h 3/0 3/2 r 2/1> | - ${C}_ q ${C}. [D] e 4/0> 4/2 4/3 4/4h | e 3/2 2/0 r 2/3> q - r |`,
    },
    {
      id: 'bg-penta-g-run', title: 'Pentatonic descent into a G-run', tags: ['Tony Rice'], source: 'Original study', key: 'G major', tempo: 112,
      scale: { root: 'G', id: 'maj_pent' },
      about: 'A falling G major pentatonic line that starts on the "and" of 1 and hands off to the G-run. Keep the pick moving down-up in strict eighths, even through the rest, and let the open strings ring into each other.',
      notes: `[G] e r 1/3> 1/0 2/3 2/0 3/2 3/0 4/2 | e 4/0 {5/1} 5/2 4/0 6/3> 5/0 5/1 5/2h 4/0 | e 4/2 q 3/0> e ${G}. q r ${G}_ |`,
    },
    {
      id: 'bg-rice-bluesy', title: 'Bluesy fill with the flat 7 and flat 3', tags: ['Tony Rice'], source: 'Original study in Tony Rice\'s vocabulary', key: 'G major', tempo: 104,
      scale: { root: 'G', id: 'maj_blues' },
      about: 'Rice coloured plain G with F natural and the Bb-to-B slide. A triplet pull-off (F-E-D) breaks the even eighths, the slide lands on beat 3, and the answer starts on the "and" so it sounds like a second voice.',
      notes: `[G] e 2/3> 1/1. et 1/1 1/0p 2/3 e 3/3 3/4s q 3/0> | e r 5/1 5/2h 4/0 4/2> 4/3 4/2 3/0 | e 4/2 3/0 et 4/2 4/0 5/2 q 6/3> e r ${G}_ |`,
    },
    {
      id: 'bg-crosspick', title: 'Crosspicking roll: G, C, D', tags: ['Tony Rice'], source: 'Original study', key: 'G major', tempo: 96,
      about: 'Three-string rolls grouped 3+3+2 against the bar: the accents fall on beat 1, the "and" of 2, and beat 4, a built-in syncopation borrowed from the banjo. Hold each chord shape and let every note ring.',
      notes: '[G] e 4/0> 3/0 2/0 4/0> 3/0 2/0 4/0> 3/0 | [C] e 5/3> 4/2 3/0 5/3> 4/2 3/0 5/3> 4/2 | [D] e 4/0> 3/2 2/3 4/0> 3/2 2/3 4/0> 3/2 | [G] e 4/0> 3/0 2/0 4/0> 3/0 2/0 q 6/3> |',
    },
    {
      id: 'bg-fiddle-g', title: 'Fiddle-tune phrase in G', source: 'Original study', key: 'G major', tempo: 108,
      scale: { root: 'G', id: 'major' },
      about: 'Four bars in the shape of a fiddle-tune A part, with a two-note pickup. Fiddle tunes drive by accenting the off-beat now and then (the "shuffle bow"); the accents mark where. The C bar breathes with a quarter note in the middle.',
      notes: '@0 e d4 e4 | [G] e g4> b3 d4 b3 g3 b3> d4 g4 | [C] e e4 c4 g3 c4 q e4> e d4 c4 | [D] e a3 d4 f#4> d4 a3 b3 c4> a3 | [G] e b3 g3 a3 f#3 q g3> r |',
    },
    {
      id: 'bg-soldiers-joy', title: 'Soldier\'s Joy, A part', source: 'Traditional', key: 'D major', tempo: 100,
      scale: { root: 'D', id: 'major' },
      about: 'One common way to play the first strain. Fiddle tunes have no single correct version, so compare it with a recording you like and adjust. The quarter notes on D are the "bow strokes": hit them harder than the eighth-note arpeggios around them.',
      notes: '@0 e f#3 g3 | [D] e a3> f#3 d3 f#3 a3 f#3 d3 f#3 | q a3 d4> d4> e c#4 b3 | e a3> f#3 d3 f#3 a3 f#3 d3 f#3 | [A] q g3 e3> e3> e f#3 g3 | [D] e a3> f#3 d3 f#3 a3 f#3 d3 f#3 | q a3 d4> d4> e e4 f#4 | [A] e g4> f#4 e4 d4 c#4 a3 b3 c#4 | [D] q d4> d4. d4. r |',
    },
    {
      id: 'bg-whiskey', title: 'Whiskey Before Breakfast, A part', source: 'Traditional', key: 'D major', tempo: 100,
      scale: { root: 'D', id: 'major' },
      about: 'One common setting of the A part, low on the neck where Tony Rice and Norman Blake played it. The long A in bar 1 and the quarter-note E in bar 4 are the breathing spots; lean on them.',
      notes: '@0 [D] e d3> e3 f#3 g3 q a3> e f#3 g3 | e a3> b3 a3 g3 f#3 d3 e3 f#3 | [G] e g3> a3 b3 g3 [D] q f#3 e a3 f#3 | [A] e e3> d3 e3 f#3 q e3 e f#3 e3 | [D] e d3> e3 f#3 g3 q a3> e f#3 g3 | e a3> b3 a3 g3 f#3 d3 e3 f#3 | [G] e g3> b3 a3 g3 [A] f#3 d3 e3 c#3 | [D] q d3> d3. h d3 |',
    },
  ]);

  L.add('jam', [
    {
      id: 'jg-mixo-chromatic', title: 'Mixolydian with chromatic passing tones', tags: ['Jerry Garcia'], source: 'Original study in Jerry Garcia\'s vocabulary', key: 'A Mixolydian', tempo: 108,
      scale: { root: 'A', id: 'mixolydian' }, pos: 4,
      about: 'Garcia connected scale tones with half steps so chord tones fall on strong beats. The line starts on the "and", climbs G-G#-A to the root and holds it across beat 3, then falls through C# and C in a triplet-led answer.',
      notes: '@4 [A7] e r e4 f#4 g4 g#4> a4 - g4 | et f#4 e4 d4 e c#4 c4 b3 a3 c#4> e4. | q r e r a4 g4 e4 q c#4~ |',
    },
    {
      id: 'jg-two-chord-vamp', title: 'Two-chord vamp: B to A', tags: ['Jerry Garcia'], source: 'Original study', key: 'B Mixolydian', tempo: 100,
      scale: { root: 'B', id: 'maj_pent' },
      about: 'The B-to-A vamp of Fire on the Mountain. The line anticipates the A chord by an eighth (on the "and" of 2 in bar 2), which is how Garcia makes a two-chord vamp feel like it is moving. Turn Band on and listen for the anticipation against the bass.',
      notes: '@6 [B] e r f#4 g#4 b4> - g#4 f#4 d#4 | e c#4 b3 q d#4> e r [A] c#4 e4 f#4> | e - e4 c#4 b3 a3 c#4 q e4. | e r b4 a4 e4 q f#4~ r |',
    },
    {
      id: 'jg-triplets', title: 'Rolling triplets in G Mixolydian', tags: ['Jerry Garcia'], source: 'Original study', key: 'G Mixolydian', tempo: 92,
      scale: { root: 'G', id: 'mixolydian' },
      about: 'Garcia shifts between eighths and triplets inside a phrase. Each beat here is either two or three notes; feel the change without rushing. The F natural (the flat 7) is the note that makes it sound like him.',
      notes: '@2 [G7] e g3 a3 et b3 d4 e4 e f4> - et e4 d4 b3 | e d4 c4 et b3 a3 g3 q a3> e r d4 | et f4> e4 d4 et b3 a3 g3 h g3~ |',
    },
    {
      id: 'jg-chord-tone-chase', title: 'Chasing chord tones: G, C, D', tags: ['Jerry Garcia'], source: 'Original study', key: 'G major', tempo: 100,
      scale: { root: 'G', id: 'major' },
      about: 'Each bar ends on the "and" of 4 with the third of the next chord, tied over the bar line: E before C, F# before D, B before G. Playing the change before it happens is the core of sounding like you are leading the band.',
      notes: '@2 [G] e r d4 b3 g3 a3 b3 d4 e4> | [C] e - g4 e4 c4 d4 e4 g4 f#4> | [D] e - a4 f#4 d4 e4 f#4 a4 b4> | [G] e - g4 d4 b3 h g3~ |',
    },
  ]);
})();
