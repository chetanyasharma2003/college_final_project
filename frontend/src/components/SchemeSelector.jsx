import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedScheme } from '../store/dataSlice';

export default function SchemeSelector({ schemes, isLoading = false, disabled = false }) {
  const dispatch = useDispatch();
  const { selectedScheme } = useSelector((state) => state.data);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedSchemeData = schemes.find((s) => s.id === selectedScheme);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && !isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative w-full md:w-64" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isLoading}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select Scheme: ${selectedSchemeData?.code || 'All Schemes'}`}
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-left hover:bg-white/20 transition flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        <span>{isLoading ? 'Loading...' : selectedSchemeData?.code || 'Select Scheme'}</span>
        <span className="text-blue-100">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-white/20 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto min-w-full" role="listbox">
          <button
            onClick={() => {
              dispatch(setSelectedScheme(null));
              setIsOpen(false);
            }}
            role="option"
            aria-selected={selectedScheme === null}
            className="w-full text-left px-4 py-3 text-gray-100 hover:bg-white/15 border-b border-white/10 transition focus:outline-none focus:bg-white/20"
          >
            All Schemes
          </button>
          {schemes.map((scheme) => (
            <button
              key={scheme.id}
              onClick={() => {
                dispatch(setSelectedScheme(scheme.id));
                setIsOpen(false);
              }}
              role="option"
              aria-selected={selectedScheme === scheme.id}
              className={`w-full text-left px-4 py-3 transition focus:outline-none ${
                selectedScheme === scheme.id
                  ? 'bg-blue-600/40 text-white border-l-2 border-blue-400'
                  : 'text-gray-100 hover:bg-white/15'
              }`}
            >
              <div className="font-semibold">{scheme.code}</div>
              <div className="text-xs text-gray-300">{scheme.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
