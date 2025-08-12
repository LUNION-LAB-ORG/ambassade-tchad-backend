import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import helmet from 'helmet';
import * as compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PrismaExceptionFilter } from 'src/database/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // injecter globalement ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Appliquer le filtre globalement à toute l'application
  app.useGlobalFilters(new PrismaExceptionFilter());

  // Security middleware
  app.use(helmet());

  // Compression
  app.use(compression());

  // CORS
  app.enableCors({
    origin: ['https://ambassade-tchad-backoffice.vercel.app', 'http://localhost:3020', 'http://localhost:3001', 'http://localhost:3000', 'http://localhost:3002'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Configuration du dossier de téléchargement
  const uploadsPath = join(__dirname, '..', '..', 'uploads');
  console.log('Uploads directory path:', uploadsPath);
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads'
  });

  // Liaison du Swagger
  const config = new DocumentBuilder()
    .setTitle('Ambassade Tchad API')
    .setDescription('The Ambassade Tchad API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  // Lancer le serveur
  const port = process.env.PORT ?? 3022;
  await app.listen(port);

  // 👇 Ajoute ceci pour afficher l’URL dans la console
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}


bootstrap();
