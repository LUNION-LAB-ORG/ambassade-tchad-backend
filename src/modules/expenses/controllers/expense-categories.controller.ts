import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExpenseCategoriesService } from '../services/expense-categories.service';
import { CreateExpenseCategoryDto } from '../dto/create-expense-category.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UserRolesGuard } from 'src/modules/users/guards/user-roles.guard';
import { UserRoles } from 'src/modules/users/decorators/user-roles.decorator';
import { Role } from '@prisma/client';
import { QueryExpenseCategoryDto } from '../dto/query-expense-category.dto';
import { UpdateExpenseCategoryDto } from '../dto/update-expense-category.dto';

@ApiTags('Catégories de Dépenses')
@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(private readonly expenseCategoriesService: ExpenseCategoriesService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Créer une nouvelle catégorie de dépense' })
  @ApiResponse({ status: 201, description: 'Catégorie créée avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(@Body() createExpenseCategoryDto: CreateExpenseCategoryDto) {
    return this.expenseCategoriesService.create(createExpenseCategoryDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtenir toutes les catégories de dépenses avec filtres' })
  @ApiResponse({ status: 200, description: 'Liste des catégories de dépenses' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  findAll(@Query() query: QueryExpenseCategoryDto) {
    return this.expenseCategoriesService.findAllWithFilters(query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtenir les statistiques des catégories de dépenses' })
  @ApiResponse({ status: 200, description: 'Statistiques des catégories' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  getStats() {
    return this.expenseCategoriesService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtenir une catégorie de dépense par ID' })
  @ApiResponse({ status: 200, description: 'Catégorie trouvée' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  findOne(@Param('id') id: string) {
    return this.expenseCategoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour une catégorie de dépense' })
  @ApiResponse({ status: 200, description: 'Catégorie mise à jour' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(@Param('id') id: string, @Body() updateExpenseCategoryDto: UpdateExpenseCategoryDto) {
    return this.expenseCategoriesService.update(id, updateExpenseCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer une catégorie de dépense' })
  @ApiResponse({ status: 200, description: 'Catégorie supprimée' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('id') id: string) {
    return this.expenseCategoriesService.remove(id);
  }
}
