export const positiveKpiTargetOrNull = (value) => {
  if (value == null) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};
