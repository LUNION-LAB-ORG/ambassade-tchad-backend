import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import {
    JustificationDocumentType,
    RequestStatus,
    Role,
    ServiceType,
    UserType,
    VisaType,
} from '@prisma/client';
import { User } from '@prisma/client';
import { CreateDemandRequestDto } from '../dto/create-demandRequest.dto';
import { UpdateDemandRequestDto } from '../dto/update-damandRequest.dto';
import { generateTicketNumber } from '../utils/ticket-generator.dto';

@Injectable()
export class DemandRequestsService {
    constructor(private readonly prisma: PrismaService) {}

    private getTicketPrefix(serviceType: ServiceType): string {
        switch (serviceType) {
            case ServiceType.VISA:
                return 'VISA';
            case ServiceType.BIRTH_ACT_APPLICATION:
                return 'BIRTH';
            case ServiceType.CONSULAR_CARD:
                return 'CARD';
            case ServiceType.POWER_OF_ATTORNEY:
                return 'POA';
            case ServiceType.MARRIAGE_CAPACITY_ACT:
                return 'MARRIAGE';
            case ServiceType.DEATH_ACT_APPLICATION:
                return 'DEATH';
            case ServiceType.LAISSEZ_PASSER:
                return 'LPASS';
            case ServiceType.NATIONALITY_CERTIFICATE:
                return 'NAT';
            default:
                return 'REQ';
        }
    }

    async create(dto: CreateDemandRequestDto, userId: string) {
        const prefix = this.getTicketPrefix(dto.serviceType);
        const ticketNumber = await generateTicketNumber(this.prisma, prefix);
        const amount = this.calculateAmount(dto);

        const request = await this.prisma.request.create({
            data: {
                userId,
                ticketNumber,
                serviceType: dto.serviceType,
                status: RequestStatus.NEW,
                amount,

                visaDetails: dto.visaDetails ? { create: { ...dto.visaDetails } } : undefined,

                birthActDetails: dto.birthActDetails ? { create: { ...dto.birthActDetails } } : undefined,

                consularCardDetails: dto.consularCardDetails ? { create: { ...dto.consularCardDetails } } : undefined,

                laissezPasserDetails: dto.laissezPasserDetails
                    ? {
                          create: {
                              ...dto.laissezPasserDetails,
                              justificationDocumentType: dto.laissezPasserDetails.justificationDocumentType
                                  ? (dto.laissezPasserDetails.justificationDocumentType as JustificationDocumentType)
                                  : undefined,
                              accompaniers: dto.laissezPasserDetails.accompanied
                                  ? {
                                        create: dto.laissezPasserDetails.accompaniers || [],
                                    }
                                  : undefined,
                          },
                      }
                    : undefined,

                marriageCapacityActDetails: dto.marriageCapacityActDetails ? { create: { ...dto.marriageCapacityActDetails } } : undefined,

                deathActDetails: dto.deathActDetails ? { create: { ...dto.deathActDetails } } : undefined,

                powerOfAttorneyDetails: dto.powerOfAttorneyDetails
                    ? {
                          create: {
                              ...dto.powerOfAttorneyDetails,
                              agentJustificationDocumentType: dto.powerOfAttorneyDetails.agentJustificationDocumentType
                                  ? (dto.powerOfAttorneyDetails.agentJustificationDocumentType as JustificationDocumentType)
                                  : undefined,
                              principalJustificationDocumentType: dto.powerOfAttorneyDetails.principalJustificationDocumentType
                                  ? (dto.powerOfAttorneyDetails.principalJustificationDocumentType as JustificationDocumentType)
                                  : undefined,
                          },
                      }
                    : undefined,

                nationalityCertificateDetails: dto.nationalityCertificateDetails ? { create: { ...dto.nationalityCertificateDetails } } : undefined,
            },
            include: {
                visaDetails: true,
                birthActDetails: true,
                consularCardDetails: true,
                laissezPasserDetails: { include: { accompaniers: true } },
                marriageCapacityActDetails: true,
                deathActDetails: true,
                powerOfAttorneyDetails: true,
                nationalityCertificateDetails: true,
            },
        });

        return {
            message: 'Demande soumise avec succès.',
            ticketNumber: request.ticketNumber,
            data: request,
        };
    }

    private calculateAmount(dto: CreateDemandRequestDto): number {
        if (dto.serviceType === ServiceType.VISA && dto.visaDetails) {
            const { durationMonths, visaType } = dto.visaDetails;
            if (visaType === VisaType.SHORT_STAY && durationMonths > 3) {
                throw new BadRequestException('La durée ne peut pas excéder 3 mois pour un visa de court séjour.');
            }
            return visaType === VisaType.SHORT_STAY ? 35000 : 70000;
        }

        if (dto.serviceType === ServiceType.BIRTH_ACT_APPLICATION) return 2000;
        if (dto.serviceType === ServiceType.CONSULAR_CARD) return 15000;
        if (dto.serviceType === ServiceType.POWER_OF_ATTORNEY) return 8000;
        if (dto.serviceType === ServiceType.MARRIAGE_CAPACITY_ACT) return 10000;
        if (dto.serviceType === ServiceType.DEATH_ACT_APPLICATION) return 3000;
        if (dto.serviceType === ServiceType.LAISSEZ_PASSER) return 5000;
        if (dto.serviceType === ServiceType.NATIONALITY_CERTIFICATE) return 4000;

        throw new BadRequestException('Type de service non reconnu ou invalide.');
    }

