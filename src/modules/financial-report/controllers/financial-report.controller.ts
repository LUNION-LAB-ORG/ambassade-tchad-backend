import { Controller, Get, Query } from '@nestjs/common';
import { FinancialReportService } from '../services/financial-report.service';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetReportDto } from '../dtos/get-report.dto';
import { FinancialReportResponseDto } from '../types/report-response.type';

@ApiTags('Rapports Financiers')
@Controller('financial-reports')
export class FinancialReportController {
    constructor(private readonly financialReportService: FinancialReportService) { }

    @Get()
    @ApiOperation({
        summary: 'Générer un rapport financier complet',
        description:
            'Génère un rapport financier complet incluant les totaux, les transactions, ' +
            'la répartition des revenus par service et des dépenses par catégorie pour une période donnée.',
    })
    @ApiResponse({
        status: 200,
        description: 'Rapport financier généré avec succès.',
        type: FinancialReportResponseDto,
    })
    @ApiQuery({
        name: 'period',
        enum: ['month', 'quarter', 'year'],
        description: 'Période d\'analyse : mensuelle, trimestrielle ou annuelle.',
    })
    @ApiQuery({ name: 'year', description: 'Année de l\'analyse, ex: 2024.' })
    @ApiQuery({
        name: 'month',
        required: false,
        description: 'Mois (1-12) si la période est "month".',
    })
    @ApiQuery({
        name: 'quarter',
        required: false,
        description: 'Trimestre (1-4) si la période est "quarter".',
    })
    async getFullReport(@Query() query: GetReportDto): Promise<FinancialReportResponseDto> {
        return this.financialReportService.getFullReport(query);
    }

    @Get('revenue/total')
    @ApiOperation({
        summary: 'Obtenir le total des revenus',
        description: 'Calcule le total des revenus pour la période spécifiée.',
    })
    @ApiQuery({
        name: 'period',
        enum: ['month', 'quarter', 'year'],
        description: 'Période d\'analyse : mensuelle, trimestrielle ou annuelle.',
    })
    @ApiQuery({ name: 'year', description: 'Année de l\'analyse, ex: 2024.' })
    @ApiQuery({
        name: 'month',
        required: false,
        description: 'Mois (1-12) si la période est "month".',
    })
    @ApiQuery({
        name: 'quarter',
        required: false,
        description: 'Trimestre (1-4) si la période est "quarter".',
    })
    async getTotalRevenue(@Query() query: GetReportDto): Promise<number> {
        return this.financialReportService.getTotalRevenue(query.period, query.year, query.month, query.quarter);
    }

    @Get('expenses/total')
    @ApiOperation({
        summary: 'Obtenir le total des dépenses',
        description: 'Calcule le total des dépenses pour la période spécifiée.',
    })
    @ApiQuery({
        name: 'period',
        enum: ['month', 'quarter', 'year'],
        description: 'Période d\'analyse : mensuelle, trimestrielle ou annuelle.',
    })
    @ApiQuery({ name: 'year', description: 'Année de l\'analyse, ex: 2024.' })
    @ApiQuery({
        name: 'month',
        required: false,
        description: 'Mois (1-12) si la période est "month".',
    })
    @ApiQuery({
        name: 'quarter',
        required: false,
        description: 'Trimestre (1-4) si la période est "quarter".',
    })
    async getTotalExpenses(@Query() query: GetReportDto): Promise<number> {
        return this.financialReportService.getTotalExpenses(query.period, query.year, query.month, query.quarter);
    }

    // Autres endpoints pour les rapports spécifiques...
    // Par exemple, pour les transactions, les revenus par service, etc.
}