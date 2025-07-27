import { Module } from '@nestjs/common';
import { PhotosService } from './services/photos.service';
import { PhotosController } from './controllers/photos.controller';

@Module({
  providers: [PhotosService],
  controllers: [PhotosController]
})
export class PhotosModule {}
