import prisma from '../config/prisma.js';

class KPIManagementService {
  // Get all KPI definitions for a scheme
  static async getSchemeKPIs(schemeCode) {
    return prisma.kPIDefinition.findMany({
      where: { scheme: { code: schemeCode } },
      include: { scheme: true },
    });
  }

  // Calculate current KPI values from scheme data
  static async calculateKPIValues(schemeCode) {
    const scheme = await prisma.scheme.findUnique({ where: { code: schemeCode } });
    if (!scheme) throw new Error(`Scheme ${schemeCode} not found`);

    const kpiDefinitions = await this.getSchemeKPIs(schemeCode);
    const results = [];

    for (const kpiDef of kpiDefinitions) {
      let calculatedValue = 0;
      const latestDate = new Date();

      // Calculate based on scheme type
      if (schemeCode === 'PMAY') {
        calculatedValue = await this.calculatePMAYKPI(kpiDef.kpi_name);
      } else if (schemeCode === 'MGNREGS') {
        calculatedValue = await this.calculateMGNREGSKPI(kpiDef.kpi_name);
      } else if (schemeCode === 'PMGSY') {
        calculatedValue = await this.calculatePMGSYKPI(kpiDef.kpi_name);
      } else if (schemeCode === 'NRLM') {
        calculatedValue = await this.calculateNRLMKPI(kpiDef.kpi_name);
      } else if (schemeCode === 'DDU-GKY') {
        calculatedValue = await this.calculateDDUGKYKPI(kpiDef.kpi_name);
      } else if (schemeCode === 'SAGY') {
        calculatedValue = await this.calculateSAGYKPI(kpiDef.kpi_name);
      }

      // Store KPI value in database
      await prisma.kPIValue.create({
        data: {
          kpi_id: kpiDef.id,
          state_id: 1,
          district_id: 0,
          block_id: 0,
          village_id: 0,
          value: calculatedValue,
          date: latestDate,
          target_value: kpiDef.target_value,
          status: calculatedValue >= kpiDef.target_value ? 'on_track' : 'at_risk',
        },
      }).catch((err) => {
        console.error(`Failed to insert KPI value for ${kpiDef.kpi_name}:`, err.message);
      });

      results.push({
        kpi_name: kpiDef.kpi_name,
        value: calculatedValue,
        target: kpiDef.target_value,
        unit: kpiDef.unit,
        status: calculatedValue >= kpiDef.target_value ? 'on_track' : 'at_risk',
      });
    }

    return results;
  }

  // PMAY KPI Calculations
  static async calculatePMAYKPI(kpiName) {
    const data = await prisma.pMAYData.findMany({ orderBy: { date: 'desc' }, take: 10 });
    if (data.length === 0) return 0;

    switch (kpiName) {
      case 'Houses Sanctioned':
        return data.reduce((sum, d) => sum + Number(d.houses_sanctioned || 0), 0);
      case 'Houses Completed':
        return data.reduce((sum, d) => sum + Number(d.houses_completed || 0), 0);
      case 'Houses Occupied':
        return data.reduce((sum, d) => sum + Number(d.houses_occupied || 0), 0);
      case 'Completion Rate':
        if (data[0]?.houses_sanctioned === 0) return 0;
        return ((data[0]?.houses_completed || 0) / (data[0]?.houses_sanctioned || 1)) * 100;
      case 'Budget Allocated':
        return data[0]?.budget_allocated || 0;
      case 'Budget Spent':
        return data[0]?.budget_spent || 0;
      default:
        return 0;
    }
  }

  // MGNREGS KPI Calculations
  static async calculateMGNREGSKPI(kpiName) {
    const data = await prisma.mGNREGSData.findMany({ orderBy: { date: 'desc' }, take: 10 });
    if (data.length === 0) return 0;

    switch (kpiName) {
      case 'Person Days Created':
        return Math.round(data.reduce((sum, d) => sum + Number(d.person_days_created || 0), 0));
      case 'Person Days Completed':
        return Math.round(data.reduce((sum, d) => sum + Number(d.person_days_completed || 0), 0));
      case 'Average Wage':
        return data[0]?.avg_wage || 0;
      case 'Work Completion Rate':
        return data[0]?.work_completion_rate || 0;
      case 'Worker Participation':
        if (data[0]?.person_days_created === 0) return 0;
        return ((data[0]?.person_days_completed || 0) / (data[0]?.person_days_created || 1)) * 100;
      default:
        return 0;
    }
  }

  // PMGSY KPI Calculations
  static async calculatePMGSYKPI(kpiName) {
    const data = await prisma.pMGSYData.findMany({ orderBy: { date: 'desc' }, take: 10 });
    if (data.length === 0) return 0;

    switch (kpiName) {
      case 'Road Length Planned':
        return Math.round(data.reduce((sum, d) => sum + Number(d.road_length_planned || 0), 0));
      case 'Road Length Constructed':
        return Math.round(data.reduce((sum, d) => sum + Number(d.road_length_constructed || 0), 0));
      case 'Habitations Connected':
        return Math.round(data.reduce((sum, d) => sum + Number(d.habitations_connected || 0), 0));
      case 'Completion Rate':
        if (data[0]?.road_length_planned === 0) return 0;
        return ((data[0]?.road_length_constructed || 0) / (data[0]?.road_length_planned || 1)) * 100;
      case 'Quality Score':
        return data[0]?.completion_rate || 0;
      default:
        return 0;
    }
  }

