import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import client from '../api/client';
import { useGeographic } from '../api/hooks';

const cellTone = (status) => ({
  on_track: 'bg-emerald-500/25 text-emerald-100',
  at_risk: 'bg-amber-500/25 text-amber-100',
  critical: 'bg-red-500/25 text-red-100',
  no_target: 'bg-white/5 text-gray-400',
  not_rated: 'bg-white/5 text-gray-400',
})[status] || 'bg-slate-700 text-slate-200';

const STATE_ONLY_SOURCES = new Set(['PMAY-G', 'PMAY-U', 'NRLM', 'DDU-GKY', 'SAGY']);
const DISTRICT_SOURCES = new Set(['MGNREGS', 'PMGSY']);
const emptyHeatmap = { kpis: [], districts: [] };

function formatValue(value) {
  const numericValue = Number(value);
  return value == null || !Number.isFinite(numericValue)
    ? 'Not reported'
    : numericValue.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function formatDate(value) {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString('en-IN')
    : 'Date not reported';
}

export default function GeographicExplorer() {
  const { selectedScheme, schemes } = useSelector((state) => state.data);
  const selectedSchemeCode = schemes.find((scheme) => scheme.id === selectedScheme)?.code;
  const { states, districts, error: geographyError, fetchDistricts } = useGeographic();
  const [stateId, setStateId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [heatmap, setHeatmap] = useState(emptyHeatmap);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapError, setHeatmapError] = useState('');
  const [locationKpis, setLocationKpis] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setReloadVersion((version) => version + 1);
    window.addEventListener('kpi-data:updated', refresh);
    return () => window.removeEventListener('kpi-data:updated', refresh);
  }, []);

  useEffect(() => {
    setDistrictId('');
    if (stateId && DISTRICT_SOURCES.has(selectedSchemeCode)) fetchDistricts(stateId);
  }, [stateId, selectedSchemeCode, fetchDistricts]);

  useEffect(() => {
    let active = true;
    if (!stateId || !selectedScheme || !DISTRICT_SOURCES.has(selectedSchemeCode)) {
      setHeatmap(emptyHeatmap);
      setHeatmapError('');
      setHeatmapLoading(false);
      return () => { active = false; };
    }

    setHeatmap(emptyHeatmap);
    setHeatmapError('');
    setHeatmapLoading(true);
    client.get('/geo/performance-heatmap', { params: { stateId, schemeId: selectedScheme } })
      .then(({ data }) => {
        if (active) {
          const payload = data?.data;
          setHeatmap({
            kpis: Array.isArray(payload?.kpis) ? payload.kpis : [],
            districts: Array.isArray(payload?.districts) ? payload.districts : [],
          });
        }
      })
      .catch((error) => {
        if (active) {
          setHeatmap(emptyHeatmap);
          setHeatmapError(error.response?.data?.message || 'District KPI data is unavailable.');
        }
      })
      .finally(() => { if (active) setHeatmapLoading(false); });
    return () => { active = false; };
  }, [stateId, selectedScheme, selectedSchemeCode, reloadVersion]);

  const location = useMemo(() => {
    if (districtId) return { level: 'district', id: districtId };
    if (stateId) return { level: 'state', id: stateId };
    return null;
  }, [districtId, stateId]);

  useEffect(() => {
    let active = true;
    if (!location || !selectedScheme) {
      setLocationKpis([]);
      setLocationError('');
      setLocationLoading(false);
      return () => { active = false; };
    }

    setLocationKpis([]);
    setLocationError('');
    setLocationLoading(true);
    client.get('/geo/location-kpis', { params: { ...location, schemeId: selectedScheme } })
      .then(({ data }) => {
        if (active) setLocationKpis(Array.isArray(data.data) ? data.data : []);
      })
      .catch((error) => {
        if (active) {
          setLocationKpis([]);
          setLocationError(error.response?.data?.message || 'Location KPI data is unavailable.');
        }
      })
      .finally(() => { if (active) setLocationLoading(false); });
    return () => { active = false; };
  }, [location, selectedScheme, reloadVersion]);

  const selectedLocation = useMemo(() => {
    if (districtId) return districts.find((item) => String(item.id) === districtId);
    return states.find((item) => String(item.id) === stateId);
  }, [districtId, districts, stateId, states]);

  const stateOnly = STATE_ONLY_SOURCES.has(selectedSchemeCode);
  const hasDistrictData = DISTRICT_SOURCES.has(selectedSchemeCode);
  const selectClass = 'min-w-40 rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-sm text-white';

  return (
    <section className="mb-8 rounded-2xl border border-white/15 bg-slate-900/70 p-5 text-white" aria-labelledby="geo-explorer-title">
      <h2 id="geo-explorer-title" className="mb-2 text-xl font-bold">Geographic source records</h2>
      <p className="mb-4 text-sm text-slate-300">
        Review the latest KPI readings available for a state or district. Geographic coverage depends on the selected source.
      </p>

      {stateOnly && (
        <p className="mb-4 rounded-lg border border-amber-400/20 bg-amber-500/5 p-3 text-sm text-amber-100">
          {selectedSchemeCode} currently provides state/UT readings only. District, block, and village filters are unavailable for this feed.
        </p>
      )}

      <div className="mb-5 flex flex-wrap gap-3">
        <label className="grid gap-1 text-xs text-slate-300">
          State or union territory
          <select
            className={selectClass}
            value={stateId}
            onChange={(event) => setStateId(event.target.value)}
            aria-label="Filter by state or union territory"
          >
            <option value="">Select state/UT</option>
            {states.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs text-slate-300">
          District
          <select
            className={selectClass}
            value={districtId}
            disabled={!stateId || !hasDistrictData}
            onChange={(event) => setDistrictId(event.target.value)}
            aria-label="Filter by district"
          >
            <option value="">Select district</option>
            {districts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
      </div>

      {geographyError && <p role="alert" className="mb-3 text-sm text-red-200">{geographyError}</p>}

      {selectedLocation && <p className="mb-4 text-sm text-blue-200">Selected location: {selectedLocation.name}</p>}
      {locationError && <p role="alert" className="mb-3 text-sm text-red-200">{locationError}</p>}
      {location && (
        <div className="mb-5 overflow-x-auto">
          <h3 className="mb-2 font-semibold">Latest {location.level} KPI readings</h3>
          {locationLoading ? (
            <p className="text-sm text-slate-400" role="status">Loading location readings…</p>
          ) : locationKpis.length ? (
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/15 text-slate-300">
                  <th scope="col" className="p-2">KPI</th>
                  <th scope="col" className="p-2">Value</th>
                  <th scope="col" className="p-2">Target</th>
                  <th scope="col" className="p-2">Status</th>
                  <th scope="col" className="p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {locationKpis.map((item) => (
                  <tr key={item.kpi_id} className="border-b border-white/10">
                    <th scope="row" className="p-2">{item.kpi_name}</th>
                    <td className="p-2">{formatValue(item.value)} {item.unit || ''}</td>
                    <td className="p-2">{item.target == null ? 'Not provided' : `${formatValue(item.target)} ${item.unit || ''}`}</td>
                    <td className="p-2">{item.target == null ? 'Not rated' : (item.status || 'Status unavailable').replaceAll('_', ' ')}</td>
                    <td className="p-2">{formatDate(item.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-slate-400">No KPI readings are recorded at this level.</p>
          )}
        </div>
      )}

      <div aria-live="polite">
        {heatmapError && <p role="alert" className="mb-2 text-sm text-red-200">{heatmapError}</p>}
        {!stateId && <p className="text-sm text-slate-400">Select a state to view its source readings.</p>}
        {stateId && stateOnly && <p className="text-sm text-slate-400">This feed has no district-level KPI observations to display.</p>}
        {stateId && hasDistrictData && heatmapLoading && <p className="text-sm text-slate-400" role="status">Loading district readings…</p>}
        {stateId && hasDistrictData && !heatmapLoading && !heatmapError && heatmap.districts.length === 0 && (
          <p className="text-sm text-slate-400">No district-level KPI observations are available for this scheme and state.</p>
        )}
      </div>

      {hasDistrictData && heatmap.districts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-1 text-left text-xs">
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 bg-slate-900 p-2">District</th>
                {heatmap.kpis.map((kpi) => <th scope="col" key={kpi.id} className="p-2">{kpi.kpi_name}</th>)}
              </tr>
            </thead>
            <tbody>
              {heatmap.districts.map((district) => (
                <tr key={district.district_id}>
                  <th scope="row" className="sticky left-0 bg-slate-900 p-2">{district.district_name}</th>
                  {heatmap.kpis.map((kpi) => {
                    const value = district.values?.[kpi.id];
                    const rawStatus = value?.target == null ? 'not_rated' : value.status;
                    const status = (rawStatus || 'unknown').replaceAll('_', ' ');
                    return (
                      <td
                        key={kpi.id}
                        className={`rounded p-2 ${cellTone(rawStatus)}`}
                        title={value ? `Latest recorded ${formatDate(value.date)}` : 'No recorded value'}
                      >
                        {value ? <>{formatValue(value.value)}<span className="block opacity-75">{status}</span></> : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-slate-400">
        Only source-mapped KPI definitions are displayed. Values are dated observations, not real-time data, unless the source explicitly reports them as current.
      </p>
    </section>
  );
}
