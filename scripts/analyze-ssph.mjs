import { readFileSync } from 'node:fs';

function analyze(source, period, step) {
  const rows = source.trim().split(/\r?\n/);
  if (rows.shift().trim() !== 'X Erel_kcalmol') throw Error('Unexpected header');
  const n = Math.round(period / step);
  if (rows.length !== n + 1) throw Error('Unexpected profile length');
  const all = rows.map((row, i) => {
    const fields = row.trim().split(/\s+/).map(Number);
    if (fields.length !== 2 || fields.some(x => !Number.isFinite(x)) || Math.abs(fields[0] - i * step) > 1e-8) {
      throw Error('Invalid row ' + (i + 2));
    }
    return fields[1];
  });
  const e = all.slice(0, n);
  const parent = e.map((_, i) => i);
  const root = i => {
    while (i !== parent[i]) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  // Lower-star edges enter at the larger endpoint energy. At equal levels,
  // edge order is deterministic but is not a physical ordering of saddles.
  const edges = e.map((v, i) => [Math.max(v, e[(i+1)%n]), i])
    .sort((a,b) => a[0]-b[0] || a[1]-b[1]);
  const finite = [];
  let cycle;
  for (const [level, i] of edges) {
    let a = root(i), b = root((i+1)%n);
    if (a === b) { cycle = level; continue; }
    if (e[a] > e[b] || (e[a] === e[b] && a > b)) [a,b] = [b,a];
    parent[b] = a;
    if (level > e[b]) finite.push([e[b],level]);
  }
  const extrema = e.flatMap((v,i) => {
    const lo = e[(i+n-1)%n], hi = e[(i+1)%n];
    const type = v < lo && v < hi ? 'minimum' : v > lo && v > hi ? 'maximum' : null;
    return type ? [{angle_deg:i*step, energy_kcal_mol:v, type}] : [];
  });
  return {vertices:n, H0_finite:finite.sort((a,b)=>a[0]-b[0] || a[1]-b[1]),
    H0_essential:[Math.min(...e),null], H1_essential:[cycle,null], extrema};
}

const cases = [['ethane', 120, 0.25], ['n-butane', 360, 0.5]];
const results = Object.fromEntries(cases.map(([name, period, step]) => {
  const file = new URL('../data/' + name + '_profile.txt', import.meta.url);
  return [name, analyze(readFileSync(file, 'utf8'), period, step)];
}));
console.log(JSON.stringify(results, null, 2));
