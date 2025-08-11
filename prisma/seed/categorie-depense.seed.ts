import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // Simplifié pour le contexte

export async function categoriesDepensesSeed() {
  console.log('Début du seeding des catégories de dépenses...');

  // Définition des données des catégories de dépenses à insérer ou mettre à jour
  const datas: Prisma.ExpenseCategoryCreateInput[] = [
    {
      name: 'Salaires',
      description: 'Dépenses liées aux salaires du personnel.',
      isActive: true,
    },
    {
      name: 'Loyer',
      description: 'Dépenses de location de bureaux et installations.',
      isActive: true,
    },
    {
      name: 'Fournitures de Bureau',
      description: 'Achat de fournitures et équipements de bureau.',
      isActive: true,
    },
    {
      name: 'Voyages et Missions',
      description: 'Frais de déplacement et missions professionnelles.',
      isActive: true,
    },
    {
      name: 'Maintenance Informatique',
      description: 'Maintenance et support des systèmes informatiques.',
      isActive: true,
    },
    {
      name: 'Marketing et Publicité',
      description: 'Dépenses de promotion et publicité.',
      isActive: true,
    },
    {
      name: 'Électricité et Eau',
      description: 'Charges de services publics (électricité, eau).',
      isActive: true,
    },
    {
      name: 'Télécommunications',
      description: 'Frais de téléphone, internet et autres services de communication.',
      isActive: true,
    },
    {
      name: 'Nettoyage et Entretien',
      description: 'Services de nettoyage et entretien des locaux.',
      isActive: true,
    },
    {
      name: 'Assurances',
      description: 'Primes d\'assurance diverses.',
      isActive: true,
    },
    {
      name: 'Formation du Personnel',
      description: 'Coûts liés à la formation et au développement des employés.',
      isActive: true,
    },
    {
      name: 'Remboursement de Prêts',
      description: 'Remboursements de capitaux et intérêts sur les prêts.',
      isActive: true,
    },
    {
      name: 'Amortissements',
      description: 'Dépréciation des actifs immobilisés.',
      isActive: true,
    },
    {
      name: 'Honoraires et Consultations',
      description: 'Rémunération de services professionnels externes (avocats, consultants).',
      isActive: true,
    },
    {
      name: 'Autres Dépenses Opérationnelles',
      description: 'Catégorie pour les dépenses récurrentes non classées.',
      isActive: true,
    },
  ];

  for (const data of datas) {
    try {
      await prisma.expenseCategory.upsert({
        where: { name: data.name },
        update: { ...data },
        create: { ...data },
      });
      console.log(`Catégorie de dépense "${data.name}" upserted avec succès.`);
    } catch (error) {
      console.error(
        `Erreur lors de l'upsert de la catégorie de dépense "${data.name}":`,
        error,
      );
      // Gérer l'erreur de manière plus robuste si nécessaire
      throw error;
    }
  }
  console.log('Fin du seeding des catégories de dépenses.');
}
