// Which state does a location (state / district / block / village) belong to?
// Used to enforce a user's state scope on endpoints that take a location id.
export function createLocationScope(db) {
  return async function stateIdOfLocation(level, id) {
    if (level === 'state') return id;
    if (level === 'district') {
      const d = await db.district.findUnique({ where: { id }, select: { state_id: true } });
      return d ? d.state_id : null;
    }
    if (level === 'block') {
      const b = await db.block.findUnique({ where: { id }, select: { district: { select: { state_id: true } } } });
      return b ? b.district.state_id : null;
    }
    if (level === 'village') {
      const v = await db.village.findUnique({ where: { id }, select: { block: { select: { district: { select: { state_id: true } } } } } });
      return v ? v.block.district.state_id : null;
    }
    return null;
  };
}
