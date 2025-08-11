import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { QueryResponseDto } from 'src/common/dto/query-response.dto';
import { Prisma, Expense as ExpenseModel } from '@prisma/client';
import { QueryExpenseDto } from '../dto/query-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';

@Injectable()
export class ExpensesService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateExpenseDto, userId: string) {
        // Résoudre le nom de catégorie en ID
        const category = await this.prisma.expenseCategory.findUnique({
            where: {
                name: dto.categoryName,
                isActive: true
            }
        });

        if (!category) {
            throw new NotFoundException(`Catégorie "${dto.categoryName}" introuvable`);
        }

        // Créer la dépense avec l'ID de catégorie résolu
        const { categoryName, ...expenseData } = dto;

        return this.prisma.expense.create({
            data: {
                ...expenseData,
                expenseDate: new Date(expenseData.expenseDate),
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

        // Filtres
        if (filters.recordedBy) {
            where.recordedBy = {
                id: filters.recordedBy
            }
        }
        if (filters.category) {
            // Filtrer par nom de catégorie
            where.category = {
                name: {
                    contains: filters.category,
                    mode: 'insensitive'
                }
            } as any
        }
        if (filters.amount) { where.amount = { gte: filters.amount } }
        if (filters.expenseDate) { where.expenseDate = { gte: new Date(filters.expenseDate) } }
        if (filters.description) { where.description = { contains: filters.description, mode: 'insensitive' } }


        const [total_expense, all_expense] = await Promise.all([
            this.prisma.expense.count({ where }),
            this.prisma.expense.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            isActive: true
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

        // 2. Statistiques détaillées par catégorie
        const expensesByCategory = await this.prisma.expense.groupBy({
            by: ['categoryId'],
            _count: { id: true },
            _sum: { amount: true },
        });

        // 3. Récupérer les informations des catégories avec statistiques
        const categoriesWithStats = await Promise.all(
            expensesByCategory.map(async (stat) => {
                const category = await this.prisma.expenseCategory.findUnique({
                    where: { id: stat.categoryId },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        isActive: true
                    }
                });

                return {
                    categoryId: stat.categoryId,
                    categoryName: category?.name || 'Catégorie supprimée',
                    categoryDescription: category?.description,
                    isActive: category?.isActive || false,
                    expenseCount: stat._count.id,
                    totalAmount: stat._sum.amount || 0,
                    percentage: totalExpenses > 0 ? ((stat._count.id / totalExpenses) * 100).toFixed(2) : '0.00'
                };
            })
        );

        // 4. Catégories sans dépenses
        const categoriesWithoutExpenses = await this.prisma.expenseCategory.findMany({
            where: {
                expenses: {
                    none: {}
                }
            },
            select: {
                id: true,
                name: true,
                description: true,
                isActive: true
            }
        });

        const emptyCategoriesStats = categoriesWithoutExpenses.map(category => ({
            categoryId: category.id,
            categoryName: category.name,
            categoryDescription: category.description,
            isActive: category.isActive,
            expenseCount: 0,
            totalAmount: 0,
            percentage: '0.00'
        }));

        // 5. Combiner toutes les catégories
        const allCategoriesStats = [...categoriesWithStats, ...emptyCategoriesStats]
            .sort((a, b) => b.expenseCount - a.expenseCount); // Trier par nombre de dépenses décroissant

        // 6. Par utilisateur
        const byAuthor = await this.prisma.expense.groupBy({
            by: ['recordedById'],
            _count: { id: true },
            _sum: { amount: true },
        });

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
                    percentage: totalExpenses > 0 ? ((author._count.id / totalExpenses) * 100).toFixed(2) : '0.00'
                };
            })
        );

        // 7. Top 5 catégories par nombre de dépenses
        const top5Categories = categoriesWithStats
            .filter(cat => cat.expenseCount > 0)
            .sort((a, b) => b.expenseCount - a.expenseCount)
            .slice(0, 5);

        // 8. Top 5 catégories par montant
        const top5CategoriesByAmount = categoriesWithStats
            .filter(cat => cat.totalAmount > 0)
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, 5);

        return {
            global: {
                totalExpenses,
                totalAmount: totalAmount._sum.amount || 0,
                totalCategories: allCategoriesStats.length,
                activeCategories: allCategoriesStats.filter(cat => cat.isActive).length,
                categoriesWithExpenses: categoriesWithStats.length,
                categoriesWithoutExpenses: emptyCategoriesStats.length
            },
            byCategory: allCategoriesStats,
            byAuthor: authors.sort((a, b) => b.count - a.count),
            topCategories: {
                byExpenseCount: top5Categories,
                byTotalAmount: top5CategoriesByAmount
            }
        };
    }

    async findOne(id: string) {
        const expense = await this.prisma.expense.findUnique({
            where: { id },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        isActive: true
                    }
                },
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
        await this.findOne(id);

        return this.prisma.expense.update({
            where: { id },
            data: {
                ...updateExpenseDto,
                expenseDate: updateExpenseDto.expenseDate ? new Date(updateExpenseDto.expenseDate) : undefined,
            },
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
