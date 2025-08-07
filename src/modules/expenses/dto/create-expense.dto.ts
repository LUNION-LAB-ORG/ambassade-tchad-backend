import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, IsUUID } from "class-validator";

export class CreateExpenseDto {
    @ApiProperty({
        description: "Montant de la dépense",
        example: 1000,
        required: true,
    })
    @IsNumber()
    @IsNotEmpty({ message: 'Le montant est obligatoire.' })
    amount: number;

    @ApiProperty({
        description: "Description de la dépense",
        example: "Description de la dépense",
        required: true,
        maxLength: 255,
    })
    @IsString()
    @MaxLength(255, { message: 'La description ne doit pas dépasser 255 caractères.' })
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: "Nom de la catégorie de dépense",
        example: "Salaires",
        required: true,
    })
    @IsString({ message: 'Le nom de la catégorie doit être une chaîne de caractères.' })
    @IsNotEmpty({ message: 'La catégorie est obligatoire.' })
    @Transform(({ value }) => value?.trim())
    categoryName: string;

    @ApiProperty({
        description: "Date de la dépense",
        example: "2022-01-01",
        required: true,
    })
    @IsDateString()
    @IsNotEmpty({ message: 'La date est obligatoire.' })
    @Transform(({ value }) => value.trim()) 
    expenseDate: string;
}