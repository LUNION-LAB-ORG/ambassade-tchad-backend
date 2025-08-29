import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNewsDto } from '../dto/create-news.dto';
import { UpdateNewsDto } from '../dto/update-news.dto';
import { PrismaService } from 'src/database/services/prisma.service';
import { QueryNewsDto } from '../dto/query-news.dto';
import { QueryResponseDto } from 'src/common/dto/query-response.dto';
import { News, Prisma } from '@prisma/client';
import { processUploadedFiles } from 'src/common/utils/processUploadedFiles';
import { deleteFilesFromSystem } from 'src/common/utils/deleteFilesFromSystem';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) { }

  async create(createNewsDto: CreateNewsDto, authorId: string, files: Express.Multer.File[] = []) {
    // Traitement des fichiers avec la fonction utilitaire
    const imageUrls = await processUploadedFiles(files, './uploads/news');

    return this.prisma.news.create({
      data: {
        ...createNewsDto,
        imageUrls: imageUrls,
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
      throw new NotFoundException(`News avec l'ID ${id} introuvable`);
    }

    return news;
  }

  async findAllWithFilters(filters: QueryNewsDto): Promise<QueryResponseDto<News>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = limit * (page - 1);
    const where: Prisma.NewsWhereInput = {};

    if (filters.title) {
      where.title = { contains: filters.title, mode: 'insensitive' };
    }
    if (filters.authorId) {
      where.authorId = filters.authorId;
    }
    if (typeof filters.published === 'boolean') {
      where.published = filters.published;
    }
    if (filters.fromDate && filters.toDate) {
      where.createdAt = {
        gte: new Date(filters.fromDate),
        lte: new Date(filters.toDate)
      };
    } else {
      if (filters.fromDate) {
        where.createdAt = { gte: new Date(filters.fromDate) };
      }
      if (filters.toDate) {
        where.createdAt = { lte: new Date(filters.toDate) };
      }
    }

    const [total_news, all_news] = await Promise.all([
      this.prisma.news.count({ where }),
      this.prisma.news.findMany({
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
    ]);

    const total_page = Math.ceil(total_news / limit);
    return {
      data: all_news,
      meta: {
        total: total_news,
        page: page,
        limit: limit,
        totalPages: total_page
      }
    };
  }

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

  async update(id: string, updateNewsDto: UpdateNewsDto, userId: string, files?: Express.Multer.File[]) {
    const news = await this.findOne(id);

    // Récupérer les anciennes URLs d'images
    const oldImageUrls = news.imageUrls || [];
    let newImageUrls: string[] = [];

    // Si de nouveaux fichiers sont fournis, on remplace TOUTES les images
    if (files && files.length > 0) {
      console.log(`Mise à jour news avec ${files.length} nouveaux fichiers`);

      // Supprimer les anciens fichiers du système de fichiers
      if (oldImageUrls.length > 0) {
        await deleteFilesFromSystem(oldImageUrls);
      }

      // Traiter les nouveaux fichiers
      newImageUrls = await processUploadedFiles(files, './uploads/news');
    } else {
      // Si aucun nouveau fichier, garder les anciens
      newImageUrls = oldImageUrls;
    }

    // Mettre à jour la news avec les nouvelles images
    const updatedNews = await this.prisma.news.update({
      where: { id },
      data: {
        ...updateNewsDto,
        imageUrls: newImageUrls,
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

    return updatedNews;
  }

  async remove(id: string, userId: string) {
    const news = await this.findOne(id);

    // Vérification des permissions (si nécessaire)
    // if (news.authorId !== userId) {
    //   throw new ForbiddenException('Vous ne pouvez supprimer que vos propres news');
    // }

    // Supprimer les fichiers associés du système de fichiers
    if (news.imageUrls && news.imageUrls.length > 0) {
      await deleteFilesFromSystem(news.imageUrls);
    }

    await this.prisma.news.delete({
      where: { id },
    });

    return { message: "News supprimée avec succès." };
  }
}