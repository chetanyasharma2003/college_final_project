import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocationScope } from '../src/services/location-scope.js';

const db = {
  district: { findUnique: async ({ where }) => (where.id === 10 ? { state_id: 1 } : null) },
  block: { findUnique: async ({ where }) => (where.id === 100 ? { district: { state_id: 1 } } : null) },
  village: { findUnique: async ({ where }) => (where.id === 1000 ? { block: { district: { state_id: 1 } } } : null) },
};

test('resolves the state of every location level', async () => {
  const of = createLocationScope(db);
  assert.equal(await of('state', 7), 7);
  assert.equal(await of('district', 10), 1);
  assert.equal(await of('block', 100), 1);
  assert.equal(await of('village', 1000), 1);
});

test('unknown ids and levels give null (so a scoped user is denied)', async () => {
  const of = createLocationScope(db);
  assert.equal(await of('district', 999), null);
  assert.equal(await of('block', 999), null);
  assert.equal(await of('village', 999), null);
  assert.equal(await of('galaxy', 1), null);
});
