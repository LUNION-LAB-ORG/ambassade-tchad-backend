import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import { CreateEventsDto } from '../dto/create-events.dto';
import { UpdateEventsDto } from '../dto/update-events.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventsDto: CreateEventsDto, authorId: string) {
    return this.prisma.event.create({
      data: {
        ...createEventsDto,
        authorId,
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
  }

  async findAll(includeUnpublished = false) {
    return this.prisma.event.findMany({
      where: includeUnpublished ? {} : { published: true },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllWithFilters(filters: {
    title?: string;
    authorId?: string;
    published?: boolean;
    fromDate?: Date;
    toDate?: Date;
  }) {
    return this.prisma.event.findMany({
      where: {
        title: filters.title
          ? { contains: filters.title, mode: 'insensitive' }
          : undefined,
        authorId: filters.authorId,
        published: filters.published,
        createdAt: {
          gte: filters.fromDate,
          lte: filters.toDate,
        },
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const total = await this.prisma.event.count();
    const published = await this.prisma.event.count({ where: { published: true } });
    const unpublished = total - published;

    const byAuthor = await this.prisma.event.groupBy({
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
    const event = await this.prisma.event.findUnique({
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

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} introuvable`);
    }

    return event;
  }

  async update(id: string, updateEventsDto: UpdateEventsDto, userId: string) {
    const event = await this.findOne(id);

    // Tout le monde peut modifier, plus besoin de vérifier l’auteur
    return this.prisma.event.update({
      where: { id },
      data: updateEventsDto,
    });
  }

  async remove(id: string, userId: string) {
    const event = await this.findOne(id);

    return this.prisma.event.delete({
      where: { id },
    });
  }
}
