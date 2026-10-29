import { PrismaClient } from '@prisma/client';
import { withStateLevelDefault } from '../utils/level-filter.js';

// Two clients share one connection pool:
//  - default export `prisma`: every plain read of KPIValue is state-level only (see utils/level-filter.js),
//    so district/block/village rows never leak into state rankings, totals or trends.
//  - named export `prismaAll`: the raw client. Used by the drill-down feature, which states its level itself.
// Set DISABLE_LEVEL_FILTER=1 in the environment to turn the filter off (emergency switch).

const READ_OPS = ['findMany', 'findFirst', 'findFirstOrThrow', 'count', 'aggregate', 'groupBy'];

function createClients() {
  const base = process.env.NODE_ENV === 'production'
    ? new PrismaClient()
    : new PrismaClient({ log: ['error', 'warn'] });

  if (process.env.DISABLE_LEVEL_FILTER === '1') return { client: base, base };

  const handlers = {};
  for (const op of READ_OPS) {
    handlers[op] = ({ model, args, query }) => {
      if (model === 'KPIValue') {
        return query({ ...(args || {}), where: withStateLevelDefault(args?.where) });
      }
      return query(args);
    };
  }
  const client = base.$extends({ name: 'kpi-state-level-default', query: { $allModels: handlers } });
  return { client, base };
}

let clients;
if (process.env.NODE_ENV === 'production') {
  clients = createClients();
} else {
  // Singleton in development (hot reload safe)
  if (!global.__prismaClients) global.__prismaClients = createClients();
  clients = global.__prismaClients;
}

export const prismaAll = clients.base;
export default clients.client;
