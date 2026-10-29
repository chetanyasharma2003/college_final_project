import net from 'node:net';

// Minimal RESP server: AUTH, SELECT, PING, GET, SET (enough to exercise the app's Redis client).
export function startFakeRedis({ password = null } = {}) {
  const store = new Map();
  const server = net.createServer((socket) => {
    let buf = Buffer.alloc(0);
    let authed = !password;
    socket.on('data', (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      for (;;) {
        const parsed = parseCommand(buf);
        if (!parsed) return;
        buf = buf.subarray(parsed.offset);
        const [cmd, ...args] = parsed.parts;
        const name = cmd.toUpperCase();
        if (name === 'AUTH') {
          if (args[args.length - 1] === password) { authed = true; socket.write('+OK\r\n'); } else socket.write('-WRONGPASS invalid password\r\n');
        } else if (!authed) socket.write('-NOAUTH Authentication required.\r\n');
        else if (name === 'SELECT') socket.write('+OK\r\n');
        else if (name === 'PING') socket.write('+PONG\r\n');
        else if (name === 'SET') { store.set(args[0], args[1]); socket.write('+OK\r\n'); }
        else if (name === 'GET') {
          const v = store.get(args[0]);
          socket.write(v == null ? '$-1\r\n' : `$${Buffer.byteLength(v)}\r\n${v}\r\n`);
        } else socket.write('-ERR unknown command\r\n');
      }
    });
    socket.on('error', () => {});
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({
    port: server.address().port,
    store,
    close: () => new Promise((r) => { server.close(r); server.closeAllConnections?.(); }),
  })));
}

function parseCommand(buf) {
  if (buf[0] !== 0x2a) return null; // '*'
  let end = buf.indexOf('\r\n');
  if (end < 0) return null;
  const count = Number(buf.toString('utf8', 1, end));
  let offset = end + 2;
  const parts = [];
  for (let i = 0; i < count; i += 1) {
    end = buf.indexOf('\r\n', offset);
    if (end < 0) return null;
    const len = Number(buf.toString('utf8', offset + 1, end));
    const start = end + 2;
    if (buf.length < start + len + 2) return null;
    parts.push(buf.toString('utf8', start, start + len));
    offset = start + len + 2;
  }
  return { parts, offset };
}
