import { Module } from '@nestjs/common';
import { ExpensesService } from './services/expenses.service';
import { ExpensesController } from './controllers/expenses.controller';
import { ExpenseCategoriesService } from './services/expense-categories.service';
import { ExpenseCategoriesController } from './controllers/expense-categories.controller';
@Module({
  providers: [ExpensesService, ExpenseCategoriesService],
  controllers: [ExpensesController, ExpenseCategoriesController]
})
export class ExpensesModule { }
