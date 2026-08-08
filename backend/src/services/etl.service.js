import prisma from '../config/prisma.js';
import axios from 'axios';

class ETLService {
  /**
   * Fetch data from data.gov.in API
   * @param {string} apiKey - data.gov.in API key
   * @param {string} resourceId - Dataset resource ID
   * @param {object} filters - Query filters
   * @returns {Promise<array>} Fetched records
   */
  static async fetchFromDataGov(apiKey, resourceId, filters = {}) {
    try {
      const baseUrl = 'https://api.data.gov.in/resource';
      const query = new URLSearchParams({
        'api-key': apiKey,
        'resource_id': resourceId,
        'format': 'json',
        'limit': 1000,
        ...filters,
      });

      const response = await axios.get(`${baseUrl}?${query.toString()}`, {
        timeout: 30000,
      });

      return response.data.records || [];
    } catch (error) {
      console.error('Data.gov.in fetch error:', error.message);
      throw new Error(`Failed to fetch from data.gov.in: ${error.message}`);
    }
  }

  /**
   * Transform raw data to standard KPI format
   * @param {array} records - Raw records from API
   * @param {string} schemeCode - Scheme code
   * @param {object} mapping - Field mapping configuration
   * @returns {Promise<array>} Transformed records
   */
  static async transformData(records, schemeCode, mapping) {
    return records.map((record) => ({
      scheme_code: schemeCode,
      state: record[mapping.state] || null,
      district: record[mapping.district] || null,
      date: new Date(record[mapping.date] || Date.now()),
      metrics: mapping.metrics.reduce(
        (acc, metricMap) => ({
          ...acc,
          [metricMap.name]: parseFloat(record[metricMap.field]) || 0,
        }),
        {}
      ),
    }));
  }

  /**
   * Load data into database
   * @param {array} transformedData - Transformed records
   * @param {string} schemeCode - Scheme code
   * @returns {Promise<object>} Import summary
   */
  static async loadData(transformedData, schemeCode) {
    let imported = 0;
    let failed = 0;
    const errors = [];

    const scheme = await prisma.scheme.findUnique({
      where: { code: schemeCode },
    });

    if (!scheme) {
      throw new Error(`Scheme not found: ${schemeCode}`);
    }

    for (const record of transformedData) {
      try {
        const state = await prisma.state.findUnique({
          where: { name: record.state },
        });

        if (!state) {
          failed++;
          errors.push(`State not found: ${record.state}`);
          continue;
        }

        const district = record.district
          ? await prisma.district.findFirst({
              where: {
                name: record.district,
                state_id: state.id,
              },
            })
          : null;

        // Store generic scheme data
        await prisma.schemeDataGeneric.upsert({
          where: {
            scheme_id_state_id_district_id_date: {
              scheme_id: scheme.id,
              state_id: state.id,
              district_id: district?.id || null,
              date: record.date,
            },
          },
          create: {
            scheme_id: scheme.id,
            state_id: state.id,
            district_id: district?.id || null,
            data: record.metrics,
            date: record.date,
          },
          update: {
            data: record.metrics,
            updated_at: new Date(),
          },
        });

        imported++;
      } catch (error) {
        failed++;
        errors.push(`Error loading record: ${error.message}`);
      }
    }

    // Log import
    await prisma.dataImport.create({
      data: {
        scheme_id: scheme.id,
        source: 'data.gov.in',
        import_type: 'api',
        records_imported: imported,
        records_failed: failed,
        status: failed === 0 ? 'completed' : 'completed',
        error_message: errors.length > 0 ? errors.slice(0, 10).join('; ') : null,
      },
    });

    return {
      scheme_code: schemeCode,
      imported,
      failed,
      total: transformedData.length,
      errors: errors.slice(0, 10),
    };
  }

  /**
   * Full ETL Pipeline
   * @param {string} schemeCode - Scheme code
   * @param {object} config - ETL configuration
   * @returns {Promise<object>} Pipeline result
   */
  static async runETLPipeline(schemeCode, config) {
    const startTime = Date.now();

    try {
      console.log(`🔄 Starting ETL for ${schemeCode}...`);

      // Extract
      const rawData = await this.fetchFromDataGov(
        config.apiKey,
        config.resourceId,
        config.filters || {}
      );
      console.log(`✅ Extracted ${rawData.length} records`);

      if (rawData.length === 0) {
        return {
          status: 'success',
          scheme_code: schemeCode,
          message: 'No new data to process',
          execution_time: Date.now() - startTime,
        };
      }

      // Transform
      const transformedData = await this.transformData(
        rawData,
        schemeCode,
        config.mapping
      );
      console.log(`✅ Transformed data`);

      // Load
      const result = await this.loadData(transformedData, schemeCode);

      return {
        status: 'success',
        ...result,
        execution_time: Date.now() - startTime,
      };
    } catch (error) {
      console.error(`❌ ETL failed for ${schemeCode}:`, error.message);

      const scheme = await prisma.scheme.findUnique({
        where: { code: schemeCode },
      });

      if (scheme) {
        await prisma.dataImport.create({
          data: {
            scheme_id: scheme.id,
            source: 'data.gov.in',
            import_type: 'api',
            status: 'failed',
            error_message: error.message,
          },
        });
      }

      return {
        status: 'error',
        scheme_code: schemeCode,
        error: error.message,
        execution_time: Date.now() - startTime,
      };
    }
  }

  /**
   * Calculate KPI values from raw data
   * @param {string} schemeCode - Scheme code
   * @param {object} kpiFormula - KPI calculation formula
   * @returns {Promise<array>} Calculated KPI values
   */
  static async calculateKPIs(schemeCode, kpiFormula) {
    const scheme = await prisma.scheme.findUnique({
      where: { code: schemeCode },
      include: { kpi_definitions: true },
    });

    if (!scheme) {
      throw new Error(`Scheme not found: ${schemeCode}`);
    }

    const genericData = await prisma.schemeDataGeneric.findMany({
      where: { scheme_id: scheme.id },
      include: { state: true },
    });

    const kpiValues = [];

    for (const data of genericData) {
      for (const kpiDef of scheme.kpi_definitions) {
        const value = kpiFormula[kpiDef.kpi_name]?.(data.data) || 0;
        const targetValue = kpiDef.target_value?.toNumber() || 100;

        let status = 'on_track';
        if (value < targetValue * 0.7) {
          status = 'critical';
        } else if (value < targetValue * 0.9) {
          status = 'at_risk';
        }

        kpiValues.push({
          kpi_id: kpiDef.id,
          state_id: data.state_id,
          district_id: data.district_id,
          value: value,
          target_value: targetValue,
          date: data.date,
          status: status,
        });
      }
    }

    // Bulk create KPI values
    await prisma.kPIValue.createMany({
      data: kpiValues,
      skipDuplicates: true,
    });

    return kpiValues;
  }
}

export default ETLService;
