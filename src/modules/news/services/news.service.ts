import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateNewsDto } from '../dto/create-news.dto';
import { UpdateNewsDto } from '../dto/update-news.dto';
import { PrismaService } from 'src/database/services/prisma.service';
import { QueryNewsDto } from '../dto/query-news.dto';
import { QueryResponseDto } from 'src/common/dto/query-response.dto';
import { News, Prisma } from '@prisma/client';

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
  async findAllWithFilters(filters: QueryNewsDto ):Promise<QueryResponseDto<News>> {
      const page = filters.page ?? 1
      const limit = filters.limit ?? 10
      const skip = limit * (page - 1)
      const where : Prisma.NewsWhereInput = {}
      if(filters.title){where.title = {contains:filters.title, mode: 'insensitive'}}
      if(filters.authorId){where.id = filters.authorId}
      if(typeof filters.published === 'boolean'){where.published = filters.published}
      if(filters.toDate){where.createdAt= {lte:new Date(filters.toDate)}}
      if(filters.fromDate){where.createdAt= {gte:new Date(filters.fromDate)}}
      const [total_news, all_news] = await Promise.all([ 
        this.prisma.news.count({where}), 
        this.prisma.news.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take : limit,
          skip
        })
      ])
  
      const total_page = Math.ceil(total_news / limit)
      return({
        data : all_news,
        meta :{
          total: total_news,
          page : page,
          limit : limit,
          totalPages : total_page
        }
      })
  
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
