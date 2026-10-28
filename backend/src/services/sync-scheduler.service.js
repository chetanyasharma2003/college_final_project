import DataSyncService from './data-sync.service.js';
import { SCHEME_CONFIGS } from '../config/scheme-integrations.js';

const hasUsableSource = (config) => Boolean(
  process.env.DATA_GOV_API_KEY
  && config.resourceId
  && config.fieldMapping?.state
  && config.fieldMapping?.date
  && config.fieldMapping?.metrics
  && !Array.isArray(config.fieldMapping.metrics)
  && Object.keys(config.fieldMapping.metrics).length > 0
  && Object.values(config.fieldMapping.metrics).every((field) => typeof field === 'string' && field.trim())
);

const FIELD_RANGES = [
  [0, 59], [0, 23], [1, 31], [1, 12], [0, 6],
];

function fieldMatches(field, value, min, max) {
  if (field === '*') return true;
  const stepMatch = field.match(/^\*\/(\d+)$/);
  if (stepMatch) return Number(stepMatch[1]) > 0 && value % Number(stepMatch[1]) === 0;
  return field.split(',').some((part) => {
    const range = part.match(/^(\d+)-(\d+)$/);
    if (range) return value >= Number(range[1]) && value <= Number(range[2]);
    return /^\d+$/.test(part) && Number(part) >= min && Number(part) <= max && Number(part) === value;
  });
}

export function isValidCronExpression(expression) {
  const fields = String(expression || '').trim().split(/\s+/);
  return fields.length === 5 && fields.every((field, index) => {
    if (field === '*') return true;
    const [min, max] = FIELD_RANGES[index];
    return field.split(',').every((part) => {
      if (/^\*\/\d+$/.test(part)) return Number(part.slice(2)) > 0;
      const range = part.match(/^(\d+)-(\d+)$/);
      if (range) return Number(range[1]) >= min && Number(range[2]) <= max && Number(range[1]) <= Number(range[2]);
      return /^\d+$/.test(part) && Number(part) >= min && Number(part) <= max;
    });
  });
}

export function getNextCronRun(expression, after = new Date()) {
  if (!isValidCronExpression(expression)) throw new Error(`Invalid cron expression: ${expression}`);
  const [minute, hour, day, month, weekday] = expression.trim().split(/\s+/);
  const candidate = new Date(after);
  candidate.setSeconds(0, 0);
  candidate.setUTCMinutes(candidate.getUTCMinutes() + 1);

  // Search at minute granularity, bounded to one year.
  for (let i = 0; i < 527040; i += 1) {
    if (
      fieldMatches(minute, candidate.getUTCMinutes(), 0, 59)
      && fieldMatches(hour, candidate.getUTCHours(), 0, 23)
      && fieldMatches(day, candidate.getUTCDate(), 1, 31)
      && fieldMatches(month, candidate.getUTCMonth() + 1, 1, 12)
      && fieldMatches(weekday, candidate.getUTCDay(), 0, 6)
    ) return candidate;
    candidate.setUTCMinutes(candidate.getUTCMinutes() + 1);
  }
  throw new Error(`No cron run found within one year: ${expression}`);
}

export function startDataSyncScheduler({ enabled = process.env.ENABLE_DATA_SYNC_SCHEDULER === 'true', now = () => new Date() } = {}) {
  if (!enabled) return () => {};
  const timers = [];

  for (const [schemeCode, config] of Object.entries(SCHEME_CONFIGS)) {
    if (!hasUsableSource(config)) continue;
    if (!config.syncFrequency || !isValidCronExpression(config.syncFrequency)) {
      console.error(`Skipping invalid data-sync schedule for ${schemeCode}`);
      continue;
    }

    const scheduleNext = () => {
      const delay = Math.max(0, getNextCronRun(config.syncFrequency, now()).getTime() - now().getTime());
      const timer = setTimeout(async () => {
        try {
          const result = await DataSyncService.syncSchemeData(schemeCode);
          console.info(`Scheduled sync ${schemeCode}: ${result.status}`);
        } catch (error) {
          console.error(`Scheduled sync ${schemeCode} failed: ${error.message}`);
        } finally {
          scheduleNext();
        }
      }, delay);
      timer.unref?.();
      timers.push(timer);
    };
    scheduleNext();
  }

  console.info(`Scheduled data sync enabled for ${timers.length} configured schemes.`);
  return () => timers.forEach(clearTimeout);
}

