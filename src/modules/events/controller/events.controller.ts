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
  UploadedFiles,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { EventsService } from '../service/events.service';
import { CreateEventsDto } from '../dto/create-events.dto';
import { UpdateEventsDto } from '../dto/update-events.dto';
import { UserRolesGuard } from 'src/modules/users/guards/user-roles.guard';
import { UserRoles } from 'src/modules/users/decorators/user-roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiResponse,
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { QueryEventsDto } from '../dto/query-events.dto';
import { GenerateConfigService } from 'src/common/services/generate-config.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Événements')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Post()
  @UseInterceptors(
    FilesInterceptor(
      'images',
      10,
      GenerateConfigService.generateConfigMultipleImageUpload('./uploads/events')
    )
  )
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateEventsDto })
  @ApiOperation({ summary: 'Créer un nouvel événement avec images compressées' })
  @ApiResponse({ status: 201, description: 'Événement créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async create(
    @Body() dto: CreateEventsDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
    @Request() req
  ) {
    return this.eventsService.create(dto, req.user.id, files);
  }

  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor(
      'images',
      10,
      GenerateConfigService.generateConfigMultipleImageUpload('./uploads/events')
    )
  )
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour un événement' })
  @ApiResponse({ status: 200, description: 'Événement mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Événement non trouvé.' })
  @ApiResponse({ status: 400, description: 'Mise à jour invalide.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventsDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    return this.eventsService.update(id, dto, req.user.id, files);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les événements avec filtres' })
  @ApiQuery({ name: 'title', required: false, description: 'Recherche par titre' })
  @ApiQuery({ name: 'authorId', required: false, description: 'Filtrer par auteur' })
  @ApiQuery({ name: 'published', required: false, type: Boolean, description: 'Filtrer par statut (publié ou non)' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Date de début (format ISO)' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Date de fin (format ISO)' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page' })
  @ApiResponse({ status: 200, description: 'Liste filtrée des événements.' })
  filter(@Query() filters: QueryEventsDto) {
    return this.eventsService.findAllWithFilters(filters);
  }

  @Get('/stats')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
  @ApiOperation({ summary: 'Récupérer les statistiques des événements' })
  @ApiResponse({ status: 200, description: 'Statistiques des événements récupérées avec succès.' })
  getStats() {
    return this.eventsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Afficher un événement par ID' })
  @ApiResponse({ status: 200, description: 'Détails de l\'événement récupérés.' })
  @ApiResponse({ status: 404, description: 'Événement non trouvé.' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CONSUL)
  @ApiOperation({ summary: 'Supprimer un événement' })
  @ApiResponse({ status: 200, description: 'Événement supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Événement non trouvé.' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.eventsService.remove(id, req.user.id);
    return { message: `Evènement avec l'id ${id} supprimé avec succès.` };
  }
}
