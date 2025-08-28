import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import { CreatePhotosDto } from '../dto/create-photos.dto';
import { Photo, Prisma } from '@prisma/client';
import { QueryPhotoDto } from '../dto/query-photo.dto';
import { QueryResponseDto } from 'src/common/dto/query-response.dto';
import { processUploadedFiles } from 'src/common/utils/processUploadedFiles';
import { deleteFilesFromSystem } from 'src/common/utils/deleteFilesFromSystem';

@Injectable()
export class PhotosService {
  constructor(private prisma: PrismaService) { }

  async create(createPhotosDto: CreatePhotosDto, files?: Express.Multer.File[]) {
    const { title, description } = createPhotosDto;

    let imageUrls: string[] = [];

    if (files && files.length > 0) {
      // Utiliser la fonction utilitaire pour traiter les fichiers
      imageUrls = await processUploadedFiles(files, './uploads/photos');
    } else if (createPhotosDto.imageUrl) {
      // Si pas de fichiers mais des URLs fournies
      imageUrls = Array.isArray(createPhotosDto.imageUrl)
        ? createPhotosDto.imageUrl
        : [createPhotosDto.imageUrl];
    }

    return this.prisma.photo.create({
      data: {
        title,
        description,
        imageUrl: imageUrls,
      },
    });
  }

  async findAllWithFilters(filters: QueryPhotoDto): Promise<QueryResponseDto<Photo>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = limit * (page - 1);
    const where: Prisma.PhotoWhereInput = {};

    if (filters.title) {
      where.title = { contains: filters.title, mode: 'insensitive' };
    }
    if (filters.authorId) {
      where.id = filters.authorId;
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

    const [total_photo, all_photo] = await Promise.all([
      this.prisma.photo.count({ where }),
      this.prisma.photo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
    ]);

    const total_page = Math.ceil(total_photo / limit);
    return {
      data: all_photo,
      meta: {
        total: total_photo,
        page: page,
        limit: limit,
        totalPages: total_page,
      },
    };
  }

  async getStats() {
    const total = await this.prisma.photo.count();
    return { total };
  }

  async findOne(id: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id },
    });

    if (!photo) {
      throw new NotFoundException(`Photo avec l'ID ${id} introuvable`);
    }

    return photo;
  }

  async update(
    id: string,
    updatePhotosDto: CreatePhotosDto,
    files?: Express.Multer.File[]
  ) {
    const { title, description } = updatePhotosDto;

    const photo = await this.findOne(id); // Vérifie que la photo existe

    // Récupérer les anciennes URLs d'images
    const oldImageUrls = photo.imageUrl || [];
    let newImageUrls: string[] = [];

    // Si de nouveaux fichiers sont fournis, on remplace TOUTES les images
    if (files && files.length > 0) {
      console.log(`Mise à jour photo avec ${files.length} nouveaux fichiers`);

      // Supprimer les anciens fichiers du système de fichiers
      if (oldImageUrls.length > 0) {
        await deleteFilesFromSystem(oldImageUrls);
      }

      // Traiter les nouveaux fichiers
      newImageUrls = await processUploadedFiles(files, './uploads/photos');
    } else if (updatePhotosDto.imageUrl) {
      // Si pas de fichiers mais des URLs fournies, remplacer aussi
      if (oldImageUrls.length > 0) {
        await deleteFilesFromSystem(oldImageUrls);
      }
      newImageUrls = Array.isArray(updatePhotosDto.imageUrl)
        ? updatePhotosDto.imageUrl
        : [updatePhotosDto.imageUrl];
    } else {
      // Si aucun nouveau fichier ni URL, garder les anciens
      newImageUrls = oldImageUrls;
    }

    const updatedPhoto = await this.prisma.photo.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl: newImageUrls,
      },
    });

    return {
      message: "Photo mise à jour avec succès.",
      data: updatedPhoto,
    };
  }

  async remove(id: string) {
    const photo = await this.findOne(id);

    // Supprimer les fichiers associés du système de fichiers
    if (photo.imageUrl && photo.imageUrl.length > 0) {
      await deleteFilesFromSystem(photo.imageUrl);
    }

    await this.prisma.photo.delete({
      where: { id },
    });

    return { message: "Photo supprimée avec succès." };
  }
}