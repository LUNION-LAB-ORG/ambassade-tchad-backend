
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
import { PhotosService } from '../services/photos.service';
import { CreatePhotosDto } from '../dto/create-photos.dto';
import { UserRoles } from 'src/modules/users/decorators/user-roles.decorator';
import { UserRolesGuard } from 'src/modules/users/guards/user-roles.guard';
import { Role } from '@prisma/client';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Photos')
@Controller('photos')
@UseGuards(JwtAuthGuard, UserRolesGuard)
@UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Photo créée avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  @ApiResponse({status:401, description:'Vous n\'ête pas autorisé'})
  create(@Body() dto: CreatePhotosDto, @Request() req) {
    return this.photosService.create(dto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Liste des photos récupérée avec succès.' })
  findAll() {
    return this.photosService.findAll();
  }

  @Get('/filter')
  @ApiResponse({ status: 200, description: 'Liste filtrée des photos récupérée avec succès.' })
  filter(
    @Query('title') title?: string,
    @Query('authorId') authorId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.photosService.findAllWithFilters({
      title,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  @Get('/stats')
  @ApiResponse({ status: 200, description: 'Statistiques des photos récupérées avec succès.' })
  getStats() {
    return this.photosService.getStats();
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Détails de la photo récupérés avec succès.' })
  @ApiResponse({ status: 404, description: 'Photo non trouvée.' })
  findOne(@Param('id') id: string) {
    return this.photosService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'Photo mise à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  @ApiResponse({ status: 404, description: 'Photo non trouvée.' })
  update(@Param('id') id: string, @Body() dto: CreatePhotosDto) {
    return this.photosService.update(id, dto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Photo supprimée avec succès.' })
  @ApiResponse({ status: 404, description: 'Photo non trouvée.' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.photosService.remove(id, req.user.id);
    return { message: `La photo avec l'id ${id} supprimé avec succès.` };
  }
}
