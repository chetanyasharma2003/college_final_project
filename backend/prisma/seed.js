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

  // Get all schemes
  const allSchemes = await prisma.scheme.findMany();

  // Create KPI definitions for each scheme
  const kpiTemplates = [
    { kpi_name: 'Budget Allocated', unit: 'Crores', data_type: 'currency', target_value: 100 },
    { kpi_name: 'Completion Rate', unit: '%', data_type: 'percentage', target_value: 80 },
    { kpi_name: 'Beneficiaries', unit: 'Count', data_type: 'numeric', target_value: 1000000 },
    { kpi_name: 'Amount Disbursed', unit: 'Crores', data_type: 'currency', target_value: 90 },
  ];

  for (const scheme of allSchemes) {
    for (const kpiTemplate of kpiTemplates) {
      try {
        const created = await prisma.kpiDefinition.create({
          data: {
            scheme_id: scheme.id,
            ...kpiTemplate,
            frequency: 'monthly',
          },
        });
        console.log(`✅ KPI for ${scheme.code}:`, created.kpi_name);
      } catch (e) {
        // KPI already exists, skip
      }
    }
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
