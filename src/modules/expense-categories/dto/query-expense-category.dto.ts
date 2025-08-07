import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { IsInt, Min, Max } from "class-validator";

export class QueryExpenseCategoryDto {
    @IsString()
    @IsOptional()
    name?: string;
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
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
