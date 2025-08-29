import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QueryPaiementDto {
    @ApiPropertyOptional({ description: 'Numéro de page', default: 1 })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Nombre d\'items par page', default: 10 })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'ticketNumber de la demande' })
    @IsString()
    @IsOptional()
    @Transform(({ value }) => String(value).trim())
    ticketNumber?: string;
}