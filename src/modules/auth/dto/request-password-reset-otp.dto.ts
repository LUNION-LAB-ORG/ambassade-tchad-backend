import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RequestPasswordResetOtpDto {
    @ApiProperty({
        description: "Email de l'utilisateur pour la réinitialisation du mot de passe. L'OTP sera envoyé au numéro de téléphone lié à cet email.",
        example: 'utilisateur@ambassade.com',
        required: true,
        maxLength: 100,
    })
    @IsNotEmpty({ message: 'L\'email est obligatoire.' })
    @IsEmail({}, { message: 'L\'email doit être une adresse email valide.' })
    @MaxLength(100, { message: 'L\'email ne doit pas dépasser 100 caractères.' })
    @Transform(({ value }) => value.trim().toLowerCase())
    email: string;
}