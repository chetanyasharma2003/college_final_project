import prisma from '../config/prisma.js';
import DataSyncService from './data-sync.service.js';

class NRLMDataService {
  static async syncNRLMData() {
    return DataSyncService.syncSchemeData('NRLM');
  }

  static async getNRLMSummary() {
    return DataSyncService.getSchemeSummary('NRLM');
  }
}

export default NRLMDataService;
