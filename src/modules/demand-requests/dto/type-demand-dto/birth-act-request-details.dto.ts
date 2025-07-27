// src/modules/requests/dto/create-request.dto.ts
import {
    IsEnum,
    IsOptional,
    ValidateNested,
    IsDateString,
    IsString,
    IsNumber,
    IsInt,
    IsArray,
    ArrayMinSize,
    IsNotEmpty,
    MaxLength,
    IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
    ServiceType,
    Gender,
    
    BirthActRequestType,
    
} from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class BirthActRequestDetailsDto {

    @ApiProperty({
    description: 'Type de service (fixé à EXTRAIT DE NAISSANCE)',
    enum: ServiceType,
    example: ServiceType.BIRTH_ACT_APPLICATION,
  })
  readonly serviceType?: "BIRTH_ACT_APPLICATION" = "BIRTH_ACT_APPLICATION";
    
    @ApiProperty({
        description: "Prénom de la personne concernée par l'acte de naissance",
        example: "Anderson",
        maxLength: 255,
    })
    @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
    @MaxLength(255, { message: 'Le prénom ne doit pas dépasser 255 caractères.' })
    @IsNotEmpty({ message: 'Le prénom est obligatoire.' })
    personFirstName: string;

    @ApiProperty({
        description: "Nom de la personne concernée par l'acte de naissance",
        example: "Kouassi",
        maxLength: 255,
    })
    @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
    @MaxLength(255, { message: 'Le nom ne doit pas dépasser 255 caractères.' })
    @IsNotEmpty({ message: 'Le nom est obligatoire.' })
    personLastName: string;

    @ApiProperty({
        description: "Date de naissance de la personne concernée",
        example: "1995-06-15",
    })
    @IsDateString({}, { message: 'La date de naissance doit être une date ISO valide.' })
    @IsNotEmpty({ message: 'La date de naissance est obligatoire.' })
    personBirthDate: string;

    @ApiProperty({
        description: "Lieu de naissance de la personne concernée",
        example: "Abidjan",
        maxLength: 255,
    })
    @IsString({ message: 'Le lieu de naissance doit être une chaîne de caractères.' })
    @MaxLength(255, { message: 'Le lieu de naissance ne doit pas dépasser 255 caractères.' })
    @IsNotEmpty({ message: 'Le lieu de naissance est obligatoire.' })
    personBirthPlace: string;

    @ApiProperty({
        description: "Nationalité de la personne concernée",
        example: "Ivoirienne",
        maxLength: 255,
    })
    @IsString({ message: 'La nationalité doit être une chaîne de caractères.' })
    @MaxLength(255, { message: 'La nationalité ne doit pas dépasser 255 caractères.' })
    @IsNotEmpty({ message: 'La nationalité est obligatoire.' })
    personNationality: string;

    @ApiProperty({
        description: "Domicile de la personne (facultatif)",
        example: "Yopougon, Abidjan",
        required: false,
        maxLength: 255,
    })
    @IsOptional()
    @IsString({ message: 'Le domicile doit être une chaîne de caractères.' })
    @MaxLength(255, { message: 'Le domicile ne doit pas dépasser 255 caractères.' })
    personDomicile?: string;

    @ApiProperty({
        description: "Nom complet du père",
        example: "Kouadio Jean-Baptiste",
        maxLength: 255,
    })
    @IsString({ message: 'Le nom du père doit être une chaîne de caractères.' })
    @MaxLength(255, { message: 'Le nom du père ne doit pas dépasser 255 caractères.' })
    @IsNotEmpty({ message: 'Le nom du père est obligatoire.' })
    fatherFullName: string;

    @ApiProperty({
        description: "Nom complet de la mère",
        example: "Koné Awa",
        maxLength: 255,
    })
    @IsString({ message: 'Le nom de la mère doit être une chaîne de caractères.' })
    @MaxLength(255, { message: 'Le nom de la mère ne doit pas dépasser 255 caractères.' })
    @IsNotEmpty({ message: 'Le nom de la mère est obligatoire.' })
    motherFullName: string;

    @ApiProperty({
        description: "Type de demande d'acte de naissance",
        example: "EXTRAIT",
        enum: BirthActRequestType,
    })
    @IsEnum(BirthActRequestType, { message: 'Le type de demande est invalide.' })
    @IsNotEmpty({ message: 'Le type de demande est obligatoire.' })
    requestType: BirthActRequestType;

   @IsEnum(Gender, { message: 'Le type de demande est invalide.' })
   @IsOptional()
   personGender?: Gender
}