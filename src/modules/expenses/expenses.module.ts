import { Module } from '@nestjs/common';
import { ExpensesService } from './services/expenses.service';
import { ExpensesController } from './controllers/expenses.controller';

@Module({
  providers: [ExpensesService],
  controllers: [ExpensesController]
})
export class ExpensesModule {}
