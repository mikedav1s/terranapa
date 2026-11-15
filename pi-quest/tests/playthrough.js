/* Plays every mission from start to finish in a real browser, to prove each
   step can be completed. Run:  python3 -m http.server 8123  (in pi-quest/)
   then:  node tests/playthrough.js http://localhost:8123/            */
const { chromium } = require('playwright');
const URL = process.argv[2] || 'http://localhost:8123/';
const only = process.argv[3];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const BLINK = 'from gpiozero import LED\nfrom time import sleep\n\nled = LED(17)\n';
const TRAFFIC = 'from gpiozero import LED\nfrom time import sleep\n\nred = LED(17)\namber = LED(27)\ngreen = LED(22)\n\n';
const BTN = 'from gpiozero import LED, Button\n\nled = LED(17)\nbutton = Button(2)\n\n';
const REACT = (lo, hi, body) => 'from gpiozero import LED, Button\nfrom time import sleep, time\nfrom random import uniform\n\nled = LED(17)\nbutton = Button(2)\n\n' + body(lo, hi);
const round = (ind) => (lo, hi) => [`print("Get ready...")`, `sleep(uniform(${lo}, ${hi}))`, 'led.on()', 'start = time()', 'button.wait_for_press()', 'led.off()', 'reaction = time() - start', 'print("Your time:", round(reaction, 2), "seconds")', 'if reaction < 0.4:', '    print("Lightning fast!")', 'else:', '    print("Keep practicing!")', 'button.wait_for_release()'].map((l) => ind + l).join('\n') + '\n';
const MORSE = 'from gpiozero import LED, Buzzer\nfrom time import sleep\n\nled = LED(17)\nbuzzer = Buzzer(3)\n\ndef dot():\n    led.on()\n    buzzer.on()\n    sleep(0.2)\n    led.off()\n    buzzer.off()\n    sleep(0.2)\n\ndef dash():\n    led.on()\n    buzzer.on()\n    sleep(0.6)\n    led.off()\n    buzzer.off()\n    sleep(0.2)\n\n';

async function press(page, hold = 250) {
  const b = page.locator('.part-button'); await b.scrollIntoViewIfNeeded(); const box = await b.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + 30); await page.mouse.down(); await sleep(hold); await page.mouse.up(); await sleep(150);
}
const pressWhenLit = async (page) => { await page.waitForSelector('.part-led.lit', { timeout: 9000 }); await sleep(120); await press(page); };

