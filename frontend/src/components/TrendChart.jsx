import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSelector } from 'react-redux';
import client from '../api/client';

export default function TrendChart() {
  const { selectedScheme, schemes } = useSelector(state => state.data);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedScheme) {
      fetchTrendData();
    }
  }, [selectedScheme]);

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the scheme code
      const scheme = schemes.find(s => s.id === selectedScheme);
      if (!scheme) {
        setTrendData([]);
        setLoading(false);
        return;
      }

      // Fetch scheme-specific KPI values
      const response = await client.get(`/kpis/latest?scheme=${scheme.code}&limit=500`);
      const schemeValues = response.data?.data || [];

      if (schemeValues.length === 0) {
        setTrendData([]);
        return;
      }

      // Group by date
      const dataByDate = {};
      schemeValues.forEach(kv => {
        const date = new Date(kv.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        if (!dataByDate[date]) {
          dataByDate[date] = { date, values: [] };
        }
        dataByDate[date].values.push(parseFloat(kv.value) || 0);
      });

      // Calculate average per date
      const chartData = Object.values(dataByDate)
        .map(d => ({
          date: d.date,
          value: Math.round(
            d.values.reduce((a, b) => a + b, 0) / d.values.length
          ),
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-15);

      setTrendData(chartData);
    } catch (err) {
      console.error('Error fetching trend:', err);
      setError('Failed to load trend data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">📈 Performance Trend (Last 30 Days)</h3>

      {loading ? (
        <div className="flex justify-center items-center h-80 md:h-96">
          <div className="animate-spin">
            <div className="text-4xl">⏳</div>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col justify-center items-center h-80 md:h-96 gap-4">
          <p className="text-red-400 font-semibold">{error}</p>
          <button
            onClick={fetchTrendData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all"
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
                }}
                labelStyle={{ color: '#f0f0f0' }}
              />
              <Legend wrapperStyle={{ color: '#e5e7eb' }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="KPI Trend"
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