    async getAll(page = 1, limit = 10) {
        const [total, data] = await Promise.all([
            this.prisma.request.count(),
            this.prisma.request.findMany({
                orderBy: { submissionDate: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: { select: { id: true, email: true, firstName: true, lastName: true } },
                    visaDetails: true,
                    birthActDetails: true,
                    consularCardDetails: true,
                    laissezPasserDetails: { include: { accompaniers: true } },
                    marriageCapacityActDetails: true,
                    deathActDetails: true,
                    powerOfAttorneyDetails: true,
                    nationalityCertificateDetails: true,
                },
            }),
        ]);

        return {
            meta: {
                total,
                page,
                limit,
                lastPage: Math.ceil(total / limit),
            },
            data,
        };
    }

    async getAllFiltered(query: {
    status?: RequestStatus;
    serviceType?: ServiceType;
    userId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}, pageNumber: number, pageSize: number) {
        const {
            status,
            serviceType,
            userId,
            fromDate,
            toDate,
            page = 1,
            limit = 10,
        } = query;

        const filters: any = {
            status,
            serviceType,
            userId,
            submissionDate: {
                gte: fromDate ? new Date(fromDate) : undefined,
                lte: toDate ? new Date(toDate) : undefined,
            },
        };

        Object.keys(filters).forEach((key) => {
            const val = filters[key];
            if (val === undefined || (typeof val === 'object' && val.gte === undefined && val.lte === undefined)) {
                delete filters[key];
            }
        });

        const [total, data] = await Promise.all([
            this.prisma.request.count({ where: filters }),
            this.prisma.request.findMany({
                where: filters,
                orderBy: { submissionDate: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: { select: { id: true, email: true, firstName: true, lastName: true } },
                    visaDetails: true,
                    birthActDetails: true,
                    consularCardDetails: true,
                    laissezPasserDetails: { include: { accompaniers: true } },
                    marriageCapacityActDetails: true,
                    deathActDetails: true,
                    powerOfAttorneyDetails: true,
                    nationalityCertificateDetails: true,
                },
            }),
        ]);

        return {
            meta: {
                total,
                page,
                limit,
                lastPage: Math.ceil(total / limit),
            },
            data,
        };
    }

    async trackByTicket(ticket: string, userId: string) {
        const request = await this.prisma.request.findUnique({
            where: { ticketNumber: ticket },
            select: { id: true, userId: true, status: true },
        });

        if (!request || request.userId !== userId) {
            throw new NotFoundException('Demande introuvable ou non autorisée.');
        }

        return { status: request.status };
    }

    async findOne(id: string, currentUser: User) {
        const request = await this.prisma.request.findUnique({
            where: { id },
            include: {
                visaDetails: true,
                birthActDetails: true,
                consularCardDetails: true,
                laissezPasserDetails: { include: { accompaniers: true } },
                marriageCapacityActDetails: true,
                deathActDetails: true,
                powerOfAttorneyDetails: true,
                nationalityCertificateDetails: true,
            },
        });

        if (!request) {
            throw new NotFoundException('Demande introuvable.');
        }

        if (currentUser.type !== UserType.PERSONNEL && request.userId !== currentUser.id) {
            throw new ForbiddenException('Accès refusé.');
        }

        return request;
    }

    async updateStatus(id: string, dto: UpdateDemandRequestDto, staffId: string) {
        const request = await this.prisma.request.findUnique({ where: { id } });

        if (!request) {
            throw new NotFoundException('Demande non trouvée.');
        }

        const updated = await this.prisma.request.update({
            where: { id },
            data: {
                status: dto.status,
                observations: dto.observation,
                updatedAt: new Date(),
            },
        });

        await this.prisma.requestStatusHistory.create({
            data: {
                requestId: id,
                changerId: staffId,
                oldStatus: request.status,
                newStatus: dto.status,
                reason: dto.reason,
            },
        });

        return {
            message: 'Statut mis à jour avec succès.',
            data: updated,
        };
    }

    async getStats() {
        const [total, byStatus, byServiceType] = await Promise.all([
            this.prisma.request.count(),
            this.prisma.request.groupBy({ by: ['status'], _count: true }),
            this.prisma.request.groupBy({ by: ['serviceType'], _count: true }),
        ]);

        return {
            total,
            byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
            byServiceType: Object.fromEntries(byServiceType.map((s) => [s.serviceType, s._count])),
        };
    }
}
