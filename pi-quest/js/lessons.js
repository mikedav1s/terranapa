/* Pi Quest — every mission, step and drill card.
   To add a mission, copy one below and change the words and the check. */
(function () {
  'use strict';
  const HOME = '/home/pi';

  /* ---- helpers for checks ---- */
  // terminal: c = { line, cmds, out, sh, pyRan, pyError, prev, events }
  const ran = (c, name) => c.cmds.some((a) => a[0] === name);
  const ranWith = (c, name, re) => c.cmds.some((a) => a[0] === name && re.test(a.slice(1).join(' ')));
  // python: c = { code, out, events, finished, inputs }
  const lines = (c) => c.out.split('\n').filter((l) => l.trim() !== '');
  const count = (s, re) => (s.match(re) || []).length;
  const onSeq = (c) => c.events.filter((e) => e.kind !== 'button' && e.value > 0).map((e) => e.pin);
  const ons = (c, pin) => onSeq(c).filter((p) => p === pin).length;
  const presses = (c, pin) => c.events.filter((e) => e.kind === 'button' && e.pin === pin && e.value).length;
  const hasOrder = (arr, pattern) => { let i = 0; for (const x of arr) if (x === pattern[i]) i++; return i >= pattern.length; };
  const durations = (c, pin) => {
    const d = []; let start = null;
    for (const e of c.events) if (e.pin === pin && e.kind !== 'button') { if (e.value > 0) start = e.t; else if (start !== null) { d.push(e.t - start); start = null; } }
    return d;
  };
  const code = (c) => c.code.replace(/#.*$/gm, '');

  const BASE = {
    Documents: {
      'homework.txt': 'Maths: page 12\nScience: build a volcano\n',
      'story.txt': 'Once there was a small robot.\nThe robot lived inside a Raspberry Pi.\nEvery night it blinked a red light.\nOne day the robot learned to code.\n',
      school: { 'science.txt': 'A circuit is a loop that electricity flows around.\n' },
    },
    Pictures: { 'cat.png': '(a picture of a cat)\n', 'robot.png': '(a picture of a robot)\n' },
    Music: {},
  };
  const WITH_PROJECTS = Object.assign({}, BASE, { projects: { 'notes.txt': '', robot: { 'plan.txt': '' }, games: {} } });

  const TRACKS = [
    { id: 'cli', name: 'Terminal', tag: 'TRACK A', blurb: 'Talk to the Pi by typing commands.' },
    { id: 'py', name: 'Python', tag: 'TRACK B', blurb: 'Write programs that think and decide.' },
    { id: 'pi', name: 'Pi Projects', tag: 'TRACK C', blurb: 'Make lights blink and buttons work.' },
  ];

  const MISSIONS = [
    /* ================= TERMINAL ================= */
    {
      id: 'cli-look', track: 'cli', kind: 'terminal', title: 'Look around',
      goal: 'Find out where you are and what is here.',
      learn: [['pwd', 'show the folder you are in'], ['ls', 'list what is here'], ['ls -a', 'list hidden files too'], ['whoami', 'show your user name'], ['clear', 'wipe the screen']],
      tree: BASE,
      steps: [
        { say: 'This black box is a <b>terminal</b>. You type a command, press <kbd>Enter</kbd>, and the Pi answers.<br><br>The text <code>pi@raspberrypi:~ $</code> is the <b>prompt</b>. It means the Pi is ready.', do: 'Type <code>pwd</code> and press <kbd>Enter</kbd>.', hint: 'Tap the black box, type the three letters p w d, then press Enter.', answer: 'pwd', check: (c) => ran(c, 'pwd') },
        { say: '<code>pwd</code> means <b>print working directory</b>. A directory is a folder. You are in <code>/home/pi</code>, your home folder.', do: 'Now list what is in this folder. Type <code>ls</code>.', hint: 'ls is short for "list". It is a lowercase L and an S.', answer: 'ls', check: (c) => ran(c, 'ls') },
        { say: 'The blue names are folders. Some files are hidden. Their names start with a dot.', do: 'Show the hidden files with <code>ls -a</code>.', hint: 'Type ls, then a space, then -a. The space matters.', answer: 'ls -a', check: (c) => ranWith(c, 'ls', /-\w*a/) },
        { say: 'The <code>-a</code> part is called an <b>option</b>. Options change how a command works.', do: 'Ask the Pi who you are. Type <code>whoami</code>.', hint: 'It is one word: who am i, with no spaces.', answer: 'whoami', check: (c) => ran(c, 'whoami') },
        { say: 'You are the user called <b>pi</b>. The screen is getting full.', do: 'Wipe it clean with <code>clear</code>.', hint: 'Type clear and press Enter.', answer: 'clear', check: (c) => ran(c, 'clear') },
        { say: '<b>From memory.</b> No peeking this time.', do: 'Type the command that shows which folder you are in.', hint: 'It stands for "print working directory".', answer: 'pwd', check: (c) => ran(c, 'pwd') },
        { say: 'One more from memory.', do: 'Type the command that lists the files here.', hint: 'Two letters. Short for "list".', answer: 'ls', check: (c) => ran(c, 'ls') },
      ],
    },
    {
      id: 'cli-move', track: 'cli', kind: 'terminal', title: 'Move around',
      goal: 'Walk between folders with cd.',
      learn: [['cd Documents', 'go into a folder'], ['cd ..', 'go up one folder'], ['cd ~', 'go home'], ['Tab key', 'finish a name for you']],
      tree: BASE,
      steps: [
        { say: 'Folders hold files and other folders. To go into one, use <code>cd</code>. It means <b>change directory</b>.', do: 'Go into the Documents folder: <code>cd Documents</code>', hint: 'Capital letters matter. It is Documents with a big D.', answer: 'cd Documents', check: (c) => c.sh.cwd === HOME + '/Documents' },
        { say: 'Look at the prompt. It now says <code>~/Documents</code>. The <code>~</code> sign means your home folder.', do: 'List the files in here.', hint: 'The same command as before: ls', answer: 'ls', check: (c) => ran(c, 'ls') },
        { say: 'Two dots <code>..</code> mean "the folder above this one".', do: 'Go back up: <code>cd ..</code>', hint: 'Type cd, a space, then two dots.', answer: 'cd ..', check: (c) => c.sh.cwd === HOME && ran(c, 'cd') },
        { say: 'Save your fingers. Type the start of a name, then press <kbd>Tab</kbd>. The Pi finishes it. On a tablet, use the <b>Tab</b> key above the terminal.', do: 'Type <code>cd Pi</code>, press <kbd>Tab</kbd>, then <kbd>Enter</kbd>.', hint: 'After Tab, the line should read: cd Pictures/', answer: 'cd Pictures', check: (c) => c.sh.cwd === HOME + '/Pictures' },
        { say: 'Lost? <code>cd ~</code> takes you home from anywhere. So does <code>cd</code> on its own.', do: 'Go home with <code>cd ~</code>', hint: 'The ~ key is on the key bar above the terminal.', answer: 'cd ~', check: (c) => c.sh.cwd === HOME && ran(c, 'cd') },
        { say: 'You can hop through two folders at once. Put a <code>/</code> between the names. This is called a <b>path</b>.', do: 'Jump straight to <code>cd Documents/school</code>', hint: 'No spaces around the slash: Documents/school', answer: 'cd Documents/school', check: (c) => c.sh.cwd === HOME + '/Documents/school' },
        { say: '<b>From memory.</b> You are deep inside the folders now.', do: 'Get back home, then prove it with <code>pwd</code>.', hint: 'First cd ~ and then pwd. The Pi should print /home/pi', answer: 'cd ~   then   pwd', check: (c) => c.sh.cwd === HOME && ran(c, 'pwd') },
      ],
    },
    {
      id: 'cli-make', track: 'cli', kind: 'terminal', title: 'Make things',
      goal: 'Create your own folders and files.',
      learn: [['mkdir projects', 'make a folder'], ['touch notes.txt', 'make an empty file'], ['tree', 'draw folders as a tree']],
      tree: BASE,
      steps: [
        { say: 'Every Pi project needs a home. <code>mkdir</code> means <b>make directory</b>.', do: 'Make a folder: <code>mkdir projects</code>', hint: 'mkdir, a space, then the folder name.', answer: 'mkdir projects', check: (c) => c.sh.isDir('~/projects') },
        { say: 'Nothing was printed. In the terminal, silence means it worked.', do: 'Go into your new folder.', hint: 'cd projects', answer: 'cd projects', check: (c) => c.sh.cwd === HOME + '/projects' },
        { say: '<code>touch</code> makes a new empty file.', do: 'Make a file: <code>touch notes.txt</code>', hint: 'touch, a space, then notes.txt', answer: 'touch notes.txt', check: (c) => c.sh.isFile('~/projects/notes.txt') },
        { say: 'Check that it is really there.', do: 'List the files.', hint: 'ls', answer: 'ls', check: (c) => ran(c, 'ls') },
        { say: 'You can make things inside other folders by giving a path.', do: 'Run these two commands:<br><code>mkdir robot</code><br><code>touch robot/plan.txt</code>', hint: 'Type the first line, press Enter, then type the second line.', answer: 'mkdir robot   then   touch robot/plan.txt', check: (c) => c.sh.isFile('~/projects/robot/plan.txt') },
        { say: '<code>tree</code> draws a picture of your folders.', do: 'Type <code>tree</code>', hint: 'Just the word tree.', answer: 'tree', check: (c) => ran(c, 'tree') },
        { say: '<b>From memory.</b>', do: 'Make a folder called <code>games</code> inside projects.', hint: 'You are already in projects. Which command makes a directory?', answer: 'mkdir games', check: (c) => c.sh.isDir('~/projects/games') },
      ],
    },
    {
      id: 'cli-read', track: 'cli', kind: 'terminal', title: 'Read and write files',
      goal: 'Put words into files and read them back.',
      learn: [['echo Hello', 'print words'], ['echo "Hi" > f.txt', 'write words into a file (replaces it)'], ['echo "Hi" >> f.txt', 'add words to the end of a file'], ['cat f.txt', 'show what is in a file']],
      tree: WITH_PROJECTS, cwd: '~/projects',
      steps: [
        { say: '<code>echo</code> repeats whatever you say.', do: 'Try <code>echo Hello</code>', hint: 'echo, a space, then any word.', answer: 'echo Hello', check: (c) => ran(c, 'echo') && c.out.trim() !== '' },
        { say: 'The <code>&gt;</code> arrow sends the words into a file instead of onto the screen.', do: 'Type <code>echo "My first file" &gt; hello.txt</code>', hint: 'The quotes keep the three words together. The > key is on the key bar.', answer: 'echo "My first file" > hello.txt', check: (c) => (c.sh.read('~/projects/hello.txt') || '').trim() !== '' },
        { say: '<code>cat</code> shows what is inside a file.', do: 'Read your file: <code>cat hello.txt</code>', hint: 'cat, a space, then the file name.', answer: 'cat hello.txt', check: (c) => ranWith(c, 'cat', /hello\.txt/) },
        { say: 'Two arrows <code>&gt;&gt;</code> add to the <b>end</b> of a file.', do: 'Type <code>echo "Line two" &gt;&gt; hello.txt</code>', hint: 'Two > signs with no space between them.', answer: 'echo "Line two" >> hello.txt', check: (c) => (c.sh.read('~/projects/hello.txt') || '').trim().split('\n').length >= 2 },
        { say: 'Check that both lines are there.', do: 'Read the file again.', hint: 'Press the ↑ key to find your old cat command.', answer: 'cat hello.txt', check: (c) => ranWith(c, 'cat', /hello\.txt/) },
        { say: 'Careful! One arrow <code>&gt;</code> <b>replaces</b> everything in the file.', do: 'See it happen: <code>echo "Oops" &gt; hello.txt</code>, then read the file.', hint: 'Run the echo line, then cat hello.txt', answer: 'echo "Oops" > hello.txt   then   cat hello.txt', check: (c) => ranWith(c, 'cat', /hello\.txt/) && (c.sh.read('~/projects/hello.txt') || '').trim().split('\n').length === 1 },
        { say: '<b>From memory.</b>', do: 'Make a file called <code>todo.txt</code> that says <b>Build a robot</b>.', hint: 'Use echo, quotes, one arrow, and the file name.', answer: 'echo "Build a robot" > todo.txt', check: (c) => /build a robot/i.test(c.sh.read('~/projects/todo.txt') || '') },
      ],
    },
    {
      id: 'cli-tidy', track: 'cli', kind: 'terminal', title: 'Copy, move, delete',
      goal: 'Keep your project folder tidy.',
      learn: [['cp a.txt b.txt', 'copy a file'], ['mv old.txt new.txt', 'rename or move a file'], ['rm junk.txt', 'delete a file (forever!)'], ['rmdir folder', 'delete an empty folder'], ['rm -r folder', 'delete a folder and everything in it']],
      tree: Object.assign({}, BASE, { projects: { 'hello.txt': 'My first file\n', 'todo.txt': 'Build a robot\n', 'old_junk.txt': 'zzz\n', robot: { 'plan.txt': '' }, games: {}, temp: { 'junk1.txt': 'x\n', 'junk2.txt': 'y\n' } } }),
      cwd: '~/projects',
      steps: [
        { say: '<code>cp</code> copies a file. Say what to copy, then the name of the copy.', do: 'Type <code>cp hello.txt backup.txt</code>', hint: 'Three parts with spaces between: cp, the old name, the new name.', answer: 'cp hello.txt backup.txt', check: (c) => c.sh.isFile('~/projects/backup.txt') && c.sh.isFile('~/projects/hello.txt') },
        { say: '<code>mv</code> moves a file. Moving it to a new name is how you <b>rename</b>.', do: 'Rename a file: <code>mv todo.txt plans.txt</code>', hint: 'mv, the old name, the new name.', answer: 'mv todo.txt plans.txt', check: (c) => !c.sh.exists('~/projects/todo.txt') && c.sh.isFile('~/projects/plans.txt') },
        { say: 'If the second name is a folder, the file moves <b>into</b> it.', do: 'Move the plans into the robot folder: <code>mv plans.txt robot</code>', hint: 'mv plans.txt robot', answer: 'mv plans.txt robot', check: (c) => c.sh.isFile('~/projects/robot/plans.txt') },
        { say: '<code>rm</code> removes a file. There is <b>no recycle bin</b> in the terminal. Gone means gone, so read the name twice.', do: 'Delete the junk: <code>rm old_junk.txt</code>', hint: 'Try typing rm old then press Tab.', answer: 'rm old_junk.txt', check: (c) => !c.sh.exists('~/projects/old_junk.txt') },
        { say: '<code>rmdir</code> removes an <b>empty</b> folder.', do: 'Remove the empty games folder: <code>rmdir games</code>', hint: 'rmdir games', answer: 'rmdir games', check: (c) => !c.sh.exists('~/projects/games') },
        { say: 'The <code>temp</code> folder has files in it, so <code>rmdir</code> will refuse. <code>rm -r</code> removes a folder and everything inside.', do: 'Type <code>rm -r temp</code>', hint: 'The -r option means "and everything inside".', answer: 'rm -r temp', check: (c) => !c.sh.exists('~/projects/temp') },
        { say: '<b>From memory.</b> Two jobs.', do: 'Make a copy of <code>hello.txt</code> called <code>hello2.txt</code>. Then delete <code>backup.txt</code>.', hint: 'One cp command, then one rm command.', answer: 'cp hello.txt hello2.txt   then   rm backup.txt', check: (c) => c.sh.isFile('~/projects/hello2.txt') && !c.sh.exists('~/projects/backup.txt') },
      ],
    },
    {
      id: 'cli-power', track: 'cli', kind: 'terminal', title: 'Power moves',
      goal: 'Work faster, get help, and use admin power.',
      learn: [['↑ key', 'bring back your last command'], ['ls -l', 'list with details'], ['man ls', 'read the manual for a command'], ['history', 'show commands you typed'], ['grep word file', 'find a word in a file'], ['sudo apt update', 'run a command with admin power']],
      tree: BASE,
      steps: [
        { say: 'The <code>-l</code> option shows a <b>long</b> list with sizes and details.', do: 'Type <code>ls -l</code>', hint: 'That is a lowercase L after the dash.', answer: 'ls -l', check: (c) => ranWith(c, 'ls', /-\w*l/) },
        { say: 'The Pi remembers what you typed. Press <kbd>↑</kbd> to bring back the last command.', do: 'Press <kbd>↑</kbd>, then <kbd>Enter</kbd>, to run <code>ls -l</code> again.', hint: 'On a tablet, tap the ↑ key above the terminal.', answer: '↑ then Enter', check: (c) => c.line !== '' && c.line === c.prev },
        { say: 'Forgot how a command works? Every command has a manual.', do: 'Read the manual for ls: <code>man ls</code>', hint: 'man, a space, then the command name.', answer: 'man ls', check: (c) => ran(c, 'man') },
        { say: '<code>history</code> lists everything you typed.', do: 'Type <code>history</code>', hint: 'One word.', answer: 'history', check: (c) => ran(c, 'history') },
        { say: '<code>grep</code> searches inside a file. It prints every line that has your word.', do: 'Find the robot lines: <code>grep robot Documents/story.txt</code><br>Use <kbd>Tab</kbd> to finish the names.', hint: 'grep, the word to find, then the path to the file.', answer: 'grep robot Documents/story.txt', check: (c) => ran(c, 'grep') && /robot/.test(c.out) },
        { say: 'On a real Pi, <code>apt</code> installs and updates software. It needs admin power.', do: 'Try <code>apt update</code> and read the error.', hint: 'Type apt update. It is meant to fail!', answer: 'apt update', check: (c) => ran(c, 'apt') || ran(c, 'sudo') },
        { say: '<code>sudo</code> means "<b>s</b>uper<b>u</b>ser <b>do</b>". It runs one command as the admin. Use it with care.', do: 'Run it with power: <code>sudo apt update</code>', hint: 'Put the word sudo in front of the last command.', answer: 'sudo apt update', check: (c) => ran(c, 'sudo') && /up to date/.test(c.out) },
      ],
    },
    {
      id: 'cli-python', track: 'cli', kind: 'terminal', title: 'Run Python from the terminal',
      goal: 'Write a program in nano and run it. This is how it works on a real Pi.',
      learn: [['nano hello.py', 'open a file in the nano editor'], ['Ctrl+O, Ctrl+X', 'save, then exit nano'], ['python3 hello.py', 'run a Python program']],
      tree: BASE,
      steps: [
        { say: 'Programs are just text files. First, a folder to keep them in.', do: 'Run <code>mkdir code</code>, then <code>cd code</code>.', hint: 'Two commands. Press Enter after each one.', answer: 'mkdir code   then   cd code', check: (c) => c.sh.cwd === HOME + '/code' },
        { say: '<code>nano</code> is a text editor that lives in the terminal. Python files end in <code>.py</code>.', do: 'Type <code>nano hello.py</code>. In nano, type this line:<br><code>print("Hello from my Pi!")</code><br>Then <b>Save</b> (Ctrl+O) and <b>Exit</b> (Ctrl+X).', hint: 'Use the Save and Exit buttons at the bottom of nano. The line needs both quotes and both brackets.', answer: 'nano hello.py, type print("Hello from my Pi!"), Save, Exit', check: (c) => /print\s*\(/.test(c.sh.read('~/code/hello.py') || '') },
        { say: 'Your program is saved. Check it.', do: 'Read it with <code>cat hello.py</code>', hint: 'cat hello.py', answer: 'cat hello.py', check: (c) => ranWith(c, 'cat', /hello\.py/) },
        { say: 'To run a Python program, type <code>python3</code> and the file name.', do: 'Run it: <code>python3 hello.py</code>', hint: 'If you see an error, open nano again and check the line.', answer: 'python3 hello.py', check: (c) => c.pyRan && !c.pyError && c.out.trim() !== '' },
        { say: 'You just wrote and ran a program the same way real Pi makers do.', do: 'Open <code>nano hello.py</code> again. Add a second <code>print</code> line with your own message. Save, exit, and run it.', hint: 'Each print goes on its own line. Then python3 hello.py', answer: 'add print("Second line") in nano, then python3 hello.py', check: (c) => c.pyRan && !c.pyError && count(c.sh.read('~/code/hello.py') || '', /print\s*\(/g) >= 2 },
      ],
    },

    /* ================= PYTHON ================= */
    {
      id: 'py-print', track: 'py', kind: 'python', title: 'Say hello',
      goal: 'Make Python print words and numbers.',
      learn: [['print("Hello")', 'show words on the screen'], ['print(2 + 3)', 'show the answer to a sum']],
      starter: 'print("Hello, world!")\n',
      steps: [
        { say: 'This is a Python program. It is one line long. <code>print</code> shows words on the screen.', do: 'Press <b>Run</b>.', hint: 'The Run button is above the code.', answer: 'Press Run', check: (c) => c.finished && /Hello/.test(c.out) },
        { say: 'The words inside the quotes are called a <b>string</b>. You can change them to anything.', do: 'Change the message so it says hello to <b>you</b>. Then run it.', hint: 'Only change the words between the two " marks.', answer: 'print("Hello, Sam!")', check: (c) => c.finished && c.out.trim() !== '' && c.out.trim() !== 'Hello, world!' },
        { say: 'Python runs your lines from top to bottom, one at a time.', do: 'Add a second <code>print</code> line under the first. Run it.', hint: 'Press Enter at the end of line 1, then type another print("...") line.', answer: 'print("Hello, Sam!")\nprint("I am learning Python.")', check: (c) => c.finished && lines(c).length >= 2 && count(code(c), /print\s*\(/g) >= 2 },
        { say: 'Numbers do not need quotes. Python can do maths: <code>+</code> <code>-</code> <code>*</code> (times) <code>/</code> (divide).', do: 'Add a line that prints a sum, like <code>print(2 + 3)</code>.', hint: 'No quotes this time, or Python will just print the sum as words.', answer: 'print(2 + 3)', check: (c) => c.finished && /print\s*\(\s*\d+\s*[-+*/]\s*\d+/.test(code(c)) && lines(c).some((l) => /^-?\d+(\.\d+)?$/.test(l.trim())) },
        { say: '<b>Bug hunt.</b> Every coder makes mistakes. Finding them is part of the job. This program has one.', do: 'Run it and read the error. Then fix the bug.', hint: 'A string needs a quote at both ends. Look at the end of the words.', answer: 'print("Almost there!")', starter: 'print("Almost there!)\n', check: (c) => c.finished && /Almost there/.test(c.out) },
      ],
    },
    {
      id: 'py-vars', track: 'py', kind: 'python', title: 'Variables',
      goal: 'Store things in named boxes.',
      learn: [['name = "Pi"', 'store words in a variable'], ['age = 10', 'store a number'], ['print(f"Hi {name}")', 'put a variable inside a string']],
      starter: 'name = "Pi"\nprint("Hello", name)\n',
      steps: [
        { say: 'A <b>variable</b> is a box with a name on it. Line 1 puts the string <code>"Pi"</code> in a box called <code>name</code>.', do: 'Run it to see what line 2 prints.', hint: 'Press Run.', answer: 'Press Run', check: (c) => c.finished && c.out.trim() !== '' },
        { say: 'Change what is in the box, and everything that uses the box changes too.', do: 'Put <b>your</b> name in the variable. Run it.', hint: 'Change "Pi" on line 1. Keep the quotes.', answer: 'name = "Sam"', check: (c) => c.finished && /name\s*=\s*["'](?!Pi["'])[^"']+["']/.test(code(c)) },
        { say: 'Variables can hold numbers too. Python can do maths with them.', do: 'Add these lines and run:<br><code>age = 10</code><br><code>print(age + 1)</code>', hint: 'Numbers have no quotes. You can use your real age.', answer: 'age = 10\nprint(age + 1)', check: (c) => c.finished && /age\s*=\s*\d+/.test(code(c)) && lines(c).some((l) => /^\d+$/.test(l.trim())) },
        { say: 'An <b>f-string</b> drops variables into a sentence. Put an <code>f</code> before the quote, and the variable in curly brackets.', do: 'Add: <code>print(f"{name} is {age} years old")</code>', hint: 'The f goes right before the first quote, with no space.', answer: 'print(f"{name} is {age} years old")', check: (c) => c.finished && /f["'][^"']*\{\s*\w+\s*\}/.test(code(c)) },
        { say: '<b>Bug hunt.</b> This program should print 6.', do: 'Run it, read the error, and fix it.', hint: 'Compare the spelling of the two names very carefully.', answer: 'score = 5\nprint(score + 1)', starter: 'score = 5\nprint(scroe + 1)\n', check: (c) => c.finished && c.out.trim() === '6' },
      ],
    },
    {
      id: 'py-input', track: 'py', kind: 'python', title: 'Ask questions',
      goal: 'Let the person using your program type an answer.',
      learn: [['name = input("Name? ")', 'ask a question and store the answer'], ['int(input("Age? "))', 'ask for a number']],
      starter: 'name = input("What is your name? ")\nprint("Nice to meet you,", name)\n',
      steps: [
        { say: '<code>input</code> asks a question and waits. Whatever is typed goes into the variable.', do: 'Run it. Type your answer in the output box and press <kbd>Enter</kbd>.', hint: 'After you press Run, a box appears under the output. Type there.', answer: 'Run, then answer the question', check: (c) => c.finished && c.inputs >= 1 },
        { say: 'You can ask as many questions as you like.', do: 'Add a second question, like a favourite food or colour. Print the answer. Run it.', hint: 'Copy the pattern: food = input("Favourite food? ") and then print it.', answer: 'food = input("Favourite food? ")\nprint("Yum,", food)', check: (c) => c.finished && count(code(c), /input\s*\(/g) >= 2 && c.inputs >= 2 },
        { say: '<code>input</code> always gives you a <b>string</b>, even if the person types 9. To do maths, wrap it in <code>int( )</code> to make it a whole number.', do: 'Add these lines and run:<br><code>age = int(input("How old are you? "))</code><br><code>print("Next year you will be", age + 1)</code>', hint: 'Count the brackets: int( input( "..." ) ) has two closing brackets.', answer: 'age = int(input("How old are you? "))\nprint("Next year you will be", age + 1)', check: (c) => c.finished && /int\s*\(\s*input/.test(code(c)) && /\d/.test(c.out) },
      ],
    },
    {
      id: 'py-if', track: 'py', kind: 'python', title: 'Decisions',
      goal: 'Make your program choose what to do.',
      learn: [['if x > 5:', 'do something only when it is true'], ['else:', 'do this when it is not'], ['elif x > 2:', 'check another thing'], ['==', 'is equal to']],
      starter: 'temp = 30\n\nif temp > 25:\n    print("It is hot!")\n',
      steps: [
        { say: '<code>if</code> asks a yes or no question. The line ends with a colon <code>:</code>. The lines underneath are pushed in by 4 spaces. They only run when the answer is yes.', do: 'Run it.', hint: 'Press Run.', answer: 'Press Run', check: (c) => c.finished && /hot/i.test(c.out) },
        { say: '<code>else</code> says what to do when the answer is no.', do: 'Change <code>temp</code> to <code>10</code>. Then add at the bottom:<br><code>else:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print("It is cool.")</code>', hint: 'else: starts at the left edge, lined up with if. The print under it has 4 spaces.', answer: 'temp = 10\n\nif temp > 25:\n    print("It is hot!")\nelse:\n    print("It is cool.")', check: (c) => c.finished && /else\s*:/.test(code(c)) && c.out.trim() !== '' && !/hot/i.test(c.out) },
        { say: '<code>elif</code> means "else if". It checks another question in between.', do: 'Between the if and the else, add:<br><code>elif temp > 15:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print("It is nice.")</code><br>Try different temps.', hint: 'elif lines up with if and else. Do not forget the colon.', answer: 'if temp > 25:\n    print("It is hot!")\nelif temp > 15:\n    print("It is nice.")\nelse:\n    print("It is cool.")', check: (c) => c.finished && /elif\s+.+:/.test(code(c)) && c.out.trim() !== '' },
        { say: 'Two equals signs <code>==</code> ask "are these the same?". One equals sign <code>=</code> puts a value in a box.', do: 'Write a new program. Ask for a password with <code>input</code>. If it is <code>"raspberry"</code>, print <b>Access granted</b>. If not, print <b>Access denied</b>.', hint: 'word = input("Password? ") then if word == "raspberry": on the next line.', answer: 'word = input("Password? ")\nif word == "raspberry":\n    print("Access granted")\nelse:\n    print("Access denied")', starter: '# Write your password checker here\n', check: (c) => c.finished && /input\s*\(/.test(code(c)) && /==/.test(code(c)) && /granted|denied/i.test(c.out) },
      ],
    },
    {
      id: 'py-loops', track: 'py', kind: 'python', title: 'Loops',
      goal: 'Repeat things without typing them again.',
      learn: [['for i in range(5):', 'repeat 5 times'], ['while count > 0:', 'repeat while something is true'], ['from time import sleep', 'get the sleep tool'], ['sleep(1)', 'wait 1 second']],
      starter: 'for i in range(3):\n    print("Blink", i)\n',
      steps: [
        { say: 'A <code>for</code> loop repeats the pushed-in lines. <code>range(3)</code> means 3 times. Watch what <code>i</code> does.', do: 'Run it.', hint: 'Press Run.', answer: 'Press Run', check: (c) => c.finished && lines(c).length >= 3 },
        { say: 'Coders count from <b>0</b>. So 3 loops are numbered 0, 1, 2.', do: 'Make it loop <b>10</b> times.', hint: 'Change the number inside range( ).', answer: 'for i in range(10):\n    print("Blink", i)', check: (c) => c.finished && /range\s*\(\s*10\s*\)/.test(code(c)) && lines(c).length >= 10 },
        { say: 'A <code>while</code> loop repeats as long as something is true.', do: 'Replace your code with this countdown and run it:<pre>count = 5\nwhile count > 0:\n    print(count)\n    count = count - 1\nprint("Lift off!")</pre>', hint: 'The last print has no spaces in front, so it runs once, after the loop ends.', answer: 'count = 5\nwhile count > 0:\n    print(count)\n    count = count - 1\nprint("Lift off!")', check: (c) => c.finished && /while\s+.+:/.test(code(c)) && /5\s+4\s+3\s+2\s+1\s/.test(c.out) && /lift off/i.test(c.out) },
        { say: 'That was fast. <code>sleep(1)</code> makes Python wait 1 second. You have to <b>import</b> it first.', do: 'Add <code>from time import sleep</code> as the very first line. Add <code>sleep(1)</code> inside the loop.', hint: 'sleep(1) needs 4 spaces in front so it is inside the loop.', answer: 'from time import sleep\n\ncount = 5\nwhile count > 0:\n    print(count)\n    sleep(1)\n    count = count - 1\nprint("Lift off!")', check: (c) => c.finished && /sleep\s*\(/.test(code(c)) && /import/.test(code(c)) && /5\s+4\s+3\s+2\s+1\s/.test(c.out) },
        { say: '<b>Bug hunt.</b> This should print Hop three times.', do: 'Run it, read the error, and fix it.', hint: 'Lines inside a loop need 4 spaces at the start.', answer: 'for i in range(3):\n    print("Hop")', starter: 'for i in range(3):\nprint("Hop")\n', check: (c) => c.finished && count(c.out, /Hop/g) === 3 },
      ],
    },
    {
      id: 'py-lists', track: 'py', kind: 'python', title: 'Lists',
      goal: 'Keep many things in one variable.',
      learn: [['colors = ["red", "green"]', 'make a list'], ['colors[0]', 'get the first thing'], ['for c in colors:', 'loop over every thing'], ['colors.append("blue")', 'add to the end'], ['len(colors)', 'count the things']],
      starter: 'colors = ["red", "amber", "green"]\nprint(colors[0])\n',
      steps: [
        { say: 'A <b>list</b> holds many things in order, inside square brackets. <code>colors[0]</code> gets the first one. Counting starts at 0.', do: 'Run it.', hint: 'Press Run.', answer: 'Press Run', check: (c) => c.finished && /red/.test(c.out) },
        { say: 'The numbers in the square brackets are 0, 1, 2.', do: 'Change the print so it shows <b>green</b>.', hint: 'Green is the third thing. Counting from 0, that is number 2.', answer: 'print(colors[2])', check: (c) => c.finished && /green/.test(c.out) && !/red/.test(c.out) },
        { say: 'A <code>for</code> loop can walk through a list, one thing at a time.', do: 'Replace the print with:<br><code>for color in colors:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print(color)</code>', hint: 'color (no s) is a new variable. It holds one thing from the list each time round.', answer: 'for color in colors:\n    print(color)', check: (c) => c.finished && /for\s+\w+\s+in\s+colors\s*:/.test(code(c)) && /red[\s\S]*amber[\s\S]*green/.test(c.out) },
        { say: '<code>.append( )</code> adds to the end of a list. <code>len( )</code> counts how many things are in it.', do: 'At the bottom add:<br><code>colors.append("blue")</code><br><code>print(len(colors))</code>', hint: 'These two lines start at the left edge, so they are not inside the loop.', answer: 'colors.append("blue")\nprint(len(colors))', check: (c) => c.finished && /\.append\s*\(/.test(code(c)) && /len\s*\(/.test(code(c)) && lines(c).some((l) => l.trim() === '4') },
      ],
    },
    {
      id: 'py-funcs', track: 'py', kind: 'python', title: 'Functions',
      goal: 'Teach Python a new word of your own.',
      learn: [['def cheer():', 'make your own command'], ['cheer()', 'use it'], ['def greet(name):', 'a function that takes a value'], ['return n * 2', 'send an answer back']],
      starter: 'def cheer():\n    print("Go Pi go!")\n\ncheer()\n',
      steps: [
        { say: '<code>def</code> defines a <b>function</b>: your own command with a name. Nothing happens until you <b>call</b> it by writing <code>cheer()</code>.', do: 'Run it.', hint: 'Press Run.', answer: 'Press Run', check: (c) => c.finished && c.out.trim() !== '' },
        { say: 'Once a function exists, you can call it again and again.', do: 'Call <code>cheer()</code> three times.', hint: 'Add two more cheer() lines at the bottom, at the left edge.', answer: 'cheer()\ncheer()\ncheer()', check: (c) => c.finished && lines(c).length >= 3 },
        { say: 'A function can take a value in its brackets. It is called a <b>parameter</b>.', do: 'Add this and run:<pre>def greet(name):\n    print("Hello", name)\n\ngreet("Ada")\ngreet("Linus")</pre>', hint: 'Put it under your other code. The def line ends with a colon.', answer: 'def greet(name):\n    print("Hello", name)\n\ngreet("Ada")\ngreet("Linus")', check: (c) => c.finished && /def\s+greet\s*\(\s*\w+\s*\)\s*:/.test(code(c)) && count(c.out, /Hello/g) >= 2 },
        { say: '<code>return</code> sends an answer back to whoever called the function.', do: 'Add this and run:<pre>def double(n):\n    return n * 2\n\nprint(double(21))</pre>', hint: 'It should print 42.', answer: 'def double(n):\n    return n * 2\n\nprint(double(21))', check: (c) => c.finished && /return/.test(code(c)) && /\b42\b/.test(c.out) },
      ],
    },

    /* ================= PI PROJECTS ================= */
    {
      id: 'pi-blink', track: 'pi', kind: 'python', title: 'First light',
      goal: 'Turn an LED on and off with code.',
      learn: [['from gpiozero import LED', 'get the LED tool'], ['led = LED(17)', 'an LED on GPIO pin 17'], ['led.on()', 'light it'], ['led.off()', 'turn it off'], ['while True:', 'repeat forever']],
      board: [{ pin: 17, kind: 'led', color: 'red' }],
      wiring: 'LED long leg to <b>GPIO17</b> (pin 11). LED short leg to a <b>330 Ω resistor</b>, then to <b>GND</b> (pin 6). Always use the resistor. It protects the LED and the Pi.',
      starter: 'from gpiozero import LED\nfrom time import sleep\n\nled = LED(17)\nled.on()\n',
      steps: [
        { say: 'A Raspberry Pi has <b>GPIO pins</b>: little metal legs your code can switch on and off. <code>gpiozero</code> is the Python tool for them. The board below is a pretend one, with an LED on pin 17.', do: 'Run the code and watch the LED.', hint: 'Press Run, then look at the green board.', answer: 'Press Run', check: (c) => ons(c, 17) >= 1 },
        { say: '<code>led.on()</code> sends power to pin 17. On a real Pi the LED goes dark when the program ends, so we need to wait.', do: 'Add two lines at the bottom: wait 1 second, then turn the LED off.', hint: 'sleep(1) then led.off()', answer: 'led.on()\nsleep(1)\nled.off()', check: (c) => c.finished && ons(c, 17) >= 1 && durations(c, 17).length >= 1 && /sleep\s*\(/.test(code(c)) },
        { say: 'On, wait, off, wait. Do that again and again and you have a <b>blink</b>.', do: 'Use a <code>for</code> loop to blink the LED <b>5 times</b>.', hint: 'for i in range(5): then four pushed-in lines: on, sleep, off, sleep.', answer: 'for i in range(5):\n    led.on()\n    sleep(0.5)\n    led.off()\n    sleep(0.5)', check: (c) => ons(c, 17) >= 5 && /\b(for|while)\b/.test(code(c)) },
        { say: 'The number in <code>sleep( )</code> sets the speed. It can be a decimal, like <code>0.2</code>.', do: 'Make it blink <b>fast</b>. Use a sleep shorter than half a second.', hint: 'Change both sleeps to sleep(0.1)', answer: 'sleep(0.1)', check: (c) => ons(c, 17) >= 5 && durations(c, 17).slice(0, 5).every((d) => d < 0.45) },
        { say: '<code>while True:</code> loops <b>forever</b>. Most Pi projects run this way, until you stop them.', do: 'Change the <code>for</code> line to <code>while True:</code>. Run it, watch a few blinks, then press <b>Stop</b>.', hint: 'True has a capital T. Keep the colon.', answer: 'while True:\n    led.on()\n    sleep(0.5)\n    led.off()\n    sleep(0.5)', check: (c) => /while\s+True\s*:/.test(code(c)) && ons(c, 17) >= 3 },
      ],
    },
    {
      id: 'pi-traffic', track: 'pi', kind: 'python', title: 'Traffic lights',
      goal: 'Control three LEDs in the right order.',
      learn: [['red = LED(17)', 'give each LED a clear name'], ['green.on()', 'switch one LED']],
      board: [{ pin: 17, kind: 'led', color: 'red' }, { pin: 27, kind: 'led', color: 'amber' }, { pin: 22, kind: 'led', color: 'green' }],
      wiring: 'Three LEDs, each with its own <b>330 Ω resistor</b> to GND. Red to <b>GPIO17</b>, amber to <b>GPIO27</b>, green to <b>GPIO22</b>.',
      starter: 'from gpiozero import LED\nfrom time import sleep\n\nred = LED(17)\namber = LED(27)\ngreen = LED(22)\n\nred.on()\nsleep(1)\nred.off()\n',
      steps: [
        { say: 'Three LEDs on three pins. Each one gets its own variable with a clear name.', do: 'Run it.', hint: 'Press Run.', answer: 'Press Run', check: (c) => ons(c, 17) >= 1 },
        { say: 'After red goes off, the cars can go.', do: 'Add code so <b>green</b> comes on for 1 second, then goes off.', hint: 'Copy the three red lines and change red to green.', answer: 'green.on()\nsleep(1)\ngreen.off()', check: (c) => hasOrder(onSeq(c), [17, 22]) && durations(c, 22).length >= 1 },
        { say: 'A full cycle is: red, green, amber, then red again.', do: 'Add <b>amber</b> after green, then <b>red</b> again.', hint: 'Each light needs three lines: on, sleep, off.', answer: 'amber.on()\nsleep(1)\namber.off()\nred.on()\nsleep(1)\nred.off()', check: (c) => hasOrder(onSeq(c), [17, 22, 27, 17]) },
        { say: 'Real traffic lights never stop.', do: 'Put the cycle inside <code>while True:</code> so it repeats. Watch two full cycles, then press <b>Stop</b>.', hint: 'Every line of the cycle needs 4 spaces in front. Select the lines and tap the indent key.', answer: 'while True:\n    red.on()\n    sleep(1)\n    red.off()\n    green.on()\n    sleep(1)\n    green.off()\n    amber.on()\n    sleep(1)\n    amber.off()', check: (c) => /while\s+True\s*:/.test(code(c)) && hasOrder(onSeq(c), [17, 22, 27, 17, 22, 27]) },
      ],
    },
    {
      id: 'pi-button', track: 'pi', kind: 'python', title: 'Push the button',
      goal: 'Make your code react to a real press.',
      learn: [['button = Button(2)', 'a button on GPIO pin 2'], ['button.wait_for_press()', 'pause until it is pressed'], ['button.is_pressed', 'True while it is held down']],
      board: [{ pin: 2, kind: 'button' }, { pin: 17, kind: 'led', color: 'red' }],
      wiring: 'Button: one leg to <b>GPIO2</b> (pin 3), the other leg to <b>GND</b>. LED on <b>GPIO17</b> with a 330 Ω resistor, as before.',
      starter: 'from gpiozero import LED, Button\n\nled = LED(17)\nbutton = Button(2)\n\nprint("Press the button!")\nbutton.wait_for_press()\nled.on()\nprint("You pressed it!")\n',
      steps: [
        { say: 'LEDs are <b>outputs</b>: the Pi talks. Buttons are <b>inputs</b>: the Pi listens. <code>wait_for_press()</code> pauses the program until the button goes down.', do: 'Run it. Then press the round button on the board.', hint: 'The program waits for you. Press and hold the round button with your finger or mouse.', answer: 'Run, then press the button on the board', check: (c) => presses(c, 2) >= 1 && ons(c, 17) >= 1 },
        { say: 'There is also <code>wait_for_release()</code>. It pauses until you let go.', do: 'Add two lines at the bottom so the LED turns off when you <b>let go</b>. Run it: press, hold, release.', hint: 'button.wait_for_release() then led.off()', answer: 'button.wait_for_release()\nled.off()', check: (c) => c.finished && /wait_for_release/.test(code(c)) && presses(c, 2) >= 1 && durations(c, 17).length >= 1 },
        { say: '<code>button.is_pressed</code> is <code>True</code> while the button is down. Check it again and again in a loop and the LED follows your finger.', do: 'Replace everything under <code>button = Button(2)</code> with this. Press the button a few times, then press <b>Stop</b>.<pre>while True:\n    if button.is_pressed:\n        led.on()\n    else:\n        led.off()</pre>', hint: 'There are two levels of pushing in here: 4 spaces, then 8 spaces.', answer: 'while True:\n    if button.is_pressed:\n        led.on()\n    else:\n        led.off()', check: (c) => /is_pressed/.test(code(c)) && presses(c, 2) >= 2 && ons(c, 17) >= 2 },
        { say: 'Now count the presses with a variable.', do: 'Write a program that prints the count each time you press. Get to <b>3</b>, then press Stop.<pre>count = 0\nwhile True:\n    button.wait_for_press()\n    count = count + 1\n    print(count)\n    button.wait_for_release()</pre>', hint: 'Keep the import line and the button = Button(2) line at the top.', answer: 'count = 0\nwhile True:\n    button.wait_for_press()\n    count = count + 1\n    print(count)\n    button.wait_for_release()', check: (c) => presses(c, 2) >= 3 && lines(c).some((l) => l.trim() === '3') },
      ],
    },
    {
      id: 'pi-reaction', track: 'pi', kind: 'python', title: 'Reaction game',
      goal: 'Build a game that times how fast you are.',
      learn: [['from random import uniform', 'get a random-number tool'], ['uniform(2, 5)', 'a random number from 2 to 5'], ['time()', 'the time right now, in seconds'], ['round(x, 2)', 'round to 2 decimal places']],
      board: [{ pin: 2, kind: 'button' }, { pin: 17, kind: 'led', color: 'green' }],
      wiring: 'The same parts as the last mission: a button on <b>GPIO2</b> and an LED on <b>GPIO17</b> with its resistor.',
      starter: 'from gpiozero import LED, Button\nfrom time import sleep, time\nfrom random import uniform\n\nled = LED(17)\nbutton = Button(2)\n\nprint("Get ready...")\nsleep(uniform(2, 5))\nled.on()\nstart = time()\nbutton.wait_for_press()\nled.off()\nreaction = time() - start\nprint("Your time:", round(reaction, 2), "seconds")\n',
      steps: [
        { say: 'This is a whole game. Read it line by line. It waits a random time, lights the LED, then measures how long you take to press.', do: 'Run it. Press the button as soon as the light comes on.', hint: 'Wait for the LED. Then press the round button quickly.', answer: 'Run, wait for the light, press the button', check: (c) => c.finished && presses(c, 2) >= 1 && /\d/.test(c.out) },
        { say: 'Games are more fun when they talk back.', do: 'At the bottom, add an <code>if</code> and <code>else</code>. If <code>reaction</code> is less than <code>0.4</code>, print <b>Lightning fast!</b> If not, print <b>Keep practicing!</b>', hint: 'if reaction < 0.4: and then a pushed-in print. Then else: and another print.', answer: 'if reaction < 0.4:\n    print("Lightning fast!")\nelse:\n    print("Keep practicing!")', check: (c) => c.finished && /if\s+reaction\s*<=?/.test(code(c)) && /else\s*:/.test(code(c)) && presses(c, 2) >= 1 },
        { say: 'One go is never enough.', do: 'Put the game inside <code>for round_number in range(3):</code> so you play <b>3 rounds</b>.', hint: 'Everything from print("Get ready...") down needs 4 more spaces. Select those lines and tap the indent key.', answer: 'for round_number in range(3):\n    print("Get ready...")\n    sleep(uniform(2, 5))\n    ... (the rest, pushed in)', check: (c) => c.finished && /for\s+\w+\s+in\s+range\s*\(\s*3\s*\)/.test(code(c)) && ons(c, 17) >= 3 && presses(c, 2) >= 3 },
      ],
    },
    {
      id: 'pi-morse', track: 'pi', kind: 'python', title: 'Morse code SOS',
      goal: 'Send a message with light and sound.',
      learn: [['buzzer = Buzzer(3)', 'a buzzer on GPIO pin 3'], ['def dot():', 'wrap a pattern in a function']],
      board: [{ pin: 3, kind: 'buzzer' }, { pin: 17, kind: 'led', color: 'red' }],
      wiring: 'Buzzer long leg to <b>GPIO3</b> (pin 5), short leg to <b>GND</b>. LED on <b>GPIO17</b> with its resistor.',
      starter: 'from gpiozero import LED, Buzzer\nfrom time import sleep\n\nled = LED(17)\nbuzzer = Buzzer(3)\n\ndef dot():\n    led.on()\n    buzzer.on()\n    sleep(0.2)\n    led.off()\n    buzzer.off()\n    sleep(0.2)\n\ndot()\ndot()\ndot()\n',
      steps: [
        { say: 'Morse code spells letters with short flashes (dots) and long flashes (dashes). Three dots is the letter <b>S</b>. This program makes a little sound.', do: 'Run it.', hint: 'Press Run. You can turn the sound off on the board.', answer: 'Press Run', check: (c) => ons(c, 17) >= 3 },
        { say: 'A dash is a long flash. Three dashes is the letter <b>O</b>.', do: 'Write a <code>dash()</code> function. It is the same as <code>dot()</code> but stays on for <code>0.6</code> seconds. Call it 3 times after the dots.', hint: 'Copy the whole dot function, rename it to dash, and change the first sleep to 0.6.', answer: 'def dash():\n    led.on()\n    buzzer.on()\n    sleep(0.6)\n    led.off()\n    buzzer.off()\n    sleep(0.2)', check: (c) => /def\s+dash\s*\(\s*\)\s*:/.test(code(c)) && durations(c, 17).filter((d) => d > 0.45).length >= 3 },
        { say: '<b>SOS</b> is the famous call for help: dot dot dot, dash dash dash, dot dot dot.', do: 'Make your program send a full <b>SOS</b>.', hint: 'Nine calls in a row: three dot(), three dash(), three dot().', answer: 'dot()\ndot()\ndot()\ndash()\ndash()\ndash()\ndot()\ndot()\ndot()', check: (c) => { const d = durations(c, 17).map((x) => (x > 0.45 ? 'L' : 's')).join(''); return d.includes('sssLLLsss'); } },
      ],
    },
    {
      id: 'pi-ship', track: 'pi', kind: 'terminal', title: 'Ship it like a maker',
      goal: 'Do the whole job from the terminal, just like on a real Pi.',
      learn: [['mkdir, cd, nano, python3', 'the real Pi workflow'], ['Ctrl+C', 'stop a running program']],
      tree: Object.assign({}, BASE, { projects: {} }), cwd: '~/projects',
      wiring: 'One LED on <b>GPIO17</b> with a 330 Ω resistor to GND. On a real Pi you type these exact commands in the Terminal app.',
      steps: [
        { say: 'This is the final mission. You will make a project folder, write the code in nano, and run it. No code editor. Just the terminal.', do: 'Make a folder called <code>blink</code> and go into it.', hint: 'mkdir blink, then cd blink', answer: 'mkdir blink   then   cd blink', check: (c) => c.sh.cwd === HOME + '/projects/blink' },
        { say: 'Now write the program.', do: 'Open <code>nano blink.py</code> and type your blink program. Save and exit.<pre>from gpiozero import LED\nfrom time import sleep\n\nled = LED(17)\nfor i in range(5):\n    led.on()\n    sleep(0.5)\n    led.off()\n    sleep(0.5)</pre>', hint: 'In nano, the Tab key makes the 4 spaces for you. Save with Ctrl+O, exit with Ctrl+X.', answer: 'nano blink.py, type the program, Save, Exit', check: (c) => { const s = c.sh.read('~/projects/blink/blink.py') || ''; return /LED\s*\(/.test(s) && /\.on\s*\(/.test(s); } },
        { say: 'Time to run it. The board will appear under the terminal.', do: 'Type <code>python3 blink.py</code>', hint: 'If you see an error, read the line number, then fix it in nano.', answer: 'python3 blink.py', check: (c) => c.pyRan && !c.pyError && c.events.filter((e) => e.kind === 'led' && e.value > 0).length >= 2 },
        { say: 'It works! One last look at what you made.', do: 'Show the details of your file with <code>ls -l</code>', hint: 'ls -l', answer: 'ls -l', check: (c) => ranWith(c, 'ls', /-\w*l/) },
      ],
    },
  ];

  /* ---- Drill cards: quick-fire practice. A card unlocks when its mission is done. ---- */
  const q = '["\'“”]';
  const DRILLS = [
    ['cli-look', 'Show which folder you are in.', /^pwd$/, 'pwd'],
    ['cli-look', 'List the files in this folder.', /^ls$/, 'ls'],
    ['cli-look', 'List ALL files, even hidden ones.', /^ls -a$/, 'ls -a'],
    ['cli-look', 'Wipe the terminal screen clean.', /^clear$/, 'clear'],
    ['cli-move', 'Go into the folder called Music.', /^cd Music\/?$/, 'cd Music'],
    ['cli-move', 'Go up one folder.', /^cd \.\.\/?$/, 'cd ..'],
    ['cli-move', 'Go to your home folder.', /^cd( ~\/?)?$/, 'cd ~'],
    ['cli-make', 'Make a folder called toys.', /^mkdir toys\/?$/, 'mkdir toys'],
    ['cli-make', 'Make an empty file called ideas.txt', /^touch ideas\.txt$/, 'touch ideas.txt'],
    ['cli-read', 'Show what is inside notes.txt', /^cat notes\.txt$/, 'cat notes.txt'],
    ['cli-read', 'Write the word hi into a file called a.txt (replace what is there).', new RegExp('^echo ' + q + '?hi' + q + '? ?> ?a\\.txt$'), 'echo hi > a.txt'],
    ['cli-read', 'Add the word bye to the END of a.txt', new RegExp('^echo ' + q + '?bye' + q + '? ?>> ?a\\.txt$'), 'echo bye >> a.txt'],
    ['cli-tidy', 'Copy a.txt to a new file called b.txt', /^cp a\.txt b\.txt$/, 'cp a.txt b.txt'],
    ['cli-tidy', 'Rename old.txt to new.txt', /^mv old\.txt new\.txt$/, 'mv old.txt new.txt'],
    ['cli-tidy', 'Delete the file junk.txt', /^rm junk\.txt$/, 'rm junk.txt'],
    ['cli-tidy', 'Delete the folder stuff and everything in it.', /^rm -(r|R|rf|fr) stuff\/?$/, 'rm -r stuff'],
    ['cli-power', 'List files with all their details.', /^ls -l$/, 'ls -l'],
    ['cli-power', 'Open the manual for the cp command.', /^man cp$/, 'man cp'],
    ['cli-power', 'Update the software list on a Pi (needs admin power).', /^sudo apt(-get)? update$/, 'sudo apt update'],
    ['cli-python', 'Open game.py in the nano editor.', /^nano game\.py$/, 'nano game.py'],
    ['cli-python', 'Run the Python program game.py', /^python3 game\.py$/, 'python3 game.py'],
    ['py-print', 'Python: print the word Hello', new RegExp('^print\\(' + q + 'Hello' + q + '\\)$'), 'print("Hello")'],
    ['py-vars', 'Python: store the number 5 in a variable called lives', /^lives ?= ?5$/, 'lives = 5'],
    ['py-vars', 'Python: print the variable called score', /^print\(score\)$/, 'print(score)'],
    ['py-input', 'Python: ask "Name? " and store the answer in name', new RegExp('^name ?= ?input\\(' + q + 'Name\\? ?' + q + '\\)$'), 'name = input("Name? ")'],
    ['py-if', 'Python: the first line of an if that checks x is bigger than 3', /^if x ?> ?3:$/, 'if x > 3:'],
    ['py-loops', 'Python: the first line of a loop that repeats 5 times (use i)', /^for i in range\(5\):$/, 'for i in range(5):'],
    ['py-loops', 'Python: the first line of a loop that runs forever', /^while True:$/, 'while True:'],
    ['py-loops', 'Python: import the sleep tool', /^from time import sleep$/, 'from time import sleep'],
    ['py-loops', 'Python: wait for 2 seconds', /^sleep\(2\)$/, 'sleep(2)'],
    ['py-lists', 'Python: add "fish" to the end of the list called pets', new RegExp('^pets\\.append\\(' + q + 'fish' + q + '\\)$'), 'pets.append("fish")'],
    ['py-funcs', 'Python: the first line of a function called jump', /^def jump\(\):$/, 'def jump():'],
    ['pi-blink', 'Pi: import the LED tool from gpiozero', /^from gpiozero import LED$/, 'from gpiozero import LED'],
    ['pi-blink', 'Pi: make a variable led for an LED on GPIO pin 17', /^led ?= ?LED\(17\)$/, 'led = LED(17)'],
    ['pi-blink', 'Pi: turn the led on', /^led\.on\(\)$/, 'led.on()'],
    ['pi-blink', 'Pi: turn the led off', /^led\.off\(\)$/, 'led.off()'],
    ['pi-button', 'Pi: make a variable button for a Button on GPIO pin 2', /^button ?= ?Button\(2\)$/, 'button = Button(2)'],
    ['pi-button', 'Pi: pause until the button is pressed', /^button\.wait_for_press\(\)$/, 'button.wait_for_press()'],
  ].map((d, i) => ({ id: 'd' + i, after: d[0], q: d[1], re: d[2], answer: d[3] }));

  const LEVELS = ['Newcomer', 'Explorer', 'Tinkerer', 'Coder', 'Builder', 'Maker', 'Inventor', 'Pi Pro'];

  window.PiLessons = { TRACKS, MISSIONS, DRILLS, LEVELS, BASE };
})();
