import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { arrayOrEmpty, findArrayPayload } from './arrayPayload.js';

describe('API array payloads', () => {
  it('accepts a direct array, including an empty array', () => {
    const values = [];
    assert.equal(findArrayPayload(null, values), values);
  });

  it('selects the first valid array from supported response wrappers', () => {
    const expected = [{ id: 1 }];
    assert.equal(findArrayPayload({ error: true }, expected, [{ id: 2 }]), expected);
  });

  it('returns null when a response contains no array payload', () => {
    assert.equal(findArrayPayload({ rows: { id: 1 } }, null), null);
  });

  it('uses an empty array for optional malformed collections', () => {
    assert.deepEqual(arrayOrEmpty({ rows: [] }), []);
    assert.deepEqual(arrayOrEmpty([{ id: 1 }]), [{ id: 1 }]);
  });
});
