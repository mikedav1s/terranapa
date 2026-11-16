/* Jazz: bebop vocabulary, Coltrane studies, Wes Montgomery studies. */
(function () {
  const L = window.GP.library;

  L.add('jazz', [
    {
      id: 'jz-251-arp', title: 'ii-V-I in C: arpeggio up, scale down', source: 'Original study (bebop vocabulary)', key: 'C major', tempo: 120, swing: true,
      about: 'The most reused sentence in jazz. Dm7 arpeggio 1-3-5-7 rising, then down the G7 scale from its third so the line lands on E, the third of C. Sing the last note before you play it.',
      notes: '@5 [Dm7] e d4 f4 a4 c5 [G7] b4 a4 g4 f4 | [Cmaj7] e e4 g4 b4 d5 q c5 r |',
    },
    {
      id: 'jz-251-b9', title: 'ii-V-I with a flat 9 and an enclosure', source: 'Original study (bebop vocabulary)', key: 'C major', tempo: 120, swing: true, flats: true,
      scale: { root: 'G', id: 'dim_hw' },
      about: 'Dm7 from its third (3-5-7-9), then G7b9 spelled downward: D, B, Ab, F. The target E is enclosed from above and below (F, D#, E), the bebop way of leaning on a chord tone.',
      notes: '@7 [Dm7] e f4 a4 c5 e5 [G7b9] d5 b4 ab4 f4 | [Cmaj7] e e4 g4 f4 d#4 q e4 r |',
    },
    {
      id: 'jz-minor-251', title: 'Minor ii-V-i in A minor', source: 'Original study (bebop vocabulary)', key: 'A minor', tempo: 112, swing: true,
      scale: { root: 'A', id: 'harm_minor' },
      about: 'Bm7b5 arpeggio up, E7b9 down through G# and F, resolving into an Am6 arpeggio. The G# to A half step is the whole point of the phrase.',
      notes: '@4 [Bm7b5] e b3 d4 f4 a4 [E7b9] g#4 f4 d4 b3 | [Am6] e c4 e4 f#4 a4 q e4 r |',
    },
    {
      id: 'jz-bebop-dom', title: 'Bebop dominant scale, G7 to C', source: 'Traditional bebop device', key: 'C major', tempo: 126, swing: true,
      scale: { root: 'G', id: 'bebop_dom' },
      about: 'Add F# between G and F and an eight-note scale appears whose chord tones (G, F, D, B) all land on the beat. Run it down from the root and it delivers you to the next chord on time.',
      notes: '@2 [G7] e g4 f#4 f4 e4 d4 c4 b3 a3 | [C6] q g3 e e3 g3 h c4 |',
    },
    {
      id: 'jz-turnaround-bb', title: 'I-VI-ii-V turnaround in Bb', source: 'Original study (rhythm changes)', key: 'Bb major', tempo: 116, swing: true, flats: true,
      about: 'Two beats per chord, one arpeggio each, alternating direction: Bbmaj7 up, G7b9 down from its flat 9, Cm7 up, F7 down. The basis of soloing on rhythm changes.',
      notes: '@5 [Bbmaj7] e bb3 d4 f4 a4 [G7b9] ab4 f4 d4 b3 | [Cm7] e c4 eb4 g4 bb4 [F7] a4 g4 f4 eb4 | [Bb6] w d4 |',
    },
    {
      id: 'jz-minor-blues', title: 'Minor blues riff in C', source: 'Original study', key: 'C minor', tempo: 132, swing: true, flats: true,
      scale: { root: 'C', id: 'min_pent' }, pos: 8,
      about: 'A riff built for the first four bars of a fast minor blues such as Mr. P.C.: pentatonic up, a rest, a short answer, and a full stop.',
      notes: '@8 [Cm7] e c4 eb4 f4 g4 bb4 g4 f4 eb4 | q c4 r e bb3 c4 q eb4 | e f4 g4 f4 eb4 c4 bb3 q c4 | h c4 r |',
    },

    /* ---- Coltrane ---- */
    {
      id: 'ct-giant-steps-cells', title: 'Giant Steps changes: 1-2-3-5 cells', tags: ['John Coltrane'], source: 'Coltrane\'s changes; study line in his digital-pattern method', key: 'B / G / Eb', tempo: 150,
      about: 'The real chord changes of the first eight bars, played the way Coltrane built his solo: four-note cells (1-2-3-5 up, 5-3-2-1 down) on every chord. Loop two bars at a time at 50% until each key change is a hand position you can see coming.',
      notes: '@6 [Bmaj7] e b3 c#4 d#4 f#4 [D7] a4 f#4 e4 d4 | @3 [Gmaj7] e g3 a3 b3 d4 [Bb7] f4 d4 c4 bb3 | @5 [Ebmaj7] e eb4 f4 g4 bb4 bb4 g4 f4 eb4 | [Am7] e a3 c4 d4 e4 [D7] d4 e4 f#4 a4 | @7 [Gmaj7] e d5 b4 a4 g4 @5 [Bb7] bb3 c4 d4 f4 | [Ebmaj7] e eb4 f4 g4 bb4 @6 [F#7] c#5 a#4 g#4 f#4 | [Bmaj7] e b3 c#4 d#4 f#4 f#4 d#4 c#4 b3 | @3 [Fm7] e f3 ab3 bb3 c4 [Bb7] bb3 c4 d4 f4 | [Ebmaj7] w eb4 |',
    },
    {
      id: 'ct-pentatonics', title: 'Stacked pentatonics on Dm7', tags: ['John Coltrane'], source: 'Original study in Coltrane\'s modal vocabulary', key: 'D Dorian', tempo: 132,
      scale: { root: 'D', id: 'dorian' },
      about: 'Over one long D minor chord (Impressions, So What), Coltrane played minor pentatonics from different degrees. D minor pentatonic is home; A minor and E minor pentatonic add the 9th and 13th without leaving the mode.',
      notes: '@10 [Dm7] e d4 f4 g4 a4 c5 a4 g4 f4 | e a4 c5 d5 e5 d5 c5 a4 g4 | @7 e e4 g4 a4 b4 d5 b4 a4 g4 | e f4 a4 g4 f4 h d4 |',
    },
    {
      id: 'ct-minor-third-cycle', title: 'Sheets of sound: minor-third cycle over G7', tags: ['John Coltrane'], source: 'Original study in Coltrane\'s vocabulary', key: 'C major', tempo: 84, flats: true,
      scale: { root: 'G', id: 'dim_hw' },
      about: 'Four dominant arpeggios a minor third apart (G7, Bb7, Db7, E7) crammed into one bar of G7, all drawn from the same diminished scale, resolving to C. Start at half tempo; the fingering shape repeats three frets higher each time.',
      notes: '[G7] s g3 b3 d4 f4 bb3 d4 f4 ab4 db4 f4 ab4 b4 e4 g#4 b4 d5 | [Cmaj7] w c5 |',
    },

    /* ---- Wes Montgomery ---- */
    {
      id: 'wm-octaves-f', title: 'Octaves: blues phrase in F', tags: ['Wes Montgomery'], source: 'Original study in Wes Montgomery\'s vocabulary', key: 'F blues', tempo: 112, swing: true, flats: true,
      scale: { root: 'F', id: 'blues' },
      about: 'Every note doubled an octave up on strings 5 and 3, the string between them muted by the fretting hand. Wes brushed these with the flesh of his thumb; try it without a pick for the round attack.',
      notes: '[F7] q 5/8+3/10 e 5/11+3/13 5/8+3/10 q 5/6+3/8 5/8+3/10 | [Bb7] q 5/11+3/13 e 5/10+3/12 5/8+3/10 h 5/5+3/7 | [F7] e 5/3+3/5 5/6+3/8 5/7+3/9 5/8+3/10 h 5/8+3/10 |',
    },
    {
      id: 'wm-three-tiers', title: 'Three tiers: line, octaves, block chords', tags: ['Wes Montgomery'], source: 'Original study in Wes Montgomery\'s vocabulary', key: 'D minor', tempo: 104, swing: true,
      scale: { root: 'D', id: 'dorian' },
      about: 'Wes built solos in three stages. The same two-bar melody appears here as a single line, then in octaves, then harmonised with chords under it. Learn the melody by ear first, then find each version.',
      notes: '@5 [Dm7] q a4 e g4 f4 q d4 r | e c4 d4 f4 g4 h a4 | q 4/7+2/10 e 4/5+2/8 4/3+2/6 q 5/5+3/7 r | e 5/3+3/5 5/5+3/7 4/3+2/6 4/5+2/8 h 4/7+2/10 | q 4/3+3/5+2/3+1/5 e 4/2+3/2+2/1+1/3 4/0+3/2+2/1+1/1 q 4/3+3/2+2/3 r | e 4/2+3/2+2/1 4/3+3/2+2/3 4/0+3/2+2/1+1/1 4/2+3/2+2/1+1/3 h 4/3+3/5+2/3+1/5 |',
    },
    {
      id: 'wm-ii-v-f', title: 'ii-V-I in F, thumb style', tags: ['Wes Montgomery'], source: 'Original study in Wes Montgomery\'s vocabulary', key: 'F major', tempo: 116, swing: true, flats: true,
      about: 'A relaxed line through Gm7 and C7 with one altered note (Db, the flat 9) pulling into F. All downstrokes with the thumb if you want his sound; it forces you to phrase like a horn player.',
      notes: '@3 [Gm7] e d4 bb3 g3 a3 bb3 d4 f4 a4 | [C7] e g4 e4 db4 c4 bb3 g3 a3 bb3 | [Fmaj7] q c4 a3 h f3 |',
    },
  ]);
})();
