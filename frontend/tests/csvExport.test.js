import test from 'node:test';
import assert from 'node:assert/strict';
import { serializeCSV } from '../src/utils/csvExport.js';

test('CSV fields quote delimiters, quotes, and newlines', () => {
  const csv = serializeCSV([{ label: 'Name', value: 'a,"b"\nnext' }]);
  assert.equal(csv, '"label","value"\r\n"Name","a,""b""\nnext"');
});

test('CSV text that starts with spreadsheet formulas is neutralized', () => {
  const csv = serializeCSV([{ label: '=1+1', note: '  @SUM(A1:A2)' }]);
  assert.equal(csv, '"label","note"\r\n"\'=1+1","\'  @SUM(A1:A2)"');
});

test('empty data produces no CSV document', () => {
  assert.equal(serializeCSV([]), '');
});
