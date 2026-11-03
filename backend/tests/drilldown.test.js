import test from 'node:test';
import assert from 'node:assert/strict';
import { withStateLevelDefault } from '../src/utils/level-filter.js';
import { progressPct, statusFromProgress, latestPerEntity, averageCoords } from '../src/utils/drilldown-math.js';
import { createDrilldownService, HttpError } from '../src/services/drilldown.service.js';

test('withStateLevelDefault adds level nulls to plain queries and does not mutate input', () => {
  const input = { kpi_id: 1, state_id: 2 };
  const out = withStateLevelDefault(input);
  assert.deepEqual(out, { kpi_id: 1, state_id: 2, district_id: null, block_id: null, village_id: null });
  assert.deepEqual(input, { kpi_id: 1, state_id: 2 });
  assert.deepEqual(withStateLevelDefault(undefined), { district_id: null, block_id: null, village_id: null });
});

test('withStateLevelDefault leaves queries that name a level untouched', () => {
  assert.deepEqual(withStateLevelDefault({ district_id: { in: [1] } }), { district_id: { in: [1] } });
  assert.deepEqual(withStateLevelDefault({ village_id: null }), { village_id: null });
  assert.deepEqual(withStateLevelDefault({ block_id: 5, kpi_id: 1 }), { block_id: 5, kpi_id: 1 });
});

test('progress and status thresholds', () => {
  assert.equal(progressPct(50, 200), 25);
  assert.equal(progressPct('80', '90'), 88.9);
  assert.equal(progressPct(1, 0), null);
  assert.equal(progressPct(null, 10), null);
  assert.equal(statusFromProgress(75), 'on_track');
  assert.equal(statusFromProgress(74.9), 'at_risk');
  assert.equal(statusFromProgress(50), 'at_risk');
  assert.equal(statusFromProgress(49.9), 'critical');
  assert.equal(statusFromProgress(null), 'no_data');
});

test('latestPerEntity keeps the first (newest) row and averageCoords ignores bad points', () => {
  const rows = [{ k: 1, v: 'new' }, { k: 1, v: 'old' }, { k: 2, v: 'x' }];
  const m = latestPerEntity(rows, (r) => r.k);
  assert.equal(m.get(1).v, 'new');
  assert.equal(m.size, 2);
  assert.deepEqual(averageCoords([{ lat: 10, lng: 20 }, { lat: 20, lng: 30 }, { lat: NaN, lng: 1 }]), { lat: 15, lng: 25 });
  assert.equal(averageCoords([]), null);
});

// ---------- fake database ----------
function matches(row, where) {
  for (const [k, cond] of Object.entries(where || {})) {
    if (cond === null) { if (row[k] != null) return false; continue; }
    if (cond && typeof cond === 'object' && 'in' in cond) { if (!cond.in.includes(row[k])) return false; continue; }
    if (row[k] !== cond) return false;
  }
  return true;
}
const D = (s) => new Date(s);
function makeDb(schemeCode = 'PMAY-U') {
  const states = [{ id: 1, name: 'Rajasthan', code: 'RA', region: 'North' }, { id: 2, name: 'Assam', code: 'AS', region: 'Northeast' }];
  const districts = [
    { id: 10, name: 'Jaipur', state_id: 1, area_km2: '11152' },
    { id: 11, name: 'Kota', state_id: 1, area_km2: '5217' },
    { id: 12, name: 'Source district', state_id: 1, area_km2: null },
  ];
  const blocks = [{ id: 100, name: 'Jaipur Block 1', district_id: 10 }, { id: 101, name: 'Jaipur Block 2', district_id: 10 }];
  const villages = [
    { id: 1000, name: 'V1', block_id: 100, population: 900, latitude: '26.8', longitude: '75.7' },
    { id: 1001, name: 'V2', block_id: 100, population: 700, latitude: '27.0', longitude: '75.9' },
    { id: 1002, name: 'V3', block_id: 101, population: 500, latitude: '26.9', longitude: '75.8' },
  ];
  const kpiName = schemeCode === 'MGNREGS' ? 'Job Cards Issued (cumulative)' : 'Houses Completed';
  const kpi = { id: 7, kpi_name: kpiName, unit: 'units', scheme: { code: schemeCode, name: schemeCode } };
  const values = [
    // state level (two dates) + a district-level row that must NOT leak into the state heatmap
    { kpi_id: 7, state_id: 1, district_id: null, block_id: null, village_id: null, value: 40, target_value: 100, date: D('2026-09-01') },
    { kpi_id: 7, state_id: 1, district_id: null, block_id: null, village_id: null, value: 80, target_value: 100, date: D('2026-10-01') },
    { kpi_id: 7, state_id: 2, district_id: null, block_id: null, village_id: null, value: 30, target_value: 100, date: D('2026-10-01') },
    { kpi_id: 7, state_id: 1, district_id: 10, block_id: null, village_id: null, value: 60, target_value: 100, date: D('2026-10-01') },
    { kpi_id: 7, state_id: 1, district_id: 10, block_id: null, village_id: null, value: 20, target_value: 100, date: D('2026-08-01') },
    { kpi_id: 7, state_id: 1, district_id: 10, block_id: 100, village_id: null, value: 90, target_value: 100, date: D('2026-10-01') },
    { kpi_id: 7, state_id: 1, district_id: 10, block_id: 100, village_id: 1000, value: 10, target_value: 100, date: D('2026-10-01') },
  ];
  const sorted = (rows, orderBy) => (orderBy?.date === 'desc' ? [...rows].sort((a, b) => b.date - a.date) : rows);
  return {
    kPIDefinition: { findUnique: async ({ where }) => (where.id === 7 ? kpi : null) },
    state: {
      findMany: async ({ where } = {}) => states.filter((s) => !where || matches(s, where)),
      findUnique: async ({ where }) => states.find((s) => s.id === where.id) || null,
    },
    district: {
      findMany: async ({ where }) => districts.filter((d) => matches(d, where)),
      findUnique: async ({ where }) => { const d = districts.find((x) => x.id === where.id); return d ? { ...d } : null; },
    },
    block: {
      findMany: async ({ where }) => blocks.filter((b) => matches(b, where)),
      findUnique: async ({ where }) => { const b = blocks.find((x) => x.id === where.id); return b ? { ...b, district: districts.find((d) => d.id === b.district_id) } : null; },
    },
    village: {
      findMany: async ({ where }) => {
        let list = villages;
        if (where.block_id != null) list = list.filter((v) => v.block_id === where.block_id);
        if (where.block?.district_id != null) list = list.filter((v) => blocks.find((b) => b.id === v.block_id).district_id === where.block.district_id);
        if (where.block?.district?.state_id != null) list = list.filter((v) => districts.find((d) => d.id === blocks.find((b) => b.id === v.block_id).district_id).state_id === where.block.district.state_id);
        return list.map((v) => ({ ...v, block: { district_id: blocks.find((b) => b.id === v.block_id).district_id } }));
      },
    },
    kPIValue: { findMany: async ({ where, orderBy }) => sorted(values.filter((r) => matches(r, where)), orderBy) },
  };
}

