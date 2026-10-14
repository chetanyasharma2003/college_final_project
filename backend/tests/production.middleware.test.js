import test from 'node:test';
import assert from 'node:assert/strict';
import { deduplicateRequests } from '../src/middleware/production.middleware.js';

const createResponse = () => ({
  body: null,
  json(payload) {
    this.body = payload;
    return this;
  },
});

test('authenticated GET requests bypass the shared response cache', () => {
  let nextCalled = false;
  const response = createResponse();

  deduplicateRequests(
    { method: 'GET', path: '/private', query: {}, headers: { authorization: 'Bearer user-token' } },
    response,
    () => { nextCalled = true; },
  );

  assert.equal(nextCalled, true);
  assert.equal(response.body, null);
});

test('anonymous GET requests can still reuse a short-lived public response', () => {
  const firstResponse = createResponse();
  const request = {
    method: 'GET',
    path: '/public-test-cache',
    query: { testKey: 'public-cache-regression' },
    headers: {},
  };
  const payload = { status: 'success', data: ['public'] };

  deduplicateRequests(request, firstResponse, () => {});
  firstResponse.json(payload);

  let nextCalled = false;
  const secondResponse = createResponse();
  deduplicateRequests(request, secondResponse, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.deepEqual(secondResponse.body, payload);
});
