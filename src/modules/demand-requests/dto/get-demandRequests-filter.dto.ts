import { RequestStatus, ServiceType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsDateString, IsNumberString, IsNumber } from 'class-validator';

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

  @IsOptional()
  @Type(() => Number )
  @IsNumber()
  page?: number;


  @IsOptional()
  @Type(() => Number )
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  ticketNumber?: string;

  @IsOptional()
  @IsString()
  contactPhoneNumber?: string;
}
