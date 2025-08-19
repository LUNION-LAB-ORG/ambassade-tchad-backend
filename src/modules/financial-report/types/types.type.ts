import { ApiProperty } from '@nestjs/swagger';

export class Transaction {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
    date: string;

    @ApiProperty({ example: 'Description de la transaction' })
    description: string;

    @ApiProperty({ example: 'revenue' })
    type: 'revenue' | 'expense';

    @ApiProperty({ example: 'Category de la transaction' })
    category: string;

    @ApiProperty({ example: 100 })
    amount: number;
}

export class RevenueByService {
    @ApiProperty({ example: 'Service de la transaction' })
    service: string;

    @ApiProperty({ example: 100 })
    amount: number;

    @ApiProperty({ example: 1 })
    count: number;
}

export class ExpenseByCategory {
    @ApiProperty({ example: 'Category de la transaction' })
    category: string;

    @ApiProperty({ example: 100 })
    amount: number;

    @ApiProperty({ example: 100 })
    percentage: number;
}

export class MonthlyData {
    @ApiProperty({ example: 'Janvier' })
    month: string;

    @ApiProperty({ example: 100 })
    revenue: number;

    @ApiProperty({ example: 100 })
    expenses: number;
}