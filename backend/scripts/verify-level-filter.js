// Run on your machine (needs DATABASE_URL and a generated Prisma client):
//   DATABASE_URL="<neon-direct-url>" node scripts/verify-level-filter.js
import prisma, { prismaAll } from '../src/config/prisma.js';

const filtered = await prisma.kPIValue.count();
const all = await prismaAll.kPIValue.count();
const stateOnly = await prismaAll.kPIValue.count({ where: { district_id: null, block_id: null, village_id: null } });
console.log({ filtered_default_client: filtered, raw_client_all_rows: all, state_level_rows_in_db: stateOnly });
console.log(filtered === stateOnly ? 'OK: default client sees state-level rows only' : 'PROBLEM: filter is not working');
const explicit = await prisma.kPIValue.count({ where: { district_id: { not: null } } });
console.log({ explicit_district_query_untouched: explicit });
await prismaAll.$disconnect();
