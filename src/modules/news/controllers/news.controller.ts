import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { NewsService } from '../services/news.service';
import { CreateNewsDto } from '../dto/create-news.dto';
import { UpdateNewsDto } from '../dto/update-news.dto';
import { UserRolesGuard } from 'src/modules/users/guards/user-roles.guard';
import { UserRoles } from 'src/modules/users/decorators/user-roles.decorator';
import { Role } from '@prisma/client';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // Création réservée aux rôles spécifiques
  @Post()
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
  create(@Body() dto: CreateNewsDto, @Request() req) {
    return this.newsService.create(dto, req.user.id);
  }

  // Liste publique
  @Get()
  findAll() {
    return this.newsService.findAll(false);
  }

  // Filtrer avec paramètres
  @Get('/filter')
  findWithFilters(
    @Query('title') title?: string,
    @Query('authorId') authorId?: string,
    @Query('published') published?: boolean,
    // @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.newsService.findAllWithFilters({
      title,
      authorId,
      published: published !== undefined ? published === true: undefined,
      // fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  // Statistiques publiques
  @Get('/stats')
  getStats() {
    return this.newsService.getStats();
  }

  // Trouver une news par id (publique)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  // Modification accessible à tous les utilisateurs connectés
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateNewsDto, @Request() req) {
    const updatedNews = this.newsService.update(id, dto, req.user.id);
    return {
      message: 'Événement mis à jour avec succès.',
      data: updatedNews,
    };
  }

  // Suppression réservée aux rôles spécifiques
  @Delete(':id')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
  remove(@Param('id') id: string, @Request() req) {
    return { message: `Actualité avec l'id ${id} supprimé avec succès.` }
  }
}
