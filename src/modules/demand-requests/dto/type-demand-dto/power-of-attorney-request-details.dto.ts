// src/modules/requests/dto/create-request.dto.ts
import {
    IsEnum,
    IsOptional,
    IsString,
    IsNotEmpty,
    MaxLength,
} from 'class-validator';
import {
    ServiceType,
    JustificationDocumentType,
} from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
// DTO demande de procuration
export class PowerOfAttorneyRequestDetailsDto {
       @ApiProperty({
    description: 'Type de service (fixé à DEMANDE PROCURATION)',
    enum: ServiceType,
    example: ServiceType.POWER_OF_ATTORNEY,
  })
  readonly serviceType?: "POWER_OF_ATTORNEY" = "POWER_OF_ATTORNEY";

  @ApiProperty({
    description: "Prénom de l'agent",
    example: "Jean",
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  agentFirstName: string;

  @ApiProperty({
    description: "Nom de l'agent",
    example: "Doe",
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  agentLastName: string;

  @ApiProperty({
    description: "Type de document justificatif de l'agent",
    enum: JustificationDocumentType,
    example: JustificationDocumentType.PASSPORT,
  })
  @IsEnum(JustificationDocumentType)
  agentJustificationDocumentType: JustificationDocumentType;

  @ApiProperty({
    description: "Numéro de pièce d'identité de l'agent",
    example: "CI123456789",
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  agentIdDocumentNumber: string;

  @ApiProperty({
    description: "Adresse de l'agent",
    example: "Abidjan, Côte d'Ivoire",
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  agentAddress: string;

  @ApiProperty({
    description: "Prénom du mandant (donneur de procuration)",
    example: "Fatou",
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  principalFirstName: string;

  @ApiProperty({
    description: "Nom du mandant",
    example: "Koné",
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  principalLastName: string;

  @ApiProperty({
    description: "Type de document justificatif du mandant",
    enum: JustificationDocumentType,
    example: JustificationDocumentType.NATIONAL_ID_CARD,
  })
  @IsEnum(JustificationDocumentType)
  principalJustificationDocumentType: JustificationDocumentType;

  @ApiProperty({
    description: "Numéro de pièce d'identité du mandant",
    example: "NID987654321",
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  principalIdDocumentNumber: string;

  @ApiProperty({
    description: "Adresse du mandant",
    example: "Bouaké, Côte d'Ivoire",
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  principalAddress: string;

  @ApiProperty({
    description: "Type de procuration (facultatif)",
    example: "Générale",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  powerOfType?: string;

  @ApiProperty({
    description: "Raison de la procuration (facultatif)",
    example: "Gestion de biens en mon absence",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}