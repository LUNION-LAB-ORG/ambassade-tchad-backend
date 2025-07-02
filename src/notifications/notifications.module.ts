import { Module, Global } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsWebSocketService } from './websockets/notifications-websocket.service';
@Global()
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService,
    NotificationsWebSocketService],
  exports: [
    NotificationsService,
    NotificationsWebSocketService
  ],
})
export class NotificationsModule { }
