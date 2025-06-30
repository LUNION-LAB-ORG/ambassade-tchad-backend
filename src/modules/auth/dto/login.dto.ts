import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsNotEmpty,
    MaxLength,
    Matches,
    IsEmail,
    IsString,
} from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: "Email de l'utilisateur",
        example: 'user@ambassade.com',
        required: true,
        maxLength: 100,
    })
    @IsNotEmpty({ message: 'L\'email est obligatoire.' })
    @IsEmail({}, { message: 'L\'email doit être une adresse email valide.' })
    @MaxLength(100, { message: 'L\'email ne doit pas dépasser 100 caractères.' })
    @Transform(({ value }) => value.trim().toLowerCase())
    email: string;

    @ApiProperty({
        description: "Mot de passe de l'utilisateur",
        example: 'Password01@',
        required: true,
        maxLength: 15,
    })
    @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
    @IsString({ message: 'Le mot de passe doit être une chaîne de caractères.' })
    @MaxLength(15, { message: 'Le mot de passe ne doit pas dépasser 15 caractères.' })
    @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;':\".,<>?/\\])[A-Za-z\d!@#$%^&*()_+\-=\[\]{}|;':\".,<>?/\\]{8,}$/, {
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.',
    })
    @Transform(({ value }) => value.trim())
    password: string;
}