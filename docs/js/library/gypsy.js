/* Gypsy jazz (jazz manouche) in the Django Reinhardt tradition. */
(function () {
  const L = window.GP.library;
  const AM6 = '6/5+4/4+3/5+2/5';
  const DM6 = '5/5+4/3+3/4+2/6';
  const E7 = '5/7+4/6+3/7+2/5';

  L.add('gypsy', [
    {
      id: 'gj-am6-arp', title: 'Am6 arpeggio with chromatic approaches', tags: ['Django Reinhardt'], source: 'Original study in Django\'s vocabulary', key: 'A minor', tempo: 120, swing: true,
      about: 'Minor chords in this style are minor sixths: A, C, E, F#. Each chord tone is approached from the half step below (G# into A, D# into E), which gives the line its bite. Rest strokes, mostly down.',
      notes: '@4 [Am6] e g#3 a3 c4 e4 f#4 a4 c5 b4 | e a4 f#4 e4 d#4 e4 c4 q a3 |',
    },
    {
      id: 'gj-dim-run', title: 'Diminished run over E7 into Am', tags: ['Django Reinhardt'], source: 'Original study in Django\'s vocabulary', key: 'A minor', tempo: 116, swing: true,
      scale: { root: 'G#', id: 'dim_wh' },
      about: 'The diminished 7th arpeggio from the third of E7 (G#, B, D, F) climbs in minor thirds, then drops through Am6. Django played runs like this with two fingers, shifting up one string.',
      notes: '@4 [E7b9] e g#3 b3 d4 f4 g#4 b4 d5 f5 | [Am6] e e5 c5 a4 f#4 h e4 |',
    },
    {
      id: 'gj-minor-swing-chorus', title: 'Chorus on Minor Swing changes', tags: ['Django Reinhardt'], source: 'Django\'s changes (Am6, Dm6, E7); original study line', key: 'A minor', tempo: 132, swing: true,
      scale: { root: 'A', id: 'harm_minor' },
      about: 'Eight bars over the real Minor Swing progression. Arpeggios outline each chord: Am6, Dm6 (with its B natural), and E7 as a diminished shape. Turn on Chords to hear the harmony under your line.',
      notes: '@5 [Am6] e e4 a4 c5 a4 q e4 e c4 e4 | [Dm6] e f4 a4 d5 a4 q f4 e d4 f4 | [E7] e g#4 b4 d5 f5 e5 d5 b4 g#4 | [Am6] q a4 e e4 c4 h a3 | [Dm6] e d4 f4 a4 b4 d5 b4 a4 f4 | [Am6] e e4 a4 c5 e5 q c5 a4 | [E7] e b4 g#4 f4 d4 b3 d4 f4 g#4 | [Am6] h a4 r |',
    },
    {
      id: 'gj-chromatic', title: 'One-string chromatic run', tags: ['Django Reinhardt'], source: 'Traditional Django device', key: 'E', tempo: 96,
      about: 'A full octave of half steps on the first string in triplets, then vibrato on the top note. Django slid one finger for several frets at a time; try 1-2-3 then shift, and also one finger sliding.',
      notes: 'et 1/0 1/1 1/2 1/3 1/4 1/5 1/6 1/7 1/8 1/9 1/10 1/11 | h 1/12~ r |',
    },
    {
      id: 'gj-pompe', title: 'La pompe: rhythm on Am6, Dm6, E7', tags: ['Django Reinhardt'], source: 'Traditional rhythm pattern', key: 'A minor', tempo: 120,
      about: 'The rhythm guitar engine of the style. Four strums to the bar: beats 1 and 3 long and low, beats 2 and 4 short and choked by lifting the fretting hand. These are the standard Django grips; see the Gypsy jazz chord family.',
      notes: `[Am6] q ${AM6} ${AM6} ${AM6} ${AM6} | [Dm6] q ${DM6} ${DM6} ${DM6} ${DM6} | [E7] q ${E7} ${E7} ${E7} ${E7} | [Am6] q ${AM6} ${AM6} h ${AM6} |`,
    },
    {
      id: 'gj-g69-ending', title: 'G 6/9 arpeggio ending', tags: ['Django Reinhardt'], source: 'Original study in Django\'s vocabulary', key: 'G major', tempo: 100,
      scale: { root: 'G', id: 'maj_pent' },
      about: 'Major chords get the sixth and ninth instead of the major seventh. This triplet arpeggio sweeps G-B-D-E up three octaves to finish a tune; pick straight through the strings with rest strokes.',
      notes: '@2 [G6/9] et g3 b3 d4 e4 g4 a4 @7 b4 d5 e5 q g5 |',
    },
  ]);
})();
