import test from 'node:test';
import assert from 'node:assert/strict';
import { getNextCronRun, isValidCronExpression } from '../src/services/sync-scheduler.service.js';

test('recognizes the configured cron expression formats', () => {
  assert.equal(isValidCronExpression('0 */6 * * *'), true);
  assert.equal(isValidCronExpression('0 3 * * 0'), true);
  assert.equal(isValidCronExpression('61 3 * * *'), false);
  assert.equal(isValidCronExpression('not cron'), false);
});

test('calculates the next daily run after the supplied time', () => {
  const after = new Date('2026-10-27T02:30:00.000Z');
  assert.equal(getNextCronRun('0 4 * * *', after).toISOString(), '2026-10-27T04:00:00.000Z');
});

test('calculates the next stepped-hour run', () => {
  const after = new Date('2026-10-27T05:30:00.000Z');
  assert.equal(getNextCronRun('0 */6 * * *', after).toISOString(), '2026-10-27T06:00:00.000Z');
});
