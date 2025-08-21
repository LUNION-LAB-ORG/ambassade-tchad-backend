import { IsOptional, IsDateString } from 'class-validator';

export class GetStatistiqueDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
