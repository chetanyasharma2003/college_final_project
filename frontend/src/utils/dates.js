export function toLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDateInput(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) || toLocalDateInputValue(date) !== value ? null : date;
}

export function formatLocalDateInput(value, options = {}) {
  const date = parseLocalDateInput(value);
  return date ? date.toLocaleDateString('en-IN', options) : 'Select date';
}
