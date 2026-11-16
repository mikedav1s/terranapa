/* Blues. Fret-number notation is used where the bend or fingering is the point. */
(function () {
  const L = window.GP.library;

  L.add('blues', [
    {
      id: 'bl-box1-call', title: 'Box 1 call and response in A', source: 'Traditional blues vocabulary', key: 'A blues', tempo: 84, swing: true,
      scale: { root: 'A', id: 'min_pent' },
      about: 'Two short statements in the fifth-fret pentatonic box. Each starts with a whole-step bend on the third string (D pushed up to E) and ends on a held note with vibrato. Leave the rests empty.',
      notes: '[A7] e 3/7b 2/5 1/5 2/8 q 2/5~ r | e 3/7b 3/5 4/7 3/5 q 4/7~ r |',
    },
    {
      id: 'bl-bb-box', title: 'The B.B. box in A', source: 'Original study in B.B. King\'s vocabulary', key: 'A blues', tempo: 80, swing: true,
      scale: { root: 'A', id: 'maj_blues' },
      about: 'B.B. King\'s home base: root under the index finger on the second string (10th fret), with the sixth and ninth close by. Bend B up toward C#, come back to the root, and shake it.',
      notes: '[A7] e 2/12b 2/10 3/11 2/10 q 2/10~ r | e 1/10 1/12b 1/10 2/12 h 2/10~ |',
    },
    {
      id: 'bl-turnaround-e', title: 'Turnaround in E: falling sixths', source: 'Traditional (Delta blues)', key: 'E blues', tempo: 76,
      about: 'The last two bars of a 12-bar blues in E. Sixths on strings 3 and 1 slide down a fret at a time in triplets, landing on E, then a walk up to B7 to send you back to the top.',
      notes: '[E7] et 3/4 1/4 3/4 3/3 1/3 3/3 3/2 1/2 3/2 q 3/1+1/0 | [B7] q 5/2 e 4/1 3/2 h 5/2+4/1+3/2+2/0 |',
    },
    {
      id: 'bl-shuffle-a', title: 'Shuffle rhythm in A', source: 'Traditional', key: 'A blues', tempo: 104, swing: true,
      about: 'The boogie pattern under countless blues: root and fifth, with the fifth stepping up to the sixth on beats 2 and 4. Palm-mute lightly and keep the swing lopsided, long-short.',
      notes: '[A7] e 5/0+4/2 5/0+4/2 5/0+4/4 5/0+4/2 5/0+4/2 5/0+4/2 5/0+4/4 5/0+4/2 | [D7] e 4/0+3/2 4/0+3/2 4/0+3/4 4/0+3/2 4/0+3/2 4/0+3/2 4/0+3/4 4/0+3/2 | [E7] e 6/0+5/2 6/0+5/2 6/0+5/4 6/0+5/2 6/0+5/2 6/0+5/2 6/0+5/4 6/0+5/2 | [A7] e 5/0+4/2 5/0+4/2 5/0+4/4 5/0+4/2 h 5/0+4/2 |',
    },
    {
      id: 'bl-12-bar-solo', title: '12-bar solo chorus in A', source: 'Original study', key: 'A blues', tempo: 92, swing: true,
      scale: { root: 'A', id: 'blues' },
      about: 'A full chorus that follows the chords instead of running one scale: C# appears over A7, F# over D7, G# over E7. Loop four bars at a time, then score the whole chorus.',
      notes: '[A7] q r e 3/5 3/7b q 2/5 e 2/8 2/5 | e 3/7 3/5 4/7 3/5 h 4/7~ | q r e 2/5 2/8 1/5 2/8 q 2/5 | e 3/7b 3/7 3/5 4/7 q 4/5 r | [D7] e 4/7 3/5 2/7 3/5 q 4/7 e 3/5 3/7 | e 2/7 2/5 3/7 3/5 h 4/7~ | [A7] e 3/5 3/6h 2/5 1/5 q 2/8b1 2/5 | e 1/8 1/5 2/8 2/5 3/7b 3/5 q 4/7 | [E7] e 2/5 2/8 2/5 3/7 q 3/4 e 4/6 3/4 | [D7] e 2/7 2/5 3/7 3/5 q 4/7 4/4 | [A7] e 4/7 3/5 3/6h 2/5 q 1/5 e 2/8 2/5 | [E7] e 3/7 3/5 4/7 4/5 h 5/7 |',
    },
    {
      id: 'bl-minor-slow', title: 'Slow minor blues phrase in B minor', source: 'Original study', key: 'B minor', tempo: 66,
      scale: { root: 'B', id: 'min_pent' },
      about: 'For a slow minor blues in the mood of The Thrill Is Gone. Three or four notes, a bend that takes its time, and a long vibrato. Count the rests as carefully as the notes.',
      notes: '[Bm7] q r e 2/10b 2/7 q 3/9~ r | e 3/7 3/9 2/7 2/10b h 2/7~ |',
    },
  ]);
})();
