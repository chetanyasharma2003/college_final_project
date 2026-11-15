export function findArrayPayload(...values) {
  return values.find(Array.isArray) ?? null;
}

export function arrayOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}
