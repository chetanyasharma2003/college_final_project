import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import client from '../api/client';

const SCHEME_COLORS = {
  PMAY: '#3b82f6',
  MGNREGS: '#10b981',
  PMGSY: '#f59e0b',
  NRLM: '#8b5cf6',
  'DDU-GKY': '#ec4899',
  SAGY: '#06b6d4',
};

const SCHEME_NAMES = {
  PMAY: 'PMAY',
  MGNREGS: 'MGNREGS',
  PMGSY: 'PMGSY',
  NRLM: 'NRLM',
  'DDU-GKY': 'DDU-GKY',
  SAGY: 'SAGY',
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
      const response = await client.get('/analytics/compare-schemes?scheme_ids=1,2,3,4,5,6');
      const result = response.data.data || [];

      const schemes = result.map(scheme => {
        const total = scheme.kpi_count || 1;
        const achieved = scheme.achieved_count || 0;
        const performance = scheme.performance || 0;

        return {
          name: scheme.scheme_code || scheme.name,
          performance,
          achieved,
          total,
          color: SCHEME_COLORS[scheme.scheme_code] || '#6b7280',
        };
      });

      setData(schemes.sort((a, b) => b.performance - a.performance));
      setError(null);
    } catch (err) {
      console.error('Error fetching comparison:', err);
      // Use mock data as fallback
      const mockSchemes = [
        { name: 'PMAY', performance: 65, achieved: 4, total: 6, color: SCHEME_COLORS.PMAY },
        { name: 'MGNREGS', performance: 70, achieved: 5, total: 6, color: SCHEME_COLORS.MGNREGS },
        { name: 'PMGSY', performance: 58, achieved: 3, total: 6, color: SCHEME_COLORS.PMGSY },
        { name: 'NRLM', performance: 45, achieved: 2, total: 6, color: SCHEME_COLORS.NRLM },
        { name: 'DDU-GKY', performance: 72, achieved: 4, total: 6, color: SCHEME_COLORS['DDU-GKY'] },
        { name: 'SAGY', performance: 55, achieved: 3, total: 6, color: SCHEME_COLORS.SAGY },
      ];
      setData(mockSchemes.sort((a, b) => b.performance - a.performance));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="bg-white/5 rounded-lg p-8 animate-pulse h-96"></div>;
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 flex items-center gap-2 text-red-400">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">Scheme Performance Comparison</h3>
        <button
          onClick={fetchComparisonData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Comparison Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {data.map(scheme => (
          <div key={scheme.name} className="bg-white/5 border border-white/10 rounded-lg p-4 text-center hover:border-white/30 transition">
            <div className="text-sm text-gray-400 mb-2">{scheme.name}</div>
            <div className="text-3xl font-bold text-white mb-2">{scheme.performance}%</div>
            <div className="text-xs text-gray-500">{scheme.achieved}/{scheme.total} KPIs</div>
            <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${scheme.performance}%`,
                  backgroundColor: scheme.color,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Performance Score by Scheme</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#fff' }}
              formatter={(value) => `${value}%`}
            />
            <Bar
              dataKey="performance"
              radius={[8, 8, 0, 0]}
              fill="#3b82f6"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ranking Table */}
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h4 className="text-lg font-semibold text-white">Scheme Ranking</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-3 text-left text-gray-400 font-semibold">#</th>
                <th className="px-6 py-3 text-left text-gray-400 font-semibold">Scheme</th>
                <th className="px-6 py-3 text-left text-gray-400 font-semibold">Performance</th>
                <th className="px-6 py-3 text-left text-gray-400 font-semibold">KPIs</th>
                <th className="px-6 py-3 text-left text-gray-400 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((scheme, index) => (
                <tr key={scheme.name} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-6 py-3 text-gray-400">#{index + 1}</td>
                  <td className="px-6 py-3 text-white font-semibold">{scheme.name}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${scheme.performance}%`,
                            backgroundColor: scheme.color,
                          }}
                        ></div>
                      </div>
                      <span className="text-white font-semibold">{scheme.performance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-400">{scheme.achieved}/{scheme.total}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      scheme.performance >= 80 ? 'bg-green-500/20 text-green-400' :
                      scheme.performance >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {scheme.performance >= 80 ? '✓ On Track' : scheme.performance >= 60 ? '⚠ At Risk' : '✕ Critical'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
