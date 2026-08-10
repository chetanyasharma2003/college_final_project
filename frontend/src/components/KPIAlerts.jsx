import { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function KPIAlerts({ kpiValues = [] }) {
  const alertedRef = useRef(new Set());

  useEffect(() => {
    if (!kpiValues || kpiValues.length === 0) return;

    kpiValues.forEach((kpi) => {
      try {
        if (!kpi || !kpi.target_value) return;

        const safeValue = Number(kpi.current_value) || 0;
        const safeTarget = Number(kpi.target_value) || 1;
        const percentage = (safeValue / safeTarget) * 100;
        const kpiKey = `${kpi.kpi_id || kpi.kpi_name}-${kpi.scheme_id || 'default'}`;

        if (percentage < 50 && !alertedRef.current.has(kpiKey + '-critical')) {
          toast.error(
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <div>
                <p className="font-semibold text-sm">{kpi.kpi_name || 'KPI'}</p>
                <p className="text-xs opacity-90">Critical: {Math.round(percentage)}% of target</p>
              </div>
            </div>,
            { autoClose: 5000 }
          );
          alertedRef.current.add(kpiKey + '-critical');
          alertedRef.current.delete(kpiKey + '-success');
        } else if (percentage >= 100 && !alertedRef.current.has(kpiKey + '-success')) {
          toast.success(
            <div className="flex items-center gap-2">
              <CheckCircle size={18} />
              <div>
                <p className="font-semibold text-sm">{kpi.kpi_name || 'KPI'}</p>
                <p className="text-xs opacity-90">Target achieved! 🎉</p>
              </div>
            </div>,
            { autoClose: 3000 }
          );
          alertedRef.current.add(kpiKey + '-success');
          alertedRef.current.delete(kpiKey + '-critical');
        }
      } catch (err) {
        // Silently handle errors to not crash the component
      }
    });
  }, [kpiValues]);

  return null;
}
