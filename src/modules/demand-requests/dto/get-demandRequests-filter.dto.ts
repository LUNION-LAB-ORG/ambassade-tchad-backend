import { RequestStatus, ServiceType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsDateString, IsNumberString } from 'class-validator';

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
  @IsNumberString()
  page?: number;

  @IsOptional()
  @IsNumberString()
  limit?: number;

  @IsOptional()
  @IsString()
  ticketNumber?: string;

  @IsOptional()
  @IsString()
  contactPhoneNumber?: string;
}
