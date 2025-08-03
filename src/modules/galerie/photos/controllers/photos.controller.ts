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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PhotosService } from '../services/photos.service';
import { CreatePhotosDto } from '../dto/create-photos.dto';
import { UserRoles } from 'src/modules/users/decorators/user-roles.decorator';
import { UserRolesGuard } from 'src/modules/users/guards/user-roles.guard';
import { Role } from '@prisma/client';
import {
  ApiResponse,
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { QueryPhotoDto } from '../dto/query-photo.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GenerateConfigService } from 'src/common/services/generate-config.service';

@ApiTags('Photos')
@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor(
      'images',
      10,
     GenerateConfigService.generateConfigMultipleImageUpload('./uploads/photos')
    )
  )
 
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePhotosDto })
  @ApiOperation({ summary: 'Créer une ou plusieurs photos' })
  @ApiResponse({ status: 201, description: 'Photo créée avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  @ApiResponse({ status: 401, description: 'Vous n\'êtes pas autorisé' })
  @UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  async create(
    @Body() dto: CreatePhotosDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req
  ) {
    const fileMap: Record<string, string> = {};
    
    files.forEach((file, i) => {
      fileMap[`image_${i}`] = file.path;
    });
        
    const compressedPaths = await GenerateConfigService.compressImages(
      fileMap,
      './uploads/photos',
      { quality: 75, width: 1280, height: 720, fit: 'inside' },
      true
    );

    dto.imageUrl = Object.values(compressedPaths);

    return this.photosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les photos avec filtres' })
  @ApiQuery({ name: 'title', required: false, description: 'Filtrer par titre' })
  @ApiQuery({ name: 'authorId', required: false, description: 'Filtrer par auteur' })
  @ApiQuery({ name: 'published', required: false, type: Boolean, description: 'Filtrer par publication' })
  @ApiResponse({ status: 200, description: 'Liste filtrée des photos récupérée avec succès.' })
  filter(@Query() filters: QueryPhotoDto) {
    return this.photosService.findAllWithFilters(filters);
  }

  @Get('/stats')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
  @ApiOperation({ summary: 'Obtenir les statistiques des photos' })
  @ApiResponse({ status: 200, description: 'Statistiques des photos récupérées avec succès.' })
  getStats() {
    return this.photosService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer les détails d\'une photo' })
  @ApiResponse({ status: 200, description: 'Détails de la photo récupérés avec succès.' })
  @ApiResponse({ status: 404, description: 'Photo non trouvée.' })
  findOne(@Param('id') id: string) {
    return this.photosService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
  @ApiOperation({ summary: 'Mettre à jour une photo' })
  @ApiResponse({ status: 200, description: 'Photo mise à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  @ApiResponse({ status: 404, description: 'Photo non trouvée.' })
  update(@Param('id') id: string, @Body() dto: CreatePhotosDto) {
    return this.photosService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CONSUL)
  @ApiOperation({ summary: 'Supprimer une photo' })
  @ApiResponse({ status: 200, description: 'Photo supprimée avec succès.' })
  @ApiResponse({ status: 404, description: 'Photo non trouvée.' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.photosService.remove(id, req.user.id);
    return { message: `La photo avec l'id ${id} supprimée avec succès.` };
  }
}
