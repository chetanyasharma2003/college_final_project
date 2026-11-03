/**
 * seed-india.js  (batched, re-runnable)
 *
 * What it does
 *  - 36 current states / UTs (adds missing ones, keeps existing codes, fills region/population)
 *  - Approximate district areas for 6 states: RJ, MH, UP, MP, GJ, KA
 *  - SYNTHETIC blocks and villages under those districts (names and coordinates are generated)
 *  - KPI values at state level (12 months) for every KPI definition of the 6 schemes.
 *    Schemes with no KPI definitions get 3 defaults.
 *  - With --drilldown also district (3 months), block and village (latest month) KPI values.
 *    (Do NOT use --drilldown until the backend queries filter by level.)
 *
 * All KPI numbers are SIMULATED (deterministic pseudo-random, same result on every run).
 * State populations are approximate Census 2011 figures; district areas are approximate.
 *
 * Usage (from repository root):
 *   node scripts/seed-india.js --dry-run                      # no database, only checks the data
 *   node scripts/seed-india.js --geography-only               # states/codes only; no sample or KPI data
 *   ALLOW_SYNTHETIC_SEED=true node scripts/seed-india.js       # explicitly opt into synthetic demo data
 *   (add --drilldown to include district/block/village KPI values)
 *
 * Re-running is safe: it deletes only the KPI values of the 6 schemes and re-inserts them.
 * It never touches users, schemes or other tables.
 */

const DRY = process.argv.includes('--dry-run');
const GEOGRAPHY_ONLY = process.argv.includes('--geography-only');
// District/block/village KPI rows are only inserted with --drilldown, because several existing
// backend queries (rankings, top performers) do not yet filter by level and would mix them with
// state rows. Use --drilldown only after the backend queries are level-aware.
const DRILL = process.argv.includes('--drilldown');
const SCHEME_CODES = ['PMAY', 'MGNREGS', 'PMGSY', 'NRLM', 'DDU-GKY', 'SAGY'];

// ---------- static data ----------
// [name, preferredCode, region, population(approx, Census 2011)]
const STATES = [
  ['Andhra Pradesh', 'AP', 'South', 49577103],
  ['Arunachal Pradesh', 'AR', 'Northeast', 1383727],
  ['Assam', 'AS', 'Northeast', 31205576],
  ['Bihar', 'BR', 'East', 104099452],
  ['Chhattisgarh', 'CG', 'Central', 25545198],
  ['Goa', 'GA', 'West', 1458545],
  ['Gujarat', 'GJ', 'West', 60439692],
  ['Haryana', 'HR', 'North', 25351462],
  ['Himachal Pradesh', 'HP', 'North', 6864602],
  ['Jharkhand', 'JH', 'East', 32988134],
  ['Karnataka', 'KA', 'South', 61095297],
  ['Kerala', 'KL', 'South', 33406061],
  ['Madhya Pradesh', 'MP', 'Central', 72626809],
  ['Maharashtra', 'MH', 'West', 112374333],
  ['Manipur', 'MN', 'Northeast', 2855794],
  ['Meghalaya', 'ML', 'Northeast', 2966889],
  ['Mizoram', 'MZ', 'Northeast', 1097206],
  ['Nagaland', 'NL', 'Northeast', 1978502],
  ['Odisha', 'OD', 'East', 41974218],
  ['Punjab', 'PB', 'North', 27743338],
  ['Rajasthan', 'RJ', 'North', 68548437],
  ['Sikkim', 'SK', 'Northeast', 610577],
  ['Tamil Nadu', 'TN', 'South', 72147030],
  ['Telangana', 'TG', 'South', 35003674],
  ['Tripura', 'TR', 'Northeast', 3673917],
  ['Uttar Pradesh', 'UP', 'North', 199812341],
  ['Uttarakhand', 'UK', 'North', 10086292],
  ['West Bengal', 'WB', 'East', 91276115],
  ['Delhi', 'DL', 'North', 16787941],
  ['Jammu and Kashmir', 'JK', 'North', 12541302],
  ['Puducherry', 'PY', 'South', 1247953],
  ['Andaman and Nicobar Islands', 'AN', 'Islands'],
  ['Chandigarh', 'CH', 'North'],
  ['Dadra and Nagar Haveli and Daman and Diu', 'DN', 'West'],
  ['Ladakh', 'LA', 'North'],
  ['Lakshadweep', 'LD', 'Islands'],
];

