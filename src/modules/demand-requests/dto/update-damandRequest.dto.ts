import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { RequestStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDemandRequestDto {
  @ApiProperty({
    description: "Nouveau statut à appliquer",
    enum: RequestStatus,
    example: RequestStatus.APPROVED_BY_AGENT,
  })
  @IsEnum(RequestStatus, { message: 'Statut invalide.' })
  status: RequestStatus;

  @ApiProperty({
    description: "Motif ou remarque liée au changement de statut (optionnel)",
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La raison doit être une chaîne de caractères.' })
  @MaxLength(1000, { message: 'La raison ne doit pas dépasser 1000 caractères.' })
  reason?: string;

  @IsOptional()
  @IsString()
  observation?: string;
}
