import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const FIXTURES = new URL('./fixtures/', import.meta.url).pathname;

export function readDist(path) {
  return readFileSync(join(DIST, path), 'utf8');
}

export function listDist() {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else out.push(relative(DIST, p));
    }
  };
  walk(DIST);
  return out;
}

export function fixture(name) {
  return readFileSync(join(FIXTURES, name), 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
}
