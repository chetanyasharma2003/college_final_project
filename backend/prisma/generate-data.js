import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Scheme-specific KPI names with realistic value ranges (actual values close to targets)
const schemeKPIs = {
  PMAY: [
    { name: 'Total Units Built', min: 80000, max: 150000, targetMult: 1.0 },
    { name: 'Beneficiaries Aided', min: 60000, max: 100000, targetMult: 1.0 },
    { name: 'Completion Rate', min: 60, max: 95, targetMult: 1.0 },
  ],
  MGNREGS: [
    { name: 'Person Days Generated', min: 300000, max: 500000, targetMult: 1.0 },
    { name: 'Total Beneficiaries', min: 50000, max: 100000, targetMult: 1.0 },
    { name: 'Completion Rate', min: 60, max: 90, targetMult: 1.0 },
  ],
  PMGSY: [
    { name: 'Road Length Built', min: 1200, max: 2000, targetMult: 1.0 },
    { name: 'Investment Made', min: 400000, max: 1000000, targetMult: 1.0 },
    { name: 'Villages Connected', min: 200, max: 500, targetMult: 1.0 },
  ],
  NRLM: [
    { name: 'SHGs Formed', min: 6000, max: 10000, targetMult: 1.0 },
    { name: 'Loan Disbursed', min: 50000000, max: 100000000, targetMult: 1.0 },
    { name: 'Livelihoods Improved', min: 10000, max: 50000, targetMult: 1.0 },
  ],
  'DDU-GKY': [
    { name: 'Candidates Trained', min: 30000, max: 50000, targetMult: 1.0 },
    { name: 'Employment Provided', min: 20000, max: 40000, targetMult: 1.0 },
    { name: 'Placement Rate', min: 60, max: 85, targetMult: 1.0 },
  ],
  SAGY: [
    { name: 'Villages Developed', min: 70, max: 150, targetMult: 1.0 },
    { name: 'Infrastructure Created', min: 200, max: 500, targetMult: 1.0 },
    { name: 'Population Benefited', min: 30000, max: 100000, targetMult: 1.0 },
  ],
};

async function generateData() {
  console.log('📊 Generating realistic 30-day data...');

  try {
    const schemes = await prisma.scheme.findMany();
    const states = await prisma.state.findMany();
    console.log(`✅ Found ${schemes.length} schemes and ${states.length} states`);

    let totalRecords = 0;

    for (const scheme of schemes) {
      const schemeCode = scheme.code;
      const kpisList = schemeKPIs[schemeCode] || [];

      if (kpisList.length === 0) continue;

      for (const kpiDef of kpisList) {
        const kpi = await prisma.kPIDefinition.findFirst({
          where: {
            scheme_id: scheme.id,
            kpi_name: kpiDef.name,
          },
        });

        if (!kpi) continue;

        // Generate data for last 30 days with upward trend
        const today = new Date();
        for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
          const date = new Date(today);
          date.setDate(date.getDate() - daysAgo);
          date.setHours(0, 0, 0, 0);

          // Generate for 2-3 random states
          const shuffledStates = states.sort(() => Math.random() - 0.5).slice(0, 3);

          for (const state of shuffledStates) {
            const baseValue = (kpiDef.min + kpiDef.max) / 2;
            const trend = 0.7 + (daysAgo / 30) * 0.3; // 70% to 100% of base
            const randomFactor = 0.85 + Math.random() * 0.3; // ±15% variation
            const value = Math.round(baseValue * trend * randomFactor);
            const target = Math.round(kpiDef.max * kpiDef.targetMult);

            // Calculate performance
            const performance = (value / target) * 100;
            const status = performance >= 80 ? 'on_track' : performance >= 50 ? 'at_risk' : 'critical';

            const existing = await prisma.kPIValue.findFirst({
              where: {
                kpi_id: kpi.id,
                state_id: state.id,
                date: date,
              },
            });

            if (!existing) {
              await prisma.kPIValue.create({
                data: {
                  kpi_id: kpi.id,
                  state_id: state.id,
                  value: value.toString(),
                  target_value: target.toString(),
                  date: date,
                  status: status,
                },
              });
              totalRecords++;
            }
          }
        }
      }

      console.log(`✅ Generated data for ${schemeCode}`);
    }

    console.log(`\n✨ Total ${totalRecords} records created`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

generateData();
