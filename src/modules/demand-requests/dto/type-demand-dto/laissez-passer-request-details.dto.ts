import {
  IsEnum,
  IsOptional,
  ValidateNested,
  IsDateString,
  IsString,
  IsArray,
  IsNotEmpty,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ServiceType,
  JustificationDocumentType,
} from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccompanierDto } from './accompanier.dto';

export class LaissezPasserRequestDetailsDto {
  @ApiPropertyOptional({
    description: 'Type de service (fixé à LAISSER PASSER)',
    enum: ServiceType,
    example: ServiceType.LAISSEZ_PASSER,
  })
  readonly serviceType?: "LAISSEZ_PASSER" = "LAISSEZ_PASSER";

  @ApiProperty({ description: "Prénom du demandeur", example: "Anderson" })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  personFirstName: string;

  @ApiProperty({ description: "Nom du demandeur", example: "Kouassi" })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  personLastName: string;

  @ApiProperty({ description: "Date de naissance", example: "1990-05-12" })
  @IsDateString()
  @IsNotEmpty()
  personBirthDate: string;

  @ApiProperty({ description: "Lieu de naissance", example: "Abidjan" })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  personBirthPlace: string;

  @ApiPropertyOptional({ description: "Profession", example: "Informaticien" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  personProfession?: string;

  @ApiProperty({ description: "Nationalité", example: "Ivoirienne" })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  personNationality: string;

  @ApiProperty({ description: "Domicile", example: "Cocody" })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  personDomicile: string;

  @ApiProperty({ description: "Nom complet du père", example: "Jean Kouadio" })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  fatherFullName: string;

  @ApiProperty({ description: "Nom complet de la mère", example: "Marie Kouadio" })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  motherFullName: string;

  @ApiPropertyOptional({ description: "Destination", example: "Paris" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  destination?: string;

  @ApiPropertyOptional({ description: "Motif du voyage", example: "Affaires" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  travelReason?: string;

  @ApiProperty({ description: "Accompagné ou non" })
  @IsBoolean()
  @Type(() => Boolean)
  accompanied: boolean;

  @ApiPropertyOptional({ description: "Liste des accompagnants", type: [AccompanierDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccompanierDto)
  accompaniers?: AccompanierDto[];

  @ApiProperty({ enum: JustificationDocumentType, description: "Type de document justificatif" })
  @IsEnum(JustificationDocumentType)
  @IsNotEmpty()
  justificationDocumentType: JustificationDocumentType;

  @ApiProperty({ description: "Numéro du document justificatif", example: "JD123456" })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  justificationDocumentNumber: string;
}