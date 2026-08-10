import { useMemo, useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import PerformanceBadge from './PerformanceBadge';
import TrendSparkline from './TrendSparkline';

export default function KPICard({ kpi, schemeCode, data: initialData }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialData && schemeCode) {
      fetchKPIStatus();
    }
  }, [schemeCode, initialData]);

  const fetchKPIStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/kpis/status/${schemeCode}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const result = await response.json();
      const kpiData = result.kpi_status.find(k => k.kpi_id === kpi?.kpi_id);
      if (kpiData) {
        setData(kpiData);
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="bg-white/10 rounded-xl p-6 animate-pulse h-48"></div>;
  }

  if (error || !data) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex items-center gap-2 text-red-400">
        <AlertCircle size={20} />
        <span className="text-sm">{error || 'No data'}</span>
      </div>
    );
  }

  const statusConfig = {
    achieved: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', icon: CheckCircle, label: '✓ Achieved' },
    on_track: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', icon: TrendingUp, label: '↑ On Track' },
    at_risk: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: AlertCircle, label: '⚠ At Risk' },
  };

  const config = statusConfig[data.status] || statusConfig.at_risk;
  const percentage = Math.min(data.progress_percentage || 0, 100);

  const formatValue = (val, unit) => {
    if (!val) return '0';
    const num = parseFloat(val);
    if (isNaN(num)) return '0';

    if (unit?.includes('%')) return num.toFixed(1) + '%';
    if (unit?.includes('INR') || unit?.includes('Crore')) {
      if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
      if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
      return num.toFixed(0);
    }
    if (unit?.includes('day')) return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    if (num > 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num > 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString('en-IN', { maximumFractionDigits: 1 });
  };

  const StatusIcon = config.icon;

  return (
    <div
      className={`${config.bg} backdrop-blur-lg border ${config.border} rounded-xl p-6 hover:border-blue-400/50 transition-all duration-300 hover:bg-white/[0.15] hover:shadow-lg`}
      role="article"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4 gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
            {data.kpi_name}
          </h3>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <p className="text-gray-300 text-xs">{data.unit}</p>
            <PerformanceBadge
              value={data.current_value}
              target={data.target_value}
              status={data.status}
            />
            <TrendSparkline
              currentValue={data.current_value}
              previousValue={data.previous_value}
            />
          </div>
        </div>
        <div className={`p-2 rounded-full ${config.bg}`}>
          <StatusIcon size={20} className={config.text} />
        </div>
      </div>

      {/* Value & Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-2 gap-2">
          <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {formatValue(data.current_value, data.unit)}
          </p>
        </div>
        <p className="text-gray-400 text-xs mb-3">Target: {formatValue(data.target_value, data.unit)}</p>

        {/* Progress Bar */}
        <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              percentage >= 100
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : percentage >= 80
                ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                : percentage >= 60
                ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
                : 'bg-gradient-to-r from-red-500 to-pink-400'
            }`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>

      {/* Status & Percentage */}
      <div className="flex justify-between items-center text-sm">
        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text}`}>
          {config.label}
        </span>
        <span className={`font-bold ${config.text}`}>
          {percentage}%
        </span>
      </div>

      {/* Last Updated */}
      {data.last_updated && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
          <Clock size={12} />
          {new Date(data.last_updated).toLocaleDateString('en-IN')}
        </div>
      )}
    </div>
  );
}
