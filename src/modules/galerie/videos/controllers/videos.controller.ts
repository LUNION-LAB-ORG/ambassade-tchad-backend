import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
  Put,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UserRoles } from 'src/modules/users/decorators/user-roles.decorator';
import { UserRolesGuard } from 'src/modules/users/guards/user-roles.guard';
import { Role } from '@prisma/client';
import { CreateVideosDto } from '../dto/create-videos.dto';
import { VideosService } from '../services/videos.service';

@Controller('videos')
@UseGuards(JwtAuthGuard, UserRolesGuard)
@UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
export class VideosController {
  VideosService: any;
  constructor(private readonly videosService: VideosService) {}

  @Post()
  create(@Body() dto: CreateVideosDto, @Request() req) {
    return this.videosService.create(dto);
  }
// "Notre force : anticiper vos besoins avec proactivité et agilité."
  @Get()
  findAll() {
    return this.videosService.findAll();
  }

  @Get('/filter')
  filter(
    @Query('title') title?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.videosService.findAllWithFilters({
      title,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  @Get('/stats')
  getStats() {
    return this.videosService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateVideosDto) {
    const updateVideo = this.videosService.update(id, dto);
    return {
        message:"vidéo modifiée avec succès",
        data: updateVideo
    }
  }

  @Delete(':id')
   @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
  async remove(@Param('id') id: string, @Request() req) {
    await this.videosService.remove(id);
    return { message:  `La vidéo avec l'id ${id} supprimé avec succès.` };
  }
}