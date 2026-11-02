import redisCache from '../services/redis-cache.service.js';

const CACHEABLE_PATHS = ['/api/v1/geo/', '/api/v1/schemes', '/api/v1/kpis/'];

export const redisResponseCache = async (req, res, next) => {
  if (
    !redisCache.configured
    || req.method !== 'GET'
    || req.headers.authorization
    || !CACHEABLE_PATHS.some((prefix) => req.originalUrl.startsWith(prefix))
  ) return next();

  const key = `govdash:v1:${req.originalUrl}`;
  try {
    const cached = await redisCache.get(key);
    if (cached) {
      res.setHeader('X-Response-Cache', 'HIT');
      return res.status(cached.statusCode || 200).json(cached.body);
    }
  } catch (error) {
    console.warn(`Redis cache read failed; serving from database: ${error.message}`);
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    res.setHeader('X-Response-Cache', 'MISS');
    if (res.statusCode >= 200 && res.statusCode < 300) {
      redisCache.set(key, { statusCode: res.statusCode, body }).catch((error) => {
        console.warn(`Redis cache write failed: ${error.message}`);
      });
    }
    return originalJson(body);
  };
  return next();
};

export default redisResponseCache;
