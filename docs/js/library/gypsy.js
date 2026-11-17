/* Gypsy jazz (jazz manouche) in the Django Reinhardt tradition.
   Rhythm notes: a lighter swing than bebop over a driving la pompe, strong rest-stroke
   accents, phrases that start after the beat, triplet arpeggios and long vibrato notes. */
(function () {
  const L = window.GP.library;
  const AM6 = '6/5+4/4+3/5+2/5';
  const DM6 = '5/5+4/3+3/4+2/6';
  const E7 = '5/7+4/6+3/7+2/5';

  L.add('gypsy', [
    {
      id: 'gj-am6-arp', title: 'Am6 arpeggio with chromatic approaches', tags: ['Django Reinhardt'], source: 'Original study in Django\'s vocabulary', key: 'A minor', tempo: 120,
      about: 'Minor chords in this style are minor sixths: A, C, E, F#. Each chord tone is approached from the half step below (G# into A, D# into E). The line climbs from the "and", turns at the top with a triplet, and ends on a long A with a wide vibrato.',
      notes: '@4 [Am6] e r g#3 a3 c4 e4> f#4 a4 c5> | et b4 c5 b4 e a4 f#4 e4. r q d#4 | e e4> c4 h a3~ q r |',
    },
    {
      id: 'gj-dim-run', title: 'Diminished run over E7 into Am', tags: ['Django Reinhardt'], source: 'Original study in Django\'s vocabulary', key: 'A minor', tempo: 116,
      scale: { root: 'G#', id: 'dim_wh' },
      about: 'The diminished 7th arpeggio from the third of E7 (G#, B, D, F) climbs in triplets, holds at the top, then falls through Am6. Django played runs like this with two fingers, shifting up one string per group.',
      notes: '@4 [E7b9] et g#3> b3 d4 f4> g#4 b4 d5> f5 g#5 e - f5 | [Am6] et e5> c5 a4 f#4 e4 c4 h a3~ |',
    },
    {
      id: 'gj-minor-swing-chorus', title: 'Chorus on Minor Swing changes', tags: ['Django Reinhardt'], source: 'Django\'s changes (Am6, Dm6, E7); original study line', key: 'A minor', tempo: 132,
      scale: { root: 'A', id: 'harm_minor' },
      about: 'Eight bars over the real first eight bars of Minor Swing: two bars each of Am6, Dm6, E7 and Am6. Every phrase starts after the beat and ends with a held, vibrated note or a short accent. Turn on Band for the la pompe rhythm.',
      notes: '@5 [Am6] q r e e4 a4 c5> - b4 a4 | et e4 f4 e4 e c4 a3 q e4> e - r | [Dm6] e r f4 a4 b4 d5> - a4 f4 | et d5 e5 d5 e b4 a4 h f4~ | [E7] e r g#4 b4 d5 f5> - e5 d5 | et b4 c5 b4 e g#4 f4 d4 b3 g#3 b3 | [Am6] q a3> e c4 e4 a4 c5> e5. r | h a4~ q - r |',
    },
    {
      id: 'gj-chromatic', title: 'One-string chromatic run', tags: ['Django Reinhardt'], source: 'Traditional Django device', key: 'E', tempo: 96,
      about: 'A full octave of half steps on the first string in triplets, accented in threes, then a held E with vibrato. Django slid one finger for several frets at a time; try 1-2-3 then shift, and also one finger sliding.',
      notes: 'et 1/0> 1/1 1/2 1/3> 1/4 1/5 1/6> 1/7 1/8 1/9> 1/10 1/11 | h 1/12~> q - r |',
    },
    {
      id: 'gj-pompe', title: 'La pompe: rhythm on Am6, Dm6, E7', tags: ['Django Reinhardt'], source: 'Traditional rhythm pattern', key: 'A minor', tempo: 120,
      about: 'The rhythm guitar engine of the style. Four downstrokes to the bar: beats 1 and 3 ring briefly, beats 2 and 4 are accented and choked short by lifting the fretting hand. The tiny upstroke before 2 and 4 is the "pump". Swing it lightly.',
      notes: `[Am6] q ${AM6} ${AM6}>. ${AM6} ${AM6}>. | [Dm6] q ${DM6} ${DM6}>. ${DM6} ${DM6}>. | [E7] q ${E7} ${E7}>. ${E7} ${E7}>. | [Am6] q ${AM6} ${AM6}>. h ${AM6} |`,
    },
    {
      id: 'gj-g69-ending', title: 'G 6/9 arpeggio ending', tags: ['Django Reinhardt'], source: 'Original study in Django\'s vocabulary', key: 'G major', tempo: 100,
      scale: { root: 'G', id: 'maj_pent' },
      about: 'Major chords get the sixth and ninth instead of the major seventh. This triplet arpeggio sweeps G-B-D-E up three octaves from the "and" of 1 and holds the top G with a slow, wide vibrato to end a tune.',
      notes: '@2 [G6/9] e r et g3 b3 d4 e4 g4 a4 @7 b4 d5 e5 e g5~> | w - |',
    },
  ]);
})();
