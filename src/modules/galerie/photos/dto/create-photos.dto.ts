import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, MaxLength, IsNotEmpty, IsArray } from "class-validator";

export class CreatePhotosDto {
    @ApiProperty({
        description: "Titre de l'evenement",
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
        description: "Contenu de l'evenement",
        example: 'Le Tchad célèbre son indépendance aujourd\'hui avec des festivités à travers le pays.',
        required: true,
    })
    @IsNotEmpty({ message: 'Le contenu est obligatoire.' })
    @MaxLength(5000, { message: 'Le contenu ne doit pas dépasser 5000 caractères.' })
    @Transform(({ value }) => value.trim())
    @IsString({message: 'Le contenu doit être une chaîne de caractères.'})
    description: string;

    @ApiProperty({
        description: "URL de l'image associée à l'actualité",
        example: ['https://example.com/image.jpg',"https://example.com/image.jpg"],
        required: true,
    })
    @IsArray()
    @IsString({ each:true})
    imageUrl: string[];

}


