import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, MaxLength, IsNotEmpty, IsArray } from "class-validator";

export class CreateVideosDto {
    @ApiProperty({
        description: "Titre de la video",
        example: 'Anniversaire de l\'indépendance du Tchad',
        required: true,
        maxLength: 255,
    })
    @IsString({message: 'Le titre doit être une chaîne de caractères.' })
    @MaxLength(255, {message: 'Le titre ne doit pas dépasser 255 caractères.'})
    @IsNotEmpty({ message: 'Le titre est obligatoire.' })
    @Transform(({ value }) => value.trim())
    title: string;

    @ApiProperty({
        description: "Contenu de la vidéo",
        example: 'Le Tchad célèbre son indépendance aujourd\'hui avec des festivités à travers le pays.',
        required: true,
    })
    @IsNotEmpty({ message: 'La description est obligatoire.' })
    @MaxLength(5000, { message: 'Le contenu ne doit pas dépasser 5000 caractères.' })
    @Transform(({ value }) => value.trim())
    @IsString({message: 'Le contenu doit être une chaîne de caractères.'})
    description: string;

    @ApiProperty({
        description: "URL de l'image associée à l'actualité",
        example: 'https://www.youtube.com/watch?v=DWsUwrgxNzA&list=RD3ymvDpsNj54&index=9',
        required: true,
    })
    @IsNotEmpty({ message: 'La description est obligatoire.' })
    @MaxLength(5000, { message: 'Le contenu ne doit pas dépasser 5000 caractères.' })
    @IsString({message: 'Le contenu doit être une chaîne de caractères.'})
    youtubeUrl: string;

}


