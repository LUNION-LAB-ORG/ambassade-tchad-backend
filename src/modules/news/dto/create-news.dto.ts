import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { PartialType } from "@nestjs/mapped-types";
import { IsString, IsBoolean, IsOptional, MaxLength, IsNotEmpty, IsArray } from "class-validator";
import Api from "twilio/lib/rest/Api";

export class CreateNewsDto {
    @ApiProperty({
        description: "Titre de l'actualité",
        example: 'Anniversaire de l\'indépendance du Tchad',
        required: true,
        maxLength: 255,
    })
    @IsString({ message: 'Le titre doit être une chaîne de caractères.' })
    @MaxLength(255, { message: 'Le titre ne doit pas dépasser 255 caractères.' })
    @IsNotEmpty({ message: 'Le titre est obligatoire.' })
    @Transform(({ value }) => value.trim())
    title: string;

    @ApiProperty({
        description: "Contenu de l'actualité",
        example: 'Le Tchad célèbre son indépendance aujourd\'hui avec des festivités à travers le pays.',
        required: true,
    })
    @IsNotEmpty({ message: 'Le contenu est obligatoire.' })
    @MaxLength(5000, { message: 'Le contenu ne doit pas dépasser 5000 caractères.' })
    @Transform(({ value }) => value.trim())
    @IsString({ message: 'Le contenu doit être une chaîne de caractères.' })
    content: string;


    @ApiProperty({ type: 'string', format: 'binary', isArray: true })
    @IsArray()
    @IsOptional()
    imageUrls: string[];

    @ApiProperty({
        description: "Indique si l'actualité est publiée",
        example: true,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => {
        // Convertir automatiquement les chaînes en booléens
        if (typeof value === 'string') {
            return value === 'true';
        }
        return value;
    })
    published?: boolean;

}