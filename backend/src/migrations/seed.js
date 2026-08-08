import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Dummy data generators
const STATES = [
  { name: 'Maharashtra', code: 'MH', region: 'West' },
  { name: 'Tamil Nadu', code: 'TN', region: 'South' },
  { name: 'Uttar Pradesh', code: 'UP', region: 'North' },
  { name: 'Madhya Pradesh', code: 'MP', region: 'Central' },
  { name: 'Karnataka', code: 'KA', region: 'South' },
  { name: 'Bihar', code: 'BR', region: 'East' },
];

const SCHEMES = [
  {
    name: 'PMAY - Pradhan Mantri Awas Yojana',
    code: 'PMAY',
    description: 'Housing for All - Urban & Rural housing scheme',
    ministry: 'Ministry of Housing',
    budget: 500000000000, // 5 lakh crore
  },
  {
    name: 'MGNREGS - Mahatma Gandhi National Rural Employment Guarantee',
    code: 'MGNREGS',
    description: 'Rural employment guarantee program',
    ministry: 'Ministry of Rural Development',
    budget: 300000000000,
  },
  {
    name: 'PMGSY - Pradhan Mantri Gram Sadak Yojana',
    code: 'PMGSY',
    description: 'Rural road connectivity program',
    ministry: 'Ministry of Roads & Transport',
    budget: 250000000000,
  },
  {
    name: 'NRLM - National Rural Livelihood Mission',
    code: 'NRLM',
    description: 'Rural livelihood and women empowerment',
    ministry: 'Ministry of Rural Development',
    budget: 200000000000,
  },
  {
    name: 'DDU-GKY - Deen Dayal Upadhyaya Scheme',
    code: 'DDU-GKY',
    description: 'Skill development and youth training',
    ministry: 'Ministry of Skill Development',
    budget: 100000000000,
  },
  {
    name: 'SAGY - Sansad Adarsh Gram Yojana',
    code: 'SAGY',
    description: 'Model villages development program',
    ministry: 'Ministry of Rural Development',
    budget: 50000000000,
  },
];

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // 1. Create Users
    console.log('Creating users...');
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@govschemes.in',
        password_hash: await bcrypt.hash('Admin@12345', 10),
        full_name: 'Admin User',
        role: 'ADMIN',
        is_active: true,
      },
    });

    const analystUser = await prisma.user.create({
      data: {
        email: 'analyst@govschemes.in',
        password_hash: await bcrypt.hash('Analyst@12345', 10),
        full_name: 'Data Analyst',
        role: 'ANALYST',
        is_active: true,
      },
    });

    console.log('✅ Users created');

    // 2. Create States
    console.log('Creating states...');
    const statesData = await Promise.all(
      STATES.map((state) =>
        prisma.state.create({
          data: {
            name: state.name,
            code: state.code,
            region: state.region,
            population: faker.number.int({ min: 50000000, max: 200000000 }),
          },
        })
      )
    );
    console.log(`✅ Created ${statesData.length} states`);

    // 3. Create Districts for each State
    console.log('Creating districts...');
    const districtsData = [];
    for (const state of statesData) {
      for (let i = 0; i < 3; i++) {
        const district = await prisma.district.create({
          data: {
            name: faker.location.city(),
            state_id: state.id,
            population: faker.number.int({ min: 1000000, max: 10000000 }),
            area_km2: parseFloat((Math.random() * 9000 + 1000).toFixed(2)),
          },
        });
        districtsData.push(district);
      }
    }
    console.log(`✅ Created ${districtsData.length} districts`);

    // 4. Create Blocks for each District
    console.log('Creating blocks...');
    const blocksData = [];
    for (const district of districtsData) {
      for (let i = 0; i < 2; i++) {
        const block = await prisma.block.create({
          data: {
            name: faker.location.city(),
            district_id: district.id,
            population: faker.number.int({ min: 100000, max: 1000000 }),
          },
        });
        blocksData.push(block);
      }
    }
    console.log(`✅ Created ${blocksData.length} blocks`);

    // 5. Create Villages for each Block
    console.log('Creating villages...');
    const villagesData = [];
    for (const block of blocksData) {
      for (let i = 0; i < 2; i++) {
        const village = await prisma.village.create({
          data: {
            name: faker.location.city(),
            block_id: block.id,
            population: faker.number.int({ min: 5000, max: 50000 }),
            latitude: parseFloat((Math.random() * 180 - 90).toFixed(6)),
            longitude: parseFloat((Math.random() * 360 - 180).toFixed(6)),
          },
        });
        villagesData.push(village);
      }
    }
    console.log(`✅ Created ${villagesData.length} villages`);

    // 6. Create Schemes
    console.log('Creating schemes...');
    const schemesData = await Promise.all(
      SCHEMES.map((scheme) =>
        prisma.scheme.create({
          data: {
            name: scheme.name,
            code: scheme.code,
            description: scheme.description,
            ministry: scheme.ministry,
            budget: scheme.budget,
            launch_date: faker.date.past({ years: 10 }),
          },
        })
      )
    );
    console.log(`✅ Created ${schemesData.length} schemes`);

    // 7. Create KPI Definitions for each Scheme
    console.log('Creating KPI definitions...');
    const kpiDefinitions = [
      // PMAY KPIs
      {
        schemeId: schemesData[0].id,
        kpiName: 'Houses Sanctioned',
        description: 'Total number of houses sanctioned',
        unit: 'units',
        dataType: 'numeric',
        targetValue: 100000,
        frequency: 'monthly',
      },
      {
        schemeId: schemesData[0].id,
        kpiName: 'Houses Completed',
        description: 'Total number of houses completed',
        unit: 'units',
        dataType: 'numeric',
        targetValue: 80000,
        frequency: 'monthly',
      },
      {
        schemeId: schemesData[0].id,
        kpiName: 'Completion Rate',
        description: 'Percentage of houses completed',
        unit: '%',
        dataType: 'percentage',
        targetValue: 80,
        frequency: 'monthly',
      },
      {
        schemeId: schemesData[0].id,
        kpiName: 'Houses Occupied',
        description: 'Total number of houses occupied',
        unit: 'units',
        dataType: 'numeric',
        targetValue: 70000,
        frequency: 'monthly',
      },
      {
        schemeId: schemesData[0].id,
        kpiName: 'Budget Allocated',
        description: 'Budget allocated for PMAY',
        unit: 'INR Crore',
        dataType: 'currency',
        targetValue: 500000,
        frequency: 'quarterly',
      },
      {
        schemeId: schemesData[0].id,
        kpiName: 'Budget Spent',
        description: 'Budget spent for PMAY',
        unit: 'INR Crore',
        dataType: 'currency',
        targetValue: 400000,
        frequency: 'quarterly',
      },
      // MGNREGS KPIs
      {
        schemeId: schemesData[1].id,
        kpiName: 'Person Days Created',
        description: 'Total person-days of employment created',
        unit: 'days',
        dataType: 'numeric',
        targetValue: 5000000,
        frequency: 'monthly',
      },
      {
        schemeId: schemesData[1].id,
        kpiName: 'Average Wage',
        description: 'Average wage paid per day',
        unit: 'INR',
        dataType: 'currency',
        targetValue: 300,
        frequency: 'monthly',
      },
      // PMGSY KPIs
      {
        schemeId: schemesData[2].id,
        kpiName: 'Road Length Constructed',
        description: 'Total km of roads constructed',
        unit: 'km',
        dataType: 'numeric',
        targetValue: 500000,
        frequency: 'monthly',
      },
      {
        schemeId: schemesData[2].id,
        kpiName: 'Habitations Connected',
        description: 'Number of habitations connected',
        unit: 'units',
        dataType: 'numeric',
        targetValue: 200000,
        frequency: 'monthly',
      },
      // NRLM KPIs
      {
        schemeId: schemesData[3].id,
        kpiName: 'SHGs Formed',
        description: 'Self Help Groups formed',
        unit: 'groups',
        dataType: 'numeric',
        targetValue: 500000,
        frequency: 'monthly',
      },
      {
        schemeId: schemesData[3].id,
        kpiName: 'Loan Disbursed',
        description: 'Loan amount disbursed',
        unit: 'INR',
        dataType: 'currency',
        targetValue: 5000000000,
        frequency: 'monthly',
      },
      // DDU-GKY KPIs
      {
        schemeId: schemesData[4].id,
        kpiName: 'Candidates Trained',
        description: 'Number of candidates trained',
        unit: 'people',
        dataType: 'numeric',
        targetValue: 5000000,
        frequency: 'monthly',
      },
      {
        schemeId: schemesData[4].id,
        kpiName: 'Placement Rate',
        description: 'Percentage of candidates placed',
        unit: '%',
        dataType: 'percentage',
        targetValue: 70,
        frequency: 'monthly',
      },
      // SAGY KPIs
      {
        schemeId: schemesData[5].id,
        kpiName: 'Villages Adopted',
        description: 'Number of villages adopted',
        unit: 'villages',
        dataType: 'numeric',
        targetValue: 8000,
        frequency: 'monthly',
      },
    ];

    await Promise.all(
      kpiDefinitions.map((kpi) =>
        prisma.kPIDefinition.create({
          data: {
            scheme_id: kpi.schemeId,
            kpi_name: kpi.kpiName,
            description: kpi.description,
            unit: kpi.unit,
            data_type: kpi.dataType,
            target_value: kpi.targetValue,
            frequency: kpi.frequency,
          },
        })
      )
    );
    console.log(`✅ Created ${kpiDefinitions.length} KPI definitions`);

    // 8. Create KPI Values (Real-time data)
    console.log('Creating KPI values...');
    const kpiDefinitionsFromDb = await prisma.kPIDefinition.findMany();
    let kpiValueCount = 0;

    for (const kpiDef of kpiDefinitionsFromDb) {
      for (const state of statesData) {
        // Generate simple realistic values that fit in database
        let value = Math.random() * Math.min(kpiDef.target_value || 10000, 10000000);

        // Determine status
        let status = 'on_track';
        if (value < (kpiDef.target_value || 10000) * 0.7) status = 'critical';
        else if (value < (kpiDef.target_value || 10000) * 0.9) status = 'at_risk';

        await prisma.kPIValue.create({
          data: {
            kpi_id: kpiDef.id,
            state_id: state.id,
            value: Math.round(value * 100) / 100,
            target_value: kpiDef.target_value,
            date: new Date(),
            status: status,
          },
        });
        kpiValueCount++;
      }
    }
    console.log(`✅ Created ${kpiValueCount} KPI values`);

    // 9. Create Scheme-specific data
    console.log('Creating scheme-specific data...');
    for (const state of statesData) {
      for (const district of districtsData.filter((d) => d.state_id === state.id)) {
        // PMAY Data
        await prisma.pMAYData.create({
          data: {
            state_id: state.id,
            district_id: district.id,
            houses_sanctioned: faker.number.int({ min: 5000, max: 50000 }),
            houses_completed: faker.number.int({ min: 2000, max: 40000 }),
            houses_occupied: faker.number.int({ min: 1000, max: 35000 }),
            budget_allocated: faker.number.float({ min: 100000000, max: 1000000000 }),
            budget_spent: faker.number.float({ min: 50000000, max: 900000000 }),
            avg_cost_per_unit: faker.number.float({ min: 500000, max: 1500000 }),
            date: new Date(),
          },
        });

        // MGNREGS Data
        await prisma.mGNREGSData.create({
          data: {
            state_id: state.id,
            district_id: district.id,
            person_days_created: faker.number.float({
              min: 1000000,
              max: 10000000,
              precision: 0.01,
            }),
            person_days_completed: faker.number.float({
              min: 500000,
              max: 9000000,
              precision: 0.01,
            }),
            avg_wage: faker.number.float({ min: 250, max: 400 }),
            work_completion_rate: faker.number.float({ min: 60, max: 100 }),
            date: new Date(),
          },
        });

        // PMGSY Data
        await prisma.pMGSYData.create({
          data: {
            state_id: state.id,
            district_id: district.id,
            road_length_planned: faker.number.float({
              min: 1000,
              max: 10000,
              precision: 0.01,
            }),
            road_length_constructed: faker.number.float({
              min: 500,
              max: 9000,
              precision: 0.01,
            }),
            habitations_connected: faker.number.int({ min: 5000, max: 50000 }),
            completion_rate: faker.number.float({ min: 50, max: 100 }),
            date: new Date(),
          },
        });

        // NRLM Data
        await prisma.nRLMData.create({
          data: {
            state_id: state.id,
            district_id: district.id,
            shgs_formed: faker.number.int({ min: 10000, max: 100000 }),
            members_registered: faker.number.int({ min: 50000, max: 500000 }),
            loan_disbursed: faker.number.float({
              min: 1000000000,
              max: 10000000000,
              precision: 0.01,
            }),
            women_empowerment_index: faker.number.float({ min: 50, max: 100 }),
            date: new Date(),
          },
        });

        // DDU-GKY Data
        await prisma.dDUGKYData.create({
          data: {
            state_id: state.id,
            district_id: district.id,
            candidates_trained: faker.number.int({ min: 10000, max: 100000 }),
            placement_count: faker.number.int({ min: 5000, max: 80000 }),
            avg_salary: faker.number.float({ min: 300000, max: 800000 }),
            date: new Date(),
          },
        });

        // SAGY Data (Village level)
        const districtBlockIds = new Set(
          blocksData
            .filter((b) => b.district_id === district.id)
            .map((b) => b.id)
        );
        for (const village of villagesData.filter((v) => districtBlockIds.has(v.block_id))) {
          await prisma.sAGYData.create({
            data: {
              district_id: district.id,
              village_id: village.id,
              development_index: faker.number.float({ min: 30, max: 100, multipleOf: 0.01 }),
              infrastructure_score: faker.number.float({ min: 40, max: 90, multipleOf: 0.01 }),
              community_satisfaction: faker.number.float({ min: 50, max: 95, multipleOf: 0.01 }),
              date: new Date(),
            },
          });
        }
      }
    }
    console.log('✅ Created all scheme-specific data');

    console.log('\n✨ Seeding completed successfully!\n');
    console.log('📊 Data Summary:');
    console.log(`   - States: ${statesData.length}`);
    console.log(`   - Districts: ${districtsData.length}`);
    console.log(`   - Blocks: ${blocksData.length}`);
    console.log(`   - Villages: ${villagesData.length}`);
    console.log(`   - Schemes: ${schemesData.length}`);
    console.log(`   - KPI Definitions: ${kpiDefinitions.length}`);
    console.log(`   - Users: 2\n`);

    console.log('🔐 Test Credentials:');
    console.log('   Admin: admin@govschemes.in / Admin@12345');
    console.log('   Analyst: analyst@govschemes.in / Analyst@12345\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