// state name -> [district, lat, lng, area_km2(approx)]
const DISTRICTS = {
  Rajasthan: [
    ['Jaipur', 26.9124, 75.7873, 11152], ['Jodhpur', 26.2389, 73.0243, 22850],
    ['Udaipur', 24.5854, 73.7125, 13419], ['Kota', 25.2138, 75.8648, 5217],
    ['Bikaner', 28.0229, 73.3119, 30247], ['Ajmer', 26.4499, 74.6399, 8481],
  ],
  Maharashtra: [
    ['Pune', 18.5204, 73.8567, 15643], ['Nagpur', 21.1458, 79.0882, 9892],
    ['Nashik', 19.9975, 73.7898, 15530], ['Aurangabad', 19.8762, 75.3433, 10107],
    ['Kolhapur', 16.705, 74.2433, 7685], ['Thane', 19.2183, 72.9781, 9558],
  ],
  'Uttar Pradesh': [
    ['Lucknow', 26.8467, 80.9462, 2528], ['Varanasi', 25.3176, 82.9739, 1535],
    ['Agra', 27.1767, 78.0081, 4027], ['Kanpur Nagar', 26.4499, 80.3319, 3155],
    ['Gorakhpur', 26.7606, 83.3732, 3483], ['Prayagraj', 25.4358, 81.8463, 5246],
  ],
  'Madhya Pradesh': [
    ['Bhopal', 23.2599, 77.4126, 2772], ['Indore', 22.7196, 75.8577, 3898],
    ['Gwalior', 26.2183, 78.1828, 5214], ['Jabalpur', 23.1815, 79.9864, 5211],
    ['Ujjain', 23.1765, 75.7885, 6091], ['Sagar', 23.8388, 78.7378, 10252],
  ],
  Gujarat: [
    ['Ahmedabad', 23.0225, 72.5714, 8087], ['Surat', 21.1702, 72.8311, 4418],
    ['Vadodara', 22.3072, 73.1812, 7794], ['Rajkot', 22.3039, 70.8022, 11203],
    ['Bhavnagar', 21.7645, 72.1519, 9980], ['Jamnagar', 22.4707, 70.0577, 14125],
  ],
  Karnataka: [
    ['Bengaluru Urban', 12.9716, 77.5946, 2196], ['Mysuru', 12.2958, 76.6394, 6854],
    ['Belagavi', 15.8497, 74.4977, 13415], ['Kalaburagi', 17.3297, 76.8343, 10990],
    ['Dakshina Kannada', 12.8703, 74.8806, 4560], ['Dharwad', 15.4589, 75.0078, 4260],
  ],
};
const BLOCKS_PER_DISTRICT = 3;
const VILLAGES_PER_BLOCK = 3;

const DEFAULT_KPIS = {
  PMAY: [
    ['Houses Sanctioned', 'units', 'numeric', 100000],
    ['Houses Completed', 'units', 'numeric', 80000],
    ['Fund Utilization', '%', 'percentage', 90],
  ],
  MGNREGS: [
    ['Person-Days Generated', 'days', 'numeric', 5000000],
    ['Average Wage Rate', 'INR', 'currency', 300],
    ['Households Provided Work', 'households', 'numeric', 400000],
  ],
  PMGSY: [
    ['Road Length Completed', 'km', 'numeric', 5000],
    ['Habitations Connected', 'habitations', 'numeric', 2000],
    ['Roads Sanctioned', 'roads', 'numeric', 1500],
  ],
  NRLM: [
    ['Self Help Groups Formed', 'groups', 'numeric', 50000],
    ['Households Mobilised', 'households', 'numeric', 300000],
    ['Credit Linkage Amount', 'INR Crore', 'currency', 5000],
  ],
  'DDU-GKY': [
    ['Candidates Trained', 'people', 'numeric', 50000],
    ['Placement Rate', '%', 'percentage', 70],
    ['Training Centres Active', 'centres', 'numeric', 300],
  ],
  SAGY: [
    ['Adarsh Grams Identified', 'villages', 'numeric', 500],
    ['Development Plans Completed', 'plans', 'numeric', 400],
    ['Fund Utilization', '%', 'percentage', 85],
  ],
};

