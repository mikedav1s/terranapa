// Checks every lick in the library: parses it, reports rhythm/spelling errors.
// Usage: node tools/validate.mjs [-v]   (-v prints the notes of each bar)
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'js');
const ctx = { window: {} };
vm.createContext(ctx);
const files = ['theory.js', 'dsl.js', 'library/meta.js', ...fs.readdirSync(path.join(root, 'library')).filter((f) => f !== 'meta.js').map((f) => 'library/' + f)];
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const { theory, dsl, library } = ctx.window.GP;
const verbose = process.argv.includes('-v');
let bad = 0;
const ids = new Set();
for (const lick of library.licks) {
  if (ids.has(lick.id)) { console.log('DUPLICATE ID', lick.id); bad++; }
  ids.add(lick.id);
  const p = dsl.parseLick(lick);
  if (lick.scale && !theory.scaleById(lick.scale.id)) { console.log(lick.id, 'unknown scale', lick.scale.id); bad++; }
  if (p.errors.length) { bad++; console.log('✗', lick.id, '\n   ' + p.errors.join('\n   ')); }
  if (verbose) {
    console.log('\n' + lick.id + '  [' + lick.meter + ']');
    for (const bar of p.bars) {
      console.log('  ' + bar.events.map((i) => {
        const e = p.events[i];
        if (e.rest) return 'r';
        if (e.tie) return '-';
        return e.notes.map((n) => theory.midiName(n.midi, p.flats) + '(' + n.string + '/' + n.fret + ')').join('+');
      }).join(' '));
    }
  }
}
console.log(`\n${library.licks.length} licks, ${bad} with problems`);
process.exit(bad ? 1 : 0);
