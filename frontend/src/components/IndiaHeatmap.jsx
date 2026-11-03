import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import client from '../api/client';
import { STATE_CENTROIDS } from '../data/stateCentroids';

const COLORS = { on_track: '#16a34a', at_risk: '#f59e0b', critical: '#dc2626', no_data: '#9ca3af' };
const LABELS = { on_track: 'On track', at_risk: 'At risk', critical: 'Critical', no_data: 'No data' };
const LEVEL_TITLE = { state: 'States', district: 'Districts', block: 'Blocks', village: 'Villages' };
const RADIUS = { state: 14, district: 12, block: 10, village: 8 };
const INDIA_CENTER = [22.9, 79.5];
const nf = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 });

// Re-fits the map whenever the set of points changes.
function FitToPoints({ points, level }) {
  const map = useMap();
  const key = points.map((p) => `${p[0]},${p[1]}`).join('|') + level;
  useEffect(() => {
    if (points.length === 0) map.setView(INDIA_CENTER, 4.5);
    else if (points.length === 1) map.setView(points[0], 9);
    else map.fitBounds(points, { padding: [40, 40], maxZoom: level === 'state' ? 6 : 11 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}

export default function IndiaHeatmap() {
  const [kpis, setKpis] = useState([]);
  const [kpiId, setKpiId] = useState(null);
  const [path, setPath] = useState([]); // each item is the parent that was clicked: {level, id, name}
  const [view, setView] = useState({ level: 'state', rows: [], kpi: null, date: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('worst');

  // KPI list
  useEffect(() => {
    let alive = true;
    client.get('/kpis')
      .then((res) => {
        if (!alive) return;
        const list = res.data?.data || [];
        setKpis(list);
        if (list.length) setKpiId(list[0].id);
        else setLoading(false);
      })
      .catch((e) => { if (alive) { setError(e.response?.data?.message || 'Could not load KPIs'); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  // Data for the current level
  useEffect(() => {
    if (!kpiId) return undefined;
    let alive = true;
    setLoading(true);
    setError('');
    const parent = path[path.length - 1];
    const request = parent
      ? client.get('/drilldown/children', { params: { kpiId, level: parent.level, parentId: parent.id } })
      : client.get('/drilldown/heatmap', { params: { kpiId } });
    request
      .then((res) => {
        if (!alive) return;
        const d = res.data?.data;
        if (parent) {
          setView({ level: d.level, rows: d.children, kpi: d.kpi, date: null });
        } else {
          const rows = d.states.map((s) => {
            const c = STATE_CENTROIDS[s.name];
            return { ...s, lat: c ? c[0] : null, lng: c ? c[1] : null };
          });
          setView({ level: 'state', rows, kpi: d.kpi, date: d.date });
        }
      })
      .catch((e) => { if (alive) setError(e.response?.data?.message || 'Could not load data'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [kpiId, path]);

  const groupedKpis = useMemo(() => {
    const g = {};
    for (const k of kpis) (g[k.scheme?.code || 'Other'] ||= []).push(k);
    return g;
  }, [kpis]);

  const sorted = useMemo(() => {
    const rows = [...view.rows];
    if (sortBy === 'name') return rows.sort((a, b) => a.name.localeCompare(b.name));
    const val = (r) => (r.progress == null ? (sortBy === 'worst' ? Infinity : -Infinity) : r.progress);
    return rows.sort((a, b) => (sortBy === 'worst' ? val(a) - val(b) : val(b) - val(a)));
  }, [view.rows, sortBy]);

  const points = view.rows.filter((r) => r.lat != null && r.lng != null).map((r) => [r.lat, r.lng]);
  const counts = view.rows.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {});
  const canDrill = view.level !== 'village';
  const allEmpty = view.rows.length > 0 && view.rows.every((r) => r.status === 'no_data');
  const unit = view.kpi?.unit || '';

  const drillInto = (row) => {
    if (!canDrill) return;
    setPath([...path, { level: view.level, id: row.id, name: row.name }]);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={kpiId || ''}
          onChange={(e) => { setKpiId(Number(e.target.value)); setPath([]); }}
          className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm max-w-full"
        >
          {Object.entries(groupedKpis).map(([code, list]) => (
            <optgroup key={code} label={code} className="text-black">
              {list.map((k) => <option key={k.id} value={k.id} className="text-black">{k.kpi_name}</option>)}
            </optgroup>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm"
        >
          <option value="worst" className="text-black">Worst progress first</option>
          <option value="best" className="text-black">Best progress first</option>
          <option value="name" className="text-black">Name (A-Z)</option>
        </select>
        <div className="flex flex-wrap gap-3 text-xs text-blue-100">
          {Object.keys(COLORS).map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLORS[s] }} />
              {LABELS[s]}{counts[s] ? ` (${counts[s]})` : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 text-sm text-blue-100" aria-label="Drill-down path">
        <button type="button" className="hover:underline font-semibold" onClick={() => setPath([])}>India</button>
        {path.map((p, i) => (
          <span key={`${p.level}-${p.id}`} className="flex items-center gap-1">
            <span aria-hidden="true">›</span>
            <button type="button" className="hover:underline font-semibold" onClick={() => setPath(path.slice(0, i + 1))}>{p.name}</button>
          </span>
        ))}
        <span className="ml-2 text-xs text-blue-300">
          {view.kpi ? `${view.kpi.scheme.code} · ${view.kpi.name}${unit ? ` (${unit})` : ''}` : ''}
        </span>
      </nav>

      {error && <div className="bg-red-500/20 border border-red-400/40 text-red-100 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Map */}
        <div className="lg:col-span-3 rounded-xl overflow-hidden border border-white/10 relative" style={{ height: 520 }}>
          {loading && (
            <div className="absolute inset-0 z-[1000] bg-slate-900/50 flex items-center justify-center text-white text-sm">Loading…</div>
          )}
          <MapContainer center={INDIA_CENTER} zoom={4.5} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitToPoints points={points} level={view.level} />
            {view.rows.filter((r) => r.lat != null && r.lng != null).map((r) => (
              <CircleMarker
                key={`${view.level}-${r.id}`}
                center={[r.lat, r.lng]}
                radius={RADIUS[view.level]}
                pathOptions={{ color: '#ffffff', weight: 1.5, fillColor: COLORS[r.status], fillOpacity: 0.85 }}
                eventHandlers={{ click: () => drillInto(r) }}
              >
                <Tooltip>
                  <strong>{r.name}</strong><br />
                  {r.value == null ? 'No KPI value' : `${nf.format(r.value)}${unit ? ` ${unit}` : ''}`}
                  {r.progress != null && <><br />{r.progress}% of target</>}
                  {canDrill && <><br /><em>Click to drill down</em></>}
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-3 overflow-y-auto" style={{ maxHeight: 520 }}>
          <h3 className="text-white font-semibold mb-2">{LEVEL_TITLE[view.level]} ({view.rows.length})</h3>
          {view.rows.length === 0 && !loading && (
            <p className="text-sm text-blue-200">No {LEVEL_TITLE[view.level].toLowerCase()} found here.</p>
          )}
          {allEmpty && view.level !== 'state' && (
            <p className="text-xs text-amber-200 bg-amber-500/10 rounded p-2 mb-2">
              No KPI values at this level yet. Detailed sample data covers Rajasthan, Maharashtra, Uttar Pradesh,
              Madhya Pradesh, Gujarat and Karnataka.
            </p>
          )}
          <ul className="space-y-1">
            {sorted.map((r) => (
              <li key={`${view.level}-${r.id}`}>
                <button
                  type="button"
                  disabled={!canDrill}
                  onClick={() => drillInto(r)}
                  className={`w-full text-left rounded-lg px-3 py-2 bg-white/5 ${canDrill ? 'hover:bg-white/10 cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-white font-medium truncate">{r.name}</span>
                    <span className="text-blue-100 whitespace-nowrap">{r.progress == null ? '—' : `${r.progress}%`}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded mt-1">
                    <div className="h-1.5 rounded" style={{ width: `${Math.min(r.progress ?? 0, 100)}%`, background: COLORS[r.status] }} />
                  </div>
                  <div className="text-xs text-blue-300 mt-1">
                    {r.value == null ? 'No KPI value' : `${nf.format(r.value)}${unit ? ` ${unit}` : ''}${r.target != null ? ` of ${nf.format(r.target)}` : ''}`}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-xs text-blue-300">
        Only KPIs mapped to configured official sources are shown. Markers indicate approximate state locations; administrative boundaries are not drawn.
        {view.date ? ` State values as of ${new Date(view.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}.` : ''}
      </p>
    </div>
  );
}
