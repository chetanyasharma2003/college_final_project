import test from 'node:test';
import assert from 'node:assert/strict';
import {
  averageKpiCompletion,
  comparativeStatus,
  completionPercentage,
  sourceReportKpiIds,
} from '../src/utils/source-report-metrics.js';

test('report KPI lists include only mapped source definitions', () => {
  assert.deepEqual(sourceReportKpiIds(
    { code: 'PMAY' },
    [{ id: 1, kpi_name: 'Total Units Built' }],
  ), []);

  assert.deepEqual(sourceReportKpiIds(
    { code: 'PMAY-U' },
    [
      { id: 2, kpi_name: 'Houses Sanctioned' },
      { id: 3, kpi_name: 'Completion Rate' },
    ],
  ), [2]);
});

test('report completion stays unavailable when a source target is missing or invalid', () => {
  assert.equal(completionPercentage(25, null), null);
  assert.equal(completionPercentage(25, 0), null);
  assert.equal(completionPercentage(25, 50), 50);
  assert.equal(averageKpiCompletion([{ value: 25, target_value: null }]), null);
  assert.equal(averageKpiCompletion([
    { value: 25, target_value: null },
    { value: 25, target_value: 50 },
  ]), 50);
});

test('comparative reports distinguish no data and unrated data from low completion', () => {
  assert.equal(comparativeStatus([], null), 'no_data');
  assert.equal(comparativeStatus([{ value: 25, target_value: null }], null), 'not_rated');
  assert.equal(comparativeStatus([{ value: 25, target_value: 50 }], 50), 'critical');
});
