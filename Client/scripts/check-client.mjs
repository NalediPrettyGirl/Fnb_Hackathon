// Lightweight client checks (no dependencies):
//  1. every JS file parses as an ES module
//  2. every relative import resolves to a file
//  3. every <script src>/<link href> in the HTML files exists
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const walk = dir => readdirSync(dir).flatMap(name => {
  if (name === 'node_modules') return [];
  const full = join(dir, name);
  return statSync(full).isDirectory() ? walk(full) : [full];
});
const files = walk(root);
let problems = 0;
const fail = message => { console.error('✗', message); problems += 1; };

for (const file of files.filter(f => f.endsWith('.js'))) {
  const source = readFileSync(file, 'utf8');
  const tmp = mkdtempSync(join(tmpdir(), 'sbcheck-'));
  const copy = join(tmp, 'check.mjs');
  writeFileSync(copy, source);
  try { execFileSync(process.execPath, ['--check', copy], { stdio: 'pipe' }); }
  catch (error) { fail(`${file}: ${error.stderr}`); }
  rmSync(tmp, { recursive: true });
  for (const match of source.matchAll(/from\s+'(\.[^']+)'/g)) {
    if (!existsSync(resolve(dirname(file), match[1]))) fail(`${file}: missing import ${match[1]}`);
  }
}

for (const file of files.filter(f => f.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(/(?:src|href)="([^"#?]+\.(?:js|css))"/g)) {
    if (!existsSync(resolve(dirname(file), match[1]))) fail(`${file}: missing asset ${match[1]}`);
  }
}

if (problems) { console.error(`\n${problems} problem(s) found.`); process.exit(1); }
console.log(`Client check passed (${files.length} files).`);
