# Pi Quest

A practice app that teaches beginners the command line and Python, with one goal:
building Raspberry Pi projects. It runs in any modern browser (iPad, phone, laptop,
or the Pi itself) and needs no account and no server.

## What is inside

- **Terminal track (7 missions)**: `pwd`, `ls`, `cd`, `mkdir`, `touch`, `cat`, `echo`,
  `cp`, `mv`, `rm`, `man`, `grep`, `sudo apt`, `nano`, `python3`. The terminal is a
  simulation with a pretend Pi file system, so nothing on the device can be harmed.
- **Python track (7 missions)**: print, variables, input, if/else, loops, lists,
  functions. The Python is real and runs in the page.
- **Pi Projects track (6 missions)**: blink an LED, traffic lights, a push button, a
  reaction game, Morse code with a buzzer, and a final mission done entirely from the
  terminal. They use the same `gpiozero` code that runs on a real Raspberry Pi, drawn
  on a virtual GPIO board. Each project ends with wiring notes for the real thing.
- **Drills**: quick-fire typing practice. Missed cards come back more often.
- **Cheat sheet**: fills in as missions are completed, plus a "move to a real Pi" guide.
- **Playground**: a free terminal and a free Python editor with LEDs, a button and a buzzer.

Every step is a small task with an automatic check, a hint, and an answer if needed.
Most missions end with a step done from memory. Progress is saved in the browser on
that device.

## Run it

It is a static site. Any web server works:

```
cd pi-quest
python3 -m http.server 8000
```

Then open `http://localhost:8000` (or `http://<computer-ip>:8000` from an iPad on the
same Wi-Fi).

To put it online for free, enable **GitHub Pages** for this repository
(Settings → Pages → deploy from the `main` branch). The app will be at
`https://<user>.github.io/<repo>/pi-quest/`.

### Use it like an app on an iPad

Open the site in Safari, tap **Share → Add to Home Screen**. It then opens full
screen. When served over HTTPS it also keeps working offline after the first visit.

## Files

| Path | What it is |
| --- | --- |
| `index.html`, `css/style.css` | The page and its look |
| `js/lessons.js` | **All missions, steps, hints, checks and drill cards.** Edit this to add content. |
| `js/shell.js` | The practice terminal and pretend file system |
| `js/pi.js` | The virtual GPIO board, the `gpiozero` stand-in, and the Python runner |
| `js/app.js` | Screens, progress and XP |
| `vendor/` | [Skulpt](https://skulpt.org) 1.2.0 (MIT), which runs Python in the browser |
| `sw.js`, `manifest.webmanifest` | Offline support and home-screen install |
| `tests/playthrough.js` | Plays every mission in a real browser to prove each step can be passed |

## Test

```
python3 -m http.server 8123 &
node tests/playthrough.js http://localhost:8123/
```

(needs [Playwright](https://playwright.dev).)

## Limits worth knowing

- The terminal is a teaching simulation. It covers the commands above, plus pipes and
  `>`/`>>`, not a full Linux shell.
- Python runs on Skulpt, which covers the core language well but not every library.
- `gpiozero` support covers `LED`, `PWMLED`, `Buzzer`, `Button`, `TrafficLights`,
  `blink()`, `when_pressed` with `pause()`. Other devices are not simulated.
