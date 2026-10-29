// Pure helpers for the drill-down / heatmap feature (no database access).

export function progressPct(value, target) {
  if (value == null || target == null || value === '' || target === '') return null;
  const v = Number(value);
  const t = Number(target);
  if (!Number.isFinite(v) || !Number.isFinite(t) || t <= 0) return null;
  return Math.round((v / t) * 1000) / 10; // one decimal
}

// Same thresholds the dashboard badges use: >=75 on track, >=50 at risk, else critical.
export function statusFromProgress(progress) {
  if (progress == null) return 'no_data';
  if (progress >= 75) return 'on_track';
  if (progress >= 50) return 'at_risk';
  return 'critical';
}

// rows must be sorted by date DESC. Returns Map(entityId -> newest row).
export function latestPerEntity(rows, keyFn) {
  const out = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    if (k != null && !out.has(k)) out.set(k, r);
  }
  return out;
}

export function averageCoords(points) {
  const valid = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (!valid.length) return null;
  const lat = valid.reduce((a, p) => a + p.lat, 0) / valid.length;
  const lng = valid.reduce((a, p) => a + p.lng, 0) / valid.length;
  return { lat: Math.round(lat * 1e5) / 1e5, lng: Math.round(lng * 1e5) / 1e5 };
}