// ---------- helpers ----------
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seedStr) { // mulberry32 -> deterministic 0..1
  let a = hash(seedStr);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const round = (x, d = 4) => Number(x.toFixed(d));
const statusOf = (p) => (p >= 0.75 ? 'on_track' : p >= 0.5 ? 'at_risk' : 'critical');
const noScale = (def) => def.unit === '%' || def.unit === 'INR' || def.data_type === 'percentage';

function monthStarts(n) { // last n months, oldest first, UTC first-of-month
  const now = new Date();
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)));
  return out;
}
function chunks(arr, size) { const out = []; for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size)); return out; }

// Build KPI value rows for one entity. refs = {state_id,district_id,block_id,village_id}
function seriesRows({ def, refs, key, target, finalProgress, dates, wobble }) {
  const r = rng('series:' + key + ':' + def.id);
  const pct = def.unit === '%' || def.data_type === 'percentage';
  return dates.map((date, i) => {
    const t = dates.length === 1 ? 1 : i / (dates.length - 1);
    const p = clamp(finalProgress * (0.55 + 0.45 * t) * (1 + (r() - 0.5) * wobble), 0.05, 1.2);
    let value = target * p;
    if (pct) value = Math.min(value, 100);
    return {
      kpi_id: def.id, ...refs, date,
      value: round(value), target_value: round(target),
      status: statusOf(pct ? value / target : p),
    };
  });
}

