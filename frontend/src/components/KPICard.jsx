import { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import PerformanceBadge from './PerformanceBadge';
import TrendSparkline from './TrendSparkline';
import client from '../api/client';

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
      const response = await client.get(`/kpis/status/${encodeURIComponent(schemeCode)}`);
      const kpiData = response.data?.kpi_status?.find((item) => item.kpi_id === kpi?.kpi_id);
      if (kpiData) {
        setData(kpiData);
        setError(null);
      } else {
        setData(null);
        setError('No observation is available for this indicator.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="bg-white/10 rounded-xl p-6 animate-pulse h-48" role="status" aria-label="Loading KPI" />;
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
    achieved: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', icon: CheckCircle, progress: 'bg-green-700' },
    on_track: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', icon: TrendingUp, progress: 'bg-blue-700' },
    at_risk: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: AlertCircle, progress: 'bg-yellow-700' },
    critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', icon: AlertCircle, progress: 'bg-red-700' },
    no_data: { bg: 'bg-white/5', text: 'text-gray-400', border: 'border-white/10', icon: Clock, progress: 'bg-gray-500' },
    no_target: { bg: 'bg-white/5', text: 'text-gray-400', border: 'border-white/10', icon: Clock, progress: 'bg-gray-500' },
  };

  const config = statusConfig[data.status] || {
    bg: 'bg-white/5', text: 'text-gray-400', border: 'border-white/10', icon: Clock, progress: 'bg-gray-500',
  };
  const numericTarget = data.target_value == null ? null : Number(data.target_value);
  const hasTarget = Number.isFinite(numericTarget) && numericTarget > 0;
  const numericProgress = data.progress_percentage == null ? null : Number(data.progress_percentage);
  const hasProgress = hasTarget && Number.isFinite(numericProgress) && numericProgress >= 0;
  const progressWidth = hasProgress ? Math.min(numericProgress, 100) : 0;

  const formatValue = (val, unit) => {
    if (val === null || val === undefined || val === '') return 'N/A';
    const num = parseFloat(val);
    if (!Number.isFinite(num)) return 'N/A';
    if (num === 0) return '0';

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
            {data.kpi_name || kpi?.kpi_name || 'Scheme indicator'}
          </h3>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <p className="text-gray-300 text-xs">{data.unit}</p>
            <PerformanceBadge status={data.status} progressPercentage={hasProgress ? numericProgress : null} />
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
          <p className="text-4xl font-bold text-gray-900">
            {formatValue(data.current_value, data.unit)}
          </p>
        </div>
        {hasTarget ? (
          <>
            <p className="text-gray-400 text-xs mb-3">Official target: {formatValue(numericTarget, data.unit)}</p>
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${config.progress}`}
                style={{ width: `${progressWidth}%` }}
                role="progressbar"
                aria-valuenow={progressWidth}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${data.kpi_name || kpi?.kpi_name || 'Indicator'} target progress`}
              ></div>
            </div>
          </>
        ) : (
          <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400">
            No official target is supplied for this indicator; progress cannot be rated.
          </p>
        )}
      </div>

      {/* Last Updated */}
      {data.last_updated && !Number.isNaN(new Date(data.last_updated).getTime()) && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
          <Clock size={12} />
          {new Date(data.last_updated).toLocaleDateString('en-IN')}
        </div>
      )}
    </div>
  );
}
