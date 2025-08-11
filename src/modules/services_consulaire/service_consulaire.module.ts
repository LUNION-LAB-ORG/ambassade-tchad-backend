import { Module } from '@nestjs/common';
import { ServiceConsulaireService } from './services/service_consulaire.service';
import { ServiceConsulaireController } from './controllers/service_consulaire.controller';

@Module({
  providers: [ServiceConsulaireService],
  controllers: [ServiceConsulaireController]
})
export class ServiceConsulaireModule {}
