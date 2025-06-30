import { Role, UserStatus, UserType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsEmail, MaxLength, MinLength, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryUserDto {
    @ApiProperty({
        description: "Filtrer par type d'utilisateur (DEMANDEUR ou PERSONNEL)",
        enum: UserType,
        required: false,
        example: UserType.PERSONNEL,
    })
    @IsOptional()
    @IsEnum(UserType, { message: 'Le type d\'utilisateur doit être une valeur valide (DEMANDEUR ou PERSONNEL).' })
    type?: UserType;

    @ApiProperty({
        description: "Filtrer par statut de l'utilisateur (ACTIVE ou INACTIVE)",
        enum: UserStatus,
        required: false,
        example: UserStatus.ACTIVE,
    })
    @IsOptional()
    @IsEnum(UserStatus, { message: 'Le statut de l\'utilisateur doit être une valeur valide (ACTIVE ou INACTIVE).' })
    status?: UserStatus;

    @ApiProperty({
        description: "Filtrer par rôle de l'utilisateur (AGENT, CHEF_SERVICE, CONSUL, ADMIN) - pertinent pour le personnel",
        enum: Role,
        required: false,
        example: Role.AGENT,
    })
    @IsOptional()
    @IsEnum(Role, { message: 'Le rôle de l\'utilisateur doit être une valeur valide de Role.' })
    role?: Role;

    @ApiProperty({
        description: "Filtrer par prénom (recherche partielle insensible à la casse)",
        example: 'jea',
        required: false,
        minLength: 2,
        maxLength: 100,
    })
    @IsOptional()
    @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
    @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères pour la recherche.' })
    @MaxLength(100, { message: 'Le prénom ne doit pas dépasser 100 caractères.' })
    @Transform(({ value }) => value.trim())
    firstName?: string;

    @ApiProperty({
        description: "Filtrer par nom de famille (recherche partielle insensible à la casse)",
        example: 'dup',
        required: false,
        minLength: 2,
        maxLength: 100,
    })
    @IsOptional()
    @IsString({ message: 'Le nom de famille doit être une chaîne de caractères.' })
    @MinLength(2, { message: 'Le nom de famille doit contenir au moins 2 caractères pour la recherche.' })
    @MaxLength(100, { message: 'Le nom de famille ne doit pas dépasser 100 caractères.' })
    @Transform(({ value }) => value.trim())
    lastName?: string;

    @ApiProperty({
        description: "Filtrer par email (recherche partielle insensible à la casse)",
        example: 'jean.dup',
        required: false,
        minLength: 3,
        maxLength: 100,
    })
    @IsOptional()
    @IsEmail({}, { message: 'L\'email doit être une adresse email valide si fourni.' })
    @MaxLength(100, { message: 'L\'email ne doit pas dépasser 100 caractères.' })
    @Transform(({ value }) => value.trim().toLowerCase())
    email?: string;

    @ApiProperty({
        description: "Filtrer par numéro de téléphone (recherche partielle)",
        example: '+22507',
        required: false,
        maxLength: 20,
    })
    @IsOptional()
    @IsString({ message: 'Le numéro de téléphone doit être une chaîne de caractères.' })
    @MaxLength(20, { message: 'Le numéro de téléphone ne doit pas dépasser 20 caractères.' })
    @Transform(({ value }) => value.trim())
    phoneNumber?: string;

    @ApiProperty({
        description: "Numéro de la page à récupérer",
        example: 1,
        required: false,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Le numéro de page doit être un entier.' })
    @Min(1, { message: 'Le numéro de page doit être au moins 1.' })
    page?: number = 1;

    @ApiProperty({
        description: "Nombre d'éléments par page",
        example: 10,
        required: false,
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Le nombre d\'éléments par page doit être un entier.' })
    @Min(1, { message: 'Le nombre d\'éléments par page doit être au moins 1.' })
    @Max(100, { message: 'Le nombre d\'éléments par page ne peut pas dépasser 100.' })
    limit?: number = 10;
}