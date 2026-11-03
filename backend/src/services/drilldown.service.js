import { progressPct, statusFromProgress, latestPerEntity, averageCoords } from '../utils/drilldown-math.js';
import { filterSourceKpiDefinitions } from './kpi-management.service.js';
import { SCHEME_CONFIGS } from '../config/scheme-integrations.js';

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const NO_LOWER = { district_id: null, block_id: null, village_id: null };

// db = a Prisma client WITHOUT the state-level default (every query below states its own level).
export function createDrilldownService(db) {
  const NOLEVEL_NULLS = NO_LOWER;

  function assertStateAllowed(stateScope, stateId) {
    if (stateScope && stateId !== stateScope) throw new HttpError(403, 'State access denied');
  }

  async function loadKpi(kpiId) {
    const kpi = await db.kPIDefinition.findUnique({ where: { id: kpiId }, include: { scheme: true } });
    if (!kpi) throw new HttpError(404, 'KPI not found');
    if (!SCHEME_CONFIGS[kpi.scheme.code]?.fieldMapping
      || filterSourceKpiDefinitions([kpi], SCHEME_CONFIGS[kpi.scheme.code]).length === 0) {
      throw new HttpError(404, 'KPI is not backed by a configured official source');
    }
    return {
      id: kpi.id, name: kpi.kpi_name, unit: kpi.unit,
      scheme: { code: kpi.scheme.code, name: kpi.scheme.name },
    };
  }

  const shape = (entity, row, extra = {}) => {
    const progress = row ? progressPct(row.value, row.target_value) : null;
    return {
      id: entity.id, name: entity.name, ...extra,
      value: row ? Number(row.value) : null,
      target: row && row.target_value != null ? Number(row.target_value) : null,
      progress,
      status: statusFromProgress(progress),
      date: row ? row.date : null,
    };
  };

  // All states, latest state-level value of one KPI.
  async function getHeatmap({ kpiId, stateScope }) {
    const kpi = await loadKpi(kpiId);
    const states = await db.state.findMany({
      where: stateScope ? { id: stateScope } : undefined,
      orderBy: { name: 'asc' },
    });
    const config = SCHEME_CONFIGS[kpi.scheme.code];
    if (config?.aggregateByDistrict) {
      const districts = await db.kPIValue.findMany({
        where: {
          kpi_id: kpiId,
          district_id: { not: null },
          block_id: null,
          village_id: null,
          district: { state_id: { in: states.map((state) => state.id) } },
        },
        orderBy: { date: 'desc' },
        include: { district: { select: { state_id: true } } },
      });
      const latestByDistrict = latestPerEntity(districts, (row) => row.district_id);
      const totalsByState = new Map();
      for (const row of latestByDistrict.values()) {
        const total = totalsByState.get(row.district.state_id) || {
          value: 0,
          target_value: null,
          date: row.date,
        };
        total.value += Number(row.value);
        if (row.date > total.date) total.date = row.date;
        totalsByState.set(row.district.state_id, total);
      }
      const data = states.map((state) => shape(
        state,
        totalsByState.get(state.id),
        { code: state.code, region: state.region },
      ));
      const dates = data.map((item) => item.date).filter(Boolean).map((date) => new Date(date).getTime());
      return {
        kpi,
        date: dates.length ? new Date(Math.max(...dates)) : null,
        states: data,
      };
    }

    const rows = await db.kPIValue.findMany({
      where: { kpi_id: kpiId, state_id: { in: states.map((s) => s.id) }, ...NOLEVEL_NULLS },
      orderBy: { date: 'desc' },
      select: { state_id: true, value: true, target_value: true, date: true },
    });
    const latest = latestPerEntity(rows, (r) => r.state_id);
    const data = states.map((s) => shape(s, latest.get(s.id), { code: s.code, region: s.region }));
    const dates = data.map((d) => d.date).filter(Boolean).map((d) => new Date(d).getTime());
    return { kpi, date: dates.length ? new Date(Math.max(...dates)) : null, states: data };
  }

  // level = what the PARENT is: state -> districts, district -> blocks, block -> villages.
  async function getChildren({ kpiId, level, parentId, stateScope }) {
    const kpi = await loadKpi(kpiId);

    if (level === 'state') {
      const state = await db.state.findUnique({ where: { id: parentId } });
      if (!state) throw new HttpError(404, 'State not found');
      assertStateAllowed(stateScope, state.id);
      const sourceConfig = SCHEME_CONFIGS[kpi.scheme.code];
      if (!sourceConfig?.aggregateByDistrict && !sourceConfig?.fieldMapping?.district) {
        throw new HttpError(422, 'This source reports state/UT values only; district data is unavailable');
      }
      const districts = await db.district.findMany({
        where: { state_id: state.id }, orderBy: { name: 'asc' },
        // Area is optional and may be null for source-derived districts. It is
        // not needed by this heatmap response; selecting it can make an older
        // generated Prisma client fail while decoding the row.
        select: { id: true, name: true },
      });
      const villages = await db.village.findMany({
        where: { block: { district: { state_id: state.id } } },
        select: { latitude: true, longitude: true, block: { select: { district_id: true } } },
      });
      const rows = await db.kPIValue.findMany({
        where: { kpi_id: kpiId, district_id: { in: districts.map((d) => d.id) }, block_id: null, village_id: null },
        orderBy: { date: 'desc' },
        select: { district_id: true, value: true, target_value: true, date: true },
      });
      const latest = latestPerEntity(rows, (r) => r.district_id);
      const byDistrict = new Map();
      for (const v of villages) {
        const k = v.block.district_id;
        if (!byDistrict.has(k)) byDistrict.set(k, []);
        byDistrict.get(k).push({ lat: Number(v.latitude), lng: Number(v.longitude) });
      }
      return {
        kpi, level: 'district', parent: { id: state.id, name: state.name, type: 'state' },
        children: districts.map((d) => shape(d, latest.get(d.id), {
          areaKm2: null,
          ...(averageCoords(byDistrict.get(d.id) || []) || { lat: null, lng: null }),
        })),
      };
    }

    if (level === 'district') {
      const district = await db.district.findUnique({ where: { id: parentId }, include: { state: true } });
      if (!district) throw new HttpError(404, 'District not found');
      assertStateAllowed(stateScope, district.state_id);
      const blocks = await db.block.findMany({
        where: { district_id: district.id }, orderBy: { name: 'asc' }, select: { id: true, name: true },
      });
      const villages = await db.village.findMany({
        where: { block: { district_id: district.id } },
        select: { block_id: true, latitude: true, longitude: true },
      });
      const rows = await db.kPIValue.findMany({
        where: { kpi_id: kpiId, block_id: { in: blocks.map((b) => b.id) }, village_id: null },
        orderBy: { date: 'desc' },
        select: { block_id: true, value: true, target_value: true, date: true },
      });
      const latest = latestPerEntity(rows, (r) => r.block_id);
      const byBlock = new Map();
      for (const v of villages) {
        if (!byBlock.has(v.block_id)) byBlock.set(v.block_id, []);
        byBlock.get(v.block_id).push({ lat: Number(v.latitude), lng: Number(v.longitude) });
      }
      return {
        kpi, level: 'block', parent: { id: district.id, name: district.name, type: 'district', stateId: district.state_id },
        children: blocks.map((b) => shape(b, latest.get(b.id), averageCoords(byBlock.get(b.id) || []) || { lat: null, lng: null })),
      };
    }

    if (level === 'block') {
      const block = await db.block.findUnique({ where: { id: parentId }, include: { district: true } });
      if (!block) throw new HttpError(404, 'Block not found');
      assertStateAllowed(stateScope, block.district.state_id);
      const villages = await db.village.findMany({
        where: { block_id: block.id }, orderBy: { name: 'asc' },
        select: { id: true, name: true, population: true, latitude: true, longitude: true },
      });
      const rows = await db.kPIValue.findMany({
        where: { kpi_id: kpiId, village_id: { in: villages.map((v) => v.id) } },
        orderBy: { date: 'desc' },
        select: { village_id: true, value: true, target_value: true, date: true },
      });
      const latest = latestPerEntity(rows, (r) => r.village_id);
      return {
        kpi, level: 'village', parent: { id: block.id, name: block.name, type: 'block', stateId: block.district.state_id },
        children: villages.map((v) => shape(v, latest.get(v.id), {
          population: v.population, lat: Number(v.latitude), lng: Number(v.longitude),
        })),
      };
    }

    throw new HttpError(400, 'level must be state, district or block');
  }

  return { getHeatmap, getChildren };
}
