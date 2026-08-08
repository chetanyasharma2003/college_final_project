import { PrismaClient } from '@prisma/client';

let prisma;

// Ensure only one PrismaClient instance exists (singleton pattern)
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to ensure singleton
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['error', 'warn'], // Only log errors in development
    });
  }
  prisma = global.prisma;
}

export default prisma;
