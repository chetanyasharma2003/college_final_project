import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react';
import client from '../api/client';

export default function StateRanking({ schemeCode = 'PMAY' }) {
  const [topStates, setTopStates] = useState([]);
  const [bottomStates, setBottomStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStateRanking();
  }, [schemeCode]);

  const fetchStateRanking = async () => {
    try {
      setLoading(true);

      const response = await client.get(`/analytics/state-ranking/${schemeCode}`);
      const data = response.data.data || [];

      if (data.length > 0) {
        setTopStates(data.slice(0, 3));
        setBottomStates(data.slice(-3).reverse());
      } else {
        throw new Error('No ranking data available');
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching state ranking:', err);
      setError('Failed to load state rankings');
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

  const allStatesForChart = [...topStates, ...bottomStates.reverse()];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">State Performance Rankings</h3>
        <button
          onClick={fetchStateRanking}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={24} className="text-green-400" />
            <h4 className="text-lg font-semibold text-white">🏆 Top Performers</h4>
          </div>

          <div className="space-y-3">
            {topStates.map((state, index) => (
              <div key={state.name} className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3 hover:border-green-500/40 transition">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">{state.name}</div>
                  <div className="text-xs text-gray-400">{state.status}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">{state.progress}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Performers */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={24} className="text-red-400" />
            <h4 className="text-lg font-semibold text-white">⚠️ Needs Support</h4>
          </div>

          <div className="space-y-3">
            {bottomStates.map((state, index) => (
              <div key={state.name} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3 hover:border-red-500/40 transition">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold">
                  {index + 6}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">{state.name}</div>
                  <div className="text-xs text-gray-400">{state.status}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-400">{state.progress}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Progress Distribution</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={allStatesForChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#fff' }}
              formatter={(value) => `${value}%`}
            />
            <Bar dataKey="progress" radius={[8, 8, 0, 0]} fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
