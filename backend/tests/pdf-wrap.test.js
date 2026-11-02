import test from 'node:test';
import assert from 'node:assert/strict';
import { wrapLine, createTextPDF } from '../src/services/pdf.service.js';

test('short lines are untouched, long lines wrap at spaces without losing text', () => {
  assert.deepEqual(wrapLine('short'), ['short']);
  const long = 'MGNREGS | Person-Days Generated | Rajasthan | value 3,456,789.12 days of 5,000,000 target | progress 69.1% | status at_risk | 2026-10-01';
  const parts = wrapLine(long);
  assert.ok(parts.length >= 2);
  assert.ok(parts.every((p) => p.length <= 85));
  assert.equal(parts.map((p) => p.trim()).join(' '), long);
  assert.ok(parts.join(' ').includes('69.1%'));
});

test('a single very long word is hard-split', () => {
  const parts = wrapLine('x'.repeat(200));
  assert.ok(parts.every((p) => p.length <= 85));
  assert.equal(parts.join('').replace(/\s/g, '').length, 200);
});

test('createTextPDF keeps the end of long lines', () => {
  const pdf = createTextPDF(['A '.repeat(80) + 'THE-END-MARKER'], { title: 'T' }).toString('ascii');
  assert.ok(pdf.startsWith('%PDF-1.4'));
  assert.ok(pdf.includes('THE-END-MARKER'));
});
