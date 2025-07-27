import { Prisma, PrismaClient, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

export async function serviceSeed() {
  console.log('Début du seeding des services...');

  const datas: Prisma.ServiceCreateInput[] = [
    {
      type: ServiceType.VISA,
      name: 'Demande de Visa',
      description: 'Demande de visa pour un court ou long séjour.',
      defaultPrice: 35000.0, // Prix du court séjour, le prix est multiplié par 2 pour les lo,gs séjours
      isPriceVariable: true, // Le prix varie en fonction du type de visa
    },
    {
      type: ServiceType.BIRTH_ACT_APPLICATION,
      name: "Demande d'Acte de Naissance",
      description: "Demande d'un acte de naissance ou de son renouvellement.",
      defaultPrice: 3000.0,
      isPriceVariable: false,
    },
    {
      type: ServiceType.CONSULAR_CARD,
      name: 'Demande de Carte Consulaire',
      description: "Demande ou renouvellement de la carte consulaire de l'Ambassade.",
      defaultPrice: 10000.0,
      isPriceVariable: false,
    },
    {
      type: ServiceType.LAISSEZ_PASSER,
      name: 'Demande de Laissez-Passer',
      description: 'Demande de document de voyage en cas de perte de passeport.',
      defaultPrice: 10000.0,
      isPriceVariable: false,
    },
    {
      type: ServiceType.MARRIAGE_CAPACITY_ACT,
      name: "Demande d'Acte de Capacité de Mariage",
      description: 'Demande du certificat de capacité matrimoniale.',
      defaultPrice: 5000.0,
      isPriceVariable: false,
    },
    {
      type: ServiceType.DEATH_ACT_APPLICATION,
      name: "Demande d'Acte de Décès",
      description: "Demande d'un acte de décès.",
      defaultPrice: 5000.0,
      isPriceVariable: false,
    },
    {
      type: ServiceType.POWER_OF_ATTORNEY,
      name: 'Demande de Procuration',
      description: 'Demande pour établir une procuration.',
      defaultPrice: 5000.0,
      isPriceVariable: false,
    },
    {
      type: ServiceType.NATIONALITY_CERTIFICATE,
      name: 'Demande de Certificat de Nationalité',
      description: 'Demande de certificat de nationalité.',
      defaultPrice: 5000.0,
      isPriceVariable: false,
    },
  ];

  for (const data of datas) {
    try {
      await prisma.service.upsert({
        where: { type: data.type }, // Cherche un service par son type unique
        update: data, // Met à jour tous les champs
        create: data, // Crée tous les champs
      });
      console.log(`Service ${data.name} upserted avec succès.`);
    } catch (error) {
      console.error(
        `Erreur lors de l'upsert du service ${data.name}:`,
        error,
      );
      throw error;
    }
  }
  console.log('Fin du seeding des services.');
}