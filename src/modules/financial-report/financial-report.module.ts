import { Module } from '@nestjs/common';
import { FinancialReportService } from './services/financial-report.service';
import { FinancialReportController } from './controllers/financial-report.controller';
@Module({
    providers: [FinancialReportService],
    controllers: [FinancialReportController]
})
export class FinancialReportModule { }
