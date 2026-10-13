import { PrismaClient } from '@prisma/client';

const g = globalThis as unknown as { __flsPrisma?: PrismaClient };

/** Client Prisma partagé (singleton, évite les connexions multiples en développement). */
export const prisma: PrismaClient = g.__flsPrisma ?? new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'] });
if (process.env.NODE_ENV !== 'production') g.__flsPrisma = prisma;
