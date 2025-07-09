import { Module } from '@nestjs/common';
import { VideosController } from './controllers/videos.controller';
import { VideosService } from './services/videos.service';

@Module({
  providers: [VideosService],
  controllers: [VideosController]
})
export class VideosModule {}
