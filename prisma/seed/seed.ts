import { PrismaClient } from '@prisma/client';
import { userSeed } from './user.seed';
import { serviceSeed } from './service.seed';

const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function main() {
  console.log('--- Début du processus de seeding global ---');

  // Exécution du seeder des utilisateurs
  await userSeed().catch((e) => {
    console.error('Erreur lors du seeding des utilisateurs:', e);
    process.exit(1);
  });

  // Exécution du seeder des services
  await serviceSeed().catch((e) => {
    console.error('Erreur lors du seeding des services:', e);
    process.exit(1);
  });

  console.log('--- Processus de seeding global terminé avec succès ---');
}

// Lancement du processus de seeding
main()
  .catch((e) => {
    console.error('Erreur inattendue dans le processus de seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Déconnexion de Prisma Demandeur.');
  });