import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { QueryResponseDto } from 'src/common/dto/query-response.dto';
import { Prisma, Expense as ExpenseModel, ExpenseCategory } from '@prisma/client';
import { QueryExpenseDto } from '../dto/query-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';

@Injectable()
export class ExpensesService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateExpenseDto, userId: string) {
        // Résoudre le nom de catégorie en ID
        const category = await this.prisma.expenseCategory.findUnique({
            where: { name: dto.categoryName }
        });

        if (!category) {
            throw new NotFoundException(`Catégorie "${dto.categoryName}" introuvable`);
        }

        // Vérification temporairement désactivée
        // if (!category.isActive) {
        //     throw new ConflictException(`La catégorie "${dto.categoryName}" est désactivée`);
        // }

        // Créer la dépense avec l'ID de catégorie résolu
        const { categoryName, ...expenseData } = dto;
        
        return this.prisma.expense.create({
            data: {
                ...expenseData,
                categoryId: category.id,
                recordedById: userId
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                },
                recordedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
    }

    async findAllWithFilters(filters: QueryExpenseDto): Promise<QueryResponseDto<ExpenseModel>> {
        const page = filters.page ?? 1
        const limit = filters.limit ?? 10
        const skip = limit * (page - 1)
        const where: Prisma.ExpenseWhereInput = {}
        if (filters.recordedById) { where.recordedById = filters.recordedById }
        if (filters.category) { where.category = filters.category }
        if (filters.amount) { where.amount = filters.amount }
        if (filters.expenseDate) { where.expenseDate = { gte: new Date(filters.expenseDate) } }
        const [total_expense, all_expense] = await Promise.all([
            this.prisma.expense.count({ where }),
            this.prisma.expense.findMany({
                include: {
                    recordedBy: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            })
        ])

        const total_page = Math.ceil(total_expense / limit)
        return ({
            data: all_expense,
            meta: {
                total: total_expense,
                page: page,
                limit: limit,
                totalPages: total_page
            }
        })

    }


    async getStats() {
        // 1. Statistiques globales
        const totalExpenses = await this.prisma.expense.count();
        const totalAmount = await this.prisma.expense.aggregate({
            _sum: { amount: true },
        });

        // 2. Par catégorie (y compris isActive)
        const byCategory = await this.prisma.expenseCategory.findMany({
            select: {
                id: true,
                name: true,
                isActive: true,
                _count: { select: { expenses: true } },
            },
        });

        // 3. Par utilisateur
        const byAuthor = await this.prisma.expense.groupBy({
            by: ['recordedById'],
            _count: { id: true },
            _sum: { amount: true },
        });

        // 4. Dépenses actives/inactives
        const activeStatusStats = await this.prisma.expense.groupBy({
            by: ['categoryId'],
            where: {
                category: { isActive: true },
            },
            _count: { id: true },
            _sum: { amount: true },
        });

        // 5. Formatage des résultats
        const categories = byCategory.map((category) => ({
            id: category.id,
            name: category.name,
            isActive: category.isActive,
        }));

        const authors = await Promise.all(
            byAuthor.map(async (author) => {
                const user = await this.prisma.user.findUnique({
                    where: { id: author.recordedById },
                    select: { firstName: true, lastName: true },
                });
                return {
                    userId: author.recordedById,
                    userName: `${user?.firstName} ${user?.lastName}`,
                    count: author._count.id,
                    totalAmount: author._sum.amount || 0,
                };
            })
        );

        return {
            global: {
                totalExpenses,
                totalAmount: totalAmount._sum.amount || 0,
            },
            byCategory: categories,
            byAuthor: authors,
            activeStats: {
                activeCategories: activeStatusStats.length,
                activeExpenses: activeStatusStats.reduce((acc, curr) => acc + curr._count.id, 0),
                activeAmount: activeStatusStats.reduce((acc, curr) => acc + (curr._sum.amount || 0), 0),
            },
        };
    }

    async findOne(id: string) {
        const expense = await this.prisma.expense.findUnique({
            where: { id },
            include: {
                recordedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!expense) {
            throw new NotFoundException(`Dépense avec l'ID ${id} introuvable`);
        }

        return expense;
    }

    async update(id: string, updateExpenseDto: UpdateExpenseDto) {
        // Vérifier que la dépense existe avant de la mettre à jour
        await this.findOne(id);

        // Mettre à jour la dépense et retourner les données complètes avec les relations
        return this.prisma.expense.update({
            where: { id },
            data: updateExpenseDto as Prisma.ExpenseUpdateInput,
            include: {
                recordedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
    }

    async delete(id: string): Promise<{ message: string }> {
        await this.findOne(id);
        await this.prisma.expense.delete({ where: { id } })

        return { message: `Dépense avec l'ID ${id} supprimée avec succès.` };
    }
}
