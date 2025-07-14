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
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Videos')
@Controller('videos')
@UseGuards(JwtAuthGuard, UserRolesGuard)
@UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
export class VideosController {
  VideosService: any;
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Video créée avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  @ApiResponse({status:401, description:'Vous n\'ête pas autorisé'})
  create(@Body() dto: CreateVideosDto, @Request() req) {
    return this.videosService.create(dto);
  }
  @Get()
  @ApiResponse({ status: 200, description: 'Liste des vidéos récupérée avec succès.' })

  findAll() {
    return this.videosService.findAll();
  }

  @Get('/filter')
  @ApiResponse({ status: 200, description: 'Liste filtrée des vidéos récupérée avec succès.' })

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
  @ApiResponse({ status: 200, description: 'Statistiques des vidéos récupérées avec succès.' })
  getStats() {
    return this.videosService.getStats();
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Détails de la photo récupérés avec succès.' })
  @ApiResponse({ status: 404, description: 'Video non trouvée.' })
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'Video mise à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  @ApiResponse({ status: 404, description: 'Video non trouvée.' })
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
  @ApiResponse({ status: 200, description: 'Video supprimée avec succès.' })
  @ApiResponse({ status: 404, description: 'Video non trouvée.' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.videosService.remove(id);
    return { message:  `La vidéo avec l'id ${id} supprimé avec succès.` };
  }
}