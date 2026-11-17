/* Woodshed — library registry: styles, player-study tags, and listening lists.

   Each lick: { id, title, style, tags, source, key, meter, tempo, swing, flats, pos,
                scale: { root, id }, about, notes }   (notes use the syntax in js/dsl.js)

   Sources are labelled honestly: "Original study" lines are written for this app in a
   player's vocabulary; composer / "Traditional" entries are the real melodies. */
(function () {
  const GP = (window.GP = window.GP || {});

  const STYLES = [
    { id: 'bluegrass', label: 'Bluegrass' },
    { id: 'jazz', label: 'Jazz' },
    { id: 'gypsy', label: 'Gypsy jazz' },
    { id: 'blues', label: 'Blues' },
    { id: 'jam', label: 'Jerry / jam' },
    { id: 'metal', label: 'Metal' },
    { id: 'greek', label: 'Greek' },
    { id: 'lebanese', label: 'Lebanese' },
    { id: 'classical', label: 'Classical' },
  ];
  const TAGS = ['Tony Rice', 'John Coltrane', 'Wes Montgomery', 'Jerry Garcia', 'Django Reinhardt', 'J.S. Bach', 'Mozart'];

  const songs = {
    bluegrass: [
      { title: 'Church Street Blues', by: 'Tony Rice', note: 'Solo guitar: bass runs, crosspicking and melody at once.' },
      { title: 'Manzanita', by: 'Tony Rice Unit', note: 'His "spacegrass" writing; listen for the bluesy b3 and b7.' },
      { title: 'Blackberry Blossom', by: 'traditional (Tony Rice, Norman Blake)', note: 'The fiddle tune every flatpicker is measured by.' },
      { title: 'Salt Creek', by: 'Bill Monroe / Tony Rice', note: 'A-mixolydian fiddle tune; the G chord gives it its edge.' },
      { title: 'Black Mountain Rag', by: 'Doc Watson', note: 'Three-part showpiece.' },
      { title: 'Whiskey Before Breakfast', by: 'traditional', note: 'In D. The A part is in this library.' },
      { title: 'Soldier\'s Joy', by: 'traditional', note: 'In D. The A part is in this library.' },
      { title: 'Freeborn Man', by: 'Tony Rice (Bluegrass Album Band)', note: 'Blues phrasing at bluegrass tempo.' },
    ],
    jazz: [
      { title: 'Giant Steps', by: 'John Coltrane', note: 'Keys a major third apart (B, G, Eb). Start with the 1-2-3-5 cells here.' },
      { title: 'Countdown', by: 'John Coltrane', note: 'Coltrane changes laid over a ii-V-I.' },
      { title: 'Impressions', by: 'John Coltrane', note: 'Two chords (Dm7, Ebm7); the pentatonic study here targets it.' },
      { title: 'Blue Train', by: 'John Coltrane', note: 'Blues language before the harmonic experiments.' },
      { title: 'Mr. P.C.', by: 'John Coltrane', note: 'Fast minor blues in C.' },
      { title: 'Naima', by: 'John Coltrane', note: 'Ballad over pedal tones.' },
      { title: 'Four on Six', by: 'Wes Montgomery', note: 'His own line on Summertime-like changes.' },
      { title: 'West Coast Blues', by: 'Wes Montgomery', note: 'A blues in 3/4 with substitute changes.' },
      { title: 'D-Natural Blues', by: 'Wes Montgomery', note: 'Slow blues: single notes, then octaves, then chords.' },
      { title: 'Road Song', by: 'Wes Montgomery', note: 'Octave melody playing at its clearest.' },
      { title: 'Bumpin\' on Sunset', by: 'Wes Montgomery', note: 'Octaves over a minor vamp.' },
    ],
    gypsy: [
      { title: 'Minor Swing', by: 'Django Reinhardt & Stephane Grappelli', note: 'Am6, Dm6, E7. The changes used in the chorus study here.' },
      { title: 'Nuages', by: 'Django Reinhardt', note: 'His best-known ballad; chromatic descending melody.' },
      { title: 'Djangology', by: 'Django Reinhardt', note: 'Bright major-key swing.' },
      { title: 'Daphne', by: 'Django Reinhardt', note: 'Rhythm-changes bridge up a half step.' },
      { title: 'Swing 42', by: 'Django Reinhardt', note: 'I-vi-ii-V in C at tempo.' },
      { title: 'Douce Ambiance', by: 'Django Reinhardt', note: 'G minor with a signature diminished break.' },
      { title: 'Les Yeux Noirs (Dark Eyes)', by: 'traditional', note: 'The jam-session waltz-turned-swing standard.' },
    ],
    blues: [
      { title: 'The Thrill Is Gone', by: 'B.B. King', note: 'B minor. Few notes, every one sung with vibrato.' },
      { title: 'Sweet Little Angel', by: 'B.B. King', note: 'The "B.B. box" in action.' },
      { title: 'Stormy Monday', by: 'T-Bone Walker', note: 'Ninth chords and the source of jazz-blues guitar.' },
      { title: 'Born Under a Bad Sign', by: 'Albert King', note: 'Wide, slow bends.' },
      { title: 'Cross Road Blues', by: 'Robert Johnson', note: 'Delta turnarounds.' },
      { title: 'Pride and Joy', by: 'Stevie Ray Vaughan', note: 'Texas shuffle rhythm with fills.' },
      { title: 'Hide Away', by: 'Freddie King', note: 'Instrumental catalogue of blues licks in E.' },
    ],
    jam: [
      { title: 'Sugaree', by: 'Grateful Dead', note: 'Long solos on B and E: major pentatonic becoming Mixolydian.' },
      { title: 'Eyes of the World', by: 'Grateful Dead', note: 'Emaj7 to Bm: fast, bright scalar lines.' },
      { title: 'Fire on the Mountain', by: 'Grateful Dead', note: 'Two-chord vamp, B to A. See the vamp study here.' },
      { title: 'Scarlet Begonias', by: 'Grateful Dead', note: 'B Mixolydian with rhythmic displacement.' },
      { title: 'Bird Song', by: 'Grateful Dead', note: 'E Mixolydian / Dorian modal improvising.' },
      { title: 'Deal', by: 'Jerry Garcia', note: 'Chord-tone playing through quick changes.' },
      { title: 'Shady Grove', by: 'Jerry Garcia & David Grisman', note: 'Traditional modal tune on acoustic guitar.' },
    ],
    metal: [
      { title: 'Master of Puppets', by: 'Metallica', note: 'Down-picked chromatic riffing in E.' },
      { title: 'The Trooper', by: 'Iron Maiden', note: 'The gallop rhythm and harmonised leads.' },
      { title: 'Holy Wars... The Punishment Due', by: 'Megadeth', note: 'Alternate-picked riffs; a Phrygian-dominant middle section.' },
      { title: 'Crazy Train', by: 'Ozzy Osbourne (Randy Rhoads)', note: 'Classical-leaning minor riff and solo.' },
      { title: 'Far Beyond the Sun', by: 'Yngwie Malmsteen', note: 'Harmonic minor sequences and sweep arpeggios.' },
      { title: 'Paranoid', by: 'Black Sabbath', note: 'E minor pentatonic riff writing at its plainest.' },
      { title: 'Caprice No. 24', by: 'Niccolo Paganini', note: 'The source of neoclassical metal; the theme is in this library.' },
    ],
    greek: [
      { title: 'Misirlou', by: 'traditional', note: 'Hitzazkiar. Shared by Greek, Arabic and Turkish repertoires; theme in this library.' },
      { title: 'Frangosyriani', by: 'Markos Vamvakaris', note: 'The classic rebetiko hasapiko.' },
      { title: 'Synnefiasmeni Kyriaki', by: 'Vassilis Tsitsanis', note: 'Often called the unofficial anthem of Greece; a zeibekiko.' },
      { title: 'To Minore tis Avgis', by: 'Spyros Peristeris', note: 'Rebetiko in a minor dromos.' },
      { title: 'To Zeibekiko tis Evdokias', by: 'Manos Loizos', note: 'Instrumental zeibekiko in 9/4.' },
      { title: 'Zorba\'s Dance (Syrtaki)', by: 'Mikis Theodorakis', note: 'Slow hasapiko accelerating into hasaposerviko.' },
      { title: 'Ta Paidia tou Peiraia', by: 'Manos Hadjidakis', note: 'Bright major melody over a hasapiko pulse.' },
      { title: 'Gerakina', by: 'traditional', note: 'Kalamatianos in 7/8 (3+2+2).' },
      { title: 'Samiotissa', by: 'traditional', note: 'Kalamatianos in 7/8 from Samos.' },
    ],
    lebanese: [
      { title: 'Lamma Bada Yatathanna', by: 'traditional (Andalusian muwashshah)', note: 'Maqam Nahawand in sama\'i thaqil, 10/8. The standard first study.' },
      { title: 'Ala Dal\'ona', by: 'traditional', note: 'The Levantine dabke song; usually sung in Bayati.' },
      { title: 'Bint El Shalabiya', by: 'traditional (Fairuz)', note: 'Folk melody made famous by Fairuz.' },
      { title: 'Nassam Alayna El Hawa', by: 'Fairuz / Rahbani Brothers', note: 'One of the central Rahbani songs.' },
      { title: 'Sa\'alouni El Nass', by: 'Fairuz / Ziad Rahbani', note: 'Ziad\'s first song for her.' },
      { title: 'Li Beirut', by: 'Fairuz', note: 'Set to the Adagio of Rodrigo\'s Concierto de Aranjuez: a guitar piece you can learn directly.' },
      { title: 'Kifak Inta', by: 'Fairuz / Ziad Rahbani', note: 'Jazz harmony meeting Arabic melody.' },
      { title: 'Lebnan Ya Qut\'at Sama', by: 'Wadih El Safi', note: 'Mountain mawwal style singing.' },
      { title: 'Misirlou', by: 'traditional', note: 'Known across the Levant; Hijaz Kar. Theme is in the Greek section.' },
    ],
    classical: [
      { title: 'Lute Suite in E minor, BWV 996 (Bourree)', by: 'J.S. Bach', note: 'Two-voice counterpoint that sits naturally on guitar.' },
      { title: 'Cello Suite No. 1, BWV 1007 (Prelude)', by: 'J.S. Bach', note: 'Arpeggiated harmony; often played on guitar in D.' },
      { title: 'Chaconne from Partita No. 2, BWV 1004', by: 'J.S. Bach', note: 'The summit of solo string writing; Segovia\'s transcription.' },
      { title: 'Eine kleine Nachtmusik, K. 525', by: 'W.A. Mozart', note: 'Arpeggio themes: tonic and dominant spelled out.' },
      { title: 'Symphony No. 40, K. 550', by: 'W.A. Mozart', note: 'Sighing half-step motif in G minor.' },
      { title: 'Rondo alla Turca, K. 331', by: 'W.A. Mozart', note: 'Ornamental turns around chord tones.' },
      { title: 'Caprice No. 24', by: 'Niccolo Paganini', note: 'Theme and variations in A minor.' },
      { title: 'Recuerdos de la Alhambra', by: 'Francisco Tarrega', note: 'The tremolo study.' },
      { title: 'Asturias (Leyenda)', by: 'Isaac Albeniz', note: 'Pedal-point writing that metal players borrowed.' },
    ],
  };

  GP.library = {
    STYLES, TAGS, songs, licks: [],
    add(style, list) {
      for (const l of list) this.licks.push(Object.assign({ style, meter: '4/4', tempo: 100 }, l));
    },
  };
})();
