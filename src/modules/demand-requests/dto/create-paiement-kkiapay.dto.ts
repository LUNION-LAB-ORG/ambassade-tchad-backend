import { IsObject, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePaiementKkiapayDto {
    @ApiProperty({ description: 'Référence de la transaction' })
    @IsString()
    @Transform(({ value }) => String(value))
    transactionRef: string;

    @ApiProperty({ description: 'Numéro de ticket de la demande' })
    @IsString()
    @Transform(({ value }) => String(value))
    ticketNumber: string;

    @ApiPropertyOptional({ description: 'Motif du paiement' })
    @IsObject()
    @IsOptional()
    @Transform(({ value }) => value)
    reason?: {
        code: string;
        description: string;
    };
}

