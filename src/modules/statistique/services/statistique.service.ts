import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/services/prisma.service";
import { GetStatistiqueDto } from "../dtos/get-statistique.dto";
import { StatistiqueResponseDto } from "../types/statistique.type";
import { Role, UserType } from "@prisma/client";

@Injectable()
export class StatistiqueService {
    constructor(private prisma: PrismaService) { }

    async getStatistique(filter: GetStatistiqueDto): Promise<StatistiqueResponseDto> {
        const { fromDate, toDate } = filter;
        const start = fromDate ? new Date(fromDate) : undefined;
        const end = toDate ? new Date(toDate) : undefined;

        // 1. Nombre total de demandes sur la période
        const totalRequests = await this.prisma.request.count({
            where: {
                submissionDate: {
                    gte: start,
                    lte: end,
                },
            },
        });

        // 2. Nombre total de dépenses sur la période
        const totalExpenses = await this.prisma.expense.count({
            where: {
                expenseDate: {
                    gte: start,
                    lte: end,
                },
            },
        });

        // 3. Nombre total de personnel actif sur l'année
        const personnelCount = await this.prisma.user.count({
            where: {
                type: UserType.PERSONNEL,
                status: "ACTIVE",
                createdAt: {
                    gte: new Date(new Date().getFullYear(), 0, 1),
                    lte: new Date(new Date().getFullYear(), 11, 31),
                },
            },
        });

        // 4. Nombre total de demandeurs actifs sur l'année
        const demandeurCount = await this.prisma.user.count({
            where: {
                type: UserType.DEMANDEUR,
                status: "ACTIVE",
                createdAt: {
                    gte: new Date(new Date().getFullYear(), 0, 1),
                    lte: new Date(new Date().getFullYear(), 11, 31),
                },
            },
        });

        // 5. Les 5 derniers historiques de statut sur les demandes
        const recentStatusHistory = await this.prisma.requestStatusHistory.findMany({
            where: {
                changedAt: {
                    gte: start,
                    lte: end,
                },
            },
            orderBy: {
                changedAt: "desc",
            },
            take: 5,
            select: {
                changedAt: true,
                newStatus: true,
                changer: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                request: {
                    select: {
                        ticketNumber: true,
                        serviceType: true,
                        amount: true,
                    },
                },
            },
        });

        // 6. Les 10 derniers membres du personnel sur la période
        const recentPersonnel = await this.prisma.user.findMany({
            where: {
                type: UserType.PERSONNEL,
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 10,
            select: {
                firstName: true,
                lastName: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });

        // 7. Les 10 derniers demandeurs sur la période
        const recentDemandeurs = await this.prisma.user.findMany({
            where: {
                type: UserType.DEMANDEUR,
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 10,
            select: {
                firstName: true,
                lastName: true,
                createdAt: true,
            },
        });

        // 8. Stats sur les contenus pour l'année en cours
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31);

        const [newsCount, eventsCount, photosCount, videosCount] = await this.prisma.$transaction([
            this.prisma.news.count({
                where: {
                    createdAt: { gte: startOfYear, lte: endOfYear },
                },
            }),
            this.prisma.evenement.count({
                where: {
                    createdAt: { gte: startOfYear, lte: endOfYear },
                },
            }),
            this.prisma.photo.count({
                where: {
                    createdAt: { gte: startOfYear, lte: endOfYear },
                },
            }),
            this.prisma.video.count({
                where: {
                    createdAt: { gte: startOfYear, lte: endOfYear },
                },
            }),
        ]);

        return {
            totalRequests,
            totalExpenses,
            personnelCount,
            demandeurCount,
            recentStatusHistory: recentStatusHistory.map(history => ({
                date: history.changedAt,
                personName: `${history.changer.firstName} ${history.changer.lastName}`,
                serviceType: history.request.serviceType,
                ticketNumber: history.request.ticketNumber,
                status: history.newStatus,
                amount: history.request.amount,
            })),
            recentPersonnel,
            recentDemandeurs,
            contentStats: {
                news: newsCount,
                events: eventsCount,
                photos: photosCount,
                videos: videosCount,
            },
        };
    }
}