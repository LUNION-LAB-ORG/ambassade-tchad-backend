import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, Min } from "class-validator";

export class UpdateServiceDto {
    @ApiProperty({
        example: "1500",
        description: "Nouveau prix du service",
        required: true
    })
    @Transform(({ value }) => {
        const num = Number(value);
        return isNaN(num) ? value : num;
    })
    @IsNumber({}, { message: "Le prix du service doit être un nombre valide" })
    @Min(0, { message: "Le prix du service doit être supérieur ou égal à 0" })
    defaultPrice: number;
}