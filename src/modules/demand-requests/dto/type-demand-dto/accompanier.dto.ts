import {
  IsOptional,
  IsDateString,
  IsString,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class AccompanierDto {
  @ApiProperty({
    description: "Prénom de l'accompagnant",
    example: 'Marie',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: "Nom de l'accompagnant",
    example: 'Dupont',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: "Date de naissance de l'accompagnant",
    example: '1995-06-15',
  })
  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({
    description: "Lieu de naissance de l'accompagnant",
    example: 'Paris',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  birthPlace: string;

  @ApiProperty({
    description: "Nationalité de l'accompagnant",
    example: 'Française',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  nationality: string;

  @ApiPropertyOptional({
    description: "Domicile de l'accompagnant",
    example: 'Lyon',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  domicile?: string;
}
