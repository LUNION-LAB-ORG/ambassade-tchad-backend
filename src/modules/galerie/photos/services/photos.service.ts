import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import { CreatePhotosDto } from '../dto/create-photos.dto';
import { Photo, Prisma } from '@prisma/client';
import { QueryPhotoDto } from '../dto/query-photo.dto';
import { QueryResponseDto } from 'src/common/dto/query-response.dto';

@Injectable()
export class PhotosService {
  constructor(private prisma: PrismaService) {}

  async processImages(files: Express.Multer.File[]): Promise<string[]> {
    return files.map(file => file.path);
  }

  async create(createPhotosDto: CreatePhotosDto, files?: Express.Multer.File[]) {
    const { title, description } = createPhotosDto;

    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      imageUrls = await this.processImages(files);
    } else if (createPhotosDto.imageUrl) {
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
    
    if (filters.title) { where.title = { contains: filters.title, mode: 'insensitive' }; }
    if (filters.authorId) { where.id = filters.authorId; }
    if (filters.toDate) { where.createdAt = { lte: new Date(filters.toDate) }; }
    if (filters.fromDate) { where.createdAt = { gte: new Date(filters.fromDate) }; }

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

    await this.findOne(id); // Vérifie d'abord que la photo existe

    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      imageUrls = await this.processImages(files);
    } else if (updatePhotosDto.imageUrl) {
      imageUrls = Array.isArray(updatePhotosDto.imageUrl) 
        ? updatePhotosDto.imageUrl 
        : [updatePhotosDto.imageUrl];
    }

    const updatedPhoto = await this.prisma.photo.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl: imageUrls,
      },
    });

    return {
      message: "Photo mise à jour avec succès.",
      data: updatedPhoto,
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.photo.delete({
      where: { id },
    });

    return { message: "Photo supprimée avec succès." };
  }
}