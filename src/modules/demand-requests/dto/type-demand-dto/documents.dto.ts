import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDocumentDto {
  @ApiProperty({ example: 'VISA_john.doe@example.com_2025-07-16.pdf' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  mimeType: string;

  @ApiProperty({ example: '/uploads/documents/VISA_john.doe@example.com_2025-07-16.pdf' })
  @IsString()
  filePath: string;

  @ApiProperty({ example: 153 }) 
  @IsInt()
  @Type(() => Number)
  fileSizeKB: number;

  @ApiProperty({ example: 'uuid-of-uploader' })
  @IsString()
  uploaderId: string;
}
