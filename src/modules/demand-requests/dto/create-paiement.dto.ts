import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, IsDateString } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentMethod } from "@prisma/client";

export class CreatePaiementDto {
    @ApiProperty({ description: 'Mode de paiement', enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    @Transform(({ value }) => String(value) as PaymentMethod)
    method: PaymentMethod = PaymentMethod.CASH;

    @ApiProperty({ description: 'Montant du paiement' })
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    amount: number = 0;

    @ApiProperty({ description: 'Référence du paiement' })
    @IsString()
    @IsOptional()
    @Transform(({ value }) => String(value))
    transactionRef?: string;

    @ApiPropertyOptional({ description: 'Date du paiement' })
    @IsDateString()
    @IsOptional()
    @Transform(({ value }) => String(value))
    paymentDate?: string = new Date().toISOString();

    @ApiProperty({ description: 'ticketNumber de la demande' })
    @IsString()
    @IsOptional()
    @Transform(({ value }) => String(value))
    ticketNumber?: string;

    @ApiProperty({ description: 'Id du personnel' })
    @IsUUID()
    @IsOptional()
    @Transform(({ value }) => String(value))
    recordedById?: string;

    @ApiPropertyOptional({ description: 'Source du paiement' })
    @IsString()
    @IsOptional()
    @Transform(({ value }) => String(value))
    source?: string;
}

