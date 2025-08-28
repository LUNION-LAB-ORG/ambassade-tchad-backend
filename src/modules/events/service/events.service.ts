import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import { CreateEventsDto } from '../dto/create-events.dto';
import { UpdateEventsDto } from '../dto/update-events.dto';
import { Prisma, Evenement as EventModel } from '@prisma/client';
import { QueryResponseDto } from 'src/common/dto/query-response.dto';
import { QueryEventsDto } from '../dto/query-events.dto';
import { processUploadedFiles } from 'src/common/utils/processUploadedFiles';
import { deleteFilesFromSystem } from 'src/common/utils/deleteFilesFromSystem';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) { }

  async create(
    dto: CreateEventsDto,
    authorId: string,
    files: Express.Multer.File[] = []
  ) {

    const imageUrls = files.length > 0
      ? await processUploadedFiles(files, './uploads/events')
      : [];

    return this.prisma.evenement.create({
      data: {
        ...dto,
        imageUrl: imageUrls,
        authorId: authorId
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }
  async findAllWithFilters(filters: QueryEventsDto): Promise<QueryResponseDto<EventModel>> {
    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const skip = limit * (page - 1)
    const where: Prisma.EvenementWhereInput = {}

    if (filters.title) { where.title = { contains: filters.title, mode: 'insensitive' } }

    if (filters.authorId) { where.id = filters.authorId }

    if (filters.published) {
      where.published = filters.published
    }

    if (filters.eventDate) { where.eventDate = { gte: new Date(filters.eventDate) } }

    if (filters.fromDate && filters.toDate) {
      where.createdAt = {
        gte: new Date(filters.fromDate),
        lte: new Date(filters.toDate)
      }
    }

    const [total_event, all_event] = await Promise.all([
      this.prisma.evenement.count({ where }),
      this.prisma.evenement.findMany({
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      })
    ])

    const total_page = Math.ceil(total_event / limit)
    return ({
      data: all_event,
      meta: {
        total: total_event,
        page: page,
        limit: limit,
        totalPages: total_page
      }
    })

  }

  async getStats() {
    const total = await this.prisma.evenement.count();
    const published = await this.prisma.evenement.count({ where: { published: true } });
    const unpublished = total - published;

    const byAuthor = await this.prisma.evenement.groupBy({
      by: ['authorId'],
      _count: { id: true },
    });

    return {
      total,
      published,
      unpublished,
      byAuthor,
    };
  }

  async findOne(id: string) {
    const evenement = await this.prisma.evenement.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!evenement) {
      throw new NotFoundException(`Événement avec l'ID ${id} introuvable`);
    }

    return evenement;
  }

  async update(id: string, UpdateEventsDto: UpdateEventsDto, userId: string, files?: Express.Multer.File[]) {
    const event = await this.findOne(id);

    // Récupérer les anciennes URLs d'images
    const oldImageUrls = event.imageUrl || [];

    let newImageUrls: string[] = [];

    // Si de nouveaux fichiers sont fournis, on remplace TOUTES les images
    if (files && files.length > 0) {
      console.log(`Mise à jour avec ${files.length} nouveaux fichiers`);
      console.log('Fichiers reçus:', files.map(f => ({
        originalname: f.originalname,
        filename: f.filename,
        path: f.path
      })));

      // Supprimer les anciens fichiers du système de fichiers
      if (oldImageUrls.length > 0) {
        await deleteFilesFromSystem(oldImageUrls);
      }

      // Traiter les nouveaux fichiers
      newImageUrls = await processUploadedFiles(files, './uploads/events');
    } else {
      // Si aucun nouveau fichier, garder les anciens
      newImageUrls = oldImageUrls;
    }

    // Mettre à jour l'événement avec les nouvelles images
    const updatedEvent = await this.prisma.evenement.update({
      where: { id },
      data: {
        ...UpdateEventsDto,
        imageUrl: newImageUrls
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updatedEvent;
  }

  async remove(id: string, userId: string) {
    const event = await this.findOne(id);

    // Supprimer les fichiers associés du système de fichiers
    if (event.imageUrl && event.imageUrl.length > 0) {
      await deleteFilesFromSystem(event.imageUrl);
    }

    await this.prisma.evenement.delete({
      where: { id },
    });

    return { message: "Événement supprimé avec succès." };
  }

}