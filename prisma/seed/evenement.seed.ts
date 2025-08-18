import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function evenementsSeed() {
  console.log('Début du seeding des événements...');

  const authorId = 'f6554cf0-4827-4e66-8f87-e0ef04bfd615'; // À adapter selon tes utilisateurs

  const datas = [
    {
      title: 'Conférence Tech 2025',
      description: 'Une conférence sur les dernières tendances technologiques.',
      eventDate: new Date('2025-09-15T09:00:00Z'),
      location: 'Paris',
      imageUrl: ['https://example.com/images/tech2025.jpg'],
      published: true,
      authorId,
    },
    {
      title: 'Atelier Développement Web',
      description: 'Atelier pratique pour apprendre le développement web moderne.',
      eventDate: new Date('2025-10-10T14:00:00Z'),
      location: 'Lyon',
      imageUrl: ['https://example.com/images/webworkshop.jpg'],
      published: false,
      authorId,
    },
    {
      title: 'Salon de l\'Emploi',
      description: 'Rencontrez des employeurs et trouvez votre prochain job.',
      eventDate: new Date('2025-11-05T10:00:00Z'),
      location: 'Marseille',
      imageUrl: ['https://example.com/images/jobfair.jpg'],
      published: true,
      authorId,
    },
    {
      title: 'Hackathon Étudiant',
      description: 'Compétition de programmation pour étudiants.',
      eventDate: new Date('2025-12-01T08:00:00Z'),
      location: 'Toulouse',
      imageUrl: ['https://example.com/images/hackathon.jpg'],
      published: false,
      authorId,
    },
    {
      title: 'Forum des Associations',
      description: 'Découvrez les associations locales et leurs activités.',
      eventDate: new Date('2026-01-20T13:30:00Z'),
      location: 'Bordeaux',
      imageUrl: ['https://example.com/images/forum.jpg'],
      published: true,
      authorId,
    },
  ];

  for (const data of datas) {
    try {
      await prisma.evenement.create({ data });
      console.log(`Événement "${data.title}" créé avec succès.`);
    } catch (error) {
      console.error(`Erreur lors de la création de l'événement "${data.title}":`, error);
      throw error;
    }
  }

  console.log('Fin du seeding des événements.');
}