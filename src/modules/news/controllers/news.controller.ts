import {
  Controller,
  Get,
  Post,
  Body,
  Put,
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
import { NewsService } from '../services/news.service';
import { CreateNewsDto } from '../dto/create-news.dto';
import { UpdateNewsDto } from '../dto/update-news.dto';
import { UserRolesGuard } from 'src/modules/users/guards/user-roles.guard';
import { UserRoles } from 'src/modules/users/decorators/user-roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiConsumes,
  ApiResponse,
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { QueryNewsDto } from '../dto/query-news.dto';
import { GenerateConfigService } from 'src/common/services/generate-config.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Actualités')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) { }

  @Post()
  @UseInterceptors(
    FilesInterceptor(
      'images',
      10,
      GenerateConfigService.generateConfigMultipleImageUpload('./uploads/photos'),
    ),
  )
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Créer une actualité avec images' })
  @ApiResponse({ status: 201, description: 'Actualité créée avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  async create(
    @Body() dto: CreateNewsDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    console.log('files:', files);
    return this.newsService.create(dto, req.user.id, files);
  }

  @Get('')
  @ApiOperation({ summary: 'Lister les actualités avec filtres' })
  @ApiQuery({ name: 'title', required: false, description: 'Filtrer par titre' })
  @ApiQuery({ name: 'authorId', required: false, description: 'Filtrer par ID de l\'auteur' })
  @ApiQuery({ name: 'published', required: false, type: Boolean, description: 'Filtrer par statut de publication' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Date minimale (ISO)' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Date maximale (ISO)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre de résultats par page' })
  @ApiResponse({ status: 200, description: 'Liste des actualités récupérée avec succès.' })
  findWithFilters(@Query() filters: QueryNewsDto) {
    return this.newsService.findAllWithFilters(filters);
  }

  @Get('/stats')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
  @ApiOperation({ summary: 'Obtenir les statistiques des actualités' })
  @ApiResponse({ status: 200, description: 'Statistiques des actualités récupérées avec succès.' })
  getStats() {
    return this.newsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une actualité par ID' })
  @ApiResponse({ status: 200, description: 'Détails de l’actualité récupérés.' })
  @ApiResponse({ status: 404, description: 'Actualité non trouvée.' })
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CONSUL)
  @ApiOperation({ summary: 'Mettre à jour une actualité' })
  @ApiResponse({ status: 200, description: 'Actualité mise à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Actualité non trouvée.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Mettre à jour une actualité avec images' })
  @ApiResponse({ status: 200, description: 'Actualité mise à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiBody({ type: UpdateNewsDto })
  @UseInterceptors(
    FilesInterceptor(
      'images',
      10,
      GenerateConfigService.generateConfigMultipleImageUpload('./uploads/photos'),
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNewsDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req
  ) {
    console.log('files:', files);
    const updatedNews = await this.newsService.update(id, dto, req.user.id, files);
    return {
      message: 'Actualité mise à jour avec succès.',
      data: updatedNews,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CONSUL)
  @ApiOperation({ summary: 'Supprimer une actualité' })
  @ApiResponse({ status: 200, description: 'Actualité supprimée avec succès.' })
  @ApiResponse({ status: 404, description: 'Actualité non trouvée.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.newsService.remove(id, req.user.id);
    return {
      message: `Actualité avec l'id ${id} supprimée avec succès.`,
    };
  }
}



