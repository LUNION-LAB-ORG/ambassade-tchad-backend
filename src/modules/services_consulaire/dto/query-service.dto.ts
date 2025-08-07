import { IsEnum, IsOptional, IsString } from "class-validator";
import { ServiceType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsInt, Min } from "class-validator";

export class QueryServiceDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEnum(ServiceType)
    @IsOptional()
    type?: ServiceType; 

    @IsOptional()
    isPriceVariable?: boolean;

    @IsOptional()
    defaultPrice?: number;

    @IsOptional()
    updatedBy?: string; 
    
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Le numéro de page doit être un entier.' })
    @Min(1, { message: 'Le numéro de page doit être au moins 1.' })
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Le nombre de résultats par page doit être un entier.' })
    @Min(1, { message: 'Le nombre de résultats par page doit être au moins 1.' })
    limit?: number;
}
