import { Module } from '@nestjs/common';
import { ExpenseCategoriesService } from './services/expense-categories.service';
import { ExpenseCategoriesController } from './controllers/expense-categories.controller';

@Module({
    providers: [ExpenseCategoriesService],
    controllers: [ExpenseCategoriesController]  
})
export class ExpenseCategoriesModule {}
