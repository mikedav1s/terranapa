/* Pi Quest — a small practice shell with a pretend Raspberry Pi file system.
   Nothing here touches the real device: every file lives in memory. */
(function () {
  'use strict';
  const HOME = '/home/pi';
  const D0 = '\x01', D1 = '\x02'; // wrap folder names so the terminal can colour them

  const mkdir = () => ({ type: 'dir', children: {} });
  const mkfile = (c) => ({ type: 'file', content: c || '' });
  const strip = (s) => s.replace(/[\x01\x02]/g, '');

  const DOCS = {
    pwd: ['Print Working Directory: shows the folder you are in.', 'pwd'],
    ls: ['List what is in a folder.', 'ls\nls -a      (show hidden files too)\nls -l      (show details)\nls Documents'],
    cd: ['Change Directory: move to another folder.', 'cd Documents\ncd ..      (go up one folder)\ncd ~       (go home)'],
    mkdir: ['Make a new folder.', 'mkdir projects'],
    touch: ['Make a new empty file.', 'touch notes.txt'],
    cat: ['Show what is inside a file.', 'cat notes.txt'],
    echo: ['Print some words. Use > to put them in a file.', 'echo Hello\necho "Hello" > hello.txt     (replace the file)\necho "More" >> hello.txt      (add to the end)'],
    cp: ['Copy a file.', 'cp hello.txt backup.txt\ncp -r folder folder2'],
    mv: ['Move or rename a file.', 'mv old.txt new.txt\nmv notes.txt Documents'],
    rm: ['Remove a file. There is no recycle bin!', 'rm junk.txt\nrm -r folder'],
    rmdir: ['Remove an empty folder.', 'rmdir old_folder'],
    clear: ['Wipe the screen clean.', 'clear'],
    history: ['Show the commands you typed before.', 'history'],
    man: ['Show the manual for a command.', 'man ls'],
    tree: ['Draw the folders and files as a tree.', 'tree'],
    grep: ['Find lines in a file that contain a word.', 'grep robot story.txt'],
    head: ['Show the first lines of a file.', 'head -n 3 story.txt'],
    tail: ['Show the last lines of a file.', 'tail -n 3 story.txt'],
    wc: ['Count lines, words and letters.', 'wc story.txt\nwc -l story.txt'],
    nano: ['Open a file in the nano text editor.', 'nano hello.py'],
    python3: ['Run a Python program.', 'python3 hello.py'],
    sudo: ['Run a command with admin power ("superuser do").', 'sudo apt update'],
    apt: ['Install and update software on the Pi.', 'sudo apt update\nsudo apt install python3-gpiozero'],
    whoami: ['Show your user name.', 'whoami'],
    date: ['Show the date and time.', 'date'],
    pinout: ['Show the GPIO pins on the Pi.', 'pinout'],
    help: ['List the commands you can use here.', 'help'],
  };

  function tokenize(line) {
    const toks = [];
    let i = 0, cur = null, quoted = false;
    const push = () => { if (cur !== null) { toks.push({ t: 'w', v: cur, q: quoted }); cur = null; quoted = false; } };
    while (i < line.length) {
      const ch = line[i];
      if (ch === ' ' || ch === '\t') { push(); i++; continue; }
      if (ch === '#' && cur === null) break;
      if (ch === "'" || ch === '"') {
        const end = line.indexOf(ch, i + 1);
        if (end < 0) throw new Error('You opened a quote ' + ch + ' but never closed it.');
        cur = (cur || '') + line.slice(i + 1, end); quoted = true; i = end + 1; continue;
      }
      if (ch === '\\' && i + 1 < line.length) { cur = (cur || '') + line[i + 1]; i += 2; continue; }
      if (ch === '|' || ch === ';') { push(); toks.push({ t: 'op', v: ch }); i++; continue; }
      if (ch === '&' && line[i + 1] === '&') { push(); toks.push({ t: 'op', v: '&&' }); i += 2; continue; }
      if (ch === '>') { push(); const dbl = line[i + 1] === '>'; toks.push({ t: 'op', v: dbl ? '>>' : '>' }); i += dbl ? 2 : 1; continue; }
      cur = (cur || '') + ch; i++;
    }
    push();
    return toks;
  }

  class Shell {
    /* io: { print(text, cls), clear(), editor(path, text) -> Promise<string|null>, python(code, name) -> Promise<{error}> } */
    constructor(io) { this.io = io; this.home = HOME; this.reset(); }

    reset(tree, cwd) {
      this.root = mkdir();
      this.history = [];
      this.last = { line: '', cmds: [], out: '', pyError: null, pyRan: false };
      this.mkdirp(HOME);
      this.seed({ '.bashrc': '# settings for your terminal\n', '.secret_note': 'You found a hidden file! Names that start with a dot stay hidden.\n' }, HOME);
      if (tree) this.seed(tree, HOME);
      this.cwd = cwd ? this.abs(cwd) : HOME;
    }
    seed(tree, base) {
      for (const [name, v] of Object.entries(tree)) {
        const p = base + '/' + name;
        if (typeof v === 'string') this.write(p, v); else { this.mkdirp(p); this.seed(v, p); }
      }
    }
    toJSON() { return { root: this.root, cwd: this.cwd, history: this.history.slice(-50) }; }
    load(data) { try { if (data && data.root && data.root.type === 'dir') { this.root = data.root; this.cwd = this.isDir(data.cwd) ? data.cwd : HOME; this.history = data.history || []; } } catch (e) { /* keep fresh state */ } }

    abs(p) {
      if (p === undefined || p === null || p === '') return this.cwd;
      if (p === '~' || p.startsWith('~/')) p = HOME + p.slice(1);
      if (!p.startsWith('/')) p = this.cwd + '/' + p;
      const parts = [];
      for (const s of p.split('/')) { if (!s || s === '.') continue; if (s === '..') parts.pop(); else parts.push(s); }
      return '/' + parts.join('/');
    }
    node(p) {
      let n = this.root;
      for (const s of this.abs(p).split('/').filter(Boolean)) {
        if (n.type !== 'dir' || !Object.prototype.hasOwnProperty.call(n.children, s)) return null;
        n = n.children[s];
      }
      return n;
    }
    split(p) { const a = this.abs(p); const i = a.lastIndexOf('/'); return { dir: this.node(a.slice(0, i) || '/'), name: a.slice(i + 1) }; }
    exists(p) { return !!this.node(p); }
    isDir(p) { const n = this.node(p); return !!n && n.type === 'dir'; }
    isFile(p) { const n = this.node(p); return !!n && n.type === 'file'; }
    read(p) { const n = this.node(p); return n && n.type === 'file' ? n.content : null; }
    mkdirp(p) {
      let n = this.root;
      for (const s of this.abs(p).split('/').filter(Boolean)) {
        if (!n.children[s]) n.children[s] = mkdir();
        n = n.children[s];
        if (n.type !== 'dir') return false;
      }
      return true;
    }
    write(p, content, append) {
      const { dir, name } = this.split(p);
      if (!dir || dir.type !== 'dir' || !name) return false;
      const ex = dir.children[name];
      if (ex && ex.type === 'dir') return false;
      dir.children[name] = mkfile(append && ex ? ex.content + content : content);
      return true;
    }
    pretty(p) { const a = this.abs(p); return a === HOME ? '~' : a.startsWith(HOME + '/') ? '~' + a.slice(HOME.length) : a; }
    prompt() { return 'pi@raspberrypi:' + this.pretty(this.cwd) + ' $ '; }

    glob(word) {
      if (!word.includes('*')) return [word];
      const i = word.lastIndexOf('/');
      const dirPart = i >= 0 ? word.slice(0, i + 1) : '';
      const pat = word.slice(i + 1);
      const d = this.node(dirPart || '.');
      if (!d || d.type !== 'dir') return [word];
      const re = new RegExp('^' + pat.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
      const hits = Object.keys(d.children).filter((n) => re.test(n) && (pat.startsWith('.') || !n.startsWith('.'))).sort();
      return hits.length ? hits.map((n) => dirPart + n) : [word];
    }

    async exec(line) {
      const io = this.io;
      this.last = { line: line.trim(), cmds: [], out: '', pyError: null, pyRan: false, prev: this.history[this.history.length - 1] || '' };
      if (!line.trim()) return this.last;
      this.history.push(line.trim());
      let toks;
      try { toks = tokenize(line); } catch (e) { this.err(e.message); return this.last; }

      // split into pipelines joined by && or ;
      const lists = [[]]; const joins = [];
      for (const t of toks) {
        if (t.t === 'op' && (t.v === '&&' || t.v === ';')) { joins.push(t.v); lists.push([]); } else lists[lists.length - 1].push(t);
      }
      let code = 0;
      for (let li = 0; li < lists.length; li++) {
        if (li > 0 && joins[li - 1] === '&&' && code !== 0) break;
        const stages = [[]];
        for (const t of lists[li]) { if (t.t === 'op' && t.v === '|') stages.push([]); else stages[stages.length - 1].push(t); }
        let stdin = null;
        for (let si = 0; si < stages.length; si++) {
          const argv = []; let redirect = null, bad = false;
          const st = stages[si];
          for (let k = 0; k < st.length; k++) {
            const t = st[k];
            if (t.t === 'op') {
              const target = st[k + 1];
              if (!target || target.t !== 'w') { this.err('After ' + t.v + ' you need a file name, like: echo hi ' + t.v + ' notes.txt'); bad = true; break; }
              redirect = { append: t.v === '>>', path: target.v }; k++;
            } else if (t.q) argv.push(t.v);
            else argv.push(...this.glob(t.v === '~' || t.v.startsWith('~/') ? HOME + t.v.slice(1) : t.v));
          }
          if (bad) { code = 2; break; }
          if (!argv.length) { if (redirect) this.write(redirect.path, '', redirect.append); continue; }
          this.last.cmds.push(argv);
          const res = await this.run(argv, stdin);
          code = res.code || 0;
          if (res.err) this.err(res.err);
          let out = res.out || '';
          if (redirect) {
            if (this.isDir(redirect.path)) { this.err('bash: ' + redirect.path + ': Is a directory'); code = 1; }
            else if (!this.write(redirect.path, strip(out), redirect.append)) { this.err('bash: ' + redirect.path + ': No such file or directory'); code = 1; }
            out = '';
          }
          if (si === stages.length - 1) { if (out) { io.print(out); this.last.out += strip(out); } } else stdin = strip(out);
        }
      }
      this.last.code = code;
      return this.last;
    }
    err(msg) { this.io.print(msg + '\n', 'err'); this.last.out += msg + '\n'; this.last.hadError = true; }

    async run(argv, stdin) {
      const name = argv[0], args = argv.slice(1);
      const fn = COMMANDS[name];
      if (!fn) {
        const guess = Object.keys(COMMANDS).find((c) => c === name.toLowerCase());
        return { err: 'bash: ' + name + ': command not found' + (guess ? '\n(Commands are lowercase. Did you mean: ' + guess + ' ?)' : '\n(Type help to see the commands you can use.)'), code: 127 };
      }
      try { return (await fn.call(this, args, stdin)) || { out: '' }; }
      catch (e) { return { err: name + ': ' + e.message, code: 1 }; }
    }

    /* Tab completion. Returns { line } with the completed text, or { options } to show. */
    complete(line) {
      const m = line.match(/(\S*)$/); const word = m[1];
      const before = line.slice(0, line.length - word.length);
      const firstWord = !before.trim() || /(\||&&|;)\s*$/.test(before);
      let cands, base = '';
      if (firstWord && !word.includes('/')) cands = Object.keys(COMMANDS).filter((c) => !HIDDEN.has(c)).map((c) => c + ' ');
      else {
        const i = word.lastIndexOf('/'); base = i >= 0 ? word.slice(0, i + 1) : '';
        const d = this.node(base || '.');
        cands = d && d.type === 'dir' ? Object.keys(d.children).filter((n) => !n.startsWith('.') || word.slice(base.length).startsWith('.')).map((n) => n + (d.children[n].type === 'dir' ? '/' : ' ')) : [];
      }
      const frag = word.slice(base.length);
      const hits = cands.filter((c) => c.startsWith(frag)).sort();
      if (!hits.length) return {};
      if (hits.length === 1) return { line: before + base + hits[0] };
      let common = hits[0];
      for (const h of hits) { let k = 0; while (k < common.length && common[k] === h[k]) k++; common = common.slice(0, k); }
      return { line: before + base + common, options: hits.map((h) => h.trim()) };
    }
  }

  function flags(args, known) {
    const f = new Set(), rest = [];
    for (const a of args) {
      if (a.length > 1 && a[0] === '-' && !/^-\d/.test(a) && a !== '--') { for (const ch of a.replace(/^-+/, '')) f.add(ch); }
      else rest.push(a);
    }
    for (const ch of f) if (known && !known.includes(ch)) throw new Error("I don't know the option -" + ch);
    return { f, rest };
  }
  const noFile = (cmd, p) => cmd + ': ' + p + ': No such file or directory';
  const clone = (n) => JSON.parse(JSON.stringify(n));

  function inputText(sh, cmd, files, stdin) {
    if (!files.length) { if (stdin === null) throw new Error('which file? Try: ' + cmd + ' notes.txt'); return [{ name: '', text: stdin }]; }
    return files.map((p) => {
      const n = sh.node(p);
      if (!n) throw new Error(p + ': No such file or directory');
      if (n.type === 'dir') throw new Error(p + ': Is a directory');
      return { name: p, text: n.content };
    });
  }

  const HIDDEN = new Set(['python', 'cowsay', 'exit', 'uname', 'hostname', 'which', 'apt-get', 'reboot', 'shutdown', 'll']);

  const COMMANDS = {
    pwd() { return { out: this.cwd + '\n' }; },
    whoami() { return { out: 'pi\n' }; },
    hostname() { return { out: 'raspberrypi\n' }; },
    uname(args) { return { out: args.includes('-a') ? 'Linux raspberrypi 6.6.31+rpt-rpi-v8 aarch64 GNU/Linux\n' : 'Linux\n' }; },
    date() { return { out: new Date().toString().replace(/ GMT.*/, '') + '\n' }; },
    clear() { this.io.clear(); return { out: '' }; },
    exit() { return { out: 'This is a practice terminal, so there is nothing to exit. Use the Back button to leave.\n' }; },

    ls(args) {
      const { f, rest } = flags(args, 'al1h');
      const targets = rest.length ? rest : ['.'];
      const blocks = []; const errs = [];
      const fmt = (name, n) => (n.type === 'dir' ? D0 + name + D1 : name);
      const long = (name, n) => (n.type === 'dir' ? 'drwxr-xr-x 2' : '-rw-r--r-- 1') + ' pi pi ' + String(n.type === 'dir' ? 4096 : n.content.length).padStart(5) + ' ' + fmt(name, n);
      for (const t of targets) {
        const n = this.node(t);
        if (!n) { errs.push("ls: cannot access '" + t + "': No such file or directory"); continue; }
        let lines;
        if (n.type === 'file') lines = [f.has('l') ? long(t, n) : t];
        else {
          const names = Object.keys(n.children).filter((x) => f.has('a') || !x.startsWith('.')).sort((a, b) => a.replace(/^\./, '').localeCompare(b.replace(/^\./, '')));
          lines = names.map((x) => (f.has('l') ? long(x, n.children[x]) : fmt(x, n.children[x])));
        }
        const body = f.has('l') || f.has('1') ? lines.join('\n') : lines.join('  ');
        blocks.push((targets.length > 1 && n.type === 'dir' ? t + ':\n' : '') + body);
      }
      const out = blocks.filter((b) => b !== '').join(targets.length > 1 ? '\n\n' : '\n');
      return { out: out ? out + '\n' : '', err: errs.join('\n'), code: errs.length ? 2 : 0 };
    },
    ll(args) { return COMMANDS.ls.call(this, ['-l', ...args]); },

    cd(args) {
      const t = args[0] === undefined ? HOME : args[0];
      const n = this.node(t);
      if (!n) return { err: 'bash: cd: ' + t + ': No such file or directory\n(Check the spelling. Capital letters matter! Type ls to see what is here.)', code: 1 };
      if (n.type !== 'dir') return { err: 'bash: cd: ' + t + ': Not a directory\n(That is a file. You can only cd into folders. Try: cat ' + t + ')', code: 1 };
      this.cwd = this.abs(t);
      return { out: '' };
    },

    mkdir(args) {
      const { f, rest } = flags(args, 'p');
      if (!rest.length) return { err: 'mkdir: what should the folder be called? Try: mkdir projects', code: 1 };
      const errs = [];
      for (const p of rest) {
        if (this.exists(p)) { if (!f.has('p')) errs.push("mkdir: cannot create directory '" + p + "': File exists"); continue; }
        if (f.has('p')) { this.mkdirp(p); continue; }
        const { dir, name } = this.split(p);
        if (!dir || dir.type !== 'dir') errs.push("mkdir: cannot create directory '" + p + "': No such file or directory");
        else dir.children[name] = mkdir();
      }
      return { out: '', err: errs.join('\n'), code: errs.length ? 1 : 0 };
    },

    touch(args) {
      if (!args.length) return { err: 'touch: what should the file be called? Try: touch notes.txt', code: 1 };
      const errs = [];
      for (const p of args) if (!this.exists(p) && !this.write(p, '')) errs.push("touch: cannot touch '" + p + "': No such file or directory");
      return { out: '', err: errs.join('\n'), code: errs.length ? 1 : 0 };
    },

    cat(args, stdin) {
      let out = '';
      for (const s of inputText(this, 'cat', args, stdin)) out += s.text;
      if (out && !out.endsWith('\n')) out += '\n';
      return { out };
    },

    echo(args) {
      let nl = true;
      if (args[0] === '-n') { nl = false; args = args.slice(1); }
      return { out: args.join(' ') + (nl ? '\n' : '') };
    },

    cp(args) {
      const { f, rest } = flags(args, 'rR');
      if (rest.length < 2) return { err: 'cp: you need two names: what to copy, and the name of the copy.\nTry: cp hello.txt backup.txt', code: 1 };
      const dest = rest[rest.length - 1];
      for (const src of rest.slice(0, -1)) {
        const n = this.node(src);
        if (!n) return { err: "cp: cannot stat '" + src + "': No such file or directory", code: 1 };
        if (n.type === 'dir' && !f.has('r') && !f.has('R')) return { err: "cp: -r not specified; omitting directory '" + src + "'\n(To copy a folder, use: cp -r " + src + ' ' + dest + ')', code: 1 };
        const target = this.isDir(dest) ? dest + '/' + this.abs(src).split('/').pop() : dest;
        const { dir, name } = this.split(target);
        if (!dir || dir.type !== 'dir') return { err: "cp: cannot create '" + dest + "': No such file or directory", code: 1 };
        dir.children[name] = clone(n);
      }
      return { out: '' };
    },

    mv(args) {
      const { rest } = flags(args, 'fv');
      if (rest.length < 2) return { err: 'mv: you need two names: the thing to move, and where it goes.\nTry: mv old.txt new.txt', code: 1 };
      const dest = rest[rest.length - 1];
      for (const src of rest.slice(0, -1)) {
        const n = this.node(src);
        if (!n) return { err: "mv: cannot stat '" + src + "': No such file or directory", code: 1 };
        const target = this.isDir(dest) ? dest + '/' + this.abs(src).split('/').pop() : dest;
        if (this.abs(target) === this.abs(src)) continue;
        if ((this.abs(target) + '/').startsWith(this.abs(src) + '/')) return { err: "mv: cannot move '" + src + "' into itself", code: 1 };
        const to = this.split(target);
        if (!to.dir || to.dir.type !== 'dir') return { err: "mv: cannot move to '" + dest + "': No such file or directory", code: 1 };
        const from = this.split(src);
        delete from.dir.children[from.name];
        to.dir.children[to.name] = n;
      }
      return { out: '' };
    },

    rm(args) {
      const { f, rest } = flags(args, 'rRfv');
      if (!rest.length) return { err: 'rm: which file? Try: rm junk.txt', code: 1 };
      const errs = [];
      for (const p of rest) {
        const a = this.abs(p);
        if (a === '/' || a === '/home' || a === HOME || (this.cwd + '/').startsWith(a + '/')) { errs.push("rm: refusing to remove '" + p + "' (you are standing in it, or it holds everything!)"); continue; }
        const n = this.node(p);
        if (!n) { if (!f.has('f')) errs.push("rm: cannot remove '" + p + "': No such file or directory"); continue; }
        if (n.type === 'dir' && !f.has('r') && !f.has('R')) { errs.push("rm: cannot remove '" + p + "': Is a directory\n(To delete a folder and everything in it: rm -r " + p + ')'); continue; }
        const { dir, name } = this.split(p);
        delete dir.children[name];
      }
      return { out: '', err: errs.join('\n'), code: errs.length ? 1 : 0 };
    },

    rmdir(args) {
      if (!args.length) return { err: 'rmdir: which folder? Try: rmdir old_folder', code: 1 };
      for (const p of args) {
        const n = this.node(p);
        if (!n) return { err: "rmdir: failed to remove '" + p + "': No such file or directory", code: 1 };
        if (n.type !== 'dir') return { err: "rmdir: failed to remove '" + p + "': Not a directory", code: 1 };
        if (Object.keys(n.children).length) return { err: "rmdir: failed to remove '" + p + "': Directory not empty\n(rmdir only removes empty folders. For a full one: rm -r " + p + ')', code: 1 };
        if (this.abs(p) === this.cwd) return { err: 'rmdir: you are standing in that folder. cd .. first.', code: 1 };
        const { dir, name } = this.split(p);
        delete dir.children[name];
      }
      return { out: '' };
    },

    tree(args) {
      const root = args[0] || '.';
      const n = this.node(root);
      if (!n || n.type !== 'dir') return { err: 'tree: ' + root + ': not a folder', code: 1 };
      let dirs = 0, files = 0;
      const walk = (d, pre) => {
        const names = Object.keys(d.children).filter((x) => !x.startsWith('.')).sort();
        let s = '';
        names.forEach((x, i) => {
          const c = d.children[x], last = i === names.length - 1;
          s += pre + (last ? '└── ' : '├── ') + (c.type === 'dir' ? D0 + x + D1 : x) + '\n';
          if (c.type === 'dir') { dirs++; s += walk(c, pre + (last ? '    ' : '│   ')); } else files++;
        });
        return s;
      };
      const body = walk(n, '');
      return { out: D0 + root + D1 + '\n' + body + '\n' + dirs + ' directories, ' + files + ' files\n' };
    },

    grep(args, stdin) {
      const { f, rest } = flags(args, 'in');
      if (!rest.length) return { err: 'grep: what word should I look for? Try: grep robot story.txt', code: 2 };
      const pat = f.has('i') ? rest[0].toLowerCase() : rest[0];
      const srcs = inputText(this, 'grep', rest.slice(1), stdin);
      let out = '';
      for (const s of srcs) s.text.split('\n').forEach((ln, i) => {
        if ((f.has('i') ? ln.toLowerCase() : ln).includes(pat) && (ln || pat === '')) out += (srcs.length > 1 ? s.name + ':' : '') + (f.has('n') ? i + 1 + ':' : '') + ln + '\n';
      });
      return { out, code: out ? 0 : 1 };
    },

    head(args, stdin) { return headTail(this, 'head', args, stdin); },
    tail(args, stdin) { return headTail(this, 'tail', args, stdin); },

    wc(args, stdin) {
      const { f, rest } = flags(args, 'lwc');
      let out = '';
      for (const s of inputText(this, 'wc', rest, stdin)) {
        const l = (s.text.match(/\n/g) || []).length, w = s.text.split(/\s+/).filter(Boolean).length, c = s.text.length;
        const parts = f.size ? [f.has('l') && l, f.has('w') && w, f.has('c') && c].filter((x) => x !== false) : [l, w, c];
        out += parts.join(' ') + (s.name ? ' ' + s.name : '') + '\n';
      }
      return { out };
    },

    history() { return { out: this.history.map((h, i) => String(i + 1).padStart(4) + '  ' + h).join('\n') + '\n' }; },

    which(args) { return args[0] && COMMANDS[args[0]] ? { out: '/usr/bin/' + args[0] + '\n' } : { out: '', code: 1 }; },

    help() {
      const names = Object.keys(DOCS);
      const w = Math.max(...names.map((n) => n.length)) + 2;
      return { out: 'Commands you can practice here:\n\n' + names.map((n) => '  ' + n.padEnd(w) + DOCS[n][0]).join('\n') + '\n\nType  man <command>  to learn more, like:  man ls\n' };
    },
    man(args) {
      if (!args[0]) return { err: 'What manual page do you want?\nFor example, try: man ls', code: 1 };
      const d = DOCS[args[0]];
      if (!d) return { err: 'No manual entry for ' + args[0], code: 16 };
      return { out: args[0].toUpperCase() + '\n\nWHAT IT DOES\n    ' + d[0] + '\n\nEXAMPLES\n' + d[1].split('\n').map((l) => '    ' + l).join('\n') + '\n' };
    },

    async nano(args) {
      if (!args[0]) return { err: 'nano: which file? Try: nano hello.py', code: 1 };
      if (this.isDir(args[0])) return { err: 'nano: ' + args[0] + ' is a folder, not a file', code: 1 };
      const { dir } = this.split(args[0]);
      if (!dir) return { err: 'nano: the folder for ' + args[0] + ' does not exist', code: 1 };
      const saved = await this.io.editor(args[0], this.read(args[0]) || '');
      if (saved !== null && saved !== undefined) this.write(args[0], saved);
      return { out: '' };
    },

    async python3(args) {
      if (args[0] === '--version' || args[0] === '-V') return { out: 'Python 3.11.2\n' };
      if (!args[0]) return { out: 'Python 3.11.2\nTo run a program, give its file name, like:  python3 hello.py\n(To try Python line by line, use the Python missions.)\n' };
      const n = this.node(args[0]);
      if (!n) return { err: "python3: can't open file '" + this.abs(args[0]) + "': [Errno 2] No such file or directory\n(Type ls to check the file is in this folder.)", code: 2 };
      if (n.type === 'dir') return { err: "python3: '" + args[0] + "' is a folder", code: 2 };
      this.last.pyRan = true;
      const res = await this.io.python(n.content, args[0]);
      this.last.pyError = res && res.error ? res.error : null;
      return { out: '', code: this.last.pyError ? 1 : 0 };
    },
    python(args) { return { err: "bash: python: command not found\n(On a Raspberry Pi the command is python3.)", code: 127 }; },

    async sudo(args, stdin) {
      if (!args.length) return { err: 'usage: sudo <command>   For example: sudo apt update', code: 1 };
      if (args[0] === 'apt' || args[0] === 'apt-get') return apt(this, args.slice(1), true);
      if (args[0] === 'reboot' || args[0] === 'shutdown' || args[0] === 'halt') return { out: 'On a real Pi that would turn it off or restart it. The practice Pi stays on!\n' };
      if (args[0] === 'rm' && args.some((a) => /^-.*r/.test(a)) && args.some((a) => a === '/' || a === '/*')) return { out: 'Whoa! On a real Pi, that command would erase EVERYTHING. Never run it. The practice Pi said no.\n' };
      return this.run(args, stdin);
    },
    apt(args) { return apt(this, args, false); },
    'apt-get'(args) { return apt(this, args, false); },
    reboot() { return { err: 'reboot: you need admin power for that. (And the practice Pi stays on anyway!)', code: 1 }; },
    shutdown() { return COMMANDS.reboot(); },

    pinout() {
      return { out: [
        'Raspberry Pi GPIO header (the pins used in Pi Quest are marked *)',
        '',
        '   3V3  (1)  (2)  5V',
        ' GPIO2* (3)  (4)  5V',
        ' GPIO3* (5)  (6)  GND*',
        ' GPIO4  (7)  (8)  GPIO14',
        '   GND  (9)  (10) GPIO15',
        'GPIO17* (11) (12) GPIO18',
        'GPIO27* (13) (14) GND',
        'GPIO22* (15) (16) GPIO23',
        '   3V3  (17) (18) GPIO24',
        '',
        'GPIO numbers are NOT the same as pin numbers. LED(17) means GPIO17, which is pin 11.',
        '',
      ].join('\n') };
    },

    cowsay(args) {
      const msg = args.join(' ') || 'Moo! Type something after cowsay.';
      const bar = '-'.repeat(msg.length + 2);
      return { out: ' ' + bar + '\n< ' + msg + ' >\n ' + bar + '\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||\n' };
    },
  };

  function headTail(sh, cmd, args, stdin) {
    let n = 10; const files = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n') n = parseInt(args[++i], 10);
      else if (/^-\d+$/.test(args[i])) n = parseInt(args[i].slice(1), 10);
      else files.push(args[i]);
    }
    if (!(n >= 0)) throw new Error('the number of lines must be a number, like: ' + cmd + ' -n 3 story.txt');
    let out = '';
    for (const s of inputText(sh, cmd, files, stdin)) {
      const lines = s.text.replace(/\n$/, '').split('\n');
      const pick = cmd === 'head' ? lines.slice(0, n) : lines.slice(Math.max(0, lines.length - n));
      if (pick.length && s.text) out += pick.join('\n') + '\n';
    }
    return { out };
  }

  function apt(sh, args, root) {
    const sub = args[0];
    if (!sub) return { out: 'apt installs and updates software.\nTry: sudo apt update\n' };
    if (!root) return { err: 'E: Could not open lock file - open (13: Permission denied)\nE: Are you root?\n(This command needs admin power. Put sudo in front: sudo apt ' + args.join(' ') + ')', code: 100 };
    if (sub === 'update') return { out: 'Hit:1 http://deb.debian.org/debian bookworm InRelease\nHit:2 http://archive.raspberrypi.com/debian bookworm InRelease\nReading package lists... Done\nBuilding dependency tree... Done\nAll packages are up to date.\n' };
    if (sub === 'upgrade') return { out: 'Reading package lists... Done\nCalculating upgrade... Done\n0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.\n' };
    if (sub === 'install') {
      const pk = args.slice(1).filter((a) => !a.startsWith('-'));
      if (!pk.length) return { err: 'apt: install what? Try: sudo apt install python3-gpiozero', code: 1 };
      return { out: 'Reading package lists... Done\n' + pk.map((p) => 'Setting up ' + p + ' ...').join('\n') + '\nDone. (This is practice, so nothing was really installed.)\n' };
    }
    return { err: 'E: Invalid operation ' + sub, code: 100 };
  }

  window.PiShell = { Shell, DOCS, HOME, stripMarks: strip, D0, D1 };
})();
