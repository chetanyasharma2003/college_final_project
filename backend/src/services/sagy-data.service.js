import prisma from '../config/prisma.js';
import DataSyncService from './data-sync.service.js';

class SAGYDataService {
  static async syncSAGYData() {
    return DataSyncService.syncSchemeData('SAGY');
  }

  static async getSAGYSummary() {
    return DataSyncService.getSchemeSummary('SAGY');
  }
}

export default SAGYDataService;
