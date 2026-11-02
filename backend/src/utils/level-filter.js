// KPIValue rows exist at several geographic levels (state, district, block, village).
// Older queries only filter by kpi_id / state_id, so once lower-level rows exist they would
// mix with state rows (rankings, totals, trends). This helper makes every "plain" read
// state-level by default. A query that mentions any level key itself is left untouched.

export const LEVEL_KEYS = ['district_id', 'block_id', 'village_id'];

export function withStateLevelDefault(where) {
  const w = where && typeof where === 'object' ? { ...where } : {};
  const mentionsLevel = LEVEL_KEYS.some((k) => Object.prototype.hasOwnProperty.call(w, k));
  if (mentionsLevel) return w;
  for (const k of LEVEL_KEYS) w[k] = null;
  return w;
}
