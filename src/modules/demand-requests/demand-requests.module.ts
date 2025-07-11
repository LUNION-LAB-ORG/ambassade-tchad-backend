import { Module } from '@nestjs/common';
import { DemandRequestsService } from './services/demand-requests.service';
import { DemandRequestsController } from './controllers/demand-requests.controller';

@Module({
  providers: [DemandRequestsService],
  controllers: [DemandRequestsController]
})
export class DemandRequestsModule {}
