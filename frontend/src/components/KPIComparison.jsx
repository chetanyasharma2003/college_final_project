import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useKPIs } from '../api/hooks';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function KPIComparison() {
  const { schemes = [] } = useSelector((state) => state.data);
  const [scheme1Code, setScheme1Code] = useState(schemes[0]?.code || 'PMAY');
  const [scheme2Code, setScheme2Code] = useState(schemes[1]?.code || 'MGNREGS');

  const { kpiValues: kpi1Data = [] } = useKPIs(scheme1Code);
  const { kpiValues: kpi2Data = [] } = useKPIs(scheme2Code);

  const scheme1Name = useMemo(
    () => schemes.find(s => s?.code === scheme1Code)?.name || scheme1Code,
    [scheme1Code, schemes]
  );

  const scheme2Name = useMemo(
    () => schemes.find(s => s?.code === scheme2Code)?.name || scheme2Code,
    [scheme2Code, schemes]
  );

  const getTrendIcon = (current, target) => {
    if (!target || target === 0) return null;
    const percentage = (current / target) * 100;
    if (percentage >= 100) return <ArrowUpRight size={16} className="text-green-400" />;
    if (percentage >= 75) return <ArrowUpRight size={16} className="text-yellow-400" />;
    return <ArrowDownRight size={16} className="text-red-400" />;
  };

  if (schemes.length < 2) {
    return null;
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Scheme Comparison</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheme 1 */}
        <div className="bg-slate-800/50 rounded-xl p-4">
          <select
            value={scheme1Code}
            onChange={(e) => setScheme1Code(e.target.value)}
            className="w-full mb-4 px-3 py-2 bg-slate-700 border border-white/10 rounded text-white text-sm"
          >
            {schemes.map(s => (
              <option key={s.code} value={s.code}>{s.name || s.code}</option>
            ))}
          </select>

          <div className="space-y-3">
            {kpi1Data.slice(0, 3).map((kpi, idx) => {
              const safeValue = Number(kpi.current_value) || 0;
              const safeTarget = Number(kpi.target_value) || 1;
              return (
                <div key={idx} className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-sm text-gray-300">{kpi.kpi_name || 'KPI'}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{safeValue.toLocaleString()}</span>
                    {getTrendIcon(safeValue, safeTarget)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scheme 2 */}
        <div className="bg-slate-800/50 rounded-xl p-4">
          <select
            value={scheme2Code}
            onChange={(e) => setScheme2Code(e.target.value)}
            className="w-full mb-4 px-3 py-2 bg-slate-700 border border-white/10 rounded text-white text-sm"
          >
            {schemes.map(s => (
              <option key={s.code} value={s.code}>{s.name || s.code}</option>
            ))}
          </select>

          <div className="space-y-3">
            {kpi2Data.slice(0, 3).map((kpi, idx) => {
              const safeValue = Number(kpi.current_value) || 0;
              const safeTarget = Number(kpi.target_value) || 1;
              return (
                <div key={idx} className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-sm text-gray-300">{kpi.kpi_name || 'KPI'}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{safeValue.toLocaleString()}</span>
                    {getTrendIcon(safeValue, safeTarget)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
