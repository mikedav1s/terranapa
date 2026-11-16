/* Greek: dromoi (modes) and dance rhythms. */
(function () {
  const L = window.GP.library;

  L.add('greek', [
    {
      id: 'gr-hitzaz-scale', title: 'Hitzaz on D: up and down', source: 'Traditional dromos', key: 'D Hitzaz', tempo: 92, flats: true,
      scale: { root: 'D', id: 'gr_hitzaz' },
      about: 'Learn the dromos as a path, not a box: D, Eb, then the wide step to F#, G, A, Bb, C, D. The Eb-to-F# gap is where the colour is; land on D with weight.',
      notes: '@3 [D] e d3 eb3 f#3 g3 a3 bb3 c4 d4 | e c4 bb3 a3 g3 f#3 eb3 q d3 |',
    },
    {
      id: 'gr-hitzaz-phrase', title: 'Hitzaz melody, hasapiko pulse', source: 'Original study', key: 'D Hitzaz', tempo: 88, flats: true,
      scale: { root: 'D', id: 'gr_hitzaz' },
      about: 'A four-bar tune over the steady two-beat hasapiko pulse. The first half circles the tonic through Eb and F#; the second climbs to A and Bb before falling home.',
      notes: '@3 [D] q d4 e eb4 f#4 q g4 f#4 | e eb4 f#4 eb4 d4 h d4 | [Gm] e a4 g4 f#4 g4 a4 bb4 q a4 | [D] e g4 f#4 eb4 f#4 h d4 |',
    },
    {
      id: 'gr-misirlou', title: 'Misirlou, main theme', source: 'Traditional (theme, simplified)', key: 'E Hitzazkiar', tempo: 96,
      scale: { root: 'E', id: 'gr_hitzazkiar' },
      about: 'The eastern Mediterranean tune claimed by Greek, Lebanese, Egyptian and Turkish musicians alike. This is a simplified outline of the theme, all on the first string so you can see the mode\'s two wide steps. Check phrasing against a recording, and tremolo-pick the long notes.',
      notes: '[E] q. 1/0 e 1/1 q 1/4 1/5 | q. 1/7 e 1/8 q 1/11 1/8 | w 1/7 | e 1/7 1/8 1/7 1/5 h 1/4 | [Dm] e 1/5 1/7 1/5 1/4 h 1/1 | [E] e 1/4 1/5 1/4 1/1 h 1/0 |',
    },
    {
      id: 'gr-kalamatianos', title: 'Kalamatianos in 7/8', source: 'Original study', key: 'D major (Rast)', meter: '7/8', tempo: 126,
      scale: { root: 'D', id: 'gr_rast' },
      about: 'The national dance rhythm: seven eighths felt as long-short-short (3+2+2). The click marks the three pulses. Clap it first, then play; the long beat always comes first.',
      notes: '@2 [D] e d4 e4 f#4 q a4 f#4 | [G] e g4 f#4 e4 q d4 e4 | [D] e f#4 g4 a4 q b4 a4 | [A] q. f#4 q e4 [D] d4 |',
    },
    {
      id: 'gr-ousak', title: 'Ousak phrase on E', source: 'Original study', key: 'E Ousak', tempo: 84,
      scale: { root: 'E', id: 'gr_ousak' },
      about: 'Ousak leans on its flat second: F falls to E like a sigh. The phrase climbs to C and then settles downward in steps, touching F last every time.',
      notes: '@0 [Em] e a4 b4 c5 b4 a4 g4 f4 g4 | e a4 g4 f4 g4 q f4 e4 | [Dm] e b4 a4 g4 a4 q g4 f4 | [Em] e e4 f4 g4 f4 h e4 |',
    },
    {
      id: 'gr-hitzazkiar-run', title: 'Hitzazkiar sequence, bouzouki style', source: 'Original study', key: 'D Hitzazkiar', tempo: 84, flats: true,
      scale: { root: 'D', id: 'gr_hitzazkiar' },
      about: 'A rising sequence in sixteenths of the kind bouzouki players use to open a taximi: four notes up, back one, four notes up. Both wide steps of the mode (Eb-F# and Bb-C#) pass under your fingers.',
      notes: '@3 [D] s d4 eb4 f#4 g4 eb4 f#4 g4 a4 f#4 g4 a4 bb4 g4 a4 bb4 c#5 | q d5 e c#5 bb4 q a4 r |',
    },
  ]);
})();
