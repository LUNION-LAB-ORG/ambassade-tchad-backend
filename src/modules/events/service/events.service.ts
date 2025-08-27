import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import { CreateEventsDto } from '../dto/create-events.dto';
import { UpdateEventsDto } from '../dto/update-events.dto';
import { Prisma, Evenement as EventModel } from '@prisma/client';
import { QueryResponseDto } from 'src/common/dto/query-response.dto';
import { QueryEventsDto } from '../dto/query-events.dto';
import { GenerateConfigService } from 'src/common/services/generate-config.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) { }

  async create(
    dto: CreateEventsDto,
    authorId: string,
    files: Express.Multer.File[] = []
  ) {

    const imageUrls = files.length > 0
      ? await this.processUploadedFiles(files)
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

  private async processUploadedFiles(files: Express.Multer.File[]): Promise<string[]> {
    const fileMap: Record<string, string> = {};

    files.forEach((file, i) => {
      fileMap[`image_${i}`] = file.path;
    });

    const compressedPaths = await GenerateConfigService.compressImages(
      fileMap,
      './uploads/events',
      { quality: 75, width: 1280, height: 720, fit: 'inside' },
      true
    );

    return Object.values(compressedPaths);
  }

  async findAllWithFilters(filters: QueryEventsDto): Promise<QueryResponseDto<EventModel>> {
    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const skip = limit * (page - 1)
    const where: Prisma.EvenementWhereInput = {}
    if (filters.title) { where.title = { contains: filters.title, mode: 'insensitive' } }
    if (filters.authorId) { where.id = filters.authorId }
    if (typeof filters.published === 'boolean') { where.published = filters.published }
    if (filters.toDate) { where.createdAt = { lte: new Date(filters.toDate) } }
    if (filters.fromDate) { where.createdAt = { gte: new Date(filters.fromDate) } }
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
    const events = await this.findOne(id);
    // Traitement des fichiers si présents
    let imageUrls = events.imageUrl; // Garder les anciennes images
    if (files && files.length > 0) {
      const eventImageUrls = await this.processUploadedFiles(files);
      imageUrls = [...imageUrls, ...eventImageUrls]; // Ajouter aux anciennes
    }

    const events_new = this.prisma.evenement.update({
      where: { id },
      data: {
        ...UpdateEventsDto,
        imageUrl: imageUrls
      },
    });
    return events_new;
  }

  async remove(id: string, userId: string) {
    const event = await this.findOne(id);

    await this.prisma.evenement.delete({
      where: { id },
    });

    return { message: "Événement supprimé avec succès." };
  }
}
