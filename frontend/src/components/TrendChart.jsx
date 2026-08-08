import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useKPIs } from '../api/hooks';

export default function TrendChart() {
  const { kpis, getKPITrend } = useKPIs();
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (kpis.length > 0) {
      fetchTrendData();
    }
  }, [kpis]);

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (kpis.length > 0) {
        const data = await getKPITrend(kpis[0].id, 30);
        const formattedData = data.map((item) => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: parseFloat(item.value),
          state: item.state?.name,
        }));
        setTrendData(formattedData.slice(0, 15)); // Last 15 days
      }
    } catch (err) {
      console.error('Error fetching trend:', err);
      setError('Failed to load trend data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Performance Trend (Last 30 Days)</h3>

      {loading ? (
        <div className="flex justify-center items-center h-80 md:h-96">
          <div role="status" aria-label="Loading chart">
            <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col justify-center items-center h-80 md:h-96 gap-4">
          <p className="text-red-400 font-semibold">{error}</p>
          <button
            onClick={fetchTrendData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all"
            aria-label="Retry loading chart"
          >
            Retry
          </button>
        </div>
      ) : trendData.length > 0 ? (
        <div className="w-full h-80 md:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.7)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                }}
                labelStyle={{ color: '#f0f0f0' }}
                cursor={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
              />
              <Legend wrapperStyle={{ color: '#e5e7eb' }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="KPI Value"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-80 md:h-96">
          <p className="text-gray-300 text-lg">📈 No trend data available</p>
          <p className="text-gray-400 text-sm mt-2">Select a scheme to view trends</p>
        </div>
      )}
    </div>
  );
}
