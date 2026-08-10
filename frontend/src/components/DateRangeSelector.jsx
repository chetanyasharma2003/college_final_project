import { useState } from 'react';
import { Calendar } from 'lucide-react';

export default function DateRangeSelector({ onDateRangeChange }) {
  const [startDate, setStartDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleStartDateChange = (e) => {
    const newDate = e.target.value;
    setStartDate(newDate);
    if (onDateRangeChange) {
      onDateRangeChange({ startDate: newDate, endDate });
    }
  };

  const handleEndDateChange = (e) => {
    const newDate = e.target.value;
    setEndDate(newDate);
    if (onDateRangeChange) {
      onDateRangeChange({ startDate, endDate: newDate });
    }
  };

  const handleQuickRange = (days) => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - days);

    const newStart = start.toISOString().split('T')[0];
    const newEnd = end.toISOString().split('T')[0];

    setStartDate(newStart);
    setEndDate(newEnd);
    setShowDropdown(false);

    if (onDateRangeChange) {
      onDateRangeChange({ startDate: newStart, endDate: newEnd });
    }
  };

  const getDateRangeLabel = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-400/30 rounded-lg text-white font-semibold transition text-sm"
      >
        <Calendar size={18} />
        <span>{getDateRangeLabel()}</span>
      </button>

      {showDropdown && (
        <div className="absolute top-12 right-0 w-80 bg-slate-800 border border-white/20 rounded-lg p-4 shadow-lg z-50">
          {/* Quick Range Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button
              onClick={() => handleQuickRange(7)}
              className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/40 rounded text-xs text-blue-200 transition"
            >
              Last 7d
            </button>
            <button
              onClick={() => handleQuickRange(30)}
              className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/40 rounded text-xs text-blue-200 transition"
            >
              Last 30d
            </button>
            <button
              onClick={() => handleQuickRange(90)}
              className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/40 rounded text-xs text-blue-200 transition"
            >
              Last 90d
            </button>
            <button
              onClick={() => handleQuickRange(365)}
              className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/40 rounded text-xs text-blue-200 transition"
            >
              Last 1y
            </button>
          </div>

          {/* Custom Date Range */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="w-full px-2 py-2 bg-slate-700 border border-white/10 rounded text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className="w-full px-2 py-2 bg-slate-700 border border-white/10 rounded text-white text-sm"
              />
            </div>

            <button
              onClick={() => setShowDropdown(false)}
              className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded text-white text-sm font-semibold transition"
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
