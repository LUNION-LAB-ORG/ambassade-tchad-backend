import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { KkiapayModule } from 'src/kkiapay/kkiapay.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SocketIoModule } from 'src/socket-io/socket-io.module';
import { TwilioModule } from 'src/twilio/twilio.module';
import { EmailModule } from 'src/email/email.module';
import { JsonWebTokenModule } from 'src/json-web-token/json-web-token.module';
import { NewsModule } from './modules/news/news.module';
import { EventsModule } from './modules/events/events.module';
import { VideosModule } from './modules/galerie/videos/videos.module';
import { PhotosModule } from './modules/galerie/photos/photos.module';
import { DemandRequestsModule } from './modules/demand-requests/demand-requests.module';
import { ServiceConsulaireModule } from './modules/services_consulaire/service_consulaire.module';
import { ExpensesModule } from './modules/expenses/expenses.module';

@Module({
  imports: [
    JsonWebTokenModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({}),
    DatabaseModule,
    CommonModule,
    AuthModule,
    NotificationsModule,
    KkiapayModule,
    SocketIoModule,
    TwilioModule,
    EmailModule,
    NewsModule,
   EventsModule,
   PhotosModule,
   VideosModule,
   DemandRequestsModule,
   ExpensesModule,
   ServiceConsulaireModule,   
  ],
 
})

export class AppModule { }
