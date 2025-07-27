import { IsEnum, IsOptional, IsString, IsDateString, IsNumberString } from 'class-validator';

export class QueryVideoDto {
  @IsOptional()
  @IsString()  
  title?: string;

  @IsOptional()
  @IsString()
  authorId?: string;

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
