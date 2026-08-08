import { useEffect, useState } from 'react';
import { useKPIs } from '../api/hooks';

export default function TopPerformers() {
  const { kpis, getTopPerformers } = useKPIs();
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (kpis.length > 0) {
      fetchTopPerformers();
    }
  }, [kpis]);

  const fetchTopPerformers = async () => {
    try {
      setLoading(true);
      if (kpis.length > 0) {
        const data = await getTopPerformers(kpis[0].id);
        setTopPerformers(data);
      }
    } catch (error) {
      console.error('Error fetching top performers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
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
      <h3 className="text-xl font-bold text-white mb-4">Top Performing States</h3>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-400">Loading...</p>
        </div>
      ) : topPerformers.length > 0 ? (
        <div className="space-y-3">
          {topPerformers.map((performer, index) => (
            <div
              key={`${performer.kpi_id}-${performer.state_id}`}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="text-2xl">{getMedalEmoji(index)}</span>
                <div className="flex-1">
                  <p className="text-white font-semibold">{performer.state?.name || 'Unknown State'}</p>
                  <p className="text-gray-400 text-sm">{performer.kpi?.kpi_name || 'KPI'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {formatValue(performer.value || 0)}
                </p>
                <p className="text-gray-400 text-xs">{performer.kpi?.unit || ''}</p>
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
