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

function sensitivity(source,period,baseStep,step) {
  const base = analyze(source,period,baseStep);
  const rows = source.trim().split(/\r?\n/).slice(1,-1).map(x=>Number(x.trim().split(/\s+/)[1]));
  const stride = step/baseStep;
  if(!Number.isInteger(stride)||rows.length%stride) throw Error('Incompatible step');
  const distance=(a,b)=>{const d=Math.abs(a-b)%period;return Math.min(d,period-d);};
  const trials=[];
  for(let i=0;i<stride;i++){
    const samples=rows.filter((_,j)=>j%stride===i);
    const minimum=Math.min(...samples);
    const data=['X Erel_kcalmol',...samples.map((e,j)=>[j*step,e-minimum].join(' ')),[period,samples[0]-minimum].join(' ')].join('\n');
    const sub=analyze(data,period,step);
    if(sub.extrema.length!==base.extrema.length || sub.H0_finite.length!==base.H0_finite.length) throw Error('Candidate count changed');
    const used=new Set();
    const referenceMin=Math.min(...rows);
    const pairs=base.extrema.map(x=>{
      const options=sub.extrema.filter(y=>y.type===x.type).map(y=>[distance(x.angle_deg,y.angle_deg+i*baseStep),y]).sort((a,b)=>a[0]-b[0]||a[1].angle_deg-b[1].angle_deg);
      const [angle,y]=options[0];
      if(used.has(y)) throw Error('Matching is not one to one');
      used.add(y);
      return {reference_angle_deg:x.angle_deg, candidate_angle_deg:y.angle_deg+i*baseStep,
        angle_error_deg:angle, energy_error_kcal_mol:Math.abs(y.energy_kcal_mol-(x.energy_kcal_mol-referenceMin))};
    });
    const deaths=sub.H0_finite.map(x=>x[1]);
    trials.push({origin_deg:i*baseStep,pairs,merger_split_kcal_mol:deaths.length===2?Math.abs(deaths[1]-deaths[0]):null});
  }
  const max=fn=>Math.max(...trials.map(fn));
  const round=x=>Number(x.toFixed(8));
  return {step_deg:step, number_of_origins:trials.length,
    max_angle_error_deg:max(t=>Math.max(...t.pairs.map(q=>q.angle_error_deg))),
    max_energy_error_kcal_mol:round(max(t=>Math.max(...t.pairs.map(q=>q.energy_error_kcal_mol)))),
    max_merger_split_kcal_mol:base.H0_finite.length===2?round(max(t=>t.merger_split_kcal_mol)):null,
    split_origins:base.H0_finite.length===2?trials.filter(t=>t.merger_split_kcal_mol>1e-8).length:null};
}

const cases = [["ethane",120,0.25],["n-butane",360,0.5]];
const output=Object.fromEntries(cases.map(([name,period,base])=>[name,[1,2,4,6,12].map(step=>sensitivity(readFileSync(new URL('../data/'+name+'_profile.txt',import.meta.url),'utf8'),period,base,step))]));
console.log(JSON.stringify(output,null,2));
