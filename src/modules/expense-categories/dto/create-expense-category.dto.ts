import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateExpenseCategoryDto {
  @ApiProperty({
    description: 'Nom de la catégorie de dépense',
    example: 'Salaires',
    required: true,
    minLength: 2,
    maxLength: 100
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Description de la catégorie de dépense',
    example: 'Catégorie pour toutes les dépenses liées aux salaires du personnel',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @MaxLength(500, { message: 'La description ne peut pas dépasser 500 caractères' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Indique si la catégorie est active',
    example: true,
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'Le statut actif doit être un booléen' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  isActive?: boolean = true;
}