const nano = (text) => ({ nano: text });
const PLAN = {
  'cli-look': [['pwd'], ['ls'], ['ls -a'], ['whoami'], ['clear'], ['pwd'], ['ls']],
  'cli-move': [['cd Documents'], ['ls'], ['cd ..'], [{ tab: 'cd Pi' }], ['cd ~'], ['cd Documents/school'], ['cd ~', 'pwd']],
  'cli-make': [['mkdir projects'], ['cd projects'], ['touch notes.txt'], ['ls'], ['mkdir robot', 'touch robot/plan.txt'], ['tree'], ['mkdir games']],
  'cli-read': [['echo Hello'], ['echo "My first file" > hello.txt'], ['cat hello.txt'], ['echo "Line two" >> hello.txt'], ['cat hello.txt'], ['echo "Oops" > hello.txt', 'cat hello.txt'], ['echo "Build a robot" > todo.txt']],
  'cli-tidy': [['cp hello.txt backup.txt'], ['mv todo.txt plans.txt'], ['mv plans.txt robot'], ['rm old_junk.txt'], ['rmdir games'], ['rm -r temp'], ['cp hello.txt hello2.txt', 'rm backup.txt']],
  'cli-power': [['ls -l'], [{ up: 1 }], ['man ls'], ['history'], ['grep robot Documents/story.txt'], ['apt update'], ['sudo apt update']],
  'cli-python': [['mkdir code', 'cd code'], ['nano hello.py', nano('print("Hello from my Pi!")')], ['cat hello.py'], ['python3 hello.py'], ['nano hello.py', nano('print("Hello from my Pi!")\nprint("Second")'), 'python3 hello.py']],
  'py-print': [{}, { code: 'print("Hello, Sam!")\n' }, { code: 'print("Hello, Sam!")\nprint("I am learning")\n' }, { code: 'print("Hello, Sam!")\nprint("I am learning")\nprint(2 + 3)\n' }, { code: 'print("Almost there!")\n' }],
  'py-vars': [{}, { code: 'name = "Sam"\nprint("Hello", name)\n' }, { code: 'name = "Sam"\nprint("Hello", name)\nage = 10\nprint(age + 1)\n' }, { code: 'name = "Sam"\nage = 10\nprint(f"{name} is {age} years old")\n' }, { code: 'score = 5\nprint(score + 1)\n' }],
  'py-input': [{ inputs: ['Sam'] }, { code: 'name = input("What is your name? ")\nprint("Nice to meet you,", name)\nfood = input("Favourite food? ")\nprint("Yum,", food)\n', inputs: ['Sam', 'pizza'] },
    { code: 'name = input("What is your name? ")\nfood = input("Favourite food? ")\nage = int(input("How old are you? "))\nprint("Next year you will be", age + 1)\n', inputs: ['Sam', 'pizza', '10'] }],
  'py-if': [{}, { code: 'temp = 10\n\nif temp > 25:\n    print("It is hot!")\nelse:\n    print("It is cool.")\n' }, { code: 'temp = 20\n\nif temp > 25:\n    print("It is hot!")\nelif temp > 15:\n    print("It is nice.")\nelse:\n    print("It is cool.")\n' },
    { code: 'word = input("Password? ")\nif word == "raspberry":\n    print("Access granted")\nelse:\n    print("Access denied")\n', inputs: ['raspberry'] }],
  'py-loops': [{}, { code: 'for i in range(10):\n    print("Blink", i)\n' }, { code: 'count = 5\nwhile count > 0:\n    print(count)\n    count = count - 1\nprint("Lift off!")\n' },
    { code: 'from time import sleep\n\ncount = 5\nwhile count > 0:\n    print(count)\n    sleep(1)\n    count = count - 1\nprint("Lift off!")\n' }, { code: 'for i in range(3):\n    print("Hop")\n' }],
  'py-lists': [{}, { code: 'colors = ["red", "amber", "green"]\nprint(colors[2])\n' }, { code: 'colors = ["red", "amber", "green"]\nfor color in colors:\n    print(color)\n' }, { code: 'colors = ["red", "amber", "green"]\nfor color in colors:\n    print(color)\ncolors.append("blue")\nprint(len(colors))\n' }],
  'py-funcs': [{}, { code: 'def cheer():\n    print("Go Pi go!")\n\ncheer()\ncheer()\ncheer()\n' }, { code: 'def greet(name):\n    print("Hello", name)\n\ngreet("Ada")\ngreet("Linus")\n' }, { code: 'def double(n):\n    return n * 2\n\nprint(double(21))\n' }],
  'pi-blink': [{}, { code: BLINK + 'led.on()\nsleep(1)\nled.off()\n' }, { code: BLINK + 'for i in range(5):\n    led.on()\n    sleep(0.5)\n    led.off()\n    sleep(0.5)\n' },
    { code: BLINK + 'for i in range(5):\n    led.on()\n    sleep(0.1)\n    led.off()\n    sleep(0.1)\n' }, { code: BLINK + 'while True:\n    led.on()\n    sleep(0.2)\n    led.off()\n    sleep(0.2)\n', during: () => sleep(1500), stop: true }],
  'pi-traffic': [{}, { code: TRAFFIC + 'red.on()\nsleep(0.3)\nred.off()\ngreen.on()\nsleep(0.3)\ngreen.off()\n' }, { code: TRAFFIC + 'red.on()\nsleep(0.3)\nred.off()\ngreen.on()\nsleep(0.3)\ngreen.off()\namber.on()\nsleep(0.3)\namber.off()\nred.on()\nsleep(0.3)\nred.off()\n' },
    { code: TRAFFIC + 'while True:\n    red.on()\n    sleep(0.2)\n    red.off()\n    green.on()\n    sleep(0.2)\n    green.off()\n    amber.on()\n    sleep(0.2)\n    amber.off()\n', during: () => sleep(1800), stop: true }],
  'pi-button': [{ during: (p) => press(p) }, { code: BTN + 'button.wait_for_press()\nled.on()\nbutton.wait_for_release()\nled.off()\n', during: (p) => press(p, 400) },
    { code: BTN + 'while True:\n    if button.is_pressed:\n        led.on()\n    else:\n        led.off()\n', during: async (p) => { await press(p); await press(p); await press(p); }, stop: true },
    { code: BTN + 'count = 0\nwhile True:\n    button.wait_for_press()\n    count = count + 1\n    print(count)\n    button.wait_for_release()\n', during: async (p) => { await press(p); await press(p); await press(p); }, stop: true }],
  'pi-reaction': [{ during: pressWhenLit }, { code: REACT(0.3, 0.6, round('')), during: pressWhenLit },
    { code: REACT(0.3, 0.6, (lo, hi) => 'for round_number in range(3):\n' + round('    ')(lo, hi)), during: async (p) => { for (let i = 0; i < 3; i++) await pressWhenLit(p); } }],
  'pi-morse': [{}, { code: MORSE + 'dot()\ndot()\ndot()\ndash()\ndash()\ndash()\n' }, { code: MORSE + 'dot()\ndot()\ndot()\ndash()\ndash()\ndash()\ndot()\ndot()\ndot()\n' }],
  'pi-ship': [['mkdir blink', 'cd blink'], ['nano blink.py', nano(BLINK + 'for i in range(3):\n    led.on()\n    sleep(0.2)\n    led.off()\n    sleep(0.2)')], ['python3 blink.py'], ['ls -l']],
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  const problems = [];
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  await page.goto(URL); await page.waitForSelector('.tracks');
  await page.click('.age-btn[data-j="0"]'); // the main run types everything, like an older learner

  const stepNow = async () => (await page.locator('.done-card').count()) ? 'done' : parseInt((await page.locator('.dots span').textContent()).match(/Step (\d+)/)[1], 10) - 1;
  const idle = () => page.waitForSelector('.term:not(.console) .term-line:not([hidden])', { timeout: 20000 });

  for (const [id, steps] of Object.entries(PLAN)) {
    if (only && only !== id) continue;
    await page.goto(URL + '#' + id); await page.waitForSelector('.brief .task');
    const python = !Array.isArray(steps[0]);
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      if ((await stepNow()) !== i) { problems.push(`${id}: expected to be on step ${i + 1} but brief shows ${await stepNow()}`); break; }
      if (!python) {
        for (const a of s) {
          if (a.nano !== undefined) { await page.waitForSelector('.nano textarea'); await page.fill('.nano textarea', a.nano); await page.click('.nano [data-a=save]'); await page.click('.nano [data-a=exit]'); }
          else if (a.tab) { await idle(); await page.fill('.term-in', a.tab); await page.press('.term-in', 'Tab'); await page.press('.term-in', 'Enter'); }
          else if (a.up) { await idle(); await page.press('.term-in', 'ArrowUp'); await page.press('.term-in', 'Enter'); }
          else { await idle(); await page.fill('.term-in', a); await page.press('.term-in', 'Enter'); }
          await sleep(60);
        }
        await idle();
      } else {
        if (s.code) await page.fill('.work-py textarea', s.code);
        await page.click('[data-a=run]');
        for (const v of s.inputs || []) { await page.waitForSelector('.console .term-line:not([hidden])'); await page.fill('.console .term-in', v); await page.press('.console .term-in', 'Enter'); await sleep(80); }
        if (s.during) await s.during(page);
        if (s.stop) await page.click('[data-a=stop]');
        await page.waitForSelector('[data-a=run]:not([disabled])', { timeout: 30000 });
      }
      await sleep(120);
      const now = await stepNow();
      if (now !== (i + 1 === steps.length ? 'done' : i + 1)) {
        const out = await page.locator(python ? '.console .term-out' : '.term .term-out').textContent();
        problems.push(`${id} step ${i + 1} did NOT pass (now ${now}). Output tail: ${JSON.stringify(out.slice(-300))}`); break;
      }
    }
    console.log((problems.some((p) => p.startsWith(id)) ? 'FAIL ' : 'ok   ') + id);
  }

  if (!only) {
    // drills: one wrong answer, then the correction, then finish the round
    await page.goto(URL + '#drills'); await page.waitForSelector('.drill-in');
    await page.fill('.drill-in', 'definitely wrong'); await page.press('.drill-in', 'Enter');
    for (let n = 0; n < 12 && (await page.locator('.drill-in').count()); n++) {
      const ans = await page.evaluate(() => { const q = document.querySelector('.drill-q').textContent; return window.PiLessons.DRILLS.find((d) => d.q === q).answer; });
      await page.fill('.drill-in', ans); await page.press('.drill-in', 'Enter'); await sleep(40);
    }
    if (!(await page.locator('.drill-end').count())) problems.push('drills: round did not finish');
    const bad = await page.evaluate(() => window.PiLessons.DRILLS.filter((d) => !d.re.test(d.answer)).map((d) => d.answer));
    if (bad.length) problems.push('drill answers that fail their own check: ' + bad.join(' | '));
    await page.goto(URL + '#sheet'); await page.waitForSelector('.sheet-block.learned');
    await page.goto(URL + '#play'); await page.waitForSelector('.work-py'); await page.click('[data-a=run]'); await page.waitForSelector('[data-a=run]:not([disabled])', { timeout: 15000 });
    await page.click('.tab[data-t=term]'); await page.fill('.term-in', 'echo hi | wc -c && cowsay moo'); await page.press('.term-in', 'Enter'); await sleep(200);
    const xp = await page.locator('.rank-xp').textContent(); console.log('final', xp);
  }
  if (!only || only === 'junior') {
    // "Age 7 to 9" helpers: tap-to-type, tap-to-add code, type-it-for-me in nano, pick-the-answer drills
    const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 } });
    const jp = await ctx.newPage();
    jp.on('pageerror', (e) => problems.push('junior pageerror: ' + e.message));
    const jstep = async () => (await jp.locator('.done-card').count()) ? 'done' : parseInt((await jp.locator('.dots span').textContent()).match(/Step (\d+)/)[1], 10) - 1;
    const want = async (n, what) => { await sleep(150); const got = await jstep(); if (got !== n) problems.push(`junior: ${what} (expected step index ${n}, got ${got})`); };
    const runIt = async (during, stop) => { await jp.click('[data-a=run]'); if (during) await during(jp); if (stop) await jp.click('[data-a=stop]'); await jp.waitForSelector('[data-a=run]:not([disabled])', { timeout: 20000 }); };
    await jp.goto(URL + '#cli-look'); await jp.waitForSelector('.task-do code.tap');
    await jp.click('.task-do code.tap'); await jp.press('.term-in', 'Enter'); await want(1, 'tapping a command then Enter should pass cli-look step 1');
    await jp.goto(URL + '#cli-python'); await jp.waitForSelector('.task');
    for (const c of ['mkdir code', 'cd code']) { await jp.fill('.term-in', c); await jp.press('.term-in', 'Enter'); await sleep(80); }
    await jp.click('.task-do code.tap'); await jp.press('.term-in', 'Enter');
    await jp.click('.nano [data-a=fill]'); await jp.click('.nano [data-a=save]'); await jp.click('.nano [data-a=exit]'); await want(2, 'nano "Type it for me" should pass cli-python step 2');
    await jp.goto(URL + '#py-vars'); await jp.waitForSelector('.task');
    await runIt(); await jp.fill('.work-py textarea', 'name = "Sam"\nprint("Hello", name)\n'); await runIt(); await want(2, 'py-vars setup');
    await jp.click('.task-do pre.tap'); await runIt(); await want(3, 'tapping the code box should pass py-vars step 3');
    await jp.click('.task-do pre.tap'); await runIt(); await want(4, 'tapping the code box should pass py-vars step 4');
    await jp.goto(URL + '#py-if'); await jp.waitForSelector('.task');
    await runIt(); await jp.fill('.work-py textarea', 'temp = 10\n\nif temp > 25:\n    print("It is hot!")\n'); await jp.click('.task-do pre.tap'); await runIt(); await want(2, 'py-if else tap');
    await jp.click('.task-do pre.tap'); await runIt(); await want(3, 'py-if elif tap (whole program)');
    await jp.goto(URL + '#pi-button'); await jp.waitForSelector('.task');
    const jpress = async (pg) => { const b = pg.locator('.part-button'); await b.scrollIntoViewIfNeeded(); const box = await b.boundingBox(); await pg.mouse.move(box.x + box.width / 2, box.y + 30); await pg.mouse.down(); await sleep(250); await pg.mouse.up(); await sleep(150); };
    await runIt(jpress); await jp.fill('.work-py textarea', BTN + 'button.wait_for_press()\nled.on()\nbutton.wait_for_release()\nled.off()\n'); await runIt(jpress); await want(2, 'pi-button setup');
    const three = async (pg) => { await jpress(pg); await jpress(pg); await jpress(pg); };
    await jp.click('.task-do pre.tap'); await runIt(three, true); await want(3, 'pi-button loop tap');
    await jp.click('.task-do pre.tap'); await runIt(three, true); await want('done', 'pi-button counter tap');
    await jp.goto(URL + '#drills'); await jp.waitForSelector('.choice');
    for (let n = 0; n < 12 && (await jp.locator('.choice').count()); n++) {
      const ans = await jp.evaluate(() => { const q = document.querySelector('.drill-q').textContent; return window.PiLessons.DRILLS.find((d) => d.q === q).answer; });
      if (n === 0) await jp.locator('.choice').filter({ hasNotText: ans }).first().click();
      await jp.locator('.choice').filter({ hasText: ans }).first().evaluate((el, a) => { [...document.querySelectorAll('.choice')].find((c) => c.textContent === a).click(); }, ans); await sleep(40);
    }
    if (!(await jp.locator('.drill-end').count())) problems.push('junior drills: round did not finish');
    console.log(problems.some((p) => p.startsWith('junior')) ? 'FAIL junior helpers' : 'ok   junior helpers');
    await ctx.close();
  }
  await browser.close();
  if (problems.length) { console.log('\nPROBLEMS:\n' + problems.join('\n')); process.exit(1); }
  console.log('\nAll good.');
})();
