import prisma from '../config/prisma.js';
import DataSyncService from './data-sync.service.js';

class PMGSYDataService {
  static async syncPMGSYData() {
    return DataSyncService.syncSchemeData('PMGSY');
  }

  static async getPMGSYSummary() {
    return DataSyncService.getSchemeSummary('PMGSY');
  }
}

export default PMGSYDataService;
