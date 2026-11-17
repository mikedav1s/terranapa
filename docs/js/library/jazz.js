/* Jazz: bebop vocabulary, Coltrane studies, Wes Montgomery studies.
   Rhythm notes: eighths swing (the feel engine sets the ratio from the tempo). Bebop lines
   usually start on an off-beat, accent the off-beats and the high points, ghost some
   down-beats (_), and end on a short accented note ("doo-DAT"). */
(function () {
  const L = window.GP.library;

  L.add('jazz', [
    {
      id: 'jz-251-arp', title: 'ii-V-I in C: arpeggio up, scale down', source: 'Original study (bebop vocabulary)', key: 'C major', tempo: 132,
      about: 'The most reused sentence in jazz, phrased like a horn player. It starts on the "and" of 1, accents the top of the Dm7 arpeggio, turns with a triplet on G7, and ends on a short, accented C ("doo-DAT").',
      notes: '@5 [Dm7] e r d4 f4 a4 c5> b4 a4_ g4 | [G7] et f4 g4 f4 e e4 d4_ f4 a4> b4 d5 | [Cmaj7] e c5> - b4 g4 e4 c5. q r |',
    },
    {
      id: 'jz-251-b9', title: 'ii-V-I with a flat 9 and an enclosure', source: 'Original study (bebop vocabulary)', key: 'C major', tempo: 126, flats: true,
      scale: { root: 'G', id: 'dim_hw' },
      about: 'Dm7 from its third, then G7b9 spelled downward. The last two eighths of bar 2 (F and D#) surround the target E from above and below so it lands on beat 1: an enclosure, the bebop way of leaning on a chord tone.',
      notes: '@7 [Dm7] e r f4 a4 c5 e5> d5 c5 a4_ | [G7b9] e b4 d5 ab4> - f4 d4_ f4 d#4 | [Cmaj7] q e4> e g4 b4 d5> c5. q r |',
    },
    {
      id: 'jz-minor-251', title: 'Minor ii-V-i in A minor', source: 'Original study (bebop vocabulary)', key: 'A minor', tempo: 116,
      scale: { root: 'A', id: 'harm_minor' },
      about: 'Bm7b5 arpeggio up from the "and", a triplet turn on E7b9, then G# pulling into A on the downbeat. Hold the A across beat 2 before the closing figure.',
      notes: '@4 [Bm7b5] e r b3 d4 f4 a4> - g#4 f4 | [E7b9] et e4 f4 e4 e d4 b3_ g#3> b3 d4 g#4> | [Am6] q a4> e - e4 f#4 c4 q a3. |',
    },
    {
      id: 'jz-bebop-dom', title: 'Bebop dominant scale, G7 to C', source: 'Traditional bebop device', key: 'C major', tempo: 132,
      scale: { root: 'G', id: 'bebop_dom' },
      about: 'Add F# between G and F and an eight-note scale appears whose chord tones (G, F, D, B) all land on the beat. Run it down from the root, ghost the passing tones, and finish with a triplet turn into a short C.',
      notes: '@2 [G7] e g4> f#4_ f4 e4_ d4 c4_ b3 a3_ | [C6] et g3 a3 g3 e e3 g3 c4> e4 d4. r |',
    },
    {
      id: 'jz-turnaround-bb', title: 'I-VI-ii-V turnaround in Bb', source: 'Original study (rhythm changes)', key: 'Bb major', tempo: 120, flats: true,
      about: 'Two beats per chord. Each arpeggio starts on the "and" or lands on the third, the Cm7 bar starts with a triplet, and the F7 bar anticipates the return to Bb.',
      notes: '@5 [Bbmaj7] e r d4 f4 a4> [G7b9] ab4 f4 d4_ b3 | [Cm7] et c4 d4 eb4 e g4 bb4> [F7] a4 - g4 eb4 | [Bb6] q d4> e c4 bb3 h - |',
    },
    {
      id: 'jz-minor-blues', title: 'Minor blues riff in C', source: 'Original study', key: 'C minor', tempo: 138, flats: true,
      scale: { root: 'C', id: 'min_pent' }, pos: 8,
      about: 'A riff for the first four bars of a fast minor blues such as Mr. P.C. Call (bar 1), short answer that starts on beat 2 (bar 2), call again, then a triplet tag. The rests are part of the riff.',
      notes: '@8 [Cm7] e r c4 eb4 f4 g4> bb4 g4. r | q r e bb3 c4 eb4> - c4. r | e r c4 eb4 f4 g4> bb4 c5> - | e bb4 g4 f4 eb4 et c4 eb4 c4 q bb3. |',
    },

    /* ---- Coltrane ---- */
    {
      id: 'ct-giant-steps-cells', title: 'Giant Steps changes: 1-2-3-5 cells', tags: ['John Coltrane'], source: 'Coltrane\'s changes; study line in his digital-pattern method', key: 'B / G / Eb', tempo: 150,
      about: 'The real chord changes of the first eight bars, played the way Coltrane built his solo: four-note cells (1-2-3-5 up, 5-3-2-1 down) on every chord. Accent the first note of each cell; that is where the key changes. At this tempo the swing is lighter, as it was on the record. Loop two bars at a time at 50% first.',
      notes: '@6 [Bmaj7] e b3> c#4 d#4 f#4 [D7] a4> f#4 e4 d4 | @3 [Gmaj7] e g3> a3 b3 d4 [Bb7] f4> d4 c4 bb3 | @5 [Ebmaj7] e eb4> f4 g4 bb4 - g4 f4 eb4 | [Am7] e a3> c4 d4 e4 [D7] d4> e4 f#4 a4 | @7 [Gmaj7] e d5> b4 a4 g4 @5 [Bb7] bb3> c4 d4 f4 | [Ebmaj7] e eb4> f4 g4 bb4 @6 [F#7] c#5> a#4 g#4 f#4 | [Bmaj7] e b3> c#4 d#4 f#4 - d#4 c#4 b3 | @3 [Fm7] e f3> ab3 bb3 c4 [Bb7] bb3> c4 d4 f4 | [Ebmaj7] q eb4> h. r |',
    },
    {
      id: 'ct-pentatonics', title: 'Stacked pentatonics on Dm7', tags: ['John Coltrane'], source: 'Original study in Coltrane\'s modal vocabulary', key: 'D Dorian', tempo: 132,
      scale: { root: 'D', id: 'dorian' },
      about: 'Over one long D minor chord (Impressions, So What), Coltrane moved between D, A and E minor pentatonic, and between eighths, triplets and sixteenth-note bursts. Bar 2 is a "sheet": sixteenths in one breath, then back to swing.',
      notes: '@10 [Dm7] e r d4 f4 g4 a4> c5 a4_ g4 | s f4 g4 a4 c5 d5> c5 a4 g4 e a4 c5> - d5 | @7 e e5> d5 b4 a4 et g4 a4 g4 e e4 g4 | et a4 b4 a4 et g4 e4 d4 h d4~ |',
    },
    {
      id: 'ct-minor-third-cycle', title: 'Sheets of sound: minor-third cycle over G7', tags: ['John Coltrane'], source: 'Original study in Coltrane\'s vocabulary', key: 'C major', tempo: 80, flats: true,
      scale: { root: 'G', id: 'dim_hw' },
      about: 'Four dominant arpeggios a minor third apart (G7, Bb7, Db7, E7) packed into one bar, all from the same diminished scale, resolving to C. The sixteenths stay straight even in a swing tune; accent the start of each arpeggio and let the last C ring.',
      notes: '[G7] s g3> b3 d4 f4 bb3> d4 f4 ab4 db4> f4 ab4 b4 e4> g#4 b4 d5 | [Cmaj7] q c5> - h r |',
    },

    /* ---- Wes Montgomery ---- */
    {
      id: 'wm-octaves-f', title: 'Octaves: blues phrase in F', tags: ['Wes Montgomery'], source: 'Original study in Wes Montgomery\'s vocabulary', key: 'F blues', tempo: 112, flats: true,
      scale: { root: 'F', id: 'blues' },
      about: 'Every note doubled an octave up on strings 5 and 3, the string between them muted. Wes phrased octaves like a horn: phrases start on the "and", the high note is tied across the beat, and the answer is short. Try it with the thumb, no pick.',
      notes: '[F7] e r 5/8+3/10 5/11+3/13> - 5/8+3/10 5/6+3/8 q 5/8+3/10. | [Bb7] e r 5/11+3/13> - 5/10+3/12 5/8+3/10 5/5+3/7 q 5/6+3/8> | [F7] et 5/3+3/5 5/6+3/8 5/7+3/9 e 5/8+3/10> - h - |',
    },
    {
      id: 'wm-three-tiers', title: 'Three tiers: line, octaves, block chords', tags: ['Wes Montgomery'], source: 'Original study in Wes Montgomery\'s vocabulary', key: 'D minor', tempo: 104,
      scale: { root: 'D', id: 'dorian' },
      about: 'Wes built solos in three stages. The same two-bar melody, with the same syncopated rhythm, appears as a single line, then in octaves, then harmonised with chords. Learn the melody by ear first, then find each version.',
      notes: '@5 [Dm7] e r a4> - g4 f4 d4. q r | e r c4 d4 f4 g4> a4 q - | e r 4/7+2/10> - 4/5+2/8 4/3+2/6 5/5+3/7. q r | e r 5/3+3/5 5/5+3/7 4/3+2/6 4/5+2/8> 4/7+2/10 q - | e r 4/3+3/5+2/3+1/5> - 4/2+3/2+2/1+1/3 4/0+3/2+2/1+1/1 4/3+3/2+2/3. q r | e r 4/2+3/2+2/1 4/3+3/2+2/3 4/0+3/2+2/1+1/1 4/2+3/2+2/1+1/3> 4/3+3/5+2/3+1/5 q - |',
    },
    {
      id: 'wm-ii-v-f', title: 'ii-V-I in F, thumb style', tags: ['Wes Montgomery'], source: 'Original study in Wes Montgomery\'s vocabulary', key: 'F major', tempo: 116, flats: true,
      about: 'A relaxed line that anticipates the C7 by an eighth and uses one altered note (Db, the flat 9) to pull into F. All downstrokes with the thumb if you want his sound; it forces you to phrase like a horn player.',
      notes: '@3 [Gm7] e r d4 bb3 g3_ a3 bb3 d4 e4> | [C7] e - g4 e4 db4> c4 bb3_ g3 a3 | [Fmaj7] et bb3 a3 g3 q a3> e c4 a3. q r |',
    },
  ]);
})();
