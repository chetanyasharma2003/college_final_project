import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSelector } from 'react-redux';
import client from '../api/client';

export default function TrendChart({ dateRange, stateId = null }) {
  const { selectedScheme, schemes } = useSelector(state => state.data);
  const [kpiValues, setKpiValues] = useState([]);
  const [selectedKpiId, setSelectedKpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let isActive = true;

    const fetchTrendData = async () => {
      if (!selectedScheme) {
        setKpiValues([]);
        return;
      }

      const scheme = schemes.find(s => s.id === selectedScheme);
      if (!scheme) {
        setKpiValues([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({ scheme: scheme.code, limit: '10000' });
        if (dateRange?.startDate) params.set('startDate', dateRange.startDate);
        if (dateRange?.endDate) params.set('endDate', dateRange.endDate);
        if (stateId) params.set('stateId', stateId);

        const response = await client.get(`/kpis/latest?${params.toString()}`);
        if (isActive) {
          setKpiValues(Array.isArray(response.data?.data) ? response.data.data : []);
        }
      } catch (err) {
        if (isActive) {
          setKpiValues([]);
          setError('Failed to load trend data');
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchTrendData();
    return () => {
      isActive = false;
    };
  }, [selectedScheme, schemes, dateRange?.startDate, dateRange?.endDate, stateId, reloadVersion]);

  useEffect(() => {
    const refresh = () => setReloadVersion((version) => version + 1);
    window.addEventListener('kpi-data:updated', refresh);
    return () => window.removeEventListener('kpi-data:updated', refresh);
  }, []);

  const metricOptions = useMemo(() => {
    const metrics = new Map();
    kpiValues.forEach((item) => {
      if (item.kpi_id != null) {
        metrics.set(String(item.kpi_id), item.kpi?.kpi_name || `KPI ${item.kpi_id}`);
      }
    });
    return Array.from(metrics, ([id, name]) => ({ id, name }));
  }, [kpiValues]);

  const activeKpiId = metricOptions.some(metric => metric.id === selectedKpiId)
    ? selectedKpiId
    : metricOptions[0]?.id || '';
  const activeMetric = metricOptions.find(metric => metric.id === activeKpiId);

  const trendData = useMemo(() => {
    const valuesByDate = new Map();
    kpiValues
      .filter(item => String(item.kpi_id) === activeKpiId)
      .forEach((item) => {
        const timestamp = new Date(item.date);
        if (Number.isNaN(timestamp.getTime())) return;
        const dateKey = timestamp.toISOString().slice(0, 10);
        const current = valuesByDate.get(dateKey) || [];
        current.push(item);
        valuesByDate.set(dateKey, current);
      });

    return Array.from(valuesByDate, ([dateKey, rows]) => {
      const nationalRows = rows.filter((item) => (
        item.state_id == null && item.district_id == null && item.block_id == null && item.village_id == null
      ));
      const districtRows = rows.filter((item) => item.district_id != null && item.block_id == null && item.village_id == null);
      const stateRows = rows.filter((item) => item.state_id != null && item.district_id == null && item.block_id == null && item.village_id == null);
      const sourceRows = nationalRows.length ? nationalRows : districtRows.length ? districtRows : stateRows;
      const total = sourceRows.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
      return {
        dateKey,
        date: new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
        }),
        value: Number(total.toFixed(2)),
      };
    }).sort((first, second) => first.dateKey.localeCompare(second.dateKey));
  }, [kpiValues, activeKpiId]);

  const formatDate = (date) => date
    ? new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">
            {trendData.length === 1 ? 'Source snapshot' : 'Performance trend'}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {trendData.length === 1
              ? `One source-reported date is available (${formatDate(trendData[0].dateKey)}); a time trend cannot be calculated.`
              : dateRange?.startDate && dateRange?.endDate
              ? `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
              : 'Available reporting dates'}
          </p>
          <p className="mt-1 text-xs text-gray-500">Uses the source national total when available; otherwise totals the lowest available state/district level.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <span>KPI</span>
          <select
            aria-label="KPI to trend"
            value={activeKpiId}
            onChange={event => setSelectedKpiId(event.target.value)}
            disabled={metricOptions.length === 0}
            className="max-w-full rounded border border-white/20 bg-slate-800 px-3 py-2 text-white"
          >
            {metricOptions.map(metric => (
              <option key={metric.id} value={metric.id}>{metric.name}</option>
            ))}
          </select>
        </label>
      </div>

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
            onClick={() => setReloadVersion(version => version + 1)}
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
                name={activeMetric?.name || 'KPI Trend'}
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
