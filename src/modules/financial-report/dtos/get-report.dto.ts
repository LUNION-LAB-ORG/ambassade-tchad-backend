import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetReportDto {
    @ApiProperty({
        enum: ['month', 'quarter', 'year'],
        description: 'Période d\'analyse : mensuelle, trimestrielle ou annuelle.',
    })
    @IsIn(['month', 'quarter', 'year'])
    period: 'month' | 'quarter' | 'year';

    @ApiProperty({ description: 'Année de l\'analyse, ex: 2024.' })
    @IsInt()
    @Min(2000)
    @Type(() => Number)
    year: number;

    @ApiProperty({
        required: false,
        description: 'Mois (1-12) si la période est "month".',
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @IsIn([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    @Type(() => Number)
    month?: number;

    @ApiProperty({
        required: false,
        description: 'Trimestre (1-4) si la période est "quarter".',
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @IsIn([1, 2, 3, 4])
    @Type(() => Number)
    quarter?: number;
}