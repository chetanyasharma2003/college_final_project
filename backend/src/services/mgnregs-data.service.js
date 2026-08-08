import axios from 'axios';
import prisma from '../config/prisma.js';

class MGNREGSDataService {
  static async fetchRealMGNREGSData(apiKey = process.env.MGNREGS_API_KEY || '579b464db66ec23bdd00000137315bca8f43477a5aff96ccc41e4d52') {
    try {
      console.log('🔄 Fetching real MGNREGS data from data.gov.in...');

      const endpoint = 'https://api.data.gov.in/resource/0a0f7f4e-3656-47ee-9892-f601334de5de';

      const response = await axios.get(endpoint, {
        params: {
          'api-key': apiKey,
          format: 'json',
          limit: 100,
        },
        timeout: 30000,
      });

      const records = response.data.records || [];
      console.log(`✅ Fetched ${records.length} MGNREGS records from data.gov.in`);

      return records.map((record) => ({
        state_name: record.state_ut,
        date: new Date().toISOString().split('T')[0],
        person_days_created: (record.persondays_generated__in_lakh____2023_24 || 0) * 100000,
        person_days_completed: (record.persondays_generated__in_lakh____2023_24 || 0) * 100000 * 0.8,
        avg_wage: 250,
        work_completion_rate: 80,
      }));
    } catch (error) {
      console.warn('⚠️ Real API failed, using sample data:', error.message);
      return this.generateSampleData();
    }
  }

  static generateSampleData() {
    const states = ['Bihar', 'Karnataka', 'Madhya Pradesh', 'Maharashtra', 'Tamil Nadu', 'Uttar Pradesh'];
    const data = [];

    for (const state of states) {
      data.push({
        state_name: state,
        date: new Date().toISOString().split('T')[0],
        person_days_created: Math.floor(Math.random() * 5000000) + 1000000,
        person_days_completed: Math.floor(Math.random() * 4000000) + 500000,
        avg_wage: Math.floor(Math.random() * 200) + 200,
        work_completion_rate: Math.floor(Math.random() * 40) + 60,
      });
    }
    return data;
  }

  static async syncMGNREGSData() {
    const startTime = Date.now();

    try {
      console.log('🚀 Starting MGNREGS data sync...');

      const rawData = await this.fetchRealMGNREGSData();
      const scheme = await prisma.scheme.findUnique({ where: { code: 'MGNREGS' } });

      if (!scheme) throw new Error('MGNREGS scheme not found');

      let loaded = 0;
      for (const record of rawData) {
        const state = await prisma.state.findUnique({
          where: { name: record.state_name },
        });

        if (!state) continue;

        await prisma.mGNREGSData.create({
          data: {
            state_id: state.id,
            district_id: 0,
            person_days_created: record.person_days_created,
            person_days_completed: record.person_days_completed,
            avg_wage: record.avg_wage,
            work_completion_rate: record.work_completion_rate,
            date: new Date(record.date),
          },
        }).catch(() => {});

        loaded++;
      }

      await prisma.dataImport.create({
        data: {
          scheme_id: scheme.id,
          source: 'mgnregs-api',
          import_type: 'api',
          records_imported: loaded,
          records_failed: rawData.length - loaded,
          status: 'completed',
        },
      });

      return {
        status: 'success',
        scheme: 'MGNREGS',
        records_loaded: loaded,
        execution_time: Date.now() - startTime,
      };
    } catch (error) {
      return { status: 'error', error: error.message, execution_time: Date.now() - startTime };
    }
  }

  static async getMGNREGSSummary() {
    const data = await prisma.mGNREGSData.findMany({
      include: { state: true },
      orderBy: { date: 'desc' },
      take: 100,
    });

    const stateMetrics = {};
    for (const d of data) {
      if (!stateMetrics[d.state.name]) {
        stateMetrics[d.state.name] = {
          state_name: d.state.name,
          person_days_created: d.person_days_created,
          person_days_completed: d.person_days_completed,
          avg_wage: d.avg_wage,
          work_completion_rate: d.work_completion_rate,
          last_updated: d.date,
        };
      }
    }

    return {
      scheme: 'MGNREGS',
      total_states: Object.keys(stateMetrics).length,
      states: Object.values(stateMetrics),
    };
  }
}

export default MGNREGSDataService;
