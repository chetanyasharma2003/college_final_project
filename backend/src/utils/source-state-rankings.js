export const rankSourceValuesByState = (rows, { aggregateByDistrict = false } = {}) => {
  const latestByEntity = new Map();

  for (const row of rows) {
    if (row.state_id == null || !row.state) continue;
    const entityId = aggregateByDistrict ? row.district_id : row.state_id;
    if (entityId == null) continue;

    const key = aggregateByDistrict
      ? `${row.state_id}:${entityId}`
      : String(row.state_id);
    const existing = latestByEntity.get(key);
    const rowDate = new Date(row.date);
    if (Number.isNaN(rowDate.getTime())) continue;
    const existingDate = existing ? new Date(existing.date) : null;
    if (existingDate && existingDate >= rowDate) continue;
    latestByEntity.set(key, row);
  }

  const states = new Map();
  for (const row of latestByEntity.values()) {
    const current = states.get(row.state_id) || {
      state_id: row.state_id,
      state: row.state,
      value: 0,
      source_date: row.date,
      locations_covered: 0,
    };
    current.value += Number(row.value) || 0;
    current.locations_covered += 1;
    if (row.date > current.source_date) current.source_date = row.date;
    states.set(row.state_id, current);
  }

  return Array.from(states.values())
    .sort((first, second) => second.value - first.value || first.state.name.localeCompare(second.state.name));
};
