import { ApiProperty } from '@nestjs/swagger';
import {
    Transaction,
    RevenueByService,
    ExpenseByCategory,
    MonthlyData,
} from './types.type';

export class FinancialReportResponseDto {
    @ApiProperty({ description: 'Total des revenus pour la période sélectionnée.' })
    totalRevenue: number;

    @ApiProperty({ description: 'Total des dépenses pour la période sélectionnée.' })
    totalExpenses: number;

    @ApiProperty({
        type: [Transaction],
        description: 'Liste détaillée des transactions (revenus et dépenses).',
    })
    transactions: Transaction[];

    @ApiProperty({
        type: [RevenueByService],
        description: 'Répartition des revenus par type de service.',
    })
    revenueByService: RevenueByService[];

    @ApiProperty({
        type: [ExpenseByCategory],
        description: 'Répartition des dépenses par catégorie.',
    })
    expensesByCategory: ExpenseByCategory[];

    @ApiProperty({
        type: [MonthlyData],
        description: 'Données agrégées par mois pour le graphique (année complète).',
    })
    monthlyData: MonthlyData[];
}