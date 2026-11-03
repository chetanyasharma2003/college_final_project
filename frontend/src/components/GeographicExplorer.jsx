import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import client from '../api/client';
import { useGeographic } from '../api/hooks';

const cellTone = (status) => ({
  on_track: 'bg-emerald-500/25 text-emerald-100',
  at_risk: 'bg-amber-500/25 text-amber-100',
  critical: 'bg-red-500/25 text-red-100',
})[status] || 'bg-slate-700 text-slate-200';
const stateOnlySources = new Set(['PMAY-G', 'PMAY-U', 'NRLM', 'DDU-GKY', 'SAGY']);

export default function GeographicExplorer() {
  const { selectedScheme, schemes } = useSelector((state) => state.data);
  const selectedSchemeCode = schemes.find((scheme) => scheme.id === selectedScheme)?.code;
  const { states, districts, blocks, villages, fetchDistricts, fetchBlocks, fetchVillages } = useGeographic();
  const [stateId, setStateId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [blockId, setBlockId] = useState('');
  const [villageId, setVillageId] = useState('');
  const [heatmap, setHeatmap] = useState({ kpis: [], districts: [] });
  const [heatmapError, setHeatmapError] = useState('');
  const [locationKpis, setLocationKpis] = useState([]);
  const [locationError, setLocationError] = useState('');
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setReloadVersion((version) => version + 1);
    window.addEventListener('kpi-data:updated', refresh);
    return () => window.removeEventListener('kpi-data:updated', refresh);
  }, []);

  useEffect(() => {
    setDistrictId(''); setBlockId(''); setVillageId('');
    if (stateId) fetchDistricts(stateId);
  }, [stateId, fetchDistricts]);
  useEffect(() => {
    setBlockId(''); setVillageId('');
    if (districtId) fetchBlocks(districtId);
  }, [districtId, fetchBlocks]);
  useEffect(() => {
    setVillageId('');
    if (blockId) fetchVillages(blockId);
  }, [blockId, fetchVillages]);
  useEffect(() => {
    let active = true;
    if (!stateId || !selectedScheme) { setHeatmap({ kpis: [], districts: [] }); return () => { active = false; }; }
    client.get('/geo/performance-heatmap', { params: { stateId, schemeId: selectedScheme } })
      .then(({ data }) => { if (active) { setHeatmap(data.data); setHeatmapError(''); } })
      .catch((error) => { if (active) setHeatmapError(error.response?.data?.message || 'Heatmap data is unavailable.'); });
    return () => { active = false; };
  }, [stateId, selectedScheme, reloadVersion]);

  const location = useMemo(() => {
    if (villageId) return { level: 'village', id: villageId };
    if (blockId) return { level: 'block', id: blockId };
    if (districtId) return { level: 'district', id: districtId };
    if (stateId) return { level: 'state', id: stateId };
    return null;
  }, [blockId, districtId, stateId, villageId]);
  useEffect(() => {
    let active = true;
    if (!location || !selectedScheme) { setLocationKpis([]); return () => { active = false; }; }
    client.get('/geo/location-kpis', { params: { ...location, schemeId: selectedScheme } })
      .then(({ data }) => { if (active) { setLocationKpis(data.data); setLocationError(''); } })
      .catch((error) => { if (active) setLocationError(error.response?.data?.message || 'Location KPIs are unavailable.'); });
    return () => { active = false; };
  }, [location, selectedScheme, reloadVersion]);

  const selectedLocation = useMemo(() => {
    if (villageId) return villages.find((item) => String(item.id) === villageId);
    if (blockId) return blocks.find((item) => String(item.id) === blockId);
    if (districtId) return districts.find((item) => String(item.id) === districtId);
    return states.find((item) => String(item.id) === stateId);
  }, [blockId, blocks, districtId, districts, stateId, states, villageId, villages]);

  const selectClass = 'min-w-40 rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-sm text-white';
  return (
    <section className="mb-8 rounded-2xl border border-white/15 bg-slate-900/70 p-5 text-white" aria-labelledby="geo-explorer-title">
      <h2 id="geo-explorer-title" className="mb-2 text-xl font-bold">Geographic drill-down and district KPI heatmap</h2>
      <p className="mb-4 text-sm text-slate-300">Explore official source observations at the geographic levels provided by each dataset. District cells show latest recorded values; no village metrics or administrative boundaries are inferred.</p>
      {stateOnlySources.has(selectedSchemeCode) && (
        <p className="mb-4 rounded-lg border border-amber-400/20 bg-amber-500/5 p-3 text-sm text-amber-100">
          {selectedSchemeCode} reports state/UT values only. Selecting a state shows its source values; district, block, and village metrics are not part of this feed.
        </p>
      )}
      <div className="mb-5 flex flex-wrap gap-3">
        <label className="grid gap-1 text-xs text-slate-300">State<select className={selectClass} value={stateId} onChange={(event) => setStateId(event.target.value)}><option value="">Select state</option>{states.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="grid gap-1 text-xs text-slate-300">District<select className={selectClass} value={districtId} disabled={!stateId} onChange={(event) => setDistrictId(event.target.value)}><option value="">Select district</option>{districts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="grid gap-1 text-xs text-slate-300">Block<select className={selectClass} value={blockId} disabled={!districtId} onChange={(event) => setBlockId(event.target.value)}><option value="">Select block</option>{blocks.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="grid gap-1 text-xs text-slate-300">Village<select className={selectClass} value={villageId} disabled={!blockId} onChange={(event) => setVillageId(event.target.value)}><option value="">Select village</option>{villages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      </div>
      {selectedLocation && <p className="mb-4 text-sm text-blue-200">Selected location: {selectedLocation.name}</p>}
      {locationError && <p role="alert" className="mb-3 text-sm text-red-200">{locationError}</p>}
      {location && <div className="mb-5 overflow-x-auto">
        <h3 className="mb-2 font-semibold">Latest {location.level} KPI readings</h3>
        {locationKpis.length ? <table className="w-full min-w-[480px] text-left text-sm"><thead><tr className="border-b border-white/15 text-slate-300"><th className="p-2">KPI</th><th className="p-2">Value</th><th className="p-2">Target</th><th className="p-2">Status</th><th className="p-2">Date</th></tr></thead><tbody>
          {locationKpis.map((item) => <tr key={item.kpi_id} className="border-b border-white/10"><th className="p-2">{item.kpi_name}</th><td className="p-2">{item.value.toLocaleString()} {item.unit || ''}</td><td className="p-2">{item.target == null ? 'Not provided' : `${item.target.toLocaleString()} ${item.unit || ''}`}</td><td className="p-2">{item.status || 'unknown'}</td><td className="p-2">{new Date(item.date).toLocaleDateString()}</td></tr>)}
        </tbody></table> : <p className="text-sm text-slate-400">No KPI readings are recorded at this level.</p>}
      </div>}
      {heatmapError && <p role="alert" className="text-sm text-red-200">{heatmapError}</p>}
      {!stateId && <p className="text-sm text-slate-400">Select a state to load the district KPI matrix.</p>}
      {stateId && !heatmapError && heatmap.districts.length === 0 && <p className="text-sm text-slate-400">No district-level KPI observations are available for this scheme and state.</p>}
      {heatmap.districts.length > 0 && <div className="overflow-x-auto"><table className="w-full min-w-[640px] border-separate border-spacing-1 text-left text-xs">
        <thead><tr><th className="sticky left-0 bg-slate-900 p-2">District</th>{heatmap.kpis.map((kpi) => <th key={kpi.id} className="p-2">{kpi.kpi_name}</th>)}</tr></thead>
        <tbody>{heatmap.districts.map((district) => <tr key={district.district_id}>
          <th className="sticky left-0 bg-slate-900 p-2">{district.district_name}</th>
          {heatmap.kpis.map((kpi) => {
            const value = district.values[kpi.id];
            return <td key={kpi.id} className={`rounded p-2 ${cellTone(value?.status)}`} title={value ? `Latest recorded ${new Date(value.date).toLocaleDateString()}` : 'No recorded value'}>
              {value ? <>{value.value.toLocaleString()}<span className="block opacity-75">{value.status?.replace('_', ' ') || 'unknown'}</span></> : '—'}
            </td>;
          })}
        </tr>)}</tbody>
      </table></div>}
      <p className="mt-3 text-xs text-slate-400">Only source-mapped KPI definitions are displayed. Coverage varies by dataset; values are not real-time unless the official source reports them as current.</p>
    </section>
  );
}
