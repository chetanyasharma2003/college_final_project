import test from 'node:test';
import assert from 'node:assert/strict';
import { startFakeRedis } from './helpers/fake-redis.js';

test('redis client: set/get/ping work, and a dead Redis is skipped quickly (backoff)', async () => {
  const redis = await startFakeRedis();
  process.env.REDIS_URL = `redis://127.0.0.1:${redis.port}`;
  process.env.REDIS_BACKOFF_MS = '300';
  const { default: cache } = await import('../src/services/redis-cache.service.js');

  assert.equal(cache.configured, true);
  assert.equal(await cache.ping(), 'PONG');
  assert.equal(await cache.set('k1', { a: 1, text: 'héllo' }, 60), true);
  assert.deepEqual(await cache.get('k1'), { a: 1, text: 'héllo' });
  assert.equal(await cache.get('missing'), null);

  await redis.close();
  await assert.rejects(() => cache.get('k1'));                       // real failure
  const t0 = Date.now();
  await assert.rejects(() => cache.get('k1'), /skipped/);            // fast: no new connection attempt
  assert.ok(Date.now() - t0 < 100);
  await new Promise((r) => setTimeout(r, 350));                      // backoff over -> tries again
  await assert.rejects(() => cache.get('k1'), (e) => !/skipped/.test(e.message));
});
