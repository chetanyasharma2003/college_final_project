import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import client from '../api/client';
import { toLocalDateInputValue } from '../utils/dates';

function buildSourceSeries(rows) {
  const grouped = new Map();
  rows.forEach((row) => {
    const date = new Date(row.date);
    const value = Number(row.value);
    if (Number.isNaN(date.getTime()) || !Number.isFinite(value)) return;
    const key = date.toISOString().slice(0, 10);
    const dayRows = grouped.get(key) || [];
    dayRows.push({ ...row, value, date });
    grouped.set(key, dayRows);
  });

  return Array.from(grouped, ([date, dayRows]) => {
    const national = dayRows.filter((row) => (
      row.state_id == null && row.district_id == null && row.block_id == null && row.village_id == null
    ));
    const district = dayRows.filter((row) => row.district_id != null && row.block_id == null && row.village_id == null);
    const state = dayRows.filter((row) => row.state_id != null && row.district_id == null && row.block_id == null && row.village_id == null);
    const sourceRows = national.length ? national : district.length ? district : state;
    if (!sourceRows.length) return null;
    return {
      date,
      value: sourceRows.reduce((total, row) => total + row.value, 0),
      forecast: null,
    };
  }).filter(Boolean).sort((first, second) => first.date.localeCompare(second.date));
}