  // NRLM KPI Calculations
  static async calculateNRLMKPI(kpiName) {
    const data = await prisma.nRLMData.findMany({ orderBy: { date: 'desc' }, take: 10 });
    if (data.length === 0) return 0;

    switch (kpiName) {
      case 'SHGs Formed':
        return Math.round(data.reduce((sum, d) => sum + Number(d.shgs_formed || 0), 0));
      case 'Members Registered':
        return Math.round(data.reduce((sum, d) => sum + Number(d.members_registered || 0), 0));
      case 'Loan Disbursed':
        return Math.round(data.reduce((sum, d) => sum + Number(d.loan_disbursed || 0), 0) / 10000000);
      case 'Loan Recovery Rate':
        return data[0]?.loan_recovery_rate || 0;
      case 'Women Empowerment Index':
        return data[0]?.women_empowerment_index || 0;
      default:
        return 0;
    }
  }

  // DDU-GKY KPI Calculations
  static async calculateDDUGKYKPI(kpiName) {
    const data = await prisma.dDUGKYData.findMany({ orderBy: { date: 'desc' }, take: 10 });
    if (data.length === 0) return 0;

    switch (kpiName) {
      case 'Candidates Trained':
        return Math.round(data.reduce((sum, d) => sum + Number(d.candidates_trained || 0), 0));
      case 'Placements Done':
        return Math.round(data.reduce((sum, d) => sum + Number(d.placement_count || 0), 0));
      case 'Placement Rate':
        if (data[0]?.candidates_trained === 0) return 0;
        return ((data[0]?.placement_count || 0) / (data[0]?.candidates_trained || 1)) * 100;
      case 'Average Salary':
        return Math.round(data.reduce((sum, d) => sum + Number(d.avg_salary || 0), 0) / data.length);
      case 'Retention Rate':
        return 75;
      default:
        return 0;
    }
  }

  // SAGY KPI Calculations
  static async calculateSAGYKPI(kpiName) {
    const data = await prisma.sAGYData.findMany({ orderBy: { date: 'desc' }, take: 10 });
    if (data.length === 0) return 0;

    switch (kpiName) {
      case 'Villages Adopted':
        return Math.round(data.reduce((sum, d) => sum + Number(d.villages_adopted || 0), 0));
      case 'Development Index':
        return Math.round(data.reduce((sum, d) => sum + Number(d.development_index || 0), 0) / data.length);
      case 'Infrastructure Score':
        return Math.round(data.reduce((sum, d) => sum + Number(d.infrastructure_score || 0), 0) / data.length);
      case 'Community Satisfaction':
        return Math.round(data.reduce((sum, d) => sum + Number(d.community_satisfaction || 0), 0) / data.length);
      case 'Livelihood Improvement':
        return 60;
      default:
        return 0;
    }
  }

  // Get KPI values for a scheme with comparison to targets
  static async getKPIStatus(schemeCode) {
    const scheme = await prisma.scheme.findUnique({ where: { code: schemeCode } });
    if (!scheme) throw new Error(`Scheme ${schemeCode} not found`);

    const kpis = await prisma.kPIDefinition.findMany({
      where: { scheme_id: scheme.id },
    });

    const status = [];
    for (const kpi of kpis) {
      const latestValue = await prisma.kPIValue.findFirst({
        where: { kpi_id: kpi.id },
        orderBy: { date: 'desc' },
      });

      const value = latestValue?.value || 0;
      const target = kpi.target_value || 0;
      const percentage = target > 0 ? (value / target) * 100 : 0;

      status.push({
        kpi_id: kpi.id,
        kpi_name: kpi.kpi_name,
        current_value: value,
        target_value: target,
        unit: kpi.unit,
        progress_percentage: Math.round(percentage),
        status: percentage >= 100 ? 'achieved' : percentage >= 80 ? 'on_track' : 'at_risk',
        last_updated: latestValue?.date || null,
      });
    }

    return status;
  }

  // Batch calculate all schemes KPI values
  static async calculateAllKPIs() {
    const schemes = await prisma.scheme.findMany();
    const results = {};

    for (const scheme of schemes) {
      try {
        results[scheme.code] = await this.calculateKPIValues(scheme.code);
      } catch (error) {
        results[scheme.code] = { error: error.message };
      }
    }

    return results;
  }

  // Update KPI target
  static async updateKPITarget(kpiId, newTarget) {
    return prisma.kPIDefinition.update({
      where: { id: kpiId },
      data: { target_value: newTarget },
    });
  }
}

export default KPIManagementService;
