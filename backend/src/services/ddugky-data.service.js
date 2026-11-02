import prisma from '../config/prisma.js';
import DataSyncService from './data-sync.service.js';

class DDUGKYDataService {
  static async syncDDUGKYData() {
    return DataSyncService.syncSchemeData('DDU-GKY');
  }

  static async getDDUGKYSummary() {
    return DataSyncService.getSchemeSummary('DDU-GKY');
  }
}

export default DDUGKYDataService;