export default function Forecasting({ schemeCode = 'PMAY', schemeName = 'PMAY' }) {
  const [forecasts, setForecasts] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [selectedKPI, setSelectedKPI] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchDefinitions = async () => {
      setLoading(true);
      setError(null);
      setNotice('');
      setForecasts([]);
      setPrediction(null);
      setKpis([]);
      setSelectedKPI('');

      try {
        const response = await client.get(`/kpis/definitions/${schemeCode}`);
        const responseDefinitions = response.data?.kpis || response.data?.data?.kpis || [];
        const definitions = Array.isArray(responseDefinitions) ? responseDefinitions : [];
        if (!active) return;
        setKpis(definitions);
        setSelectedKPI(definitions[0] ? String(definitions[0].id) : '');
        if (!definitions.length) setError('No source-mapped KPI definitions are available for this scheme.');
      } catch (fetchError) {
        if (active) setError(fetchError.response?.data?.message || 'Failed to load KPIs for forecasting.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDefinitions();
    return () => { active = false; };
  }, [schemeCode, reloadVersion]);

  const selectedDefinition = kpis.find(kpi => String(kpi.id) === selectedKPI);

  useEffect(() => {
    if (!selectedDefinition) return;
    let active = true;

    const fetchForecast = async () => {
      setLoading(true);
      setError(null);
      setNotice('');
      setForecasts([]);
      setPrediction(null);

      try {
        const end = new Date();
        const start = new Date(end);
        start.setFullYear(start.getFullYear() - 1);
        const historyResponse = await client.get('/kpis/latest', {
          params: {
            scheme: schemeCode,
            startDate: toLocalDateInputValue(start),
            endDate: toLocalDateInputValue(end),
            limit: 10000,
          },
        });
        const history = (Array.isArray(historyResponse.data?.data) ? historyResponse.data.data : [])
          .filter((item) => String(item.kpi_id) === String(selectedDefinition.id));
        const actualPoints = buildSourceSeries(history);
        const gapsInDays = actualPoints.slice(1).map((point, index) => (
          (new Date(point.date) - new Date(actualPoints[index].date)) / 86400000
        ));
        const spanInDays = actualPoints.length > 1
          ? (new Date(actualPoints.at(-1).date) - new Date(actualPoints[0].date)) / 86400000
          : 0;

        if (actualPoints.length < 3 || spanInDays < 60 || gapsInDays.some((gap) => gap <= 0 || gap > 180)) {
          if (!active) return;
          setForecasts(actualPoints);
          setNotice('Forecast unavailable: this KPI needs at least three recent source dates spanning 60 days, with no reporting gap over 180 days. The chart shows available source observations only.');
          return;
        }

        const predictionResponse = await client.get(`/predictions/kpi/${selectedDefinition.id}?months=3`);
        const result = predictionResponse.data?.data;
        if (result?.status !== 'success' || !Array.isArray(result.forecasts)) {
          if (!active) return;
          setForecasts(actualPoints);
          setNotice(result?.message || 'A projection could not be generated from this source history.');
          return;
        }

        const forecastPoints = result.forecasts.map((item) => {
          const date = new Date(item.date);
          const value = Number(item.predicted_value);
          if (Number.isNaN(date.getTime()) || !Number.isFinite(value)) return null;
          return {
            date: date.toISOString().slice(0, 10),
            value: null,
            forecast: value,
          };
        }).filter(Boolean);

        if (!active) return;
        setForecasts([...actualPoints, ...forecastPoints]);
        setPrediction(result);
        if (!forecastPoints.length) setNotice('The source returned no valid forecast dates.');
      } catch (fetchError) {
        if (active) setError(fetchError.response?.data?.message || fetchError.message || 'Failed to load forecast.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchForecast();
    return () => { active = false; };
  }, [selectedDefinition?.id, schemeCode, reloadVersion]);

  const historicalPoints = forecasts.filter(point => point.value != null);
  const predictedPoints = forecasts.filter(point => point.forecast != null);
  const currentValue = historicalPoints.at(-1)?.value ?? null;
  const predictedValue = predictedPoints.at(-1)?.forecast ?? null;
  const firstMonthValue = predictedPoints[0]?.forecast ?? null;
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
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 flex items-center gap-3 text-red-400" role="alert">
        <AlertCircle size={20} />
        <span>{error}</span>
          <button type="button" onClick={() => setReloadVersion((version) => version + 1)} className="ml-auto rounded border px-3 py-1 text-sm">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp size={28} className="text-green-400" />
          Exploratory trend projection
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
            type="button"
            key={kpi.id}
            onClick={() => setSelectedKPI(String(kpi.id))}
            aria-pressed={selectedKPI === String(kpi.id)}
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
      {notice && <p className="app-note" role="status">{notice}</p>}

      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">
          {predictedPoints.length ? 'Three-month exploratory projection' : 'Available source observations'}: {selectedDefinition?.kpi_name || schemeName}
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          {forecasts.length > 0 && <AreaChart data={forecasts}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#245b48" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#245b48" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#875d16" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#875d16" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5eae6" />
            <XAxis dataKey="date" stroke="#68766f" style={{ fontSize: '12px' }} />
            <YAxis stroke="#68766f" />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #dfe6e1', borderRadius: '8px', color: '#17231f' }}
              labelStyle={{ color: '#17231f' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#245b48"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
              name="Historical"
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#875d16"
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
          <p className="text-green-400 text-sm mb-2">Change over three projected months</p>
          <p className="text-3xl font-bold text-white">{projectedChange == null ? 'N/A' : `${projectedChange >= 0 ? '+' : ''}${projectedChange.toFixed(1)}%`}</p>
          <p className="text-xs text-green-300 mt-1">Compared with the latest source total</p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-400 text-sm mb-2">Projection method</p>
          <p className="text-lg font-bold text-white">Linear trend</p>
          <p className="text-xs text-blue-300 mt-1">No statistical confidence score is calculated.</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <p className="text-amber-400 text-sm mb-2">Reported value direction</p>
          <p className="text-3xl font-bold text-white capitalize">{prediction?.trend || 'Not available'}</p>
          <p className="text-xs text-amber-300 mt-1">{prediction?.trend_rate || 'No trend estimate'}</p>
        </div>
      </div>

      {/* Forecast Details */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Projection summary</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between pb-3 border-b border-white/10">
            <span className="text-gray-400">Current Value:</span>
            <span className="text-white font-semibold">{currentValue == null ? 'N/A' : currentValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-white/10">
            <span className="text-gray-400">First-month estimate:</span>
            <span className="text-white font-semibold">{firstMonthValue == null ? 'N/A' : firstMonthValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-white/10">
            <span className="text-gray-400">Three-month difference vs latest reported value:</span>
            <span className="text-green-400 font-semibold">{projectedChange == null ? 'N/A' : `${(predictedValue - currentValue).toLocaleString()} (${projectedChange.toFixed(1)}%)`}</span>
          </div>
          {Number.isFinite(targetValue) && targetValue > 0 && (
            <>
              <div className="flex justify-between pb-3 border-b border-white/10">
                <span className="text-gray-400">Configured target:</span>
                <span className="text-white font-semibold">{targetValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Three-month projection vs configured target:</span>
                <span className="text-amber-400 font-semibold">{projectedTargetProgress == null ? 'N/A' : `${(predictedValue - targetValue).toLocaleString()} (${(projectedTargetProgress - 100).toFixed(1)}%)`}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-400 mb-3">How to read this projection</h4>
        <ul className="space-y-2 text-blue-100 text-sm">
          <li>• The line extends a linear fit over dated source totals or the lowest available geographic level.</li>
          <li>• Rising counts or allocations do not necessarily mean better programme outcomes.</li>
          <li>• This exploratory estimate is not an official target or a validated forecast.</li>
        </ul>
      </div>
    </div>
  );
}
