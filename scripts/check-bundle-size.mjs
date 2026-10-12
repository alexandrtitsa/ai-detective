import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const KB = 1024;

const BUDGETS = {
  initialJs: 130 * KB,
  totalJs: 230 * KB,
  css: 20 * KB,
};

const distDir = fileURLToPath(new URL('../dist/', import.meta.url));
const assetsDir = join(distDir, 'assets');

const gzipSize = (path) => gzipSync(readFileSync(path), { level: 9 }).length;
const kb = (bytes) => `${(bytes / KB).toFixed(1)} KB`;
const total = (files) => files.reduce((sum, file) => sum + file.size, 0);

const assets = readdirSync(assetsDir).map((name) => ({
  name,
  size: gzipSize(join(assetsDir, name)),
}));
const js = assets.filter((file) => file.name.endsWith('.js'));
const css = assets.filter((file) => file.name.endsWith('.css'));

const html = readFileSync(join(distDir, 'index.html'), 'utf8');
const initialNames = new Set(
  [...html.matchAll(/\/assets\/([\w.-]+\.js)/g)].map((match) => match[1]),
);
const initialJs = js.filter((file) => initialNames.has(file.name));

const checks = [
  ['Початковий JS', total(initialJs), BUDGETS.initialJs],
  ['Увесь JS', total(js), BUDGETS.totalJs],
  ['CSS', total(css), BUDGETS.css],
];

let failed = false;
for (const [label, size, budget] of checks) {
  const ok = size <= budget;
  failed ||= !ok;
  console.log(`${ok ? '✓' : '✗'} ${label} (gzip): ${kb(size)} з ${kb(budget)}`);
}

console.log('\nНайбільші JS-чанки (gzip):');
for (const file of [...js].sort((a, b) => b.size - a.size).slice(0, 6)) {
  console.log(`  ${kb(file.size).padStart(9)}  ${file.name}`);
}

process.exitCode = failed ? 1 : 0;