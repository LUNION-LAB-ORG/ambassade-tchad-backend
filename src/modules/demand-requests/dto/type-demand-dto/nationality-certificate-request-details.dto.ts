import {
    IsEnum,
    IsDateString,
    IsString,
    IsNotEmpty,
    MaxLength,
} from 'class-validator';
import {
    ServiceType,
    OriginCountryParentRelationshipType,
} from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class NationalityCertificateRequestDetailsDto {
     @ApiProperty({
    description: 'Type de service (fixé à CERTIFICAT DE NATIONALITE)',
    enum: ServiceType,
    example: ServiceType.NATIONALITY_CERTIFICATE,
  })
  readonly serviceType?: "NATIONALITY_CERTIFICATE" = "NATIONALITY_CERTIFICATE";
  @ApiProperty({
    description: "Prénom du demandeur",
    example: "Anderson",
    maxLength: 255,
  })
  @IsString({ message: "Le prénom doit être une chaîne de caractères." })
  @MaxLength(255, { message: "Le prénom ne doit pas dépasser 255 caractères." })
  @IsNotEmpty({ message: "Le prénom est obligatoire." })
  applicantFirstName: string;

  @ApiProperty({
    description: "Nom du demandeur",
    example: "Kouassi",
    maxLength: 255,
  })
  @IsString({ message: "Le nom doit être une chaîne de caractères." })
  @MaxLength(255, { message: "Le nom ne doit pas dépasser 255 caractères." })
  @IsNotEmpty({ message: "Le nom est obligatoire." })
  applicantLastName: string;

  @ApiProperty({
    description: "Date de naissance du demandeur",
    example: "1990-05-12",
  })
  @IsDateString({}, { message: "La date de naissance doit être une date valide." })
  @IsNotEmpty({ message: "La date de naissance est obligatoire." })
  applicantBirthDate: string;

  @ApiProperty({
    description: "Lieu de naissance du demandeur",
    example: "Abidjan",
    maxLength: 255,
  })
  @IsString({ message: "Le lieu de naissance doit être une chaîne de caractères." })
  @MaxLength(255, { message: "Le lieu de naissance ne doit pas dépasser 255 caractères." })
  @IsNotEmpty({ message: "Le lieu de naissance est obligatoire." })
  applicantBirthPlace: string;

  @ApiProperty({
    description: "Nationalité du demandeur",
    example: "Ivoirienne",
    maxLength: 255,
  })
  @IsString({ message: "La nationalité doit être une chaîne de caractères." })
  @MaxLength(255, { message: "La nationalité ne doit pas dépasser 255 caractères." })
  @IsNotEmpty({ message: "La nationalité est obligatoire." })
  applicantNationality: string;

  @ApiProperty({
    description: "Prénom du parent dans le pays d'origine",
    example: "Jean",
    maxLength: 255,
  })
  @IsString({ message: "Le prénom du parent doit être une chaîne de caractères." })
  @MaxLength(255, { message: "Le prénom du parent ne doit pas dépasser 255 caractères." })
  @IsNotEmpty({ message: "Le prénom du parent est obligatoire." })
  originCountryParentFirstName: string;

  @ApiProperty({
    description: "Nom du parent dans le pays d'origine",
    example: "Koffi",
    maxLength: 255,
  })
  @IsString({ message: "Le nom du parent doit être une chaîne de caractères." })
  @MaxLength(255, { message: "Le nom du parent ne doit pas dépasser 255 caractères." })
  @IsNotEmpty({ message: "Le nom du parent est obligatoire." })
  originCountryParentLastName: string;

  @ApiProperty({
    description: "Relation du parent dans le pays d'origine",
    enum: OriginCountryParentRelationshipType,
  })
  @IsEnum(OriginCountryParentRelationshipType, { message: "Le type de relation est invalide." })
  @IsNotEmpty({ message: "La relation avec le parent est obligatoire." })
  originCountryParentRelationship: OriginCountryParentRelationshipType;
}
