import { Module } from '@nestjs/common';
import { ExpensesService } from './services/expenses.service';
import { ExpensesController } from './controllers/expenses.controller';
import { ExpenseCategoriesController } from './controllers/expense-categories.controller';
import { ExpenseCategoriesService } from './services/expense-categories.service';
@Module({
  providers: [ExpensesService, ExpenseCategoriesService],
  controllers: [ExpensesController, ExpenseCategoriesController]
})
export class ExpensesModule { }
