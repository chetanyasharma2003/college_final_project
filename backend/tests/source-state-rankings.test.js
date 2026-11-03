import test from 'node:test';
import assert from 'node:assert/strict';
import { rankSourceValuesByState } from '../src/utils/source-state-rankings.js';
import { positiveKpiTargetOrNull } from '../src/utils/kpi-target.js';

test('zero and missing KPI targets remain unavailable instead of becoming zero targets', () => {
  assert.equal(positiveKpiTargetOrNull(null), null);
  assert.equal(positiveKpiTargetOrNull(0), null);
  assert.equal(positiveKpiTargetOrNull('0'), null);
  assert.equal(positiveKpiTargetOrNull(-1), null);
  assert.equal(positiveKpiTargetOrNull('250'), 250);
});

test('state rankings retain the latest source value and never infer performance', () => {
  const ranked = rankSourceValuesByState([
    { state_id: 1, state: { id: 1, name: 'Alpha' }, value: 8, date: new Date('2024-01-01') },
    { state_id: 1, state: { id: 1, name: 'Alpha' }, value: 12, date: new Date('2025-01-01') },
    { state_id: 2, state: { id: 2, name: 'Beta' }, value: 10, date: new Date('2025-01-01') },
    { state_id: null, state: null, value: 999, date: new Date('2025-01-01') },
  ]);

  assert.deepEqual(ranked.map(({ state }) => state.name), ['Alpha', 'Beta']);
  assert.deepEqual(ranked.map(({ value }) => value), [12, 10]);
  assert.equal('progress' in ranked[0], false);
});

test('district source values are summed from each district latest record only', () => {
  const ranked = rankSourceValuesByState([
    { state_id: 1, district_id: 10, state: { id: 1, name: 'Alpha' }, value: 4, date: new Date('2024-01-01') },
    { state_id: 1, district_id: 10, state: { id: 1, name: 'Alpha' }, value: 6, date: new Date('2025-01-01') },
    { state_id: 1, district_id: 11, state: { id: 1, name: 'Alpha' }, value: 9, date: new Date('2025-01-01') },
    { state_id: 2, district_id: 20, state: { id: 2, name: 'Beta' }, value: 13, date: new Date('2025-01-01') },
  ], { aggregateByDistrict: true });

  assert.deepEqual(ranked.map(({ state, value, locations_covered }) => ({
    state: state.name,
    value,
    locations_covered,
  })), [
    { state: 'Alpha', value: 15, locations_covered: 2 },
    { state: 'Beta', value: 13, locations_covered: 1 },
  ]);
});
