import net from 'node:net';
import tls from 'node:tls';

const redisUrl = process.env.REDIS_URL;

function encodeCommand(parts) {
  return `*${parts.length}\r\n${parts.map((part) => `$${Buffer.byteLength(String(part))}\r\n${part}\r\n`).join('')}`;
}

function parseReply(buffer, offset = 0) {
  if (buffer.length <= offset) return null;
  const type = String.fromCharCode(buffer[offset]);
  const end = buffer.indexOf('\r\n', offset);
  if (end < 0) return null;
  const header = buffer.toString('utf8', offset + 1, end);
  if (type === '+' || type === '-') return { value: type === '-' ? new Error(header) : header, offset: end + 2 };
  if (type === ':') return { value: Number(header), offset: end + 2 };
  if (type === '$') {
    const size = Number(header);
    if (size === -1) return { value: null, offset: end + 2 };
    const next = end + 2 + size;
    if (buffer.length < next + 2) return null;
    return { value: buffer.toString('utf8', end + 2, next), offset: next + 2 };
  }
  return null;
}

function command(parts) {
  if (!redisUrl) return Promise.reject(new Error('REDIS_URL is not configured'));
  const url = new URL(redisUrl);
  const secure = url.protocol === 'rediss:';
  const port = Number(url.port || (secure ? 6380 : 6379));
  const socket = secure
    ? tls.connect({ host: url.hostname, port, servername: url.hostname })
    : net.createConnection({ host: url.hostname, port });

  return new Promise((resolve, reject) => {
    let buffer = Buffer.alloc(0);
    let settled = false;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      error ? reject(error) : resolve(value);
    };
    socket.setTimeout(1500, () => finish(new Error('Redis connection timed out')));
    socket.once('error', (error) => finish(error));
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      const parsed = parseReply(buffer);
      if (parsed) finish(parsed.value instanceof Error ? parsed.value : null, parsed.value);
    });
    socket.once(secure ? 'secureConnect' : 'connect', () => {
      const auth = url.password
        ? (url.username ? ['AUTH', decodeURIComponent(url.username), decodeURIComponent(url.password)] : ['AUTH', decodeURIComponent(url.password)])
        : null;
      const database = url.pathname.length > 1 ? ['SELECT', url.pathname.slice(1)] : null;
      const setup = [auth, database].filter(Boolean);
      const writeNext = () => {
        if (setup.length) socket.write(encodeCommand(setup.shift()));
        else socket.write(encodeCommand(parts));
      };
      if (!setup.length) writeNext();
      else {
        const originalData = socket.listeners('data')[0];
        const setupReplies = (chunk) => {
          buffer = Buffer.concat([buffer, chunk]);
          const parsed = parseReply(buffer);
          if (!parsed) return;
          buffer = buffer.subarray(parsed.offset);
          if (parsed.value instanceof Error) return finish(parsed.value);
          if (setup.length) socket.write(encodeCommand(setup.shift()));
          else {
            socket.off('data', setupReplies);
            if (originalData) socket.off('data', originalData);
            socket.on('data', (reply) => {
              buffer = Buffer.concat([buffer, reply]);
              const result = parseReply(buffer);
              if (result) finish(result.value instanceof Error ? result.value : null, result.value);
            });
            socket.write(encodeCommand(parts));
          }
        };
        socket.off('data', originalData);
        socket.on('data', setupReplies);
        socket.write(encodeCommand(setup.shift()));
      }
    });
  });
}

export const redisCache = {
  configured: Boolean(redisUrl),
  async get(key) {
    if (!redisUrl) return null;
    const value = await command(['GET', key]);
    if (value == null) return null;
    try { return JSON.parse(value); } catch { return null; }
  },
  async set(key, value, ttlSeconds = 120) {
    if (!redisUrl) return false;
    await command(['SET', key, JSON.stringify(value), 'EX', ttlSeconds]);
    return true;
  },
  async ping() {
    if (!redisUrl) return 'not_configured';
    return command(['PING']);
  },
};

export default redisCache;
