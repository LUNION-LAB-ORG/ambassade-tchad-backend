import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsDateString, IsNumberString, IsBoolean, IsNumber } from 'class-validator';

export class QueryEventsDto {
  @IsOptional()
  @IsString()  
  title?: string;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsString()
  location?: String;

  @IsOptional()
  @IsDateString()
  eventDate:string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
