import { Module } from '@nestjs/common';
import { StatistiqueService } from './services/statistique.service';
import { StatistiqueController } from './controllers/statistique.controller';

@Module({
    providers: [StatistiqueService],
    controllers: [StatistiqueController]
})
export class StatistiqueModule { }
