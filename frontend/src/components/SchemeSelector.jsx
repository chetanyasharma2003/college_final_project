import { useDispatch, useSelector } from 'react-redux';
import { setSelectedScheme } from '../store/dataSlice';

export default function SchemeSelector({ schemes = [], isLoading = false, disabled = false }) {
  const dispatch = useDispatch();
  const { selectedScheme } = useSelector((state) => state.data);
  const selectedSchemeData = schemes.find((scheme) => scheme.id === selectedScheme);

  const handleChange = (event) => {
    const value = event.target.value;
    dispatch(setSelectedScheme(value ? Number(value) : null));
  };

  return (
    <select
      value={selectedScheme ?? ''}
      onChange={handleChange}
      disabled={disabled || isLoading || schemes.length === 0}
      aria-label={`Select scheme${selectedSchemeData ? `, current ${selectedSchemeData.code}` : ''}`}
      className="w-full min-h-[42px] rounded-lg border border-white/20 bg-white px-3 py-2 text-sm text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="" disabled>{isLoading ? 'Loading schemes…' : 'Select a scheme'}</option>
      {schemes.map((scheme) => (
        <option key={scheme.id} value={scheme.id}>
          {scheme.code} · {scheme.name}
        </option>
      ))}
    </select>
  );
}
