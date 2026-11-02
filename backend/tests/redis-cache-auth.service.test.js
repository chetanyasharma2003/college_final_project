import test from 'node:test';
import assert from 'node:assert/strict';
import { startFakeRedis } from './helpers/fake-redis.js';

test('redis client works through the AUTH + SELECT setup path', async () => {
  const redis = await startFakeRedis({ password: 's3cret' });
  process.env.REDIS_URL = `redis://:s3cret@127.0.0.1:${redis.port}/2`;
  const { default: cache } = await import('../src/services/redis-cache.service.js');
  assert.equal(await cache.set('a', { ok: true }, 30), true);
  assert.deepEqual(await cache.get('a'), { ok: true });
  assert.equal(await cache.ping(), 'PONG');
  await redis.close();
});

test('wrong password is rejected', async () => {
  // separate server + fresh module instance via query string
  const redis = await startFakeRedis({ password: 'right' });
  process.env.REDIS_URL = `redis://:wrong@127.0.0.1:${redis.port}`;
  const { default: cache } = await import('../src/services/redis-cache.service.js?wrong');
  await assert.rejects(() => cache.get('a'), /WRONGPASS/);
  await redis.close();
});
