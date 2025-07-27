import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import { CreateEventsDto } from '../dto/create-events.dto';
import { UpdateEventsDto } from '../dto/update-events.dto';
import { Prisma, Event as EventModel } from '@prisma/client';
import { QueryResponseDto } from 'src/common/dto/query-response.dto';
import { QueryEventsDto } from '../dto/query-events.dto';

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

  async findAllWithFilters(filters: QueryEventsDto ):Promise<QueryResponseDto<EventModel>> {
     const page = filters.page ?? 1
     const limit = filters.limit ?? 10
     const skip = limit * (page - 1)
     const where : Prisma.EventWhereInput = {}
     if(filters.title){where.title = {contains:filters.title, mode: 'insensitive'}}
     if(filters.authorId){where.id = filters.authorId}
     if(typeof filters.published === 'boolean'){where.published = filters.published}
     if(filters.toDate){where.createdAt= {lte:new Date(filters.toDate)}}
     if(filters.fromDate){where.createdAt= {gte:new Date(filters.fromDate)}}
     const [total_event, all_event] = await Promise.all([ 
       this.prisma.event.count({where}), 
       this.prisma.event.findMany({
         where,
         orderBy: { createdAt: 'desc' },
         take : limit,
         skip
       })
     ])
 
     const total_page = Math.ceil(total_event / limit)
     return({
       data : all_event,
       meta :{
         total: total_event,
         page : page,
         limit : limit,
         totalPages : total_page
       }
     })
 
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
    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: updateEventsDto,
    });

    return {
      message: "Événement mis à jour avec succès.",
      data: updatedEvent,
    };
  }

  async remove(id: string, userId: string) {
    const event = await this.findOne(id);

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: "Événement supprimé avec succès." };
  }
}
