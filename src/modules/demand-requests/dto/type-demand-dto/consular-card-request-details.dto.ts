import {
    IsEnum,
    IsOptional,
    IsDateString,
    IsString,
    IsNotEmpty,
    MaxLength,
} from 'class-validator';
import {
    ServiceType,
    JustificationDocumentType,
    OriginCountryParentRelationshipType,
} from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';


export class ConsularCardRequestDetailsDto {
    @ApiProperty({
    description: 'Type de service (fixé à CARTE CONSULAIRE)',
    enum: ServiceType,
    example: ServiceType.CONSULAR_CARD,
  })
  readonly serviceType?: "CONSULAR_CARD" = "CONSULAR_CARD";
    
  @ApiProperty({
    description: 'Prénom de la personne concernée',
    example: 'Anderson',
    maxLength: 255,
  })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'Le prénom ne doit pas dépasser 255 caractères.' })
  @IsNotEmpty({ message: 'Le prénom est obligatoire.' })
  personFirstName: string;

  @ApiProperty({
    description: 'Nom de la personne concernée',
    example: 'Kouassi',
    maxLength: 255,
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'Le nom ne doit pas dépasser 255 caractères.' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  personLastName: string;

  @ApiProperty({
    description: 'Date de naissance',
    example: '1990-05-12',
  })
  @IsDateString({}, { message: 'La date de naissance doit être une date valide.' })
  @IsNotEmpty({ message: 'La date de naissance est obligatoire.' })
  personBirthDate: string;

  @ApiProperty({
    description: 'Lieu de naissance',
    example: 'Abidjan',
    maxLength: 255,
  })
  @IsString({ message: 'Le lieu de naissance doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'Le lieu de naissance ne doit pas dépasser 255 caractères.' })
  @IsNotEmpty({ message: 'Le lieu de naissance est obligatoire.' })
  personBirthPlace: string;

  @ApiProperty({
    description: 'Profession (facultative)',
    example: 'Développeur web',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'La profession doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'La profession ne doit pas dépasser 255 caractères.' })
  personProfession?: string;

  @ApiProperty({
    description: 'Nationalité',
    example: 'Ivoirienne',
    maxLength: 255,
  })
  @IsString({ message: 'La nationalité doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'La nationalité ne doit pas dépasser 255 caractères.' })
  @IsNotEmpty({ message: 'La nationalité est obligatoire.' })
  personNationality: string;

  @ApiProperty({
    description: 'Domicile (facultatif)',
    example: 'Yopougon, Abidjan',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Le domicile doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'Le domicile ne doit pas dépasser 255 caractères.' })
  personDomicile?: string;

  @ApiProperty({
    description: "Adresse au pays d'origine (facultatif)",
    enum: OriginCountryParentRelationshipType,
    required: false,
  })
  @IsOptional()
  @IsEnum(OriginCountryParentRelationshipType, {
    message: "Le type de lien au pays d'origine est invalide.",
  })
  personAddressInOriginCountry?: OriginCountryParentRelationshipType;

  @ApiProperty({
    description: 'Nom complet du père (facultatif)',
    example: 'Kouadio Jean-Baptiste',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Le nom du père doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'Le nom du père ne doit pas dépasser 255 caractères.' })
  fatherFullName?: string;

  @ApiProperty({
    description: 'Nom complet de la mère (facultatif)',
    example: 'Koné Awa',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Le nom de la mère doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'Le nom de la mère ne doit pas dépasser 255 caractères.' })
  motherFullName?: string;

  @ApiProperty({
    description: 'Type de document justificatif (facultatif)',
    enum: JustificationDocumentType,
    required: false,
  })
  @IsOptional()
  @IsEnum(JustificationDocumentType, {
    message: 'Le type de document justificatif est invalide.',
  })
  justificationDocumentType?: JustificationDocumentType;

  @ApiProperty({
    description: 'Numéro du document justificatif (facultatif)',
    example: 'DOC123456',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Le numéro du document doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'Le numéro du document ne doit pas dépasser 255 caractères.' })
  justificationDocumentNumber?: string;
}