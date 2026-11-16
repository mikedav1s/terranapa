/* Classical: public-domain themes. Pitches sound an octave below the keyboard/violin
   originals, as guitar music is conventionally written. */
(function () {
  const L = window.GP.library;
  const ROM = (top, b2, b3) => `${top} ${b2} ${b3}`;

  L.add('classical', [
    {
      id: 'cl-bach-bourree', title: 'Bourree in E minor, opening', tags: ['J.S. Bach'], source: 'J.S. Bach, Lute Suite BWV 996 (upper voice, bars 1-4)', key: 'E minor', tempo: 96,
      scale: { root: 'E', id: 'harm_minor' },
      about: 'The upper voice of the first phrase. Notice the long-short-short rhythm and how the line walks down an octave and a half from G to low E. Once it is fluent, try adding the bass line underneath.',
      notes: '@0 e e4 f#4 | q g4 e f#4 e4 q d#4 e e4 f#4 | q b3 e c#4 d#4 q e4 e d4 c4 | q b3 e a3 g3 q f#3 e g3 a3 | e b3 a3 g3 f#3 q e3 |',
    },
    {
      id: 'cl-bach-minuet', title: 'Minuet in G', tags: ['J.S. Bach'], source: 'Christian Petzold, from the Anna Magdalena Bach Notebook, BWV Anh. 114 (bars 1-16)', key: 'G major', meter: '3/4', tempo: 112,
      scale: { root: 'G', id: 'major' },
      about: 'Long attributed to Bach. A leap, then a scale, then repeated notes: three ideas that make the whole sixteen bars. Play it in second position and keep the quarter notes detached.',
      notes: '@2 [G] q d4 e g3 a3 b3 c4 | q d4 g3 g3 | [C] q e4 e c4 d4 e4 f#4 | [G] q g4 g3 g3 | [C] q c4 e d4 c4 b3 a3 | [G] q b3 e c4 b3 a3 g3 | [D] q f#3 e g3 a3 b3 g3 | q b3 h a3 | [G] q d4 e g3 a3 b3 c4 | q d4 g3 g3 | [C] q e4 e c4 d4 e4 f#4 | [G] q g4 g3 g3 | [C] q c4 e d4 c4 b3 a3 | [G] q b3 e c4 b3 a3 g3 | [D] q a3 e b3 a3 g3 f#3 | [G] h. g3 |',
    },
    {
      id: 'cl-bach-cello-prelude', title: 'Cello Suite No. 1, Prelude (opening)', tags: ['J.S. Bach'], source: 'J.S. Bach, BWV 1007 (bars 1-4, at cello pitch)', key: 'G major', tempo: 72,
      scale: { root: 'G', id: 'major' },
      about: 'One chord per bar, spelled out as a rocking arpeggio: G, C over G, D7 over G, back to G. Hold the low G and let the upper notes ring. This is harmony taught as melody.',
      notes: '@0 [G] s g2 d3 b3 a3 b3 d3 b3 d3 g2 d3 b3 a3 b3 d3 b3 d3 | [C/G] s g2 e3 c4 b3 c4 e3 c4 e3 g2 e3 c4 b3 c4 e3 c4 e3 | [D7/G] s g2 f#3 c4 b3 c4 f#3 c4 f#3 g2 f#3 c4 b3 c4 f#3 c4 f#3 | [G] s g2 g3 b3 a3 b3 g3 b3 g3 g2 g3 b3 a3 b3 g3 b3 f#3 |',
    },
    {
      id: 'cl-bach-jesu', title: 'Jesu, Joy of Man\'s Desiring', tags: ['J.S. Bach'], source: 'J.S. Bach, from Cantata BWV 147 (bars 1-4)', key: 'G major', meter: '9/8', tempo: 132,
      scale: { root: 'G', id: 'major' },
      about: 'An unbroken stream of triplets, three groups of three in each bar. The melody moves mostly by step with small leaps to chord tones. Keep every eighth even and let the line breathe at the bar lines.',
      notes: '@0 [G] e r g3 a3 b3 d4 c4 c4 e4 d4 | e d4 g4 f#4 g4 d4 b3 g3 a3 b3 | [C] e c4 d4 e4 d4 c4 b3 [D] a3 b3 g3 | e f#3 g3 a3 d3 f#3 a3 c4 b3 a3 | [G] q. b3 r r |',
    },
    {
      id: 'cl-bach-prelude-c', title: 'Prelude in C, opening', tags: ['J.S. Bach'], source: 'J.S. Bach, Well-Tempered Clavier I, BWV 846 (bars 1-4)', key: 'C major', tempo: 66,
      about: 'Each bar is one chord, broken the same way twice: C, Dm7 over C, G7 over B, C. Fret the whole chord first, then pick it apart. A lesson in voice leading: only one or two notes move between bars.',
      notes: '[C] s 5/3 4/2 3/0 2/1 1/0 3/0 2/1 1/0 5/3 4/2 3/0 2/1 1/0 3/0 2/1 1/0 | [Dm7/C] s 5/3 4/0 3/2 2/3 1/1 3/2 2/3 1/1 5/3 4/0 3/2 2/3 1/1 3/2 2/3 1/1 | [G7/B] s 5/2 4/0 3/0 2/3 1/1 3/0 2/3 1/1 5/2 4/0 3/0 2/3 1/1 3/0 2/3 1/1 | [C] s 5/3 4/2 3/0 2/1 1/0 3/0 2/1 1/0 5/3 4/2 3/0 2/1 1/0 3/0 2/1 1/0 |',
    },
    {
      id: 'cl-mozart-nachtmusik', title: 'Eine kleine Nachtmusik, opening', tags: ['Mozart'], source: 'W.A. Mozart, K. 525 (bars 1-4)', key: 'G major', tempo: 126,
      about: 'A theme made of nothing but two arpeggios: G major going up, D7 coming down. Mozart shows that chord tones alone can be a melody if the rhythm is strong.',
      notes: '@2 [G] q g3 e r d3 q g3 e r d3 | e g3 d3 g3 b3 q d4 r | [D7] q c4 e r a3 q c4 e r a3 | e c4 a3 f#3 a3 q d3 r |',
    },
    {
      id: 'cl-mozart-sym40', title: 'Symphony No. 40, first theme', tags: ['Mozart'], source: 'W.A. Mozart, K. 550 (opening)', key: 'G minor', tempo: 108, flats: true,
      scale: { root: 'G', id: 'aeolian' },
      about: 'A falling half step repeated three times, then a leap of a sixth. The second phrase repeats the idea one step lower. Feel the two eighths as a pickup into each quarter note.',
      notes: '@3 e eb4 d4 | [Gm] q d4 e eb4 d4 q d4 e eb4 d4 | q d4 bb4 r e bb4 a4 | q g4 e g4 f4 q eb4 e eb4 d4 | [Cm] q c4 c4 r e d4 c4 | [D7] q c4 e d4 c4 q c4 e d4 c4 | q c4 a4 r e a4 g4 | q f#4 e f#4 eb4 q d4 e d4 c4 | [Gm] q bb3 bb3 r |',
    },
    {
      id: 'cl-mozart-turca', title: 'Rondo alla Turca, opening', tags: ['Mozart'], source: 'W.A. Mozart, Piano Sonata K. 331, third movement (bars 1-8)', key: 'A minor', meter: '2/4', tempo: 100,
      scale: { root: 'A', id: 'harm_minor' },
      about: 'Each four-note turn circles the note it is heading for (B-A-G#-A lands on C), climbing the A minor arpeggio. A study in neighbour tones that transfers directly to bebop enclosures and metal trills.',
      notes: '@4 s b3 a3 g#3 a3 | [Am] e c4 r s d4 c4 b3 c4 | e e4 r s f4 e4 d#4 e4 | s b4 a4 g#4 a4 b4 a4 g#4 a4 | q c5 e a4 c5 | [Em] e b4 a4 g4 a4 | e b4 a4 g4 a4 | e b4 a4 g4 f#4 | q e4 |',
    },
    {
      id: 'cl-beethoven-ode', title: 'Ode to Joy', source: 'L. van Beethoven, Symphony No. 9 (theme)', key: 'C major', tempo: 108,
      scale: { root: 'C', id: 'major' },
      about: 'Entirely stepwise within five notes: the ideal first melody to play by ear in every position. Once you have it here, find it starting on a different string without looking at the tab.',
      notes: '@0 [C] q e4 e4 f4 g4 | g4 f4 e4 d4 | c4 c4 d4 e4 | [G] q. e4 e d4 h d4 | [C] q e4 e4 f4 g4 | g4 f4 e4 d4 | c4 c4 d4 e4 | [G] q. d4 e c4 [C] h c4 |',
    },
    {
      id: 'cl-beethoven-elise', title: 'Fur Elise, opening', source: 'L. van Beethoven, WoO 59 (bars 1-8)', key: 'A minor', meter: '3/8', tempo: 60,
      about: 'The rocking E-D# half step, then broken A minor and E major chords answering from below. Let the arpeggio notes overlap. Tempo counts quarter notes, so the eighth-note pulse is twice the number shown.',
      notes: '@0 s e4 d#4 | [Am] s e4 d#4 e4 b3 d4 c4 | e a3 s r c3 e3 a3 | [E] e b3 s r e3 g#3 b3 | [Am] e c4 s r e3 e4 d#4 | s e4 d#4 e4 b3 d4 c4 | e a3 s r c3 e3 a3 | [E] e b3 s r e3 c4 b3 | [Am] q a3 |',
    },
    {
      id: 'cl-greensleeves', title: 'Greensleeves', source: 'Traditional English, 16th century', key: 'A minor (Dorian)', meter: '6/8', tempo: 90,
      scale: { root: 'A', id: 'dorian' },
      about: 'The first half of the tune in its older Dorian form, with F# rising and G# at the cadences. Two swaying beats to the bar; the click marks them.',
      notes: '@0 e a3 | [Am] q c4 e d4 e. e4 s f#4 e e4 | [G] q d4 e b3 e. g3 s a3 e b3 | [Am] q c4 e a3 e. a3 s g#3 e a3 | [E] q b3 e g#3 q e3 e a3 | [Am] q c4 e d4 e. e4 s f#4 e e4 | [G] q d4 e b3 e. g3 s a3 e b3 | [Am] e. c4 s b3 e a3 [E] e. g#3 s f#3 e g#3 | [Am] q. a3 q a3 |',
    },
    {
      id: 'cl-romance', title: 'Spanish Romance, opening', source: 'Anonymous (Romance anonimo), bars 1-8', key: 'E minor', meter: '3/4', tempo: 80,
      scale: { root: 'E', id: 'aeolian' },
      about: 'The melody is the first note of every triplet, on the first string; the open B and G fill in underneath. Bring the top note out and keep the inner strings quiet. Bars 7 and 8 move to A minor at the fifth fret.',
      notes: `[Em] et 6/0+1/7 2/0 3/0 ${ROM('1/7', '2/0', '3/0')} ${ROM('1/7', '2/0', '3/0')} | et ${ROM('1/7', '2/0', '3/0')} ${ROM('1/5', '2/0', '3/0')} ${ROM('1/3', '2/0', '3/0')} | et 6/0+1/3 2/0 3/0 ${ROM('1/2', '2/0', '3/0')} ${ROM('1/0', '2/0', '3/0')} | et ${ROM('1/0', '2/0', '3/0')} ${ROM('1/3', '2/0', '3/0')} ${ROM('1/7', '2/0', '3/0')} | et 6/0+1/12 2/0 3/0 ${ROM('1/12', '2/0', '3/0')} ${ROM('1/12', '2/0', '3/0')} | et ${ROM('1/12', '2/0', '3/0')} ${ROM('1/10', '2/0', '3/0')} ${ROM('1/8', '2/0', '3/0')} | [Am] et 5/0+1/8 2/5 3/5 ${ROM('1/7', '2/5', '3/5')} ${ROM('1/5', '2/5', '3/5')} | et ${ROM('1/5', '2/5', '3/5')} ${ROM('1/7', '2/5', '3/5')} ${ROM('1/8', '2/5', '3/5')} |`,
    },
  ]);
})();
