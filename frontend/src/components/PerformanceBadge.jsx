import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function PerformanceBadge({ value = 0, target = 1, status = 'on-track' }) {
  const safeValue = Number(value) || 0;
  const safeTarget = Number(target) || 1;
  const percentage = safeTarget > 0 ? (safeValue / safeTarget) * 100 : 0;

  let badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  let icon = <Clock size={14} />;

  if (percentage >= 100) {
    badgeColor = 'bg-green-500/20 text-green-300 border-green-500/30';
    icon = <CheckCircle size={14} />;
  } else if (percentage >= 75) {
    badgeColor = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    icon = <AlertCircle size={14} />;
  } else if (percentage < 50) {
    badgeColor = 'bg-red-500/20 text-red-300 border-red-500/30';
    icon = <AlertCircle size={14} />;
  }

  const statusLabel =
    percentage >= 100 ? 'Achieved' :
    percentage >= 75 ? 'On Track' :
    percentage >= 50 ? 'At Risk' :
    'Critical';

  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${badgeColor}`}>
      {icon}
      <span>{statusLabel} ({Math.round(percentage)}%)</span>
    </div>
  );
}
