import type { Repo } from './types';
export * from './types';

let instance: Repo | null = null;

/**
 * Source de données : PostgreSQL via Prisma (par défaut dès que DATABASE_URL est défini)
 * ou mode démo en mémoire (DATA_SOURCE=demo).
 */
export async function getRepo(): Promise<Repo> {
  if (instance) return instance;
  const useDemo = process.env.DATA_SOURCE === 'demo' || !process.env.DATABASE_URL;
  if (useDemo) {
    const { createDemoRepo } = await import('./demo-repo');
    instance = createDemoRepo();
  } else {
    const [{ createPrismaRepo }, { prisma }] = await Promise.all([import('./prisma-repo'), import('../client')]);
    instance = createPrismaRepo(prisma);
  }
  return instance;
}
