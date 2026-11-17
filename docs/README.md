# Woodshed Guitar

A practice app for building the link between a melody in your ear and where it lives on the fretboard.
It runs entirely in the browser: no build step, no server, no account. Practice history stays in your browser.

## What is in it

- **Library** of 66 phrases, tunes and studies: bluegrass, jazz, Gypsy jazz, blues, Jerry Garcia / jam,
  metal, Greek, Lebanese and classical, with player studies for Tony Rice, John Coltrane, Wes Montgomery,
  Jerry Garcia, Django Reinhardt, Bach and Mozart. Each style also has a "songs to know" listening list.
- **Standard notation and tab** for every piece, with a playback cursor and a fretboard that lights up
  the current note.
- **Practice transport**: tempo (50 / 75 / 100% presets), loop, bar ranges, count-in, click, backing
  chords, swing, and a speed trainer that raises the tempo on every loop. Space bar starts and stops.
- **Feel**: playback is phrased, not just quantised. Each style has its own swing (jazz swing that
  straightens out as the tempo rises, a triplet shuffle for blues, a slight lilt for bluegrass, straight
  for metal and classical), accents (off-beat accents and short phrase endings in bebop, heavy down-beats
  in odd-meter dances, arch-shaped phrases in classical), micro-timing (blues and jazz sit behind the
  beat, bluegrass on top of it), legato hammer-ons and slides, slow blues bends and vibrato on held notes.
  The Feel menu overrides the swing; Humanize turns the small timing and touch variations on or off.
- **Band**: a rhythm section in the style of the piece, following its chords: walking bass and ride
  cymbal (jazz), la pompe (Gypsy jazz), boom-chick with mandolin chop (bluegrass), shuffle kit and boogie
  bass (blues), rock kit (jam), double-kick (metal), hasapiko and kalamatianos percussion (Greek),
  maqsum, baladi and sama'i darbuka patterns (Lebanese), and a light bass and chord continuo (classical).
- **Ear mode**: hides the music so you learn the phrase by listening.
- **Listening mode** (microphone):
  - *Play along and score* checks each note for pitch and timing against the click and marks it
    green (hit), amber (right note, late or early) or red (missed).
  - *Step through* waits for you to find each note, with no tempo.
- **Scales & modes**: Western modes, pentatonic and blues, jazz scales, Greek dromoi and Arabic maqamat
  (quarter tones shown as slight bends), on a full fretboard with audio.
- **Chord library**: open, barre, power, jazz shells, drop-2/drop-3 voicings, Gypsy jazz grips and
  top-string triads, movable to any root.
- **Metronome** with drum grooves (jazz ride, shuffle, rock, metal, Greek, darbuka), swing, odd meters
  (7/8, 9/8, 10/8), subdivisions, tap tempo and a speed trainer; **tuner**.
- **Progress**: practice time, streak, accuracy trend, per-style and per-piece bests.
- **Your own licks**: type a phrase or paste ASCII tab from any transcription. It gets every tool above.

## About the material

- Entries credited to a composer or marked *Traditional* are the real melodies (Bach, Mozart, Beethoven,
  Paganini, fiddle tunes, Misirlou). Traditional tunes vary between players; treat these as one common
  setting and check them against a recording.
- Entries marked *Original study* are lines written for this app in a player's vocabulary over the real
  chord changes (for example Giant Steps and Minor Swing). They are not transcriptions of recorded solos.
  To practise an actual transcription, paste its tab under **Add your own lick**.

## Running it

Listening mode and the tuner need microphone access, which browsers only grant on `https://` or `localhost`.

- **GitHub Pages**: repository Settings → Pages → Deploy from a branch → pick the branch and the `/docs`
  folder. The app is then served at the Pages address.
- **Locally**: `cd docs && python3 -m http.server 8000`, then open <http://localhost:8000>.

Use headphones (or switch Guide notes off) while the app is listening, so the microphone only hears your guitar.

## Adding to the library

Pieces live in `docs/js/library/*.js`. The note syntax (durations, triplets, ties, accents `>`, ghost
notes `_`, staccato `.`, palm mutes `m`, grace notes `{5/1}`, dynamics `!mf`) is documented at the top of
`docs/js/dsl.js` and in the app under Add your own lick → Notation reference. How notes are performed
is in `docs/js/feel.js`; the rhythm section is `docs/js/band.js`. After editing, run:

```
node tools/validate.mjs        # checks bar lengths and spellings
node tools/validate.mjs -v     # also prints every note with its string/fret
```

Notation rendering uses [VexFlow](https://www.vexflow.com) (MIT), vendored in `docs/vendor/`.
