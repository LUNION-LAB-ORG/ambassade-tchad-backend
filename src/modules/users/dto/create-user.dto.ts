import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  MaxLength,
  IsString,
  IsEnum,
  IsEmail,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  // PRÉNOM
  @ApiProperty({
    description: "Prénom de l'utilisateur du personnel",
    example: 'Jean',
    required: true,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Le prénom est obligatoire.' })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
  @MaxLength(100, { message: 'Le prénom ne doit pas dépasser 100 caractères.' })
  @Transform(({ value }) => value.trim())
  firstName: string;

  // NOM DE FAMILLE
  @ApiProperty({
    description: "Nom de famille de l'utilisateur du personnel",
    example: 'Dupont',
    required: true,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Le nom de famille est obligatoire.' })
  @IsString({ message: 'Le nom de famille doit être une chaîne de caractères.' })
  @MaxLength(100, { message: 'Le nom de famille ne doit pas dépasser 100 caractères.' })
  @Transform(({ value }) => value.trim())
  lastName: string;

  // EMAIL
  @ApiProperty({
    description: "Email de l'utilisateur du personnel",
    example: 'jean.dupont@ambassade.com',
    required: true,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'L\'email est obligatoire.' })
  @IsEmail({}, { message: 'L\'email doit être une adresse email valide.' })
  @MaxLength(100, { message: 'L\'email ne doit pas dépasser 100 caractères.' })
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;

  // NUMÉRO DE TÉLÉPHONE
  @ApiProperty({
    description: 'Numéro de téléphone de l\'utilisateur du personnel',
    example: '+2250707070707',
    required: false,
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Le numéro de téléphone doit être une chaîne de caractères.' })
  @MaxLength(20, { message: 'Le numéro de téléphone ne doit pas dépasser 20 caractères.' })
  @Transform(({ value }) => value.trim())
  phoneNumber?: string;

  @ApiProperty({
    description: "Rôle de l'utilisateur (AGENT, CHEF_SERVICE, CONSUL, ADMIN)",
    enum: Role,
    example: Role.AGENT,
    required: true,
  })
  @IsNotEmpty({ message: 'Le rôle est obligatoire pour un utilisateur du personnel.' })
  @IsEnum(Role, { message: 'Le rôle doit être une valeur valide de Role.' })
  role: Role;
}