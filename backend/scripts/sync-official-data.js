import path from 'node:path';
import { existsSync } from 'node:fs';
import dotenv from 'dotenv';

const envPath = path.resolve(process.cwd(), '.env.real-data');
if (existsSync(envPath)) {
  const envResult = dotenv.config({ path: envPath, override: true });
  if (envResult.error) {
    console.error('Unable to load backend/.env.real-data.');
    process.exit(1);
  }
} else {
  // Hosted jobs provide credentials as environment variables. Local runs may
  // still use the ignored .env file when no private import file is present.
  dotenv.config();
}

const databaseUrl = process.env.DATABASE_URL;
let databaseHost;
try {
  databaseHost = databaseUrl ? new URL(databaseUrl).hostname : null;
} catch {
  databaseHost = null;
}

if (!databaseHost?.endsWith('.neon.tech')) {
  console.error('Set DATABASE_URL to the Neon connection URL in backend/.env.real-data or the process environment before importing.');
  process.exitCode = 1;
} else {
  const { getDataGovApiKey, SCHEME_CONFIGS } = await import('../src/config/scheme-integrations.js');
  const missingKeys = Object.keys(SCHEME_CONFIGS).filter((code) => (
    SCHEME_CONFIGS[code].resourceId
    && SCHEME_CONFIGS[code].fieldMapping
    && !getDataGovApiKey(code)
  ));

  if (missingKeys.length > 0) {
    console.error(`Missing data.gov.in API key configuration for: ${missingKeys.join(', ')}`);
    process.exitCode = 1;
  } else {
    const { default: dataSyncService } = await import('../src/services/data-sync.service.js');
    const { default: prisma } = await import('../src/config/prisma.js');

    try {
      console.log('Importing official source records into the configured Neon database…');
      const result = await dataSyncService.syncAllSchemeData();
      for (const [code, schemeResult] of Object.entries(result.schemes)) {
        const error = schemeResult.error || schemeResult.errors?.[0];
        console.log(`${code}: ${schemeResult.status}, ${schemeResult.recordsLoaded || 0} records${error ? ` — ${error}` : ''}`);
      }
      console.log(`Finished: ${result.success} successful, ${result.failed} failed, ${result.totalRecords} records imported.`);
      if (result.failed > 0) process.exitCode = 1;
    } catch (error) {
      const detail = error.code || error.name || 'unknown error';
      console.error(`Official data import failed before completion (${detail}).`);
      process.exitCode = 1;
    } finally {
      await prisma.$disconnect();
    }
  }
}
