import {
    IsOptional,
    IsDateString,
    IsString,
    IsNotEmpty,
    MaxLength,
} from 'class-validator';
import {
    ServiceType,
} from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MarriageCapacityActRequestDetailsDto {
      @ApiProperty({
    description: 'Type de service (fixé à CERTIFICATION DE CAPACITE DE MARIAGE)',
    enum: ServiceType,
    example: ServiceType.MARRIAGE_CAPACITY_ACT,
  })
  readonly serviceType?: "MARRIAGE_CAPACITY_ACT" = "MARRIAGE_CAPACITY_ACT";

  @ApiProperty({ description: 'Prénom de l\'époux', example: 'Jean' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  husbandFirstName: string;

  @ApiProperty({ description: 'Nom de l\'époux', example: 'Dupont' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  husbandLastName: string;

  @ApiProperty({ description: 'Date de naissance de l\'époux', example: '1985-02-15' })
  @IsDateString({}, { message: 'La date de naissance de l\'époux doit être au format AAAA-MM-JJ' })
  @IsNotEmpty()
  husbandBirthDate: string;

  @ApiProperty({ description: 'Lieu de naissance de l\'époux', example: 'Paris' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  husbandBirthPlace: string;

  @ApiProperty({ description: 'Nationalité de l\'époux', example: 'Française' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  husbandNationality: string;

  @ApiPropertyOptional({ description: 'Domicile de l\'époux', example: 'Lyon' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  husbandDomicile?: string;

  @ApiProperty({ description: 'Prénom de l\'épouse', example: 'Sophie' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  wifeFirstName: string;

  @ApiProperty({ description: 'Nom de l\'épouse', example: 'Martin' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  wifeLastName: string;

  @ApiProperty({ description: 'Date de naissance de l\'épouse', example: '1990-08-10' })
  @IsDateString({}, { message: 'La date de naissance de l\'épouse doit être au format AAAA-MM-JJ' })
  @IsNotEmpty()
  wifeBirthDate: string;

  @ApiProperty({ description: 'Lieu de naissance de l\'épouse', example: 'Abidjan' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  wifeBirthPlace: string;

  @ApiProperty({ description: 'Nationalité de l\'épouse', example: 'Ivoirienne' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  wifeNationality: string;

  @ApiPropertyOptional({ description: 'Domicile de l\'épouse', example: 'Bouaké' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  wifeDomicile?: string;
}
