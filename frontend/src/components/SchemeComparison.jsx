import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import client from '../api/client';

const FEEDS = [
  { code: 'PMAY-G', color: '#3b82f6' },
  { code: 'PMAY-U', color: '#60a5fa' },
  { code: 'MGNREGS', color: '#10b981' },
  { code: 'PMGSY', color: '#f59e0b' },
  { code: 'NRLM', color: '#8b5cf6' },
  { code: 'DDU-GKY', color: '#ec4899' },
  { code: 'SAGY', color: '#06b6d4' },
];

const formatDate = (value) => value
  ? new Date(value).toLocaleDateString('en-IN')
  : 'Not reported';

export default function SchemeComparison() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComparisonData = useCallback(async () => {
    setLoading(true);
    const comparisons = await Promise.all(FEEDS.map(async (feed) => {
      try {
        const response = await client.get(`/kpis/status/${encodeURIComponent(feed.code)}`);
        const metrics = (response.data?.kpi_status || []).map((item) => ({
          ...item,
          current_value: item.current_value == null ? null : Number(item.current_value),
        }));
        return { ...feed, metrics, error: null };
      } catch (error) {
        return {
          ...feed,
          metrics: [],
          error: error.response?.data?.message || 'Source data is unavailable.',
        };
      }
    }));
    setData(comparisons);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchComparisonData();
    window.addEventListener('kpi-data:updated', fetchComparisonData);
    return () => window.removeEventListener('kpi-data:updated', fetchComparisonData);
  }, [fetchComparisonData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-bold text-white">Official scheme data comparison</h3>
          <p className="mt-1 text-sm text-gray-300">
            Source-reported measures and coverage. Different schemes use different indicators, so no unsupported shared performance score is calculated.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchComparisonData}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/20 px-4 py-2 text-blue-200 transition hover:bg-blue-500/30 disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((feed) => {
          const available = feed.metrics.filter((metric) => metric.current_value != null);
          const latest = feed.metrics.reduce((date, metric) => (
            metric.last_updated && (!date || new Date(metric.last_updated) > new Date(date))
              ? metric.last_updated
              : date
          ), null);

          return (
            <article key={feed.code} className="rounded-lg border border-white/20 bg-white/10 p-4">
              <h4 className="mb-3 text-lg font-bold" style={{ color: feed.color }}>{feed.code}</h4>
              <p className="text-sm text-gray-300">
                {feed.metrics.length} source KPI(s) · {available.length} with readings
              </p>
              <p className="mb-3 text-xs text-gray-400">Latest reporting date: {formatDate(latest)}</p>
              {feed.error ? (
                <p role="alert" className="text-sm text-red-300">{feed.error}</p>
              ) : available.length ? (
                <ul className="space-y-2 border-t border-white/10 pt-3">
                  {available.map((metric) => (
                    <li key={metric.kpi_id} className="flex justify-between gap-3 text-sm">
                      <span className="text-gray-300">{metric.kpi_name}</span>
                      <span className="shrink-0 font-semibold text-white">
                        {metric.current_value.toLocaleString('en-IN')} {metric.unit || ''}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="border-t border-white/10 pt-3 text-sm text-gray-400">
                  {feed.metrics.length ? 'No imported observations yet.' : 'No source KPI definitions yet. Run an official data sync from the admin dashboard.'}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
