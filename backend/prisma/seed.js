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
      state_access: null, // NULL = all-India access
      is_active: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create analyst user
  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@govschemes.in' },
    update: {},
    create: {
      email: 'analyst@govschemes.in',
      password_hash: hashedPassword,
      full_name: 'Analyst',
      role: 'ANALYST',
      state_access: null, // NULL = all-India access
      is_active: true,
    },
  });

  console.log('✅ Analyst user created:', analyst.email);

  // Create 6 government schemes
  const schemes = [
    {
      code: 'PMAY',
      name: 'Pradhan Mantri Awas Yojana',
      ministry: 'Ministry of Housing and Urban Affairs',
      description: 'Housing scheme for economically weaker sections',
    },
    {
      code: 'MGNREGS',
      name: 'Mahatma Gandhi National Rural Employment Guarantee Scheme',
      ministry: 'Ministry of Rural Development',
      description: 'Rural employment guarantee scheme',
    },
    {
      code: 'PMGSY',
      name: 'Pradhan Mantri Gram Sadak Yojana',
      ministry: 'Ministry of Rural Development',
      description: 'Rural roads development scheme',
    },
    {
      code: 'NRLM',
      name: 'National Rural Livelihood Mission',
      ministry: 'Ministry of Rural Development',
      description: 'Rural livelihoods and poverty reduction',
    },
    {
      code: 'DDU-GKY',
      name: 'Deen Dayal Upadhyaya Gram Jyoti Yojana',
      ministry: 'Ministry of Skill Development',
      description: 'Skill development and employment scheme',
    },
    {
      code: 'SAGY',
      name: 'Sansad Adarsh Gram Yojana',
      ministry: 'Ministry of Rural Development',
      description: 'Model villages development program',
    },
  ];

  for (const scheme of schemes) {
    const created = await prisma.scheme.upsert({
      where: { code: scheme.code },
      update: {},
      create: scheme,
    });
    console.log('✅ Scheme created:', created.name);
  }

  // Create KPI definitions
  const kpis = [
    { code: 'BUDGET', name: 'Total Budget Allocated', unit: 'Crores', target: 100 },
    { code: 'COMPLETION', name: 'Completion Rate', unit: '%', target: 80 },
    { code: 'BENEFICIARIES', name: 'Total Beneficiaries', unit: 'Count', target: 1000000 },
    { code: 'DISBURSED', name: 'Amount Disbursed', unit: 'Crores', target: 90 },
    { code: 'APPLICATIONS', name: 'Applications Received', unit: 'Count', target: 500000 },
    { code: 'APPROVED', name: 'Applications Approved', unit: 'Count', target: 400000 },
  ];

  for (const kpi of kpis) {
    const created = await prisma.kpiDefinition.upsert({
      where: { code: kpi.code },
      update: {},
      create: kpi,
    });
    console.log('✅ KPI defined:', created.name);
  }

  console.log('\n✅ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
