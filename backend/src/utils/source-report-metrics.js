import { SCHEME_CONFIGS } from '../config/scheme-integrations.js';
import { filterSourceKpiDefinitions } from '../services/kpi-management.service.js';

export const sourceReportKpiIds = (scheme, definitions) => {
  const config = SCHEME_CONFIGS[scheme.code];
  if (!config?.fieldMapping) return [];
  return filterSourceKpiDefinitions(definitions, config).map(({ id }) => id);
};

export const completionPercentage = (value, targetValue) => {
  if (targetValue == null) return null;
  const numericValue = Number(value);
  const numericTarget = Number(targetValue);
  if (!Number.isFinite(numericValue) || !Number.isFinite(numericTarget) || numericTarget <= 0) return null;
  return (numericValue / numericTarget) * 100;
};

export const averageKpiCompletion = (kpiValues) => {
  const percentages = kpiValues
    .map(({ value, target_value }) => completionPercentage(value, target_value))
    .filter((percentage) => percentage != null);
  if (percentages.length === 0) return null;
  return Math.round((percentages.reduce((sum, percentage) => sum + percentage, 0) / percentages.length) * 100) / 100;
};

export const comparativeStatus = (kpiValues, averageCompletion) => {
  if (kpiValues.length === 0) return 'no_data';
  if (averageCompletion == null) return 'not_rated';
  return averageCompletion >= 80 ? 'on_track' : averageCompletion >= 60 ? 'at_risk' : 'critical';
};
