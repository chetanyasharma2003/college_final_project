import test from 'node:test';
import assert from 'node:assert/strict';
import ETLService from '../src/services/etl.service.js';

test('ETL transformation preserves missing data instead of inventing zeroes or dates', async () => {
  const mapping = {
    state: 'state_name',
    district: 'district_name',
    date: 'report_date',
    metrics: [
      { name: 'person_days', field: 'person_days' },
      { name: 'wage', field: 'wage' },
    ],
  };
  const [record] = await ETLService.transformData([
    { state_name: 'Rajasthan', person_days: '', wage: 'not numeric' },
  ], 'MGNREGS', mapping);

  assert.equal(record.date, null);
  assert.deepEqual(record.metrics, {});
});

test('ETL transformation parses numeric source values and keeps source date', async () => {
  const mapping = {
    state: 'state_name',
    date: 'report_date',
    metrics: [{ name: 'person_days', field: 'person_days' }],
  };
  const [record] = await ETLService.transformData([
    { state_name: 'Rajasthan', report_date: '2026-10-27', person_days: '1,250' },
  ], 'MGNREGS', mapping);

  assert.equal(record.date.toISOString(), '2026-10-27T00:00:00.000Z');
  assert.deepEqual(record.metrics, { person_days: 1250 });
});
