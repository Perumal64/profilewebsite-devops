// Dependency-free project checks. Run: node scripts/check-site.mjs
// Used by the "Validate Website" and "Deploy to GitHub Pages" workflows.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const errors = [];
const fail = (msg) => errors.push(msg);
const read = (p) => readFileSync(p, 'utf8');
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

// 1. Required files
['index.html', 'css/theme.css', 'css/style.css', 'js/main.js', 'README.md'].forEach((f) => {
  if (!existsSync(f)) fail(`Missing required file: ${f}`);
});
if (errors.length) { report(); }

const html = read('index.html');
const theme = strip(read('css/theme.css'));
const style = strip(read('css/style.css'));

// 2. Theming rule: colours live ONLY in theme.css
const colourPattern = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(/;
if (colourPattern.test(style)) fail('css/style.css contains a hardcoded colour. Move it into css/theme.css as a variable.');
if (/\sstyle\s*=/.test(html)) fail('index.html has an inline style="" attribute. Use a class and theme variables instead.');

// 3. Every var(--x) used in style.css must exist in theme.css (or be defined in style.css)
const defined = new Set([...theme.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
[...style.matchAll(/(--[\w-]+)\s*:/g)].forEach((m) => defined.add(m[1]));
const used = new Set([...style.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]));
used.forEach((v) => { if (!defined.has(v)) fail(`css/style.css uses ${v} but it is not defined in css/theme.css`); });

// 4. Dark theme must only override variables that exist in the light theme
const rootBlock = (theme.match(/:root\s*\{([\s\S]*?)\}/) || [])[1] || '';
const darkBlock = (theme.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\}/) || [])[1];
if (!darkBlock) fail('css/theme.css has no [data-theme="dark"] block.');
else {
  const light = new Set([...rootBlock.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  [...darkBlock.matchAll(/(--[\w-]+)\s*:/g)].forEach((m) => { if (!light.has(m[1])) fail(`Dark theme overrides ${m[1]} which is not defined in :root`); });
}

// 5. HTML integrity: unique ids, anchors resolve, local files exist, images have alt
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
dup.forEach((id) => fail(`Duplicate id="${id}" in index.html`));
[...html.matchAll(/href="#([^"]*)"/g)].forEach((m) => { if (m[1] && !ids.includes(m[1])) fail(`Dead anchor: href="#${m[1]}" has no matching id`); });
[...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].forEach((m) => {
  const v = m[1];
  if (/^(https?:|mailto:|tel:|data:|#)/.test(v)) return;
  if (!existsSync(v)) fail(`Broken local reference: ${v}`);
});
[...html.matchAll(/<img\b[^>]*>/g)].forEach((m) => { if (!/\balt="/.test(m[0])) fail(`Image without alt text: ${m[0].slice(0, 60)}...`); });
[...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].forEach((m) => { if (!/rel="[^"]*noopener/.test(m[0])) fail(`External link missing rel="noopener": ${m[0].slice(0, 60)}...`); });

// 6. Pipeline consistency: every workflow_run trigger must name a workflow that exists
const wfDir = '.github/workflows';
if (existsSync(wfDir)) {
  const files = readdirSync(wfDir).filter((f) => /\.ya?ml$/.test(f));
  const names = new Map();
  files.forEach((f) => { const m = read(join(wfDir, f)).match(/^name:\s*(.+?)\s*$/m); if (m) names.set(m[1].replace(/^["']|["']$/g, ''), f); else fail(`${f} has no name:`); });
  files.forEach((f) => {
    const block = (read(join(wfDir, f)).match(/workflow_run:[\s\S]*?workflows:\s*\n((?:\s+-\s*.+\n?)+)/) || [])[1];
    if (!block) return;
    block.split('\n').map((l) => l.replace(/^\s*-\s*/, '').replace(/^["']|["']$/g, '').trim()).filter(Boolean)
      .forEach((n) => { if (!names.has(n)) fail(`${f} waits for workflow "${n}" which does not exist (known: ${[...names.keys()].join(', ')})`); });
  });
}

report();

function report() {
  if (errors.length) {
    console.error(`\n${errors.length} problem(s) found:\n` + errors.map((e) => ` - ${e}`).join('\n') + '\n');
    process.exit(1);
  }
  console.log('All site checks passed.');
}
