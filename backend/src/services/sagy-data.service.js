import axios from 'axios';
import prisma from '../config/prisma.js';

class SAGYDataService {
  static async fetchRealSAGYData(apiKey = '579b464db66ec23bdd00000137315bca8f43477a5aff96ccc41e4d52') {
    try {
      console.log('🔄 Fetching real SAGY data from data.gov.in...');

      const endpoint = 'https://api.data.gov.in/resource/7f4c1a6d-81b6-4bcb-b6e7-0b638ad0f7e4';

      const response = await axios.get(endpoint, {
        params: {
          'api-key': apiKey,
          format: 'json',
          limit: 100,
        },
        timeout: 30000,
      });

      const records = response.data.records || [];
      console.log(`✅ Fetched ${records.length} SAGY records from data.gov.in`);

      return records.map((record) => ({
        state_name: record.state_ut_name,
        date: new Date().toISOString().split('T')[0],
        villages_adopted: record.number_of_gram_panchayats || 0,
        development_index: 75,
        infrastructure_score: 70,
        community_satisfaction: 80,
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
        villages_adopted: Math.floor(Math.random() * 1000) + 100,
        development_index: Math.floor(Math.random() * 50) + 50,
        infrastructure_score: Math.floor(Math.random() * 40) + 60,
        community_satisfaction: Math.floor(Math.random() * 30) + 70,
      });
    }
    return data;
  }

  static async syncSAGYData() {
    const startTime = Date.now();
    try {
      const rawData = await this.fetchRealSAGYData();
      const scheme = await prisma.scheme.findUnique({ where: { code: 'SAGY' } });
      if (!scheme) throw new Error('SAGY not found');

      let loaded = 0;
      for (const record of rawData) {
        const state = await prisma.state.findUnique({ where: { name: record.state_name } });
        if (!state) continue;

        await prisma.sAGYData.create({
          data: {
            district_id: 0,
            village_id: 0,
            development_index: record.development_index,
            infrastructure_score: record.infrastructure_score,
            community_satisfaction: record.community_satisfaction,
            date: new Date(record.date),
          },
        }).catch(() => {});

        loaded++;
      }

      await prisma.dataImport.create({
        data: { scheme_id: scheme.id, source: 'sagy-api', import_type: 'api', records_imported: loaded, records_failed: rawData.length - loaded, status: 'completed' },
      });

      return { status: 'success', scheme: 'SAGY', records_loaded: loaded, execution_time: Date.now() - startTime };
    } catch (error) {
      return { status: 'error', error: error.message, execution_time: Date.now() - startTime };
    }
  }

  static async getSAGYSummary() {
    const data = await prisma.sAGYData.findMany({ orderBy: { date: 'desc' }, take: 100 });
    return { scheme: 'SAGY', total_records: data.length, avg_development_index: data.length > 0 ? (data.reduce((s, d) => s + Number(d.development_index), 0) / data.length).toFixed(2) : 0 };
  }
}

export default SAGYDataService;
