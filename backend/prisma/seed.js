import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@12345', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@govschemes.in' },
    update: {},
    create: {
      email: 'admin@govschemes.in',
      password_hash: hashedPassword,
      full_name: 'Admin',
      role: 'ADMIN',
      state_access: null,
      is_active: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@govschemes.in' },
    update: {},
    create: {
      email: 'analyst@govschemes.in',
      password_hash: hashedPassword,
      full_name: 'Analyst',
      role: 'ANALYST',
      state_access: null,
      is_active: true,
    },
  });

  console.log('✅ Analyst user created:', analyst.email);

  // Create 6 schemes
  const schemes = [
    { code: 'PMAY', name: 'Pradhan Mantri Awas Yojana', ministry: 'Ministry of Housing and Urban Affairs', description: 'Housing scheme for economically weaker sections' },
    { code: 'MGNREGS', name: 'Mahatma Gandhi National Rural Employment Guarantee Scheme', ministry: 'Ministry of Rural Development', description: 'Rural employment guarantee scheme' },
    { code: 'PMGSY', name: 'Pradhan Mantri Gram Sadak Yojana', ministry: 'Ministry of Rural Development', description: 'Rural roads development scheme' },
    { code: 'NRLM', name: 'National Rural Livelihood Mission', ministry: 'Ministry of Rural Development', description: 'Rural livelihoods and poverty reduction' },
    { code: 'DDU-GKY', name: 'Deen Dayal Upadhyaya Gram Jyoti Yojana', ministry: 'Ministry of Skill Development', description: 'Skill development and employment scheme' },
    { code: 'SAGY', name: 'Sansad Adarsh Gram Yojana', ministry: 'Ministry of Rural Development', description: 'Model villages development program' },
  ];

  for (const scheme of schemes) {
    const created = await prisma.scheme.upsert({
      where: { code: scheme.code },
      update: {},
      create: scheme,
    });
    console.log('✅ Scheme:', created.code);
  }

  const allSchemes = await prisma.scheme.findMany();

  // Scheme-specific KPI definitions
  const schemeKPIs = {
    PMAY: [
      { name: 'Total Units Built', min: 80000, max: 150000, target: 100000 },
      { name: 'Beneficiaries Aided', min: 60000, max: 100000, target: 80000 },
      { name: 'Completion Rate', min: 60, max: 95, target: 85 },
    ],
    MGNREGS: [
      { name: 'Person Days Generated', min: 300000, max: 500000, target: 400000 },
      { name: 'Total Beneficiaries', min: 50000, max: 100000, target: 75000 },
      { name: 'Completion Rate', min: 60, max: 90, target: 80 },
    ],
    PMGSY: [
      { name: 'Road Length Built', min: 1200, max: 2000, target: 1500 },
      { name: 'Investment Made', min: 400000, max: 1000000, target: 700000 },
      { name: 'Villages Connected', min: 200, max: 500, target: 350 },
    ],
    NRLM: [
      { name: 'SHGs Formed', min: 6000, max: 10000, target: 8000 },
      { name: 'Loan Disbursed', min: 50000000, max: 100000000, target: 75000000 },
      { name: 'Livelihoods Improved', min: 10000, max: 50000, target: 30000 },
    ],
    'DDU-GKY': [
      { name: 'Candidates Trained', min: 30000, max: 50000, target: 40000 },
      { name: 'Employment Provided', min: 20000, max: 40000, target: 30000 },
      { name: 'Placement Rate', min: 60, max: 85, target: 75 },
    ],
    SAGY: [
      { name: 'Villages Developed', min: 70, max: 150, target: 100 },
      { name: 'Infrastructure Created', min: 200, max: 500, target: 350 },
      { name: 'Population Benefited', min: 30000, max: 100000, target: 65000 },
    ],
  };

  // Create KPI definitions
  for (const scheme of allSchemes) {
    const kpiList = schemeKPIs[scheme.code] || [];
    for (const kpiDef of kpiList) {
      try {
        await prisma.kPIDefinition.create({
          data: {
            scheme_id: scheme.id,
            kpi_name: kpiDef.name,
            unit: 'unit',
            data_type: 'numeric',
            target_value: kpiDef.target,
            frequency: 'daily',
          },
        });
        console.log(`  ✅ KPI: ${scheme.code} - ${kpiDef.name}`);
      } catch (e) {}
    }
  }

  // Generate 1080 KPI VALUES for 30 days
  console.log('\n📊 Generating 1080 KPI values (30-day history)...');
  const states = await prisma.state.findMany().catch(() => []);

  // If no states exist, create some
  if (states.length === 0) {
    const stateNames = ['Maharashtra', 'Tamil Nadu', 'Karnataka', 'Uttar Pradesh', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Telangana', 'Andhra Pradesh', 'West Bengal'];
    for (const name of stateNames) {
      await prisma.state.create({
        data: { name, code: name.slice(0, 2).toUpperCase() },
      }).catch(() => {});
    }
  }

  const statesToUse = await prisma.state.findMany().catch(() => []);
  console.log(`Using ${statesToUse.length} states`);

  let totalRecords = 0;
  const today = new Date();

  for (const scheme of allSchemes) {
    const kpiDefs = await prisma.kPIDefinition.findMany({ where: { scheme_id: scheme.id } });

    for (const kpi of kpiDefs) {
      for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        date.setHours(0, 0, 0, 0);

        // Create data for 3 random states per day
        const randomStates = statesToUse.sort(() => Math.random() - 0.5).slice(0, Math.min(3, statesToUse.length));

        for (const state of randomStates) {
          const baseValue = kpi.target_value ? (Number(kpi.target_value) * 0.75) : 100;
          const randomFactor = 0.7 + Math.random() * 0.5; // 70% to 120% of base
          const value = Math.round(baseValue * randomFactor);
          const performance = kpi.target_value ? (value / Number(kpi.target_value)) * 100 : 50;
          const status = performance >= 80 ? 'on_track' : performance >= 50 ? 'at_risk' : 'critical';

          await prisma.kPIValue.create({
            data: {
              kpi_id: kpi.id,
              state_id: state.id,
              value: value.toString(),
              target_value: kpi.target_value?.toString() || '100',
              date,
              status,
            },
          }).catch(() => {});

          totalRecords++;
        }
      }
    }
  }

  console.log(`✅ Created ${totalRecords} KPI values`);
  console.log('\n✅ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
