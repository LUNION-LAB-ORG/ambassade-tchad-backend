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
import {
  ApiResponse,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { QueryVideoDto } from '../dto/query-video.dto';

@ApiTags('Vidéos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
  @ApiOperation({ summary: 'Créer une nouvelle vidéo' })
  @ApiResponse({ status: 201, description: 'Vidéo créée avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  @ApiResponse({ status: 401, description: 'Vous n\'êtes pas autorisé' })
  create(@Body() dto: CreateVideosDto, @Request() req) {
    return this.videosService.create(dto);
  }

  @Get('')
  @ApiOperation({ summary: 'Lister les vidéos avec filtres' })
  @ApiQuery({ name: 'title', required: false, description: 'Filtrer par titre' })
  @ApiQuery({ name: 'authorId', required: false, description: 'Filtrer par auteur' })
  @ApiQuery({ name: 'published', required: false, type: Boolean, description: 'Filtrer par publication' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page' })
  @ApiResponse({ status: 200, description: 'Liste filtrée des vidéos récupérée avec succès.' })
  filter(@Query() filters: QueryVideoDto) {
    return this.videosService.findAllWithFilters(filters);
  }

  @Get('/stats')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
  @ApiOperation({ summary: 'Obtenir les statistiques des vidéos' })
  @ApiResponse({ status: 200, description: 'Statistiques des vidéos récupérées avec succès.' })
  getStats() {
    return this.videosService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une vidéo par ID' })
  @ApiResponse({ status: 200, description: 'Détails de la vidéo récupérés.' })
  @ApiResponse({ status: 404, description: 'Vidéo non trouvée.' })
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
  @ApiOperation({ summary: 'Mettre à jour une vidéo' })
  @ApiResponse({ status: 200, description: 'Vidéo mise à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  @ApiResponse({ status: 404, description: 'Vidéo non trouvée.' })
  update(@Param('id') id: string, @Body() dto: CreateVideosDto) {
    const updateVideo = this.videosService.update(id, dto);
    return {
      message: "Vidéo modifiée avec succès",
      data: updateVideo
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CONSUL)
  @ApiOperation({ summary: 'Supprimer une vidéo' })
  @ApiResponse({ status: 200, description: 'Vidéo supprimée avec succès.' })
  @ApiResponse({ status: 404, description: 'Vidéo non trouvée.' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.videosService.remove(id);
    return { message:  `La vidéo avec l'id: ${id} supprimée avec succès.` };
  }
}
