import { Module } from '@nestjs/common';
import { EventsService } from './service/events.service';
import { EventsController } from './controller/events.controller';

@Module({
  providers: [EventsService],
  controllers: [EventsController],
  exports:[EventsService]
})
export class EventsModule {}
