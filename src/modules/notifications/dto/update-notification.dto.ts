import { CreateNotificationDto } from './create-notification.dto';
import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @ApiPropertyOptional({
    description: 'Statut de lecture de la notification',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean; 
}