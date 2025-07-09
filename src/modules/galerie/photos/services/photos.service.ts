import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import { CreatePhotosDto } from '../dto/create-photos.dto';

@Injectable()
export class PhotosService {
  constructor(private prisma: PrismaService) {}

  async create(createPhotosDto: CreatePhotosDto) {
    const { title, description, imageUrl } = createPhotosDto;

    const imageUrlString = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;

    return this.prisma.photo.create({
      data: {
        title,
        description,
        imageUrl: imageUrlString,
      },
    });
  }

  async findAll() {
    return this.prisma.photo.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllWithFilters(filters: {
    title?: string;
    toDate?: Date;
  }) {
    return this.prisma.photo.findMany({
      where: {
        title: filters.title
          ? { contains: filters.title, mode: 'insensitive' }
          : undefined,
        createdAt: filters.toDate
          ? {
              lte: filters.toDate,
            }
          : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
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

  async update(id: string, updatePhotosDto: CreatePhotosDto) {
    const { title, description, imageUrl } = updatePhotosDto;
    const imageUrlString = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;


    await this.findOne(id); // Vérifie d'abord que la photo existe

    const updatedPhoto = await this.prisma.photo.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl: imageUrlString
      },
    });

    return {
      message: "Photo mise à jour avec succès.",
      data: updatedPhoto,
    };
  }

  async remove(id: string, userId: string) {
    await this.findOne(id);

    await this.prisma.photo.delete({
      where: { id },
    });

    return { message: "Photo supprimée avec succès." };
  }
}
