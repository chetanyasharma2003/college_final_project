import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCompletionRates() {
  try {
    console.log('Updating completion rates...');
    
    // Update PMAY Completion Rate (1 -> 65)
    await prisma.kPIValue.updateMany({
      where: { kpi_id: 1 },
      data: { value: 65 }
    });
    console.log('✅ PMAY Completion Rate updated to 65%');
    
    // Update PMGSY Completion Rate (27 -> 55)
    await prisma.kPIValue.updateMany({
      where: { kpi_id: 27 },
      data: { value: 55 }
    });
    console.log('✅ PMGSY Completion Rate updated to 55%');
    
    // Update NRLM Recovery Rate (32 -> 65)
    await prisma.kPIValue.updateMany({
      where: { kpi_id: 32 },
      data: { value: 65 }
    });
    console.log('✅ NRLM Recovery Rate updated to 65%');
    
    console.log('All updates complete!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateCompletionRates();
