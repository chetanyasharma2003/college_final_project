export default function StateSelector({ states = [], selected, onChange, isLoading = false, disabled = false }) {
  return (
    <select
      value={selected ?? ''}
      onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
      disabled={disabled || isLoading}
      aria-label={`Filter by state or union territory${selected ? `, current ${states.find((state) => state.id === selected)?.name || ''}` : ''}`}
      className="w-full min-h-[42px] rounded-lg border border-white/20 bg-white px-3 py-2 text-sm text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="">{isLoading ? 'Loading locations…' : 'All states and union territories'}</option>
      {states.map((state) => (
        <option key={state.id} value={state.id}>{state.name}</option>
      ))}
    </select>
  );
}
