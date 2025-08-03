import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsString,
  IsBoolean,
  IsOptional,
  MaxLength,
  IsNotEmpty,
  IsArray,
  IsDateString
} from "class-validator";

export class CreateEventsDto {
  @ApiProperty({
    description: "Titre de l'événement",
    example: "Anniversaire de l'indépendance du Tchad",
    required: true,
    maxLength: 255,
  })
  @IsString({ message: 'Le titre doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'Le titre ne doit pas dépasser 255 caractères.' })
  @IsNotEmpty({ message: 'Le titre est obligatoire.' })
  @Transform(({ value }) => value.trim())
  title: string;

  @ApiProperty({
    description: "Contenu de l'événement",
    example: "Le Tchad célèbre son indépendance aujourd'hui avec des festivités à travers le pays.",
    required: true,
  })
  @IsNotEmpty({ message: 'Le contenu est obligatoire.' })
  @MaxLength(5000, { message: 'Le contenu ne doit pas dépasser 5000 caractères.' })
  @Transform(({ value }) => value.trim())
  @IsString({ message: 'Le contenu doit être une chaîne de caractères.' })
  description: string;

  @ApiProperty({
    description: "La date de l'événement",
    example: "2025-12-28",
    required: true,
  })
  @IsNotEmpty({ message: 'La date de l\'événement est obligatoire.' })
  @IsDateString({}, { message: 'La date doit être au format ISO (ex: 2025-12-28).' })
  eventDate: string;

  @ApiProperty({ type: 'string', format: 'binary', isArray: true })
  @IsArray({ message: 'Les images doivent être un tableau de chaînes de caractères.' })
  @IsOptional()
  imageUrl?: string[];

  @ApiProperty({
    description: "Indique si l'événement est publié",
    example: true,
    required: false,
  })
  @IsBoolean({ message: 'Le champ "published" doit être un booléen.' })
  @IsOptional()
  @Transform(({ value }) => {
        // Convertir automatiquement les chaînes en booléens
        if (typeof value === 'string') {
            return value === 'true';
        }
        return value;
    })
  published?: boolean;

  @ApiProperty({
    description: "Lieu de l'événement",
    example: 'Abidjan, Cocody',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Le lieu doit être une chaîne de caractères.' })
  @Transform(({ value }) => value?.trim())
  location?: string;
}
