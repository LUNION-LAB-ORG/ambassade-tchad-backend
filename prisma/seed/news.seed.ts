import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function newsSeed() {
  console.log('Début du seeding des actualités...');

  const newsData = [
    {
      title: "Inauguration de l'Ambassade du Tchad à Paris",
      content:
        "L'Ambassade du Tchad à Paris a été inaugurée avec succès. Cet événement marque une étape importante dans les relations diplomatiques entre le Tchad et la France.",
      imageUrls: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ],
      published: true,
      authorId: '1', 
    },
    {
      title: 'Nouvelles mesures sanitaires pour les voyageurs',
      content:
        'Le gouvernement tchadien a mis en place de nouvelles mesures sanitaires pour les voyageurs entrant au Tchad. Veuillez consulter notre site web pour plus de détails.',
      imageUrls: ['https://example.com/image3.jpg'],
      published: true,
      authorId: '2',
    },
    {
      title: 'Visite officielle du Président à N\'Djaména',
      content:
        'Le Président a effectué une visite officielle à N\'Djaména, saluée par les citoyens et les membres du gouvernement.',
      imageUrls: [
        'https://example.com/image3.jpg',
        'https://example.com/image4.jpg',
        'https://example.com/image5.jpg',
      ],
      published: true,
      authorId: '3',
    },
  ];

  for (const news of newsData) {
    await prisma.news.create({ data: news });
  }

  console.log('Seeding des actualités terminé.');
}
