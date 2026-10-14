import prisma from '../config/prisma.js';
import { DATA_VALIDATION_RULES } from '../config/scheme-integrations.js';
import DataSyncService from './data-sync.service.js';

class PMAYDataService {
  /**
   * Fetch real PMAY data from government API
   */
  static async fetchPMAYData() {
    throw new Error('Use the canonical PMAY sync endpoint so imports are validated and tracked.');
  }

  /**
   * Generate sample PMAY data for testing
   */
  static generateSamplePMAYData() {
    throw new Error('Synthetic PMAY data generation was removed. Use explicit development-only seed scripts.');
  }

  /**
   * Validate PMAY data
   */
  static validateData(record) {
    const rules = DATA_VALIDATION_RULES.PMAY;
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = record[field];

      if (typeof value !== 'number') {
        errors.push(`${field} must be a number`);
        continue;
      }

      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${field} must be >= ${rule.min}`);
      }

      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${field} must be <= ${rule.max}`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Load PMAY data into database
   */
  static async loadPMAYDataToDB(rawData) {
    throw new Error('Legacy PMAY data writes were removed. Use the canonical PMAY sync endpoint.');
  }

  /**
   * Full PMAY ETL Pipeline
   */
  static async syncPMAYData() {
    return DataSyncService.syncSchemeData('PMAY');
  }

  /**
   * Calculate PMAY KPIs
   */
  static async calculatePMAYKPIs() {
    throw new Error('Legacy PMAY KPI calculation was removed. Use the canonical KPI calculation service.');
  }

  /**
   * Get PMAY performance summary
   */
  static async getPMAYSummary() {
    return DataSyncService.getSchemeSummary('PMAY');
  }
}

export default PMAYDataService;
