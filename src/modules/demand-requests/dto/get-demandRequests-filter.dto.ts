import { RequestStatus, ServiceType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsDateString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetDemandRequestsFilterDto {
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

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

  @IsOptional()
  @IsString()
  ticketNumber?: string;
}
