import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsBoolean, IsOptional, MaxLength, IsNotEmpty, IsArray, IsDateString } from "class-validator";

export class CreateEventsDto {
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
        description:"la date de l'évènement",
        example:"28/12/2025",
        required: true
    })

    @IsNotEmpty({ message: 'La date de l\'evenment est obligatoire.' })
    @MaxLength(5000, { message: 'Le contenu ne doit pas dépasser 5000 caractères.' })
    @Transform(({ value }) => value.trim())
    @IsDateString()
    eventDate: string

    @ApiProperty({
        description: "URL de l'image associée à l'actualité",
        example: 'https://example.com/image.jpg',
        required: false,
    })
    @IsArray()
    @IsString({ each:true})
    imageUrls: string[];

    @ApiProperty({
        description: "Indique si l'actualité est publiée",
        example: true,
        required: false,
    })


    @IsBoolean()
    @IsOptional()
    published?: boolean;

    @ApiProperty({
        description: "URL de l'image associée à l'actualité",
        example: 'Abdjan, cocody',
        required: false,
    })
    @IsOptional()
    @IsString()
    location?: string;


}


