import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';

export class QueryVideoDto {
  @ApiPropertyOptional({
    description: "Numéro de la page à récupérer",
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Le numéro de page doit être un entier.' })
  @Min(1, { message: 'Le numéro de page doit être au moins 1.' })
  @Max(100, { message: 'Le numéro de page ne peut pas dépasser 100.' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Nombre d'éléments par page",
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Le nombre d\'éléments par page doit être un entier.' })
  @Min(1, { message: 'Le nombre d\'éléments par page doit être au moins 1.' })
  @Max(100, { message: 'Le nombre d\'éléments par page ne peut pas dépasser 100.' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "Titre de la video",
    example: "Titre de la video",
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: "ID de l'auteur",
    example: "ID de l'auteur",
    required: false,
  })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({
    description: "Date de début",
    example: "2022-01-01",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: "Date de fin",
    example: "2022-12-31",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