test('heatmap uses only state-level rows and the newest date', async () => {
  const svc = createDrilldownService(makeDb());
  const res = await svc.getHeatmap({ kpiId: 7, stateScope: null });
  assert.equal(res.kpi.name, 'Houses Completed');
  const raj = res.states.find((s) => s.name === 'Rajasthan');
  assert.equal(raj.value, 80);          // not 60 (a district row), not 40 (older date)
  assert.equal(raj.progress, 80);
  assert.equal(raj.status, 'on_track');
  assert.equal(res.states.find((s) => s.name === 'Assam').status, 'critical');
});

test('drilldown rejects synthetic KPI definitions outside a verified source mapping', async () => {
  const svc = createDrilldownService(makeDb('PMAY'));
  await assert.rejects(
    svc.getHeatmap({ kpiId: 7, stateScope: null }),
    (error) => error instanceof HttpError && error.status === 404,
  );
});

test('state-only feeds reject district drilldown with a clear availability response', async () => {
  const svc = createDrilldownService(makeDb('PMAY-U'));
  await assert.rejects(
    svc.getChildren({ kpiId: 7, level: 'state', parentId: 1, stateScope: null }),
    (error) => error instanceof HttpError
      && error.status === 422
      && error.message === 'This source reports state/UT values only; district data is unavailable',
  );
});

test('heatmap respects the user state scope', async () => {
  const svc = createDrilldownService(makeDb());
  const res = await svc.getHeatmap({ kpiId: 7, stateScope: 2 });
  assert.deepEqual(res.states.map((s) => s.name), ['Assam']);
});

test('state -> districts: newest value, averaged coordinates, no_data when empty', async () => {
  const svc = createDrilldownService(makeDb('MGNREGS'));
  const res = await svc.getChildren({ kpiId: 7, level: 'state', parentId: 1, stateScope: null });
  assert.equal(res.level, 'district');
  const jaipur = res.children.find((c) => c.name === 'Jaipur');
  assert.equal(jaipur.value, 60);        // newest district row (2026-10-01), not the 2026-08 one (20)
  assert.ok(jaipur.lat > 26 && jaipur.lat < 28);
  const kota = res.children.find((c) => c.name === 'Kota');
  assert.equal(kota.status, 'no_data');
  assert.equal(kota.lat, null);
  assert.equal(res.children.find((c) => c.name === 'Source district').areaKm2, null);
});

test('district -> blocks and block -> villages', async () => {
  const svc = createDrilldownService(makeDb('MGNREGS'));
  const blocks = await svc.getChildren({ kpiId: 7, level: 'district', parentId: 10, stateScope: null });
  assert.equal(blocks.level, 'block');
  assert.equal(blocks.children.find((b) => b.id === 100).value, 90);
  assert.equal(blocks.children.find((b) => b.id === 101).status, 'no_data');
  const villages = await svc.getChildren({ kpiId: 7, level: 'block', parentId: 100, stateScope: null });
  assert.equal(villages.level, 'village');
  assert.equal(villages.children.find((v) => v.id === 1000).value, 10);
  assert.equal(villages.children.find((v) => v.id === 1000).status, 'critical');
  assert.equal(villages.children.length, 2);
});

test('scope violations and bad input are rejected', async () => {
  const svc = createDrilldownService(makeDb());
  await assert.rejects(() => svc.getChildren({ kpiId: 7, level: 'state', parentId: 1, stateScope: 2 }), (e) => e instanceof HttpError && e.status === 403);
  await assert.rejects(() => svc.getChildren({ kpiId: 7, level: 'district', parentId: 10, stateScope: 2 }), (e) => e.status === 403);
  await assert.rejects(() => svc.getChildren({ kpiId: 7, level: 'block', parentId: 100, stateScope: 2 }), (e) => e.status === 403);
  await assert.rejects(() => svc.getChildren({ kpiId: 999, level: 'state', parentId: 1, stateScope: null }), (e) => e.status === 404);
  await assert.rejects(() => svc.getChildren({ kpiId: 7, level: 'state', parentId: 99, stateScope: null }), (e) => e.status === 404);
  await assert.rejects(() => svc.getChildren({ kpiId: 7, level: 'galaxy', parentId: 1, stateScope: null }), (e) => e.status === 400);
});
