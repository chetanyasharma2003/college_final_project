// Compatibility exports for older imports. The canonical configuration lives
// in scheme-integrations.js and remains inactive until verified OGD metadata is set.
import { SCHEME_CONFIGS } from './scheme-integrations.js';

export const DATA_SOURCES = Object.fromEntries(
  Object.entries(SCHEME_CONFIGS).map(([code, config]) => [code, {
    name: config.name,
    apiEndpoint: config.apiEndpoint,
    resourceId: config.resourceId,
    fieldMapping: config.fieldMapping,
    frequency: config.syncFrequency,
  }]),
);

export const SYNC_SCHEDULES = Object.fromEntries(
  Object.entries(SCHEME_CONFIGS).map(([code, config]) => [code, config.syncFrequency]),
);

export const RETRY_CONFIG = {
  maxAttempts: 3,
  delayMs: 5000,
  backoffMultiplier: 2,
  timeoutMs: 30000,
};

export const VALIDATION_RULES = {
  state_name: { type: 'string', required: true },
  district_name: { type: 'string', required: false },
  date: { type: 'date', required: true },
  value: { type: 'number', required: true, min: 0 },
  completion_rate: { type: 'number', min: 0, max: 100 },
};

export default DATA_SOURCES;
