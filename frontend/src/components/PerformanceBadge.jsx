import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const STATUS_PRESENTATION = {
  achieved: { label: 'Target reached', tone: 'bg-green-500/10 text-green-400 border-green-500/30', icon: CheckCircle },
  on_track: { label: 'On track', tone: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: CheckCircle },
  at_risk: { label: 'Below target threshold', tone: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', icon: AlertCircle },
  critical: { label: 'Below target threshold', tone: 'bg-red-500/10 text-red-400 border-red-500/30', icon: AlertCircle },
  no_data: { label: 'No observation', tone: 'bg-white/5 text-gray-400 border-white/10', icon: Clock },
  no_target: { label: 'Not rated · no target', tone: 'bg-white/5 text-gray-400 border-white/10', icon: Clock },
};

export default function PerformanceBadge({ status = 'no_target', progressPercentage }) {
  const presentation = STATUS_PRESENTATION[status] || {
    label: 'Status unavailable',
    tone: 'bg-white/5 text-gray-400 border-white/10',
    icon: Clock,
  };
  const StatusIcon = presentation.icon;
  const progress = Number(progressPercentage);
  const hasProgress = progressPercentage != null && Number.isFinite(progress) && progress >= 0;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${presentation.tone}`}>
      <StatusIcon size={13} aria-hidden="true" />
      <span>{presentation.label}{hasProgress ? ` · ${Math.round(progress)}%` : ''}</span>
    </div>
  );
}
