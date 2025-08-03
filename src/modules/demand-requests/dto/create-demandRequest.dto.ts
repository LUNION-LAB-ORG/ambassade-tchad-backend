import {
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsArray,
} from 'class-validator';
import {
  ServiceType,
} from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VisaRequestDetailsDto } from './type-demand-dto/visa-request-details.dto';
import { BirthActRequestDetailsDto } from './type-demand-dto/birth-act-request-details.dto';
import { ConsularCardRequestDetailsDto } from './type-demand-dto/consular-card-request-details.dto';
import { LaissezPasserRequestDetailsDto } from './type-demand-dto/laissez-passer-request-details.dto';
import { MarriageCapacityActRequestDetailsDto } from './type-demand-dto/marriage-capacity-act-request-details.dto';
import { DeathActRequestDetailsDto } from './type-demand-dto/death-act-request-details.dto';
import { PowerOfAttorneyRequestDetailsDto } from './type-demand-dto/power-of-attorney-request-details.dto';
import { NationalityCertificateRequestDetailsDto } from './type-demand-dto/nationality-certificate-request-details.dto';

export class CreateDemandRequestDto {
  @ApiProperty({
    enum: ServiceType,
    description: 'Type de service demandé',
    example: ServiceType.VISA,
  })
  @IsEnum(ServiceType, { message: 'Type de service invalide.' })
  @IsNotEmpty({ message: 'Le type de service est requis.' })
  serviceType: ServiceType;

  @ApiPropertyOptional({ type: () => VisaRequestDetailsDto })
  @IsOptional()
  @IsString()
  visaDetails?: string;

  @ApiPropertyOptional({ type: () => BirthActRequestDetailsDto })
  @IsOptional()
  @IsString()
  birthActDetails?: string;

  @ApiPropertyOptional({ type: () => ConsularCardRequestDetailsDto })
  @IsOptional()
  consularCardDetails?: string;

  @ApiPropertyOptional({ type: () => LaissezPasserRequestDetailsDto })
  @IsOptional()
  laissezPasserDetails?: string;

  @ApiPropertyOptional({ type: () => MarriageCapacityActRequestDetailsDto })
  @IsOptional()
  marriageCapacityActDetails?: string;

  @ApiPropertyOptional({ type: () => DeathActRequestDetailsDto })
  @IsOptional()
  deathActDetails?: string;

  @ApiPropertyOptional({ type: () => PowerOfAttorneyRequestDetailsDto })
  @IsOptional()
  powerOfAttorneyDetails?: string;

  @ApiPropertyOptional({ type: () => NationalityCertificateRequestDetailsDto })
  @IsOptional()
  nationalityCertificateDetails?: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone de contact',
    example: '+2250701020304',
  })
  @IsOptional()
  @IsString({ message: 'Le numéro de téléphone doit être une chaîne.' })
  contactPhoneNumber?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'Fichiers PDF à uploader (relevé, attestation, etc.)',
  })
  @IsOptional()
  @IsArray()
  documents?: Express.Multer.File[];
}