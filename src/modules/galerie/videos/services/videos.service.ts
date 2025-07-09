import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import { UpdateVideosDto } from '../dto/update-videos.dto';
import { CreateVideosDto } from '../dto/create-videos.dto';

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService) {}

  async create(createVideosDto: CreateVideosDto) {
    const { title, description, youtubeUrl } = createVideosDto;

    return this.prisma.video.create({
      data: {
        title,
        description,
        youtubeUrl
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
    const total = await this.prisma.video.count();
    return { total };
  }

  async findOne(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
    });

    if (!video) {
      throw new NotFoundException(`Photo avec l'ID ${id} introuvable`);
    }

    return video;
  }

  async update(id: string, updateVideosDto: UpdateVideosDto) {
    const { title, description, youtubeUrl } = updateVideosDto;

    await this.findOne(id); 
    const updatedVideo = await this.prisma.video.update({
      where: { id },
      data: {
        title,
        description,
        youtubeUrl
      },
    });
    
    return {
      message: "Vidéo mise à jour avec succès.",
      data: updatedVideo,
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.video.delete({
      where: { id },
    });

    return { message: "Vidéo supprimée avec succès." };
  }
}
