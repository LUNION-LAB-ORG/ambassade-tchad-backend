import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, MaxLength, IsString, IsEmail, MinLength } from 'class-validator';

export class CompleteOtpLoginDto {
  @ApiProperty({
    description: "Email de l'utilisateur pour la vérification OTP",
    example: 'user@ambassade.com',
    required: true,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'L\'email est obligatoire.' })
  @IsEmail({}, { message: 'L\'email doit être une adresse email valide.' })
  @MaxLength(100, { message: 'L\'email ne doit pas dépasser 100 caractères.' })
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string; // Utilisation de l'email pour lier à l'utilisateur

  @ApiProperty({
    description: "Code de vérification OTP à 4 chiffres",
    example: '1234',
    required: true,
    maxLength: 4, // Longueur de l'OTP confirmée
    minLength: 4, // Ajouté pour s'assurer que c'est bien 4 chiffres
  })
  @IsNotEmpty({ message: 'Le code de vérification est obligatoire.' })
  @IsString({ message: 'Le code de vérification doit être une chaîne de caractères.' })
  @MaxLength(4, { message: 'Le code de vérification doit contenir 4 caractères.' })
  @MinLength(4, { message: 'Le code de vérification doit contenir 4 caractères.' })
  @Transform(({ value }) => value.trim())
  otp: string;
}