import { useEffect, useRef, useState } from 'react';
import { Calendar } from 'lucide-react';
import { formatLocalDateInput, toLocalDateInputValue } from '../utils/dates';

export default function DateRangeSelector({ onDateRangeChange }) {
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState(() => toLocalDateInputValue());
  const [showDropdown, setShowDropdown] = useState(false);
  const rangeRef = useRef(null);

  useEffect(() => {
    if (!showDropdown) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!rangeRef.current?.contains(event.target)) setShowDropdown(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setShowDropdown(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [showDropdown]);

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
    start.setDate(end.getDate() - (days - 1));

    const newStart = toLocalDateInputValue(start);
    const newEnd = toLocalDateInputValue(end);

    setStartDate(newStart);
    setEndDate(newEnd);
    setShowDropdown(false);

    if (onDateRangeChange) {
      onDateRangeChange({ startDate: newStart, endDate: newEnd });
    }
  };

  const getDateRangeLabel = () => {
    return `${formatLocalDateInput(startDate)} – ${formatLocalDateInput(endDate)}`;
  };

  return (
    <div className="relative" ref={rangeRef}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-expanded={showDropdown}
        aria-controls="trend-date-range-options"
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-400/30 rounded-lg text-white font-semibold transition text-sm"
      >
        <Calendar size={18} />
        <span>{getDateRangeLabel()}</span>
      </button>

      {showDropdown && (
        <div id="trend-date-range-options" className="absolute top-12 right-0 w-80 max-w-[calc(100vw-32px)] bg-slate-800 border border-white/20 rounded-lg p-4 shadow-lg z-50">
          {/* Quick Range Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4" role="group" aria-label="Quick trend date ranges">
            <button
              type="button"
              onClick={() => handleQuickRange(7)}
              className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/40 rounded text-xs text-blue-200 transition"
            >
              Last 7 days
            </button>
            <button
              type="button"
              onClick={() => handleQuickRange(30)}
              className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/40 rounded text-xs text-blue-200 transition"
            >
              Last 30 days
            </button>
            <button
              type="button"
              onClick={() => handleQuickRange(90)}
              className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/40 rounded text-xs text-blue-200 transition"
            >
              Last 90 days
            </button>
            <button
              type="button"
              onClick={() => handleQuickRange(365)}
              className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/40 rounded text-xs text-blue-200 transition"
            >
              Last year
            </button>
          </div>

          {/* Custom Date Range */}
          <div className="space-y-3">
            <div>
              <label htmlFor="trend-start-date" className="block text-xs text-gray-300 mb-1">Start date</label>
              <input
                id="trend-start-date"
                type="date"
                value={startDate}
                max={endDate}
                onChange={handleStartDateChange}
                aria-label="Trend start date"
                className="w-full px-2 py-2 bg-slate-700 border border-white/10 rounded text-white text-sm"
              />
            </div>

            <div>
              <label htmlFor="trend-end-date" className="block text-xs text-gray-300 mb-1">End date</label>
              <input
                id="trend-end-date"
                type="date"
                value={endDate}
                min={startDate}
                max={toLocalDateInputValue()}
                onChange={handleEndDateChange}
                aria-label="Trend end date"
                className="w-full px-2 py-2 bg-slate-700 border border-white/10 rounded text-white text-sm"
              />
            </div>

            <button
              type="button"
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
