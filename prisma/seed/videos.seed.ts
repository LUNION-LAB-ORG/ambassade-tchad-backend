
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function videosSeed() {
  console.log('Début du seeding des vidéos...');
 const datas: Prisma.VideoCreateInput[] = [
      {
        title: 'Introduction à TypeScript',
        description: 'Une vidéo expliquant les bases de TypeScript et ses avantages.',
        youtubeUrl: 'https://www.youtube.com/watch?v=BCg4U1FzODs',
      },
      {
        "title": "Découverte de Prisma ORM",
        "description": "Présentation des fonctionnalités clés de Prisma pour Node.js.",
        "youtubeUrl": "https://www.youtube.com/watch?v=RebA5J-rlwg",
      },
      {
        "title": "NestJS pour les débutants",
        "description": "Apprendre à créer une API REST avec NestJS.",
        "youtubeUrl": "https://www.youtube.com/watch?v=wqhNoDE6pb4",
      },
      {
        "title": "React Hooks expliqué",
        "description": "Comprendre useState, useEffect et autres hooks.",
        "youtubeUrl": "https://www.youtube.com/watch?v=dpw9EHDh2bM",
      },
      {
        "title": "Introduction à Docker",
        "description": "Comment créer et exécuter des conteneurs avec Docker.",
        "youtubeUrl": "https://www.youtube.com/watch?v=Gjnup-PuquQ",
      },
      {
        "title": "Git et GitHub pour débutants",
        "description": "Les bases de Git et comment collaborer sur GitHub.",
        "youtubeUrl": "https://www.youtube.com/watch?v=RGOj5yH7evk",
      },
  ];

  for (const data of datas) {
    try {
      await prisma.video.upsert({
        where: { id: data.id },
        update: data,
        create: data,
      });
      console.log(`Video "${data.title}" upserted avec succès.`);
    } catch (error) {
      console.error(`Erreur lors de l'upsert de la video "${data.title}":`, error);
      throw error;
    }
  }
  console.log('Fin du seeding des vidéos.');
}
