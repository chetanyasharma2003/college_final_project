import { useEffect, useState } from 'react';
import client from '../api/client';

export default function TopPerformers() {
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTopPerformers();
  }, []);

  const fetchTopPerformers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get top KPI values
      const response = await client.get('/kpis/latest?limit=100');
      const kpiValues = response.data?.data || [];

      if (kpiValues.length === 0) {
        throw new Error('No data available');
      }

      // Sort by value and get top 5
      const sorted = kpiValues
        .sort((a, b) => (parseFloat(b.value) || 0) - (parseFloat(a.value) || 0))
        .slice(0, 5)
        .map((kv, idx) => ({
          ...kv,
          rank: idx + 1
        }));

      setTopPerformers(sorted);
    } catch (err) {
      console.error('Error fetching top performers:', err);
      setError('Failed to load top performers');
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '⭐';
  };

  const formatValue = (val) => {
    const num = parseFloat(val) || 0;
    if (num > 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num > 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">🏆 Top Performing States</h3>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin"><div className="text-4xl">⏳</div></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-400">{error}</div>
      ) : topPerformers.length > 0 ? (
        <div className="space-y-3">
          {topPerformers.map((performer) => (
            <div
              key={`${performer.kpi_id}-${performer.state_id}-${performer.rank}`}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="text-2xl">{getMedalEmoji(performer.rank)}</span>
                <div className="flex-1">
                  <p className="text-white font-semibold">{performer.state?.name || 'State'}</p>
                  <p className="text-gray-400 text-sm">{performer.kpi?.kpi_name || 'KPI'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {formatValue(performer.value || 0)}
                </p>
                <p className="text-gray-400 text-xs text-green-400">✓ On Track</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-400">No data available</p>
        </div>
      )}
    </div>
  );
}
