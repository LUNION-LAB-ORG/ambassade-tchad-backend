import { IsEnum, IsOptional, IsString, IsDateString, IsNumberString, IsBoolean } from 'class-validator';

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
  @IsNumberString()
  page?: number;

  @IsOptional()
  @IsNumberString()
  limit?: number;
}
