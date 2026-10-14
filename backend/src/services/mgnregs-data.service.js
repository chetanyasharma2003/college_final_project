import prisma from '../config/prisma.js';
import DataSyncService from './data-sync.service.js';

class MGNREGSDataService {
  static async syncMGNREGSData() {
    return DataSyncService.syncSchemeData('MGNREGS');
  }

  static async getMGNREGSSummary() {
    return DataSyncService.getSchemeSummary('MGNREGS');
  }
}

export default MGNREGSDataService;
