import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsNotEmpty,
    MaxLength,
    IsString,
    IsEmail,
    IsPhoneNumber,
    MinLength,
    Matches,
} from 'class-validator';

export class RegisterClientDto {
    @ApiProperty({
        description: "Prénom du demandeur",
        example: 'Alice',
        required: true,
        maxLength: 100,
    })
    @IsNotEmpty({ message: 'Le prénom est obligatoire.' })
    @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
    @MaxLength(100, { message: 'Le prénom ne doit pas dépasser 100 caractères.' })
    @Transform(({ value }) => value.trim())
    firstName: string;

    @ApiProperty({
        description: "Nom de famille du demandeur",
        example: 'Martin',
        required: true,
        maxLength: 100,
    })
    @IsNotEmpty({ message: 'Le nom de famille est obligatoire.' })
    @IsString({ message: 'Le nom de famille doit être une chaîne de caractères.' })
    @MaxLength(100, { message: 'Le nom de famille ne doit pas dépasser 100 caractères.' })
    @Transform(({ value }) => value.trim())
    lastName: string;

    @ApiProperty({
        description: "Email du demandeur (utilisé comme identifiant de connexion)",
        example: 'alice.martin@example.com',
        required: true,
        maxLength: 100,
    })
    @IsNotEmpty({ message: 'L\'email est obligatoire.' })
    @IsEmail({}, { message: 'L\'email doit être une adresse email valide.' })
    @MaxLength(100, { message: 'L\'email ne doit pas dépasser 100 caractères.' })
    @Transform(({ value }) => value.trim().toLowerCase())
    email: string;

    @ApiProperty({
        description: 'Numéro de téléphone du demandeur (pour l\'envoi de l\'OTP)',
        example: '+2250707070707',
        required: true, // Rendu obligatoire pour l'envoi de l'OTP à l'inscription
        maxLength: 20,
    })
    @IsNotEmpty({ message: 'Le numéro de téléphone est obligatoire.' })
    @IsPhoneNumber("CI", { message: 'Numéro de téléphone non valide, utilisez le format international avec l\'indicatif du pays (ex: +225XXXXXXXXX).' })
    @IsString({ message: 'Le numéro de téléphone doit être une chaîne de caractères.' })
    @MaxLength(20, { message: 'Le numéro de téléphone ne doit pas dépasser 20 caractères.' })
    @Transform(({ value }) => value.trim())
    phoneNumber: string;

    @ApiProperty({
        description: "Mot de passe initial choisi par le demandeur",
        example: 'Motdepasse01!',
        required: true,
        maxLength: 15,
    })
    @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
    @IsString({ message: 'Le mot de passe doit être une chaîne de caractères.' })
    @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
    @MaxLength(15, { message: 'Le mot de passe ne doit pas dépasser 15 caractères.' })
    @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;':\".,<>?/\\])[A-Za-z\d!@#$%^&*()_+\-=\[\]{}|;':\".,<>?/\\]{8,}$/, {
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.',
    })
    @Transform(({ value }) => value.trim())
    password: string;
}
