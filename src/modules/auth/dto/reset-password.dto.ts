import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsNotEmpty,
    MaxLength,
    Matches,
    IsEmail,
    IsString,
    MinLength,
} from 'class-validator';

export class ResetPasswordDto {
    @ApiProperty({
        description: "Email de l'utilisateur pour la réinitialisation du mot de passe.",
        example: 'utilisateur@ambassade.com',
        required: true,
        maxLength: 100,
    })
    @IsNotEmpty({ message: 'L\'email est obligatoire.' })
    @IsEmail({}, { message: 'L\'email doit être une adresse email valide.' })
    @MaxLength(100, { message: 'L\'email ne doit pas dépasser 100 caractères.' })
    @Transform(({ value }) => value.trim().toLowerCase())
    email: string;

    @ApiProperty({
        description: "Nouveau mot de passe de l'utilisateur",
        example: 'NouveauMotDePasse01!',
        required: true,
        maxLength: 15,
    })
    @IsNotEmpty({ message: 'Le nouveau mot de passe est obligatoire.' })
    @IsString({ message: 'Le nouveau mot de passe doit être une chaîne de caractères.' })
    @MinLength(8, { message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' })
    @MaxLength(15, { message: 'Le nouveau mot de passe ne doit pas dépasser 15 caractères.' })
    @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;':\".,<>?/\\])[A-Za-z\d!@#$%^&*()_+\-=\[\]{}|;':\".,<>?/\\]{8,}$/, {
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.',
    })
    @Transform(({ value }) => value.trim())
    newPassword: string;

    // @ApiProperty({
    //     description: "Code de vérification OTP à 4 chiffres",
    //     example: '1234',
    //     required: true,
    //     maxLength: 4,
    //     minLength: 4,
    // })
    // @IsNotEmpty({ message: 'Le code OTP est obligatoire.' })
    // @IsString({ message: 'Le code OTP doit être une chaîne de caractères.' })
    // @MaxLength(4, { message: 'Le code OTP doit contenir 4 caractères.' })
    // @MinLength(4, { message: 'Le code OTP doit contenir 4 caractères.' })
    // @Transform(({ value }) => value.trim())
    // otp: string;*

    @IsString()
    @MinLength(6, { message: 'Le mot de passe actuel doit contenir au moins 6 caractères' })
    currentPassword: string;

    @IsString()
    @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
    confirmPassword: string;
}

