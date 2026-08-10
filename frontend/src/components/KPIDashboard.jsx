import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import client from '../api/client';
import KPICard from './KPICard';
import ExportButton from './ExportButton';

export default function KPIDashboard({ schemeCode, schemeName, stateId = null }) {
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    fetchAllKPIs();
    const interval = setInterval(fetchAllKPIs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [schemeCode, stateId]);

  const fetchAllKPIs = async () => {
    try {
      setLoading(true);
      const url = stateId
        ? `/kpis/status/${schemeCode}?stateId=${stateId}`
        : `/kpis/status/${schemeCode}`;
      const response = await client.get(url);
      setKpiData(response.data.kpi_status || []);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregate stats
  const stats = {
    total: kpiData.length,
    achieved: kpiData.filter(k => k.status === 'achieved').length,
    on_track: kpiData.filter(k => k.status === 'on_track').length,
    at_risk: kpiData.filter(k => k.status === 'at_risk').length,
    avg_progress: kpiData.length > 0 ? Math.round(kpiData.reduce((sum, k) => sum + k.progress_percentage, 0) / kpiData.length) : 0,
  };

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex items-center gap-3 text-red-400">
        <AlertCircle size={24} />
        <div>
          <h3 className="font-semibold">Error Loading KPIs</h3>
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={fetchAllKPIs}
            className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-sm transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">{schemeName}</h2>
          <p className="text-gray-400">Real-time KPI Performance Tracking</p>
        </div>
        <div className="flex gap-3">
          <ExportButton kpiData={kpiData} schemeName={schemeName} />
          <button
            onClick={fetchAllKPIs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Total KPIs</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-400 text-sm mb-1">Achieved</p>
          <p className="text-3xl font-bold text-green-400">{stats.achieved}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-400 text-sm mb-1">On Track</p>
          <p className="text-3xl font-bold text-blue-400">{stats.on_track}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-400 text-sm mb-1">At Risk</p>
          <p className="text-3xl font-bold text-yellow-400">{stats.at_risk}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-purple-400 text-sm mb-1">Avg Progress</p>
          <p className="text-3xl font-bold text-purple-400">{stats.avg_progress}%</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && kpiData.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white/5 rounded-xl p-6 animate-pulse h-48"></div>
          ))}
        </div>
      )}

      {/* KPI Cards Grid */}
      {!loading && kpiData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiData.map(kpi => (
            <KPICard
              key={kpi.kpi_id}
              kpi={kpi}
              schemeCode={schemeCode}
              data={kpi}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && kpiData.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-white mb-2">No KPI Data Available</h3>
          <p className="text-gray-400 mb-4">No KPI definitions found for this scheme.</p>
          <button
            onClick={fetchAllKPIs}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Footer */}
      {lastRefresh && (
        <p className="text-xs text-gray-500 text-center">
          Last updated: {lastRefresh.toLocaleTimeString('en-IN')}
        </p>
      )}
    </div>
  );
}
