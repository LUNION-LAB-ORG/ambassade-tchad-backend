import { Injectable, BadRequestException } from '@nestjs/common';
import { ServiceType } from '@prisma/client';
import {
    Transaction,
    RevenueByService,
    ExpenseByCategory,
    MonthlyData,
} from '../dtos/types.dto';
import { GetReportDto } from '../dtos/get-report.dto';
import { PrismaService } from 'src/database/services/prisma.service';

@Injectable()
export class FinancialReportService {
    constructor(private prisma: PrismaService) { }

    async getFullReport(query: GetReportDto) {
        const { period, year, month, quarter } = query;
        const { startDate, endDate } = this.getPeriodDates(period, year, month, quarter);

        const payments = await this.prisma.payment.findMany({
            where: { paymentDate: { gte: startDate, lte: endDate } },
        });

        const expenses = await this.prisma.expense.findMany({
            where: { expenseDate: { gte: startDate, lte: endDate } },
            include: { category: true },
        });

        const totalRevenue = this.calculateTotalRevenue(payments);
        const totalExpenses = this.calculateTotalExpenses(expenses);
        const transactions = await this.getTransactions(payments, expenses);
        const revenueByService = await this.getRevenueByService(payments);
        const expensesByCategory = this.getExpensesByCategory(expenses, totalExpenses);
        const monthlyData = await this.getMonthlyData(year);

        return {
            totalRevenue,
            totalExpenses,
            transactions,
            revenueByService,
            expensesByCategory,
            monthlyData,
        };
    }

    async getTotalRevenue(period: 'month' | 'quarter' | 'year', year: number, month?: number, quarter?: number): Promise<number> {
        const { startDate, endDate } = this.getPeriodDates(period, year, month, quarter);
        const result = await this.prisma.payment.aggregate({
            where: { paymentDate: { gte: startDate, lte: endDate } },
            _sum: { amount: true },
        });
        return result._sum.amount || 0;
    }

    async getTotalExpenses(period: 'month' | 'quarter' | 'year', year: number, month?: number, quarter?: number): Promise<number> {
        const { startDate, endDate } = this.getPeriodDates(period, year, month, quarter);
        const result = await this.prisma.expense.aggregate({
            where: { expenseDate: { gte: startDate, lte: endDate } },
            _sum: { amount: true },
        });
        return result._sum.amount || 0;
    }

    async getRevenueByService(payments: any[]): Promise<RevenueByService[]> {
        const serviceIds = [...new Set(payments.map(p => p.requestId))];
        const requests = await this.prisma.request.findMany({
            where: { id: { in: serviceIds } },
            select: { id: true, serviceType: true },
        });
        const serviceMap = new Map<string, ServiceType>(requests.map(req => [req.id, req.serviceType]));

        const aggregation = payments.reduce((acc, p) => {
            const serviceType = serviceMap.get(p.requestId);
            if (!serviceType) return acc;

            if (!acc[serviceType]) {
                acc[serviceType] = { service: serviceType, amount: 0, count: 0 };
            }
            acc[serviceType].amount += p.amount;
            acc[serviceType].count += 1;
            return acc;
        }, {});

        return Object.values(aggregation);
    }

    getExpensesByCategory(expenses: any[], totalExpenses: number): ExpenseByCategory[] {
        const aggregation: Record<string, ExpenseByCategory> = expenses.reduce((acc: Record<string, ExpenseByCategory>, expense) => {
            const categoryName = expense.category.name;
            if (!acc[categoryName]) {
                acc[categoryName] = { category: categoryName, amount: 0, percentage: 0 };
            }
            acc[categoryName].amount += expense.amount;
            return acc;
        }, {});

        return Object.values(aggregation).map(item => ({
            ...item,
            percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0,
        }));
    }

    async getTransactions(payments: any[], expenses: any[]): Promise<Transaction[]> {
        const mappedPayments: Transaction[] = payments.map(p => ({
            id: p.id,
            date: this.formatDate(p.paymentDate),
            description: `Paiement pour la demande ${p.requestId}`,
            type: 'revenue',
            category: 'Revenus',
            amount: p.amount,
        }));

        const mappedExpenses: Transaction[] = expenses.map(e => ({
            id: e.id,
            date: this.formatDate(e.expenseDate),
            description: e.description,
            type: 'expense',
            category: e.category.name,
            amount: e.amount,
        }));

        return [...mappedPayments, ...mappedExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Ajout de la méthode manquante pour le rapport mensuel
    private async getMonthlyData(year: number): Promise<MonthlyData[]> {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
        ];

        // Utilisation de la méthode groupBy de Prisma pour une agrégation efficace
        const revenueData = await this.prisma.payment.groupBy({
            by: ['paymentDate'],
            _sum: { amount: true },
            where: {
                paymentDate: {
                    gte: new Date(Date.UTC(year, 0, 1)),
                    lte: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
                },
            },
        });

        const expenseData = await this.prisma.expense.groupBy({
            by: ['expenseDate'],
            _sum: { amount: true },
            where: {
                expenseDate: {
                    gte: new Date(Date.UTC(year, 0, 1)),
                    lte: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
                },
            },
        });

        const monthlyMap: MonthlyData[] = months.map(month => ({ month, revenue: 0, expenses: 0 }));

        revenueData.forEach(item => {
            // Les données de Prisma sont typées et safe
            const monthIndex = item.paymentDate.getUTCMonth();
            monthlyMap[monthIndex].revenue += item._sum.amount || 0;
        });

        expenseData.forEach(item => {
            const monthIndex = item.expenseDate.getUTCMonth();
            monthlyMap[monthIndex].expenses += item._sum.amount || 0;
        });

        return monthlyMap;
    }


    private getPeriodDates(
        period: 'month' | 'quarter' | 'year',
        year: number,
        month?: number,
        quarter?: number,
    ): { startDate: Date; endDate: Date } {
        let startDate: Date;
        let endDate: Date;

        if (period === 'year') {
            startDate = new Date(Date.UTC(year, 0, 1));
            endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
        } else if (period === 'quarter') {
            if (quarter === undefined) throw new BadRequestException('Quarter is required for quarter period.');
            const startMonth = (quarter - 1) * 3;
            const endMonth = startMonth + 2;
            startDate = new Date(Date.UTC(year, startMonth, 1));
            endDate = new Date(Date.UTC(year, endMonth + 1, 0, 23, 59, 59, 999));
        } else if (period === 'month') {
            if (month === undefined) throw new BadRequestException('Month is required for month period.');
            startDate = new Date(Date.UTC(year, month - 1, 1));
            endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
        } else {
            throw new BadRequestException('Invalid period specified.');
        }

        return { startDate, endDate };
    }

    private calculateTotalRevenue(payments: any[]): number {
        return payments.reduce((sum, p) => sum + p.amount, 0);
    }

    private calculateTotalExpenses(expenses: any[]): number {
        return expenses.reduce((sum, e) => sum + e.amount, 0);
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}