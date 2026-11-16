/* Bluegrass flatpicking + the Jerry Garcia / jam section. */
(function () {
  const L = window.GP.library;

  L.add('bluegrass', [
    {
      id: 'bg-g-run', title: 'The G-run', source: 'Traditional lick (Lester Flatt)', key: 'G major', tempo: 100,
      scale: { root: 'G', id: 'maj_blues' },
      about: 'The punctuation mark of bluegrass guitar. Boom-chick for a bar, then the run: G, A, slide Bb into B, D, E, and land hard on the open G. Every down-beat is a downstroke.',
      notes: '[G] q 6/3 3/0+2/0+1/3 4/0 3/0+2/0+1/3 | e 6/3 5/0 5/1 5/2h 4/0 4/2 q 3/0 |',
    },
    {
      id: 'bg-runs-c-d', title: 'The same run in C and D', source: 'Traditional lick', key: 'C / D', tempo: 100,
      about: 'The G-run is a shape of scale degrees: 1, 2, b3-3, 5, 6, 1. Moving it to the C and D chords is the first step toward hearing a lick as a melody rather than a fingering.',
      notes: '[C] e 5/3 4/0 4/1 4/2h 3/0 3/2 q 2/1 | [D] e 4/0 4/2 4/3 4/4h 3/2 2/0 q 2/3 |',
    },
    {
      id: 'bg-penta-g-run', title: 'Pentatonic descent into a G-run', tags: ['Tony Rice'], source: 'Original study', key: 'G major', tempo: 110,
      scale: { root: 'G', id: 'maj_pent' },
      about: 'A falling G major pentatonic line from the top string that hands off to the G-run. Keep the pick moving down-up in strict eighths so the open strings ring into each other.',
      notes: '[G] e 1/3 1/0 2/3 2/0 3/2 3/0 4/2 4/0 | e 6/3 5/0 5/1 5/2h 4/0 4/2 q 3/0 |',
    },
    {
      id: 'bg-rice-bluesy', title: 'Bluesy fill with the flat 7 and flat 3', tags: ['Tony Rice'], source: 'Original study in Tony Rice\'s vocabulary', key: 'G major', tempo: 104,
      scale: { root: 'G', id: 'maj_blues' },
      about: 'Rice coloured plain G with F natural and the Bb-to-B slide. Here the line drops D-F-E-D, slides Bb into B on the third string, then answers with a run back up to G.',
      notes: '[G] e 2/3 1/1 1/0 2/3 3/3 3/4s 3/0 4/2 | e 5/1 5/2h 4/0 4/2 3/0 4/2 q 3/0 |',
    },
    {
      id: 'bg-crosspick', title: 'Crosspicking roll: G, C, D', tags: ['Tony Rice'], source: 'Original study', key: 'G major', tempo: 96,
      about: 'Three-string rolls grouped 3+3+2 against the bar, the guitar version of a banjo roll. Hold each chord shape and let every note ring. Pick down-down-up or strictly alternate; try both.',
      notes: '[G] e 4/0 3/0 2/0 4/0 3/0 2/0 4/0 3/0 | [C] e 5/3 4/2 3/0 5/3 4/2 3/0 5/3 4/2 | [D] e 4/0 3/2 2/3 4/0 3/2 2/3 4/0 3/2 | [G] e 4/0 3/0 2/0 4/0 3/0 2/0 q 6/3 |',
    },
    {
      id: 'bg-fiddle-g', title: 'Fiddle-tune phrase in G', source: 'Original study', key: 'G major', tempo: 104,
      scale: { root: 'G', id: 'major' },
      about: 'Four bars in the shape of a fiddle-tune A part: arpeggio up, scale down, following G, C, D, G. Say the chord names out loud as you cross each bar line.',
      notes: '@0 [G] e g3 b3 d4 b3 g4 f#4 e4 d4 | [C] e e4 c4 g3 c4 e4 d4 c4 b3 | [D] e a3 d4 f#4 d4 a3 b3 c4 a3 | [G] e b3 g3 a3 f#3 q g3 r |',
    },
    {
      id: 'bg-soldiers-joy', title: 'Soldier\'s Joy, A part', source: 'Traditional', key: 'D major', tempo: 100,
      scale: { root: 'D', id: 'major' },
      about: 'One common way to play the first strain. Fiddle tunes have no single correct version, so compare it with a recording you like and adjust. The D arpeggio figure repeats three times; the answers change.',
      notes: '@0 e f#3 g3 | [D] e a3 f#3 d3 f#3 a3 f#3 d3 f#3 | q a3 d4 d4 e c#4 b3 | e a3 f#3 d3 f#3 a3 f#3 d3 f#3 | [A] q g3 e3 e3 e f#3 g3 | [D] e a3 f#3 d3 f#3 a3 f#3 d3 f#3 | q a3 d4 d4 e e4 f#4 | [A] e g4 f#4 e4 d4 c#4 a3 b3 c#4 | [D] q d4 d4 d4 |',
    },
    {
      id: 'bg-whiskey', title: 'Whiskey Before Breakfast, A part', source: 'Traditional', key: 'D major', tempo: 100,
      scale: { root: 'D', id: 'major' },
      about: 'One common setting of the A part, low on the neck where Tony Rice and Norman Blake played it. Check it against your favourite recording; every picker bends this tune a little.',
      notes: '@0 [D] e d3 e3 f#3 g3 q a3 e f#3 g3 | e a3 b3 a3 g3 f#3 d3 e3 f#3 | [G] e g3 a3 b3 g3 [D] q f#3 e a3 f#3 | [A] e e3 d3 e3 f#3 q e3 e f#3 e3 | [D] e d3 e3 f#3 g3 q a3 e f#3 g3 | e a3 b3 a3 g3 f#3 d3 e3 f#3 | [G] e g3 b3 a3 g3 [A] f#3 d3 e3 c#3 | [D] q d3 d3 h d3 |',
    },
  ]);

  L.add('jam', [
    {
      id: 'jg-mixo-chromatic', title: 'Mixolydian with chromatic passing tones', tags: ['Jerry Garcia'], source: 'Original study in Jerry Garcia\'s vocabulary', key: 'A Mixolydian', tempo: 108,
      scale: { root: 'A', id: 'mixolydian' }, pos: 4,
      about: 'Garcia connected scale tones with half steps so that chord tones fall on strong beats. Here G-G#-A climbs to the root, then D-C#-C-B falls through the major and minor third.',
      notes: '@4 [A7] e e4 f#4 g4 g#4 a4 g4 f#4 e4 | e d4 c#4 c4 b3 a3 c#4 q e4 |',
    },
    {
      id: 'jg-two-chord-vamp', title: 'Two-chord vamp: B to A', tags: ['Jerry Garcia'], source: 'Original study', key: 'B Mixolydian', tempo: 100,
      scale: { root: 'B', id: 'maj_pent' },
      about: 'The B-to-A vamp of Fire on the Mountain. Play B major pentatonic over B, then shift the same shape of thinking down to A. The melody should make the chord change audible with no band behind you.',
      notes: '@6 [B] e f#4 g#4 b4 g#4 f#4 d#4 c#4 b3 | [A] e c#4 e4 f#4 e4 c#4 b3 q a3 |',
    },
    {
      id: 'jg-triplets', title: 'Rolling triplets in G Mixolydian', tags: ['Jerry Garcia'], source: 'Original study', key: 'G Mixolydian', tempo: 92,
      scale: { root: 'G', id: 'mixolydian' },
      about: 'Garcia often shifted from eighths into triplets mid-phrase. Keep the triplets even, three to a click, and accent the first of each group.',
      notes: '@2 [G7] et g3 a3 b3 d4 b3 a3 g3 a3 b3 d4 e4 f4 | et g4 f4 e4 d4 b3 a3 q g3 r |',
    },
    {
      id: 'jg-chord-tone-chase', title: 'Chasing chord tones: G, C, D', tags: ['Jerry Garcia'], source: 'Original study', key: 'G major', tempo: 100,
      scale: { root: 'G', id: 'major' },
      about: 'The same melodic shape rebuilt on each chord, aiming at the third every time the harmony moves: B for G, E for C, F# for D. This is the core of playing "through" changes rather than over them.',
      notes: '@2 [G] e d4 b3 g3 a3 b3 d4 e4 d4 | [C] e e4 g4 e4 c4 d4 e4 g4 e4 | [D] e f#4 a4 f#4 d4 e4 f#4 a4 f#4 | [G] e g4 d4 b3 d4 h g3 |',
    },
  ]);
})();
