import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class QueryExpenseCategoryDto {
    @ApiPropertyOptional({
        description: "Nom de la catégorie",
        example: "Transport",
        required: false,
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({
        description: "Statut de la catégorie",
        example: true,
        required: false,
    })
    @IsBoolean()
    @Type(() => Boolean)
    @IsOptional()
    isActive?: boolean;
}
