import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import { UpdateVideosDto } from '../dto/update-videos.dto';
import { CreateVideosDto } from '../dto/create-videos.dto';
import { QueryVideoDto } from '../dto/query-video.dto';
import { QueryResponseDto } from 'src/common/dto/query-response.dto';
import { Prisma, Video } from '@prisma/client';

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

  async findAllWithFilters(filters: QueryVideoDto ):Promise<QueryResponseDto<Video>> {
      const page = filters.page ?? 1
      const limit = filters.limit ?? 10
      const skip = limit * (page - 1)
      const where : Prisma.VideoWhereInput = {}
      if(filters.title){where.title = {contains:filters.title, mode: 'insensitive'}}
      if(filters.authorId){where.id = filters.authorId}
      if(filters.toDate){where.createdAt= {lte:new Date(filters.toDate)}}
      if(filters.fromDate){where.createdAt= {gte:new Date(filters.fromDate)}}
      const [total_video, all_video] = await Promise.all([ 
        this.prisma.video.count({where}), 
        this.prisma.video.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take : limit,
          skip
        })
      ])
  
      const total_page = Math.ceil(total_video / limit)
      return({
        data : all_video,
        meta :{
          total: total_video,
          page : page,
          limit : limit,
          totalPages : total_page
        }
      })
  
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
