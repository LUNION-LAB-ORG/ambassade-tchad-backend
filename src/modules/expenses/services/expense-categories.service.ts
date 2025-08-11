import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/services/prisma.service";
import { CreateExpenseCategoryDto } from "../dto/create-expense-category.dto";
import { ConflictException } from "@nestjs/common";
import { QueryResponseDto } from "src/common/dto/query-response.dto";
import { QueryExpenseCategoryDto } from "../dto/query-expense-category.dto";
import { Prisma, ExpenseCategory as ExpenseCategoryModel } from "@prisma/client";
import { UpdateExpenseCategoryDto } from "../dto/update-expense-category.dto";

@Injectable()
export class ExpenseCategoriesService {
    constructor(private prisma: PrismaService) { }

    async create(createExpenseCategoryDto: CreateExpenseCategoryDto) {
        const existingCategory = await this.prisma.expenseCategory.findUnique({
            where: { name: createExpenseCategoryDto.name }
        });

        if (existingCategory) {
            throw new ConflictException(`Une catégorie avec le nom "${createExpenseCategoryDto.name}" existe déjà`);
        }

        return this.prisma.expenseCategory.create({
            data: createExpenseCategoryDto,
        });
    }

    async findAllWithFilters(filters: QueryExpenseCategoryDto): Promise<ExpenseCategoryModel[]> {
        const where: Prisma.ExpenseCategoryWhereInput = {}
        if (filters.name) { where.name = { contains: filters.name, mode: 'insensitive' } }
        if (filters.isActive) { where.isActive = filters.isActive }

        const all_expense_category = await this.prisma.expenseCategory.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        })

        return all_expense_category;
    }

    async findOne(id: string) {
        return this.prisma.expenseCategory.findUnique({ where: { id } });
    }

    async getStats() {
        const total = await this.prisma.expenseCategory.count();
        const isActive = await this.prisma.expenseCategory.count({ where: { isActive: true } });
        const isNotActive = await this.prisma.expenseCategory.count({ where: { isActive: false } });
        return {
            total,
            isActive,
            isNotActive,
        };
    }

    async update(id: string, updateExpenseCategoryDto: UpdateExpenseCategoryDto) {
        return this.prisma.expenseCategory.update({
            where: { id },
            data: updateExpenseCategoryDto,
        });
    }

    async remove(id: string) {
        return this.prisma.expenseCategory.delete({ where: { id } });
    }
}
