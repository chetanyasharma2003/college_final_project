import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { RefreshCw } from 'lucide-react';
import client from '../api/client';

const SCHEME_COLORS = {
  PMAY: '#3b82f6',
  MGNREGS: '#10b981',
  PMGSY: '#f59e0b',
  NRLM: '#8b5cf6',
  'DDU-GKY': '#ec4899',
  SAGY: '#06b6d4',
};

export default function SchemeComparison() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComparisonData();
  }, []);

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      const schemes = ['PMAY', 'MGNREGS', 'PMGSY', 'NRLM', 'DDU-GKY', 'SAGY'];
      const comparisons = await Promise.all(schemes.map(async (scheme) => {
        const response = await client.get(`/kpis/latest?scheme=${encodeURIComponent(scheme)}&limit=2000`);
        const values = Array.isArray(response.data?.data) ? response.data.data : [];
        const latestByLocation = new Map();

        values.forEach((item) => {
          const locationKey = `${item.kpi_id}:${item.state_id ?? 'national'}:${item.district_id ?? ''}`;
          if (!latestByLocation.has(locationKey)) latestByLocation.set(locationKey, item);
        });

        const observations = Array.from(latestByLocation.values()).map((item) => {
          const value = Number(item.value);
          const target = Number(item.target_value);
          return Number.isFinite(value) && Number.isFinite(target) && target > 0
            ? Math.min(Math.max((value / target) * 100, 0), 100)
            : null;
        }).filter(value => value != null);

        return {
          name: scheme,
          performance: observations.length
            ? Math.round(observations.reduce((sum, value) => sum + value, 0) / observations.length)
            : null,
          kpis: new Set(Array.from(latestByLocation.values(), item => item.kpi_id)).size,
          values: observations.length,
          color: SCHEME_COLORS[scheme],
        };
      }));

      setData(comparisons.sort((first, second) => (second.performance ?? -1) - (first.performance ?? -1)));
      setError(null);
    } catch (err) {
      console.error('Error fetching comparison:', err);
      setData([]);
      setError('Unable to load scheme comparisons. Check data availability and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">📊 Scheme Performance Comparison</h3>
        <button
          onClick={fetchComparisonData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Schemes Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map(scheme => (
          <div key={scheme.name} className="bg-white/10 border border-white/20 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-bold text-white">{scheme.name}</h4>
              <span className="text-2xl font-bold" style={{ color: scheme.color }}>
                  {scheme.performance == null ? 'N/A' : `${scheme.performance}%`}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <p>KPI Metrics: <span className="text-white font-semibold">{scheme.kpis}</span></p>
              <p>Data Points: <span className="text-white font-semibold">{scheme.values}</span></p>
              {scheme.performance == null && <p className="text-gray-400">No comparable observations</p>}
            </div>
              {scheme.performance != null && (
                <div className="mt-3 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${scheme.performance}%`, backgroundColor: scheme.color }} />
                </div>
              )}
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      {error && <p role="alert" className="text-center text-red-300">{error}</p>}

      {data.some(scheme => scheme.performance != null) && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mt-6">
          <h4 className="text-lg font-bold text-white mb-4">Performance Score by Scheme</h4>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.filter(scheme => scheme.performance != null)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f0f0f0' }}
                />
                <Legend wrapperStyle={{ color: '#e5e7eb' }} />
                <Bar dataKey="performance" name="Performance %" radius={[8, 8, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin"><div className="text-4xl">⏳</div></div>
        </div>
      )}
    </div>
  );
}
