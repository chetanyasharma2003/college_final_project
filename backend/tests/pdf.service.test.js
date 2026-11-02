import test from 'node:test';
import assert from 'node:assert/strict';
import { createTextPDF } from '../src/services/pdf.service.js';

test('creates a valid PDF document with escaped report text', () => {
  const pdf = createTextPDF(['Metric (units): 12%'], { title: 'PMAY Summary' });
  const content = pdf.toString('ascii');
  assert.equal(content.startsWith('%PDF-1.4'), true);
  assert.equal(content.includes('PMAY Summary'), true);
  assert.equal(content.includes('Metric \\(units\\): 12%'), true);
  assert.equal(content.endsWith('%%EOF'), true);
});

test('splits long reports into multiple pages', () => {
  const pdf = createTextPDF(Array.from({ length: 100 }, (_, index) => `Line ${index}`));
  assert.equal((pdf.toString('ascii').match(/\/Type \/Page /g) || []).length, 3);
});
