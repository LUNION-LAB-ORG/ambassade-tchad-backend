import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateNewsDto } from '../dto/create-news.dto';
import { UpdateNewsDto } from '../dto/update-news.dto';
import { PrismaService } from 'src/database/services/prisma.service';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async create(createNewsDto: CreateNewsDto, authorId: string) {
    return this.prisma.news.create({
      data: {
        ...createNewsDto,
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
    return this.prisma.news.findMany({
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

  async findOne(id: string) {
    const news = await this.prisma.news.findUnique({
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

    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }

    return news;
  }

  // filtre des news
   async findAllWithFilters(filters: {
    title?: string;
    authorId?: string;
    published?: boolean;
    // fromDate?: Date;
    toDate?: Date;
  }) {
    return this.prisma.news.findMany({
      where: {
        title: filters.title
          ? { contains: filters.title, mode: 'insensitive' }
          : undefined,
        authorId: filters.authorId,
        published: filters.published,
        createdAt: {
          // gte: filters.fromDate,
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

  // statistique des news

  async getStats() {
    const total = await this.prisma.news.count();
    const published = await this.prisma.news.count({ where: { published: true } });
    const unpublished = total - published;

    const byAuthor = await this.prisma.news.groupBy({
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
  async update(id: string, updateNewsDto: UpdateNewsDto, userId: string) {
    const news = await this.findOne(id);

    // if (news.authorId !== userId) {
    //   throw new ForbiddenException('You can only update your own news');
    // }

    return this.prisma.news.update({
      where: { id },
      data: updateNewsDto,
    });
  }

  async remove(id: string, userId: string) {
    const news = await this.findOne(id);

    if (news.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own news');
    }

    return this.prisma.news.delete({
      where: { id },
    });
  }
}
