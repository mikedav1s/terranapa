/* Lebanese / Levantine: maqam studies. Quarter tones are written as a fretted note with a
   quarter-tone bend ("1/4" in the tab). Rhythm notes: the percussion cycle (iqa') sets the
   accents: doum strokes are heavy, tek strokes light; melodies ornament with turns. */
(function () {
  const L = window.GP.library;

  L.add('lebanese', [
    {
      id: 'lb-hijaz', title: 'Maqam Hijaz on D', source: 'Original study (traditional sayr)', key: 'D Hijaz', tempo: 84, flats: true,
      scale: { root: 'D', id: 'ar_hijaz' },
      about: 'A maqam has a path as well as a scale. Hijaz usually opens by showing the lower tetrachord (D, Eb, F#, G) and its fall to the tonic, then rises to A and Bb before the full descent. Over the maqsum rhythm, phrases start after the doum.',
      notes: '@3 [D] e r a4> g4 f#4 et g4 f#4 eb4 q d4~ | e d4 eb4 f#4> g4 q a4 e bb4 a4 | et c5 bb4 a4 e g4 f#4 g4 eb4 q d4~> |',
    },
    {
      id: 'lb-kurd-dabke', title: 'Maqam Kurd: dabke riff', source: 'Original study', key: 'D Kurd', tempo: 112, flats: true, groove: 'baladi',
      scale: { root: 'D', id: 'ar_kurd' },
      about: 'A stomping line for the dabke line dance, the kind a mijwiz or buzuq repeats while the dancers lock in. The accents fall with the two opening doum strokes of the baladi rhythm, and each bar holds a note across beat 3, where the dancers stamp.',
      notes: '@3 [Dm] e d4> d4> eb4 f4> - eb4 d4. r | e d4> eb4> f4 g4> - f4 eb4 d4 | e f4> g4> a4 bb4> - a4 g4 f4 | e eb4> f4> eb4 d4> - r q r |',
    },
    {
      id: 'lb-bayati', title: 'Maqam Bayati with quarter-tone bends', source: 'Original study', key: 'D Bayati', tempo: 76, flats: true,
      scale: { root: 'D', id: 'ar_bayati' },
      about: 'Bayati\'s second degree sits between Eb and E. Fret the Eb and push it up slightly, a quarter tone, wherever the tab shows a 1/4 bend. The triplet turns around that note are how singers and oud players show it off; listen to the guide notes for the exact pitch.',
      notes: '@3 [D] q d4> et eb4q f4 eb4q q d4 e f4 g4 | q. a4> e g4 et f4 g4 f4 q eb4q | e r g4 a4 bb4> q a4 et g4 a4 g4 | e f4 g4 f4 eb4q h d4~ |',
    },
    {
      id: 'lb-nahawand-samai', title: 'Maqam Nahawand in sama\'i thaqil (10/8)', source: 'Original study', key: 'C Nahawand', meter: '10/8', tempo: 132, flats: true,
      scale: { root: 'C', id: 'ar_nahawand' },
      about: 'The ten-beat cycle of the sama\'i form and of Lamma Bada Yatathanna, grouped 3+2+2+3. The melody follows the cycle: a long note on the first doum, short notes leading to the second group. Turn Band on to hear the darbuka pattern.',
      notes: '@3 [Cm] q. g4> q ab4 g4 e f4 eb4 d4 | q. eb4> q f4 eb4 q. d4 | e c4> d4 eb4 q f4 g4> e ab4 g4 f4 | [G] q. eb4> q d4 b3 [Cm] q. c4~ |',
    },
    {
      id: 'lb-rast', title: 'Maqam Rast on C', source: 'Original study', key: 'C Rast', tempo: 80, flats: true,
      scale: { root: 'C', id: 'ar_rast' },
      about: 'Rast is the foundation of the maqam system. Its third and seventh are half-flat: fret Eb and Bb and bend each up a quarter tone. Triplet turns show off the neutral third; compare it with plain C major to hear what it does.',
      notes: '@3 [C] q c4> e d4 eb4q q f4 et g4 f4 eb4q | q g4> e a4 bb4q c5> bb4q q a4 | et g4 a4 g4 e f4 eb4q q d4 e eb4q d4 | h c4~> h r |',
    },
  ]);
})();
