import { ApiProperty } from "@nestjs/swagger";
import { ServiceType } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsString, MinLength, MaxLength, IsNumberString, Min, IsOptional, IsEnum, IsBoolean } from "class-validator";

export class CreateServiceDto {
    @ApiProperty({
        example: "Visa",
        description: "Nom du service",
        required: true
    })
    @IsString({ message: "Le nom du service doit être une chaîne de caractères" })
    @MinLength(3, { message: "Le nom du service doit contenir au moins 3 caractères" })
    @MaxLength(100, { message: "Le nom du service doit contenir au maximum 100 caractères" })
    name: string;

    @ApiProperty({
        example: "Description du service",
        description: "Description du service",
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        example: "Visa",
        description: "Type du service",
        required: true
    })
    @IsString({ message: "Le type du service doit être une chaîne de caractères" })
    @IsEnum(ServiceType, { message: "Le type du service doit être un type valide" })
    type: ServiceType;

    @ApiProperty({
        example: "1000",
        description: "Prix du service",
        required: true
    })
    @IsNumberString()
    @Transform(({ value }) => Number(value))
    @Min(0, { message: "Le prix du service doit être supérieur ou égal à 0" })
    defaultPrice: number;

    @ApiProperty({
        example: "false",
        description: "Indique si le prix de ce service peut varier en fonction de sous-options (comme pour le visa)",
        required: false
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    isPriceVariable?: boolean;
}
