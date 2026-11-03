import { useCallback, useEffect, useRef, useState } from 'react';
import client from '../api/client';

export default function TopPerformers({ schemeCode = 'PMAY' }) {
  const [rankings, setRankings] = useState([]);
  const [stateCount, setStateCount] = useState(0);
  const [metrics, setMetrics] = useState([]);
  const [selectedKpiId, setSelectedKpiId] = useState('');
  const [aggregation, setAggregation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestVersion = useRef(0);

  const loadSourceValues = useCallback(async (code, kpiId = '') => {
    if (!code) {
      setRankings([]);
      setStateCount(0);
      setMetrics([]);
      setLoading(false);
      return;
    }

    const version = requestVersion.current + 1;
    requestVersion.current = version;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (kpiId) params.set('kpi_id', kpiId);
      const encodedParams = params.toString();
      const query = encodedParams ? `?${encodedParams}` : '';
      const response = await client.get(`/analytics/state-values/${encodeURIComponent(code)}${query}`);
      if (version !== requestVersion.current) return;

      const data = response.data?.data || [];
      const availableMetrics = response.data?.kpis || [];
      setRankings(data.slice(0, 5));
      setStateCount(data.length);
      setMetrics(availableMetrics);
      setSelectedKpiId(String(response.data?.selected_kpi_id || ''));
      setAggregation(response.data?.aggregation || '');
    } catch (requestError) {
      if (version === requestVersion.current) {
        setRankings([]);
        setError(requestError.response?.data?.message || 'Source values are unavailable.');
      }
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setRankings([]);
    setStateCount(0);
    setMetrics([]);
    setSelectedKpiId('');
    setAggregation('');
    loadSourceValues(schemeCode);
    return () => { requestVersion.current += 1; };
  }, [schemeCode, loadSourceValues]);

  const selectedMetric = metrics.find((metric) => String(metric.id) === selectedKpiId);
  const sourceDate = rankings.reduce((latest, item) => (
    !latest || new Date(item.source_date) > new Date(latest) ? item.source_date : latest
  ), null);
  const formatValue = (value) => Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const formatDate = (value) => value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white">Highest reported values: {schemeCode}</h3>
          <p className="mt-1 max-w-xl text-sm text-gray-400">
            Showing up to five of {stateCount} states/UTs with data. A larger count or allocation does not mean better performance.
          </p>
        </div>
        <label className="grid gap-1 text-xs text-gray-300">
          Indicator
          <select
            aria-label="Indicator for state value ranking"
            value={selectedKpiId}
            disabled={metrics.length === 0 || loading}
            onChange={(event) => {
              const nextKpiId = event.target.value;
              setSelectedKpiId(nextKpiId);
              loadSourceValues(schemeCode, nextKpiId);
            }}
            className="max-w-full rounded border border-white/20 bg-slate-800 px-3 py-2 text-white"
          >
            {metrics.map((metric) => (
              <option key={metric.id} value={metric.id}>{metric.name}</option>
            ))}
          </select>
        </label>
      </div>

      {selectedMetric && (
        <p className="mb-3 text-xs text-gray-400">
          {selectedMetric.name}{selectedMetric.unit ? ` · ${selectedMetric.unit}` : ''}
          {sourceDate ? ` · source date ${formatDate(sourceDate)}` : ''}
        </p>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center" aria-live="polite">
          <div className="animate-spin"><div className="text-4xl">⏳</div></div>
        </div>
      ) : error ? (
        <p role="alert" className="text-center text-red-300">{error}</p>
      ) : rankings.length > 0 ? (
        <div className="space-y-3">
          {rankings.map((item, index) => (
            <div
              key={`${item.state_id}-${selectedKpiId}`}
              className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="text-lg font-bold text-blue-200">#{index + 1}</span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{item.state?.name || 'State'}</p>
                  {aggregation.includes('district') && (
                    <p className="text-xs text-gray-400">{item.locations_covered} source districts summed</p>
                  )}
                </div>
              </div>
              <p className="shrink-0 text-right font-semibold text-blue-100">
                {formatValue(item.value)}{selectedMetric?.unit ? ` ${selectedMetric.unit}` : ''}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center">
          <p className="max-w-sm text-center text-gray-400">
            This source has no state-level observations to rank for the selected indicator.
          </p>
        </div>
      )}
    </div>
  );
}
