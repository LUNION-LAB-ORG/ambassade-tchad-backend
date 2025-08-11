import { Controller, Get, Post, Delete, Param, Query, Patch } from '@nestjs/common';
import { ExpensesService } from '../services/expenses.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { Body, Req } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { QueryExpenseDto } from '../dto/query-expense.dto';
import { Role, User } from '@prisma/client';
import { Request } from 'express';
import { UserRolesGuard } from 'src/modules/users/guards/user-roles.guard';
import { UserRoles } from 'src/modules/users/decorators/user-roles.decorator';

@ApiTags('Dépenses')
@Controller('expenses')
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Créer une nouvelle dépense avec images compressées' })
    @ApiResponse({ status: 201, description: 'Dépense créée avec succès.' })
    @ApiResponse({ status: 400, description: 'Requête invalide.' })
    @ApiResponse({ status: 401, description: 'Non autorisé' })
    async create(
        @Body() dto: CreateExpenseDto,
        @Req() req: Request,
    ) {
        const user = req.user as User;
        return this.expensesService.create(dto, user.id);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Lister les dépenses avec filtres' })
    @ApiQuery({ name: 'recordedById', required: false, description: 'Filtrer par auteur' })
    @ApiQuery({ name: 'category', required: false, description: 'Filtrer par catégorie' })
    @ApiQuery({ name: 'amount', required: false, description: 'Filtrer par montant' })
    @ApiQuery({ name: 'expenseDate', required: false, description: 'Filtrer par date' })
    @ApiResponse({ status: 200, description: 'Liste des dépenses' })
    @ApiResponse({ status: 401, description: 'Non autorisé' })
    async findAllWithFilters(@Query() query: QueryExpenseDto) {
        return this.expensesService.findAllWithFilters(query);
    }

    @Get('stats')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Obtenir les statistiques des dépenses' })
    @ApiResponse({ status: 200, description: 'Statistiques des dépenses' })
    @ApiResponse({ status: 401, description: 'Non autorisé' })
    async getStats() {
        return this.expensesService.getStats();
    }
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Obtenir une dépense par ID' })
    @ApiResponse({ status: 200, description: 'Dépense trouvée' })
    @ApiResponse({ status: 401, description: 'Non autorisé' })
    async findOne(@Param('id') id: string) {
        return this.expensesService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Mettre à jour une dépense par ID' })
    @ApiResponse({ status: 200, description: 'Dépense mise à jour' })
    @ApiResponse({ status: 401, description: 'Non autorisé' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateExpenseDto,
    ) {
        return this.expensesService.update(id, updateDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, UserRolesGuard)
    @UserRoles(Role.ADMIN)
    @ApiOperation({ summary: 'Supprimer une dépense par ID' })
    @ApiResponse({ status: 200, description: 'Dépense supprimée' })
    @ApiResponse({ status: 401, description: 'Non autorisé' })
    async delete(@Param('id') id: string) {
        return this.expensesService.delete(id);
    }
}
