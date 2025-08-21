import { PrismaClient } from '@prisma/client';
import { userSeed } from './user.seed';
import { serviceSeed } from './service.seed';
import { categoriesDepensesSeed } from './categorie-depense.seed';
import { videosSeed } from './videos.seed';

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

  // Exécution du seeder des catégories de dépenses
  await categoriesDepensesSeed().catch((e) => {
    console.error('Erreur lors du seeding des catégories de dépenses:', e);
    process.exit(1);
  });

  console.log('--- Processus de seeding global terminé avec succès ---');
  await videosSeed().catch((e) => {
    console.error('Erreur lors du seeding des vidéos:', e);
    process.exit(1);
  });

  console.log('--- Processus de seeding global VIDEO terminé avec succès ---');
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