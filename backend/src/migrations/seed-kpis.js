import prisma from '../config/prisma.js';

// KPI definitions for all 6 schemes
const KPI_DEFINITIONS = {
  PMAY: [
    { name: 'Houses Sanctioned', unit: 'units', dataType: 'numeric', target: 100000, frequency: 'monthly' },
    { name: 'Houses Completed', unit: 'units', dataType: 'numeric', target: 80000, frequency: 'monthly' },
    { name: 'Houses Occupied', unit: 'units', dataType: 'numeric', target: 70000, frequency: 'monthly' },
    { name: 'Completion Rate', unit: '%', dataType: 'percentage', target: 80, frequency: 'monthly' },
    { name: 'Budget Allocated', unit: 'INR Crore', dataType: 'currency', target: 500000, frequency: 'quarterly' },
    { name: 'Budget Spent', unit: 'INR Crore', dataType: 'currency', target: 400000, frequency: 'quarterly' },
  ],

  MGNREGS: [
    { name: 'Person Days Created', unit: 'million days', dataType: 'numeric', target: 5000, frequency: 'monthly' },
    { name: 'Person Days Completed', unit: 'million days', dataType: 'numeric', target: 4000, frequency: 'monthly' },
    { name: 'Average Wage', unit: 'INR/day', dataType: 'currency', target: 300, frequency: 'monthly' },
    { name: 'Work Completion Rate', unit: '%', dataType: 'percentage', target: 80, frequency: 'monthly' },
    { name: 'Worker Participation', unit: '%', dataType: 'percentage', target: 75, frequency: 'monthly' },
  ],

  PMGSY: [
    { name: 'Road Length Planned', unit: 'km', dataType: 'numeric', target: 500000, frequency: 'quarterly' },
    { name: 'Road Length Constructed', unit: 'km', dataType: 'numeric', target: 400000, frequency: 'quarterly' },
    { name: 'Habitations Connected', unit: 'units', dataType: 'numeric', target: 200000, frequency: 'monthly' },
    { name: 'Completion Rate', unit: '%', dataType: 'percentage', target: 85, frequency: 'quarterly' },
    { name: 'Quality Score', unit: 'points', dataType: 'numeric', target: 85, frequency: 'quarterly' },
  ],

  NRLM: [
    { name: 'SHGs Formed', unit: 'groups', dataType: 'numeric', target: 500000, frequency: 'monthly' },
    { name: 'Members Registered', unit: 'people', dataType: 'numeric', target: 5000000, frequency: 'monthly' },
    { name: 'Loan Disbursed', unit: 'INR Crore', dataType: 'currency', target: 50000, frequency: 'quarterly' },
    { name: 'Loan Recovery Rate', unit: '%', dataType: 'percentage', target: 90, frequency: 'quarterly' },
    { name: 'Women Empowerment Index', unit: 'score', dataType: 'numeric', target: 80, frequency: 'quarterly' },
  ],

  'DDU-GKY': [
    { name: 'Candidates Trained', unit: 'people', dataType: 'numeric', target: 5000000, frequency: 'monthly' },
    { name: 'Placements Done', unit: 'people', dataType: 'numeric', target: 3500000, frequency: 'monthly' },
    { name: 'Placement Rate', unit: '%', dataType: 'percentage', target: 70, frequency: 'monthly' },
    { name: 'Average Salary', unit: 'INR', dataType: 'currency', target: 500000, frequency: 'quarterly' },
    { name: 'Retention Rate', unit: '%', dataType: 'percentage', target: 75, frequency: 'quarterly' },
  ],

  SAGY: [
    { name: 'Villages Adopted', unit: 'villages', dataType: 'numeric', target: 8000, frequency: 'quarterly' },
    { name: 'Development Index', unit: 'score', dataType: 'numeric', target: 75, frequency: 'quarterly' },
    { name: 'Infrastructure Score', unit: 'score', dataType: 'numeric', target: 80, frequency: 'quarterly' },
    { name: 'Community Satisfaction', unit: '%', dataType: 'percentage', target: 85, frequency: 'quarterly' },
    { name: 'Livelihood Improvement', unit: '%', dataType: 'percentage', target: 60, frequency: 'quarterly' },
  ],
};

async function seedKPIs() {
  console.log('🌱 Starting KPI definitions seeding...\n');

  try {
    for (const [schemeCode, kpis] of Object.entries(KPI_DEFINITIONS)) {
      const scheme = await prisma.scheme.findUnique({
        where: { code: schemeCode },
      });

      if (!scheme) {
        console.log(`⚠️  Scheme ${schemeCode} not found, skipping`);
        continue;
      }

      console.log(`📊 Adding KPIs for ${schemeCode}...`);
      let created = 0;

      for (const kpi of kpis) {
        await prisma.kPIDefinition.create({
          data: {
            scheme_id: scheme.id,
            kpi_name: kpi.name,
            description: `${kpi.name} for ${scheme.name}`,
            unit: kpi.unit,
            data_type: kpi.dataType,
            target_value: kpi.target,
            frequency: kpi.frequency,
          },
        }).catch((err) => {
          if (err.code === 'P2002') {
            // Unique constraint - KPI already exists
            return;
          }
          throw err;
        });

        created++;
      }

      console.log(`✅ Created ${created} KPIs for ${schemeCode}\n`);
    }

    // Summary
    const totalKPIs = await prisma.kPIDefinition.count();
    console.log(`\n✨ KPI Seeding Complete!`);
    console.log(`📈 Total KPI Definitions: ${totalKPIs}\n`);

    console.log('📋 KPI Summary:');
    for (const schemeCode of Object.keys(KPI_DEFINITIONS)) {
      const scheme = await prisma.scheme.findUnique({
        where: { code: schemeCode },
        include: { _count: { select: { kpi_definitions: true } } },
      });
      if (scheme) {
        console.log(`   ${schemeCode}: ${scheme._count.kpi_definitions} KPIs`);
      }
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedKPIs();
