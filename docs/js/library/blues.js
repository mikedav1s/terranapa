/* Blues. Rhythm notes: shuffle eighths (long-short), notes sit a little behind the beat,
   bends take their time, phrases leave space for the answer. Fret-number notation is used
   where the bend or fingering is the point. */
(function () {
  const L = window.GP.library;

  L.add('blues', [
    {
      id: 'bl-box1-call', title: 'Box 1 call and response in A', source: 'Traditional blues vocabulary', key: 'A blues', tempo: 84,
      scale: { root: 'A', id: 'min_pent' },
      about: 'A call that starts after the beat with a held bend, and a response that starts in the middle of the next bar. The half-step bend in bar 2 (D to Eb) is the "blue" note. Leave the rests empty; they are half the phrase.',
      notes: '[A7] e r 3/7b> - 2/5 1/5> 2/5 q 3/7~ | h r e r 3/5 3/7b1 3/5 | et 4/7 3/5 4/7 q 4/7~> h r |',
    },
    {
      id: 'bl-bb-box', title: 'The B.B. box in A', source: 'Original study in B.B. King\'s vocabulary', key: 'A blues', tempo: 76,
      scale: { root: 'A', id: 'maj_blues' },
      about: 'B.B. King\'s home base, root on the second string at the 10th fret. Slide into the B, bend it up toward C#, come back to the root and shake it. Only a few notes, all of them sung: count the space before the first note.',
      notes: '[A7] q r e r {2/10s} 2/12b> - 2/10 1/10 1/12b1 | h 2/10~> et 1/12 1/10 2/12 e 2/10 3/11 | q 2/10~ h r q r |',
    },
    {
      id: 'bl-turnaround-e', title: 'Turnaround in E: falling sixths', source: 'Traditional (Delta blues)', key: 'E blues', tempo: 76,
      about: 'The last two bars of a 12-bar blues in E. Sixths on strings 3 and 1 slide down a fret at a time in triplets, landing on E, then a walk up to B7 that starts after the beat to send you back to the top.',
      notes: '[E7] et 3/4> 1/4 3/4 3/3 1/3 3/3 3/2 1/2 3/2 q 3/1+1/0~ | [B7] e r 5/2> 4/1 3/2 h 5/2+4/1+3/2+2/0> |',
    },
    {
      id: 'bl-shuffle-a', title: 'Shuffle rhythm in A', source: 'Traditional', key: 'A blues', tempo: 104,
      about: 'The boogie pattern under countless blues: root and fifth, with the fifth stepping up to the sixth. Palm-mute at the bridge, accent beats 2 and 4 with the snare, and keep the swing lopsided, long-short.',
      notes: '[A7] e 5/0+4/2m 5/0+4/2m 5/0+4/4m> 5/0+4/2m 5/0+4/2m 5/0+4/2m 5/0+4/4m> 5/0+4/2m | [D7] e 4/0+3/2m 4/0+3/2m 4/0+3/4m> 4/0+3/2m 4/0+3/2m 4/0+3/2m 4/0+3/4m> 4/0+3/2m | [E7] e 6/0+5/2m 6/0+5/2m 6/0+5/4m> 6/0+5/2m 6/0+5/2m 6/0+5/2m 6/0+5/4m> 6/0+5/2m | [A7] e 5/0+4/2m 5/0+4/2m 5/0+4/4m> 5/0+4/2m q 5/0+4/2> r |',
    },
    {
      id: 'bl-12-bar-solo', title: '12-bar solo chorus in A', source: 'Original study', key: 'A blues', tempo: 92,
      scale: { root: 'A', id: 'blues' },
      about: 'A full chorus that follows the chords instead of running one scale: C# appears over A7, F# over D7, G# over E7. Phrases start in different places in the bar, mix shuffle eighths with triplets, and leave room. Loop four bars at a time, then score the whole chorus.',
      notes: '[A7] q r e r 3/5 3/7b> - 2/5 2/8 | et 2/5 3/7 3/5 q 4/7~ h r | e r 1/5> 2/8 2/5 et 3/7 3/5 4/7 q 3/7b1~ | e - 3/5 4/7 4/5 q 5/7> r | [D7] e r 4/7 3/5 2/7> - 3/5 q 4/7 | et 2/7 2/5 3/7 e 2/5 3/7 q 2/7~ e r 4/7 | [A7] e 3/5 3/6h 2/5 1/5> q 2/8b~ e 2/5 2/8 | e 1/5> 2/8 2/5 3/7 et 3/5 4/7 3/5 q 4/7~ | [E7] e r 2/5 2/8> - 2/5 3/7 q 3/4 | [D7] et 2/7 2/5 3/7 e 3/5 4/7 4/4 4/7 q 4/5~ | [A7] e r 4/7 3/5 3/6h 2/5> 1/5 q 2/8b1~ | [E7] et 2/5 3/7 3/5 e 4/7 4/6> q 5/7 r |',
    },
    {
      id: 'bl-minor-slow', title: 'Slow minor blues phrase in B minor', source: 'Original study', key: 'B minor', tempo: 60,
      scale: { root: 'B', id: 'min_pent' },
      about: 'For a slow minor blues in the mood of The Thrill Is Gone. Slide into the bend, hold it for two eighths, then let it fall. Very few notes and a long, slow vibrato. At this tempo the shuffle is a slow 12/8 feel: count "1-and-a".',
      notes: '[Bm7] q r e r {2/9s} 2/10b> - - 2/7 3/9~ | e r 3/7 3/9 2/7 et 2/10b 2/7 3/9 q 3/7~ |',
    },
  ]);
})();
