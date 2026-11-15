import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const STATUS_LABELS = {
  critical: 'Below target threshold',
  at_risk: 'Below target threshold',
  achieved: 'Target reached',
};

function formatNumber(value) {
  const number = Number(value);
  return value == null || !Number.isFinite(number) ? 'Not reported' : number.toLocaleString('en-IN');
}

export default function KPIAlerts({ kpiValues = [], loading = false }) {
  const flagged = kpiValues.filter((item) => ['critical', 'at_risk'].includes(item.status));
  const reached = kpiValues.filter((item) => item.status === 'achieved');

  return (
    <section className="rounded-xl border border-white/15 bg-white/5 p-5" aria-labelledby="kpi-alerts-title">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-400">
          <AlertCircle size={18} aria-hidden="true" />
        </span>
        <div>
          <h3 id="kpi-alerts-title" className="font-semibold text-white">Target-based status</h3>
          <p className="mt-1 text-sm text-gray-400">
            Statuses come from the dashboard's available target data. Indicators without a supplied target are not rated.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400" role="status">Loading indicator statuses…</p>
      ) : flagged.length || reached.length ? (
        <ul className="grid gap-2 md:grid-cols-2">
          {[...flagged, ...reached].map((item) => {
            const isReached = item.status === 'achieved';
            const Icon = isReached ? CheckCircle : AlertCircle;
            return (
              <li key={item.kpi_id || item.kpi_name} className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
                <Icon size={16} className={isReached ? 'text-green-400' : 'text-amber-400'} aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{item.kpi_name || 'Scheme indicator'}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {STATUS_LABELS[item.status]} · {formatNumber(item.current_value)} {item.unit || ''}
                    {item.target_value == null ? '' : ` / target ${formatNumber(item.target_value)}`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="flex items-start gap-2 text-sm text-gray-400">
          <Clock size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          No target-based status is available for the current selection.
        </p>
      )}
    </section>
  );
}