// ---------- main ----------
async function main() {
  if (!DRY && !GEOGRAPHY_ONLY
    && (process.env.NODE_ENV === 'production' || process.env.ALLOW_SYNTHETIC_SEED !== 'true')) {
    throw new Error('Synthetic demo data is disabled unless ALLOW_SYNTHETIC_SEED=true in development. Use --geography-only for state references.');
  }

  let prisma = null;
  if (!DRY) {
    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();
  }
  const t0 = Date.now();

  // 1) states --------------------------------------------------------
  let stateRows; // [{id,name,code,population}]
  if (DRY) {
    stateRows = STATES.map(([name, code, , population], i) => ({ id: i + 1, name, code, population }));
  } else {
    const existing = await prisma.state.findMany();
    const takenCodes = new Set(existing.map((s) => s.code));
    for (const [name, pref, region, population] of STATES) {
      const found = existing.find((s) => s.name === name);
      if (found) {
        if (!GEOGRAPHY_ONLY) {
          await prisma.state.update({ where: { id: found.id }, data: { region, population } });
        }
        continue;
      }
      let code = pref;
      if (takenCodes.has(code)) { // pick another free 2-letter code
        const letters = name.replace(/[^A-Za-z]/g, '').toUpperCase();
        outer: for (const a of letters) for (const b of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
          if (!takenCodes.has(a + b)) { code = a + b; break outer; }
        }
      }
      takenCodes.add(code);
      await prisma.state.create({
        data: GEOGRAPHY_ONLY ? { name, code } : { name, code, region, population },
      });
    }
    stateRows = await prisma.state.findMany();
  }
  const stateByName = new Map(stateRows.map((s) => [s.name, s]));
  const stateList = STATES.map(([name]) => stateByName.get(name)).filter(Boolean);
  const totalPop = STATES.reduce((total, state) => total + (state[3] || 0), 0);
  console.log(`states ready: ${stateList.length}`);
  if (GEOGRAPHY_ONLY) {
    console.log('geography-only mode: no district, block, village, KPI definition, or KPI value data was written');
    if (prisma) await prisma.$disconnect();
    return;
  }

  // 2) districts / blocks / villages ---------------------------------
  const districts = []; // {id,name,state,lat,lng,area}
  const blocks = [];    // {id,name,district}
  const villages = [];  // {id,name,block}

  if (DRY) {
    let did = 1, bid = 1, vid = 1;
    for (const [sName, list] of Object.entries(DISTRICTS)) {
      for (const [name, lat, lng, area] of list) {
        const d = { id: did++, name, state: stateByName.get(sName), lat, lng, area }; districts.push(d);
        for (let b = 1; b <= BLOCKS_PER_DISTRICT; b++) {
          const blk = { id: bid++, name: `${name} Block ${b}`, district: d }; blocks.push(blk);
          for (let v = 1; v <= VILLAGES_PER_BLOCK; v++) villages.push({ id: vid++, name: `${name} B${b} Village ${v}`, block: blk });
        }
      }
    }
  } else {
    const dRows = [];
    for (const [sName, list] of Object.entries(DISTRICTS)) {
      const st = stateByName.get(sName);
      for (const [name, , , area] of list) dRows.push({ name, state_id: st.id, area_km2: area });
    }
    await prisma.district.createMany({ data: dRows, skipDuplicates: true });
    const dbD = await prisma.district.findMany({ where: { state_id: { in: stateList.map((s) => s.id) } } });
    const centre = {};
    for (const [sName, list] of Object.entries(DISTRICTS)) for (const [name, lat, lng] of list) centre[sName + '|' + name] = [lat, lng];
    for (const d of dbD) {
      const st = stateRows.find((s) => s.id === d.state_id);
      const c = centre[st.name + '|' + d.name];
      if (c) districts.push({ id: d.id, name: d.name, state: st, lat: c[0], lng: c[1], area: Number(d.area_km2) });
    }
    const bRows = [];
    for (const d of districts) for (let b = 1; b <= BLOCKS_PER_DISTRICT; b++) bRows.push({ name: `${d.name} Block ${b}`, district_id: d.id });
    await prisma.block.createMany({ data: bRows, skipDuplicates: true });
    const dMap = new Map(districts.map((d) => [d.id, d]));
    const dbB = await prisma.block.findMany({ where: { district_id: { in: districts.map((d) => d.id) } } });
    for (const b of dbB) blocks.push({ id: b.id, name: b.name, district: dMap.get(b.district_id) });
    const vRows = [];
    for (const blk of blocks) {
      const r = rng('village:' + blk.name);
      const bn = blk.name.split(' Block ')[1];
      for (let v = 1; v <= VILLAGES_PER_BLOCK; v++) {
        vRows.push({
          name: `${blk.district.name} B${bn} Village ${v}`, block_id: blk.id,
          population: 800 + Math.floor(r() * 4200),
          latitude: round(blk.district.lat + (r() - 0.5) * 0.5, 6),
          longitude: round(blk.district.lng + (r() - 0.5) * 0.5, 6),
        });
      }
    }
    await prisma.village.createMany({ data: vRows, skipDuplicates: true });
    const bMap = new Map(blocks.map((b) => [b.id, b]));
    const dbV = await prisma.village.findMany({ where: { block_id: { in: blocks.map((b) => b.id) } } });
    for (const v of dbV) villages.push({ id: v.id, name: v.name, block: bMap.get(v.block_id), lat: Number(v.latitude), lng: Number(v.longitude) });
  }
  console.log(`districts: ${districts.length}, blocks: ${blocks.length}, villages: ${villages.length}`);

  // 3) KPI definitions -----------------------------------------------
  let defs = []; // {id,scheme,kpi_name,unit,data_type,target_value}
  if (DRY) {
    let id = 1;
    for (const code of SCHEME_CODES) for (const [kpi_name, unit, data_type, target] of DEFAULT_KPIS[code])
      defs.push({ id: id++, scheme: code, kpi_name, unit, data_type, target_value: target });
  } else {
    for (const code of SCHEME_CODES) {
      const scheme = await prisma.scheme.findUnique({ where: { code } });
      if (!scheme) { console.warn(`scheme ${code} not found, skipping`); continue; }
      let found = await prisma.kPIDefinition.findMany({ where: { scheme_id: scheme.id } });
      if (found.length === 0) {
        await prisma.kPIDefinition.createMany({
          data: DEFAULT_KPIS[code].map(([kpi_name, unit, data_type, target]) => ({
            scheme_id: scheme.id, kpi_name, unit, data_type, target_value: target,
          })), skipDuplicates: true,
        });
        found = await prisma.kPIDefinition.findMany({ where: { scheme_id: scheme.id } });
      }
      for (const d of found) defs.push({ id: d.id, scheme: code, kpi_name: d.kpi_name, unit: d.unit, data_type: d.data_type, target_value: d.target_value == null ? 100 : Number(d.target_value) });
    }
  }
  console.log(`KPI definitions used: ${defs.length}`);

  // 4) KPI values ----------------------------------------------------
  const d12 = monthStarts(12);
  const d3 = d12.slice(-3);
  const latest = d12.slice(-1);
  const rows = [];
  const stateProg = new Map(); // `${stateId}:${defId}` -> final progress
  const districtProg = new Map();
  const blockProg = new Map();

  for (const def of defs) {
    for (const st of stateList) {
      const share = (STATES.find((s) => s[0] === st.name)[3] || 0) / totalPop;
      const target = noScale(def) ? def.target_value : Math.max(def.target_value * share, 1);
      const r = rng(`state:${st.name}:${def.kpi_name}`);
      const fp = 0.38 + r() * 0.7; // 0.38 .. 1.08
      stateProg.set(`${st.id}:${def.id}`, { fp, target });
      rows.push(...seriesRows({ def, refs: { state_id: st.id }, key: `S${st.id}`, target, finalProgress: fp, dates: d12, wobble: 0.06 }));
    }
  }
  const stateDistricts = new Map();
  for (const d of districts) (stateDistricts.get(d.state.id) || stateDistricts.set(d.state.id, []).get(d.state.id)).push(d);

  if (DRILL) for (const def of defs) {
    for (const d of districts) {
      const sp = stateProg.get(`${d.state.id}:${def.id}`);
      const nD = stateDistricts.get(d.state.id).length;
      const target = noScale(def) ? sp.target : sp.target / nD;
      const r = rng(`district:${d.name}:${def.kpi_name}`);
      const fp = clamp(sp.fp + (r() - 0.5) * 0.35, 0.2, 1.15);
      districtProg.set(`${d.id}:${def.id}`, { fp, target });
      rows.push(...seriesRows({ def, refs: { state_id: d.state.id, district_id: d.id }, key: `D${d.id}`, target, finalProgress: fp, dates: d3, wobble: 0.08 }));
    }
    for (const b of blocks) {
      const dp = districtProg.get(`${b.district.id}:${def.id}`);
      const target = noScale(def) ? dp.target : dp.target / BLOCKS_PER_DISTRICT;
      const r = rng(`block:${b.name}:${def.kpi_name}`);
      const fp = clamp(dp.fp + (r() - 0.5) * 0.4, 0.15, 1.15);
      blockProg.set(`${b.id}:${def.id}`, { fp, target });
      rows.push(...seriesRows({ def, refs: { state_id: b.district.state.id, district_id: b.district.id, block_id: b.id }, key: `B${b.id}`, target, finalProgress: fp, dates: latest, wobble: 0.1 }));
    }
    for (const v of villages) {
      const bp = blockProg.get(`${v.block.id}:${def.id}`);
      const target = noScale(def) ? bp.target : bp.target / VILLAGES_PER_BLOCK;
      const r = rng(`village:${v.name}:${def.kpi_name}`);
      const fp = clamp(bp.fp + (r() - 0.5) * 0.5, 0.1, 1.15);
      rows.push(...seriesRows({ def, refs: { state_id: v.block.district.state.id, district_id: v.block.district.id, block_id: v.block.id, village_id: v.id }, key: `V${v.id}`, target, finalProgress: fp, dates: latest, wobble: 0.1 }));
    }
  }
  console.log(`KPI value rows to insert: ${rows.length}`);

  // ---- sanity checks (also run in dry mode) ----
  const keys = new Set();
  let bad = 0;
  for (const r of rows) {
    const k = [r.kpi_id, r.state_id ?? '', r.district_id ?? '', r.block_id ?? '', r.village_id ?? '', +r.date].join('|');
    if (keys.has(k)) bad++;
    keys.add(k);
    if (!(r.value >= 0) || !Number.isFinite(r.value)) bad++;
  }
  for (const v of villages) if (v.lat !== undefined && !(v.lat > 6 && v.lat < 37.5 && v.lng > 68 && v.lng < 98)) bad++;
  if (bad) throw new Error(`sanity check failed: ${bad} problems`);
  const dist = rows.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {});
  console.log('status mix:', JSON.stringify(dist));

  if (DRY) { console.log(`DRY RUN OK (${((Date.now() - t0) / 1000).toFixed(1)}s) - nothing was written`); return; }

  // 5) write ---------------------------------------------------------
  const defIds = defs.map((d) => d.id);
  const del = await prisma.kPIValue.deleteMany({ where: { kpi_id: { in: defIds } } });
  console.log(`removed ${del.count} old KPI values of these schemes`);
  let done = 0;
  for (const part of chunks(rows, 2000)) {
    await prisma.kPIValue.createMany({ data: part });
    done += part.length;
    console.log(`  inserted ${done}/${rows.length}`);
  }
  console.log(`DONE in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error('SEED FAILED:', e.message || e); process.exit(1); });
