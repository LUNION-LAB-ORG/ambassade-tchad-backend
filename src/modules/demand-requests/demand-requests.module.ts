import { Module } from '@nestjs/common';
import { DemandRequestsService } from './services/demand-requests.service';
import { DemandRequestsController } from './controllers/demand-requests.controller';
import { PaiementService } from './services/paiement.service';
import { PaiementController } from './controllers/paiement.controller';
import { KkiapayModule } from 'src/kkiapay/kkiapay.module';

@Module({
  imports: [KkiapayModule],
  providers: [DemandRequestsService, PaiementService],
  controllers: [DemandRequestsController, PaiementController],
})
export class DemandRequestsModule { }
