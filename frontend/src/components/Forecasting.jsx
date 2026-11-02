import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import client from '../api/client';

export default function Forecasting({ schemeCode = 'PMAY', schemeName = 'PMAY' }) {
  const [forecasts, setForecasts] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [selectedKPI, setSelectedKPI] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchDefinitions = async () => {
      setLoading(true);
      setError(null);
      setForecasts([]);
      setPrediction(null);
      setKpis([]);
      setSelectedKPI('');

      try {
        const response = await client.get(`/kpis/definitions/${schemeCode}`);
        const definitions = response.data?.data?.kpis || [];
        if (!active) return;
        setKpis(definitions);
        setSelectedKPI(definitions[0] ? String(definitions[0].id) : '');
        if (definitions.length === 0) setError('No KPI definitions are available for this scheme.');
      } catch (fetchError) {
        if (active) setError(fetchError.response?.data?.message || 'Failed to load KPIs for forecasting.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDefinitions();
    return () => { active = false; };
  }, [schemeCode]);

  const selectedDefinition = kpis.find(kpi => String(kpi.id) === selectedKPI);

  useEffect(() => {
    if (!selectedDefinition) return;
    let active = true;

    const fetchForecast = async () => {
      setLoading(true);
      setError(null);
      setForecasts([]);
      setPrediction(null);

      try {
        const [predictionResponse, historyResponse] = await Promise.all([
          client.get(`/predictions/kpi/${selectedDefinition.id}?months=3`),
          client.get(`/kpis/${selectedDefinition.id}/trend?days=365`),
        ]);
        const result = predictionResponse.data?.data;
        if (result?.status !== 'success' || !Array.isArray(result.forecasts)) {
          throw new Error(result?.message || 'Not enough historical data to create a forecast.');
        }

        const history = Array.isArray(historyResponse.data?.data) ? historyResponse.data.data : [];
        const valuesByDate = new Map();
        history.forEach((item) => {
          const date = new Date(item.date);
          const value = Number(item.value);
          if (Number.isNaN(date.getTime()) || !Number.isFinite(value)) return;
          const key = date.toISOString().slice(0, 10);
          const point = valuesByDate.get(key) || { total: 0, count: 0 };
          point.total += value;
          point.count += 1;
          valuesByDate.set(key, point);
        });

        const actualPoints = Array.from(valuesByDate, ([date, point]) => ({
          date,
          value: point.total / point.count,
          forecast: null,
        })).sort((first, second) => first.date.localeCompare(second.date));
        const forecastPoints = result.forecasts.map(item => ({
          date: new Date(item.date).toISOString().slice(0, 10),
          value: null,
          forecast: Number(item.predicted_value),
        }));

        if (!active) return;
        setForecasts([...actualPoints, ...forecastPoints]);
        setPrediction(result);
        if (actualPoints.length === 0) setError('No historical KPI values are available for this period.');
      } catch (fetchError) {
        if (active) setError(fetchError.response?.data?.message || fetchError.message || 'Failed to load forecast.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchForecast();
    return () => { active = false; };
  }, [selectedDefinition?.id, reloadVersion]);

  const historicalPoints = forecasts.filter(point => point.value != null);
  const predictedPoints = forecasts.filter(point => point.forecast != null);
  const currentValue = historicalPoints.at(-1)?.value ?? null;
  const predictedValue = predictedPoints.at(-1)?.forecast ?? null;
  const targetValue = Number(selectedDefinition?.target_value);
  const projectedChange = currentValue != null && currentValue !== 0 && predictedValue != null
    ? ((predictedValue - currentValue) / Math.abs(currentValue)) * 100
    : null;
  const projectedTargetProgress = Number.isFinite(targetValue) && targetValue > 0 && predictedValue != null
    ? (predictedValue / targetValue) * 100
    : null;

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
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp size={28} className="text-green-400" />
          Predictive Forecasting
        </h3>
        <button
            onClick={() => setReloadVersion(version => version + 1)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(kpi => (
          <button
            key={kpi.id}
            onClick={() => setSelectedKPI(String(kpi.id))}
            className={`px-4 py-2 rounded-lg border-2 transition text-sm font-semibold ${
              selectedKPI === String(kpi.id)
                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
            }`}
          >
            {kpi.kpi_name}
          </button>
        ))}
      </div>

      {/* Forecast Chart */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Three-Month Forecast: {selectedDefinition?.kpi_name || schemeName}</h4>
        <ResponsiveContainer width="100%" height={300}>
          {forecasts.length > 0 && <AreaChart data={forecasts}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
              name="Historical"
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorForecast)"
              name="Forecast"
              strokeDasharray="5 5"
            />
            <Legend />
          </AreaChart>}
          {forecasts.length === 0 && <div className="h-[300px] flex items-center justify-center text-gray-400">No forecast data available.</div>}
        </ResponsiveContainer>
      </div>

      {/* Forecast Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-400 text-sm mb-2">Projected Change</p>
          <p className="text-3xl font-bold text-white">{projectedChange == null ? 'N/A' : `${projectedChange >= 0 ? '+' : ''}${projectedChange.toFixed(1)}%`}</p>
          <p className="text-xs text-green-300 mt-1">From latest observation</p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-400 text-sm mb-2">Forecast Confidence</p>
          <p className="text-3xl font-bold text-white">{prediction?.prediction_confidence || 'N/A'}</p>
          <p className="text-xs text-blue-300 mt-1">Model estimate</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <p className="text-amber-400 text-sm mb-2">Trend</p>
          <p className="text-3xl font-bold text-white">{prediction?.trend || 'N/A'}</p>
          <p className="text-xs text-amber-300 mt-1">{prediction?.trend_rate || 'No trend estimate'}</p>
        </div>
      </div>

      {/* Forecast Details */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Forecast Summary</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between pb-3 border-b border-white/10">
            <span className="text-gray-400">Current Value:</span>
            <span className="text-white font-semibold">{currentValue == null ? 'N/A' : currentValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-white/10">
            <span className="text-gray-400">30-Day Forecast:</span>
            <span className="text-white font-semibold">{predictedValue == null ? 'N/A' : predictedValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-white/10">
            <span className="text-gray-400">Expected Growth:</span>
            <span className="text-green-400 font-semibold">{projectedChange == null ? 'N/A' : `${(predictedValue - currentValue).toLocaleString()} (${projectedChange.toFixed(1)}%)`}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-white/10">
            <span className="text-gray-400">Target Value:</span>
            <span className="text-white font-semibold">{Number.isFinite(targetValue) ? targetValue.toLocaleString() : 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Gap to Target:</span>
            <span className="text-amber-400 font-semibold">{projectedTargetProgress == null ? 'N/A' : `${(predictedValue - targetValue).toLocaleString()} (${(projectedTargetProgress - 100).toFixed(1)}%)`}</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-400 mb-3">💡 Forecast Insights</h4>
        <ul className="space-y-2 text-blue-100 text-sm">
          <li>• Forecasts are generated from historical records for the selected KPI.</li>
          <li>• Current trend: {prediction?.trend || 'unavailable'}.</li>
          <li>• Estimated rate: {prediction?.trend_rate || 'unavailable'}.</li>
          <li>• Treat projections as estimates, not official scheme targets.</li>
        </ul>
      </div>
    </div>
  );
}
