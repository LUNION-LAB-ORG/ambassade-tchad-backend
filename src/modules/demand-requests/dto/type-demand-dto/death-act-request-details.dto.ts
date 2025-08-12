import {
    IsDateString,
    IsString,
    IsNotEmpty,
    MaxLength,
} from 'class-validator';
import {
    ServiceType,
} from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class DeathActRequestDetailsDto {
       @ApiProperty({
    description: 'Type de service (fixé à CERTIFICATION DE DECES)',
    enum: ServiceType,
    example: ServiceType.DEATH_ACT_APPLICATION,
  })
  readonly serviceType?: "DEATH_ACT_APPLICATION" = "DEATH_ACT_APPLICATION";

  @ApiProperty({
    description: 'Prénom du défunt',
    example: 'Jean',
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  deceasedFirstName: string;

  @ApiProperty({
    description: 'Nom du défunt',
    example: 'Kouadio',
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  deceasedLastName: string;

  @ApiProperty({
    description: 'Date de naissance du défunt',
    example: '1950-04-22',
  })
  @IsDateString({}, { message: 'La date de naissance doit être au format ISO 8601' })
  @IsNotEmpty()
  deceasedBirthDate: string;

  @ApiProperty({
    description: 'Date de décès du défunt',
    example: '2023-01-15',
  })
  @IsDateString({}, { message: 'La date de décès doit être au format ISO 8601' })
  @IsNotEmpty()
  deceasedDeathDate: string;

  @ApiProperty({
    description: 'Nationalité du défunt',
    example: 'Ivoirienne',
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  deceasedNationality: string;
}
