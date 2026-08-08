import prisma from '../config/prisma.js';

async function addMissingKPIs() {
  console.log('Adding missing KPI definitions...\n');

  try {
    // Get PMAY scheme
    const pmayScheme = await prisma.scheme.findUnique({
      where: { code: 'PMAY' }
    });

    if (!pmayScheme) {
      console.error('❌ PMAY scheme not found');
      return;
    }

    // Add Houses Occupied KPI
    const housesOccupied = await prisma.kPIDefinition.create({
      data: {
        scheme_id: pmayScheme.id,
        kpi_name: 'Houses Occupied',
        description: 'Total number of houses occupied',
        unit: 'units',
        data_type: 'numeric',
        target_value: 70000,
        frequency: 'monthly',
      },
    });
    console.log('✅ Created Houses Occupied KPI');

    // Add Budget Allocated KPI
    const budgetAllocated = await prisma.kPIDefinition.create({
      data: {
        scheme_id: pmayScheme.id,
        kpi_name: 'Budget Allocated',
        description: 'Budget allocated for PMAY',
        unit: 'INR Crore',
        data_type: 'currency',
        target_value: 500000,
        frequency: 'quarterly',
      },
    });
    console.log('✅ Created Budget Allocated KPI');

    // Add Budget Spent KPI
    const budgetSpent = await prisma.kPIDefinition.create({
      data: {
        scheme_id: pmayScheme.id,
        kpi_name: 'Budget Spent',
        description: 'Budget spent for PMAY',
        unit: 'INR Crore',
        data_type: 'currency',
        target_value: 400000,
        frequency: 'quarterly',
      },
    });
    console.log('✅ Created Budget Spent KPI');

    // Get all states
    const states = await prisma.state.findMany();
    console.log(`\nAdding KPI values for ${states.length} states...`);

    // Add sample values for each new KPI for all states
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    for (const state of states) {
      // Houses Occupied
      await prisma.kPIValue.create({
        data: {
          kpi_id: housesOccupied.id,
          state_id: state.id,
          district_id: 0,
          block_id: 0,
          village_id: 0,
          value: Math.floor(Math.random() * 70000),
          target_value: 70000,
          date: date,
          status: Math.random() > 0.3 ? 'on_track' : 'at_risk',
        },
      });

      // Budget Allocated
      await prisma.kPIValue.create({
        data: {
          kpi_id: budgetAllocated.id,
          state_id: state.id,
          district_id: 0,
          block_id: 0,
          village_id: 0,
          value: Math.floor(Math.random() * 500000),
          target_value: 500000,
          date: date,
          status: Math.random() > 0.3 ? 'on_track' : 'at_risk',
        },
      });

      // Budget Spent
      await prisma.kPIValue.create({
        data: {
          kpi_id: budgetSpent.id,
          state_id: state.id,
          district_id: 0,
          block_id: 0,
          village_id: 0,
          value: Math.floor(Math.random() * 400000),
          target_value: 400000,
          date: date,
          status: Math.random() > 0.3 ? 'on_track' : 'at_risk',
        },
      });
    }

    console.log(`✅ Added KPI values for all states`);
    console.log('\n🌱 Missing KPIs seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addMissingKPIs();
