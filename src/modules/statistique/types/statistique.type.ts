import { RequestStatus, ServiceType, Role, UserStatus } from "@prisma/client";

export class StatistiqueResponseDto {
    totalRequests: number;
    totalExpenses: number;
    personnelCount: number;
    demandeurCount: number;
    recentStatusHistory: RecentStatusHistoryDto[];
    recentPersonnel: RecentPersonnelDto[];
    recentDemandeurs: RecentDemandeursDto[];
    contentStats: ContentStatsDto;
}

export class RecentStatusHistoryDto {
    date: Date;
    personName: string;
    serviceType: ServiceType;
    ticketNumber: string;
    status: RequestStatus;
    amount: number;
}

export class RecentPersonnelDto {
    firstName: string | null;
    lastName: string | null;
    role: Role | null;
    status: UserStatus;
    createdAt: Date;
}

export class RecentDemandeursDto {
    firstName: string | null;
    lastName: string | null;
    createdAt: Date;
}

export class ContentStatsDto {
    news: number;
    events: number;
    photos: number;
    videos: number;
}