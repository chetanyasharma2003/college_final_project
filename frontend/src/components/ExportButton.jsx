import { Download } from 'lucide-react';
import { exportKPIsToCSV } from '../utils/csvExport';

export default function ExportButton({ kpiData = [], schemeName = 'KPIs' }) {
  const handleExport = () => {
    if (!kpiData || kpiData.length === 0) {
      alert('No data to export');
      return;
    }
    exportKPIsToCSV(kpiData, schemeName);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg text-white font-semibold transition text-sm"
    >
      <Download size={18} />
      Export
    </button>
  );
}
