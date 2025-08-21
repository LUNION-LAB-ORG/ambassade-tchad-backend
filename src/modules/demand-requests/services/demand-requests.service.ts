import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import {
    Prisma,
    RequestStatus,
    ServiceType,
    UserType,
    VisaType,
} from '@prisma/client';
import { User } from '@prisma/client';
import { CreateDemandRequestDto } from '../dto/create-demandRequest.dto';
import { UpdateDemandRequestDto } from '../dto/update-damandRequest.dto';
import {
    generateTicketNumber,
    getTicketPrefix,
} from '../utils/ticket-generator.dto';
import { CreateDocumentDto } from '../dto/type-demand-dto/documents.dto';
import { GetDemandRequestsFilterDto } from '../dto/get-demandRequests-filter.dto';
import { QueryResponseDto } from 'src/common/dto/query-response.dto';
import { GenerateDataService } from 'src/common/services/generate-data.service';

@Injectable()
export class DemandRequestsService {
    trackRequestByTicket(ticket: string) {
        throw new Error('Method not implemented.');
    }
    constructor(private readonly prisma: PrismaService) { }

    private async createRequestWithDetails(
        dto: CreateDemandRequestDto,
        userId: string,
        prefix: string,
        details: any,
    ) {
        const ticketNumber = await generateTicketNumber(this.prisma, prefix);
        const amount = await this.calculateAmount(dto.serviceType);

        const request = await this.prisma.request.create({
            data: {
                userId,
                ticketNumber,
                serviceType: dto.serviceType,
                status: RequestStatus.NEW,
                amount,
                contactPhoneNumber: dto.contactPhoneNumber,
                ...details,
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

    async create(
        dto: CreateDemandRequestDto,
        userId: string,
        files: Express.Multer.File[],
    ) {
        // Création spécifique selon le type de service
        switch (dto.serviceType) {
            case ServiceType.VISA:
                return this.createVisaRequest(dto, userId, files);
                break;
            case ServiceType.BIRTH_ACT_APPLICATION:
                return this.createBirthActRequest(dto, userId, files);
                break;
            case ServiceType.CONSULAR_CARD:
                return this.createConsularCardRequest(dto, userId, files);
                break;
            case ServiceType.POWER_OF_ATTORNEY:
                return this.createPowerOfAttorneyRequest(dto, userId, files);
                break;
            case ServiceType.MARRIAGE_CAPACITY_ACT:
                return this.createMarriageCapacityActRequest(dto, userId, files);
                break;
            case ServiceType.DEATH_ACT_APPLICATION:
                return this.createDeathActRequest(dto, userId, files);
                break;
            case ServiceType.LAISSEZ_PASSER:
                return this.createLaissezPasserRequest(dto, userId, files);
                break;
            case ServiceType.NATIONALITY_CERTIFICATE:
                return this.createNationalityCertificateRequest(dto, userId, files);
                break;
            default:
                throw new BadRequestException('Type de service non reconnu.');
        }
    }

    private formatDocumentsData(
        files: Express.Multer.File[] | undefined,
        userId: string,
    ): CreateDocumentDto[] {
        if (!files || files.length === 0) {
            return [];
        }
        return files.map((file) => ({
            fileName: file.originalname,
            mimeType: file.mimetype,
            filePath: file.path,
            fileSizeKB: Math.ceil(file.size / 1024),
            uploaderId: userId,
        }));
    }

    private async createVisaRequest(
        dto: CreateDemandRequestDto,
        userId: string,
        files: Express.Multer.File[],
    ) {
        const { visaDetails, ...demande } = dto;
        const visaDetailsObject =
        typeof visaDetails === 'string'
            ? JSON.parse(visaDetails)
            : visaDetails;
        if (!visaDetailsObject) {
            throw new BadRequestException('Les détails du visa sont requis.');
        }
        // Préparation des données de la requête
        const prefix = getTicketPrefix(demande.serviceType);
        const ticketNumber = await generateTicketNumber(this.prisma, prefix);
        const amount = await this.calculateAmount(
            dto.serviceType,
            visaDetailsObject?.durationMonths,
        );

        // Préparation des données du visa
        const visaType =
            visaDetailsObject.durationMonths <= 3
                ? VisaType.SHORT_STAY
                : VisaType.LONG_STAY;

        const finalVisaDetails = {
            ...visaDetailsObject,
            visaType,
        };

        // Préparation des Documents
        const documentsData = this.formatDocumentsData(files, userId);
        const request = await this.prisma.request.create({
            data: {
                userId,
                ticketNumber,
                serviceType: dto.serviceType,
                status: RequestStatus.NEW,
                amount,
                contactPhoneNumber: dto.contactPhoneNumber,
                visaDetails: {
                    create: {
                        ...finalVisaDetails,
                        personBirthDate: new Date(finalVisaDetails.personBirthDate),
                        passportIssueDate: new Date(finalVisaDetails.passportIssueDate),
                        passportExpirationDate: new Date(finalVisaDetails.passportExpirationDate),
                    },
                },
                documents: {
                    create: documentsData,
                },
            },
            include: {
                visaDetails: true,
                documents: true,
            },
        });
        return {
            message: 'Demande soumise avec succès.',
            ticketNumber: request.ticketNumber,
            data: request,
        };
    }

    private async createBirthActRequest(
        dto: CreateDemandRequestDto,
        userId: string,
        files: Express.Multer.File[],
    ) {
        const { birthActDetails, ...demande } = dto;
        const birthDetailsObject =
        typeof birthActDetails === 'string'
            ? JSON.parse(birthActDetails)
            : birthActDetails;
        if (!birthDetailsObject) {
            throw new BadRequestException(
                "Les détails du l'extrait de naissance sont requis.",
            );
        }
        const prefix = getTicketPrefix(demande.serviceType);
        const ticketNumber = await generateTicketNumber(this.prisma, prefix);
        const amount = await this.calculateAmount(
            dto.serviceType,
            birthDetailsObject?.durationMonths,
        );
        const finalbirthDetails = {
            ...birthDetailsObject,
        };
        // Préparation des Documents
        const documentsData = this.formatDocumentsData(files, userId);
        const request = await this.prisma.request.create({
            data: {
                userId,
                ticketNumber,
                serviceType: dto.serviceType,
                status: RequestStatus.NEW,
                amount,
                contactPhoneNumber: dto.contactPhoneNumber,
                birthActDetails: {
                    create: {
                        ...finalbirthDetails,
                        personBirthDate: new Date(finalbirthDetails.personBirthDate),
                    },
                },
                documents: {
                    create: documentsData,
                },
            },
            include: {
                birthActDetails: true,
                documents: true,
            },
        });
        return {
            message: 'Demande soumise avec succès.',
            ticketNumber: request.ticketNumber,
            data: request,
        };
    }

    private async createConsularCardRequest(
        dto: CreateDemandRequestDto,
        userId: string,
        files: Express.Multer.File[],
    ) {
        const { consularCardDetails, ...demande } = dto;
        const consularCardDetailsObject =
        typeof consularCardDetails === 'string'
            ? JSON.parse(consularCardDetails)
            : consularCardDetails;
        if (!consularCardDetailsObject) {
            throw new BadRequestException('Les détails du visa sont requis.');
        }
        const prefix = getTicketPrefix(demande.serviceType);
        const ticketNumber = await generateTicketNumber(this.prisma, prefix);
        const amount = await this.calculateAmount(
            dto.serviceType,
            consularCardDetailsObject?.durationMonths,
        );
        const finalconsularCardDetails = {
            ...consularCardDetailsObject,
        };
        // Préparation des Documents
        const documentsData = this.formatDocumentsData(files, userId);
        const request = await this.prisma.request.create({
            data: {
                userId,
                ticketNumber,
                serviceType: dto.serviceType,
                status: RequestStatus.NEW,
                amount,
                contactPhoneNumber: dto.contactPhoneNumber,
                consularCardDetails: {
                    create: {
                        ...finalconsularCardDetails,
                        personBirthDate: new Date(finalconsularCardDetails.personBirthDate),
                    },
                },
                documents: {
                    create: documentsData,
                },
            },
            include: {
                consularCardDetails: true,
                documents: true,
            },
        });
        return {
            message: 'Demande soumise avec succès.',
            ticketNumber: request.ticketNumber,
            data: request,
        };
    }

    private async createPowerOfAttorneyRequest(
        dto: CreateDemandRequestDto,
        userId: string,
        files: Express.Multer.File[],
    ) {
        const { powerOfAttorneyDetails, ...demande } = dto;

        const powerOfAttorneyDetailsObject =
        typeof powerOfAttorneyDetails === 'string'
            ? JSON.parse(powerOfAttorneyDetails)
            : powerOfAttorneyDetails;

        if (!powerOfAttorneyDetailsObject) {
            throw new BadRequestException(
                'Les détails de la procuration sont requis.',
            );
        }

        const prefix = getTicketPrefix(demande.serviceType);
        const ticketNumber = await generateTicketNumber(this.prisma, prefix);
        const amount = await this.calculateAmount(dto.serviceType);

        const finalPowerOfAttorneyDetails = {
            ...powerOfAttorneyDetailsObject,
            agentJustificationDocumentType:
                powerOfAttorneyDetailsObject.agentJustificationDocumentType,
            principalJustificationDocumentType:
                powerOfAttorneyDetailsObject.principalJustificationDocumentType,
        };

        const documentsData = this.formatDocumentsData(files, userId);

        const request = await this.prisma.request.create({
            data: {
                userId,
                ticketNumber,
                serviceType: dto.serviceType,
                status: RequestStatus.NEW,
                amount,
                contactPhoneNumber: dto.contactPhoneNumber,
                powerOfAttorneyDetails: {
                    create: finalPowerOfAttorneyDetails,
                },
                documents: {
                    create: documentsData,
                },
            },
            include: {
                powerOfAttorneyDetails: true,
                documents: true,
            },
        });

        return {
            message: 'Demande soumise avec succès.',
            ticketNumber: request.ticketNumber,
            data: request,
        };
    }

    private async createMarriageCapacityActRequest(
        dto: CreateDemandRequestDto,
        userId: string,
        files: Express.Multer.File[],
    ) {
        const { marriageCapacityActDetails, ...demande } = dto;

        const marriageCapacityActDetailsObject =
        typeof marriageCapacityActDetails === 'string'
            ? JSON.parse(marriageCapacityActDetails)
            : marriageCapacityActDetails;

        if (!marriageCapacityActDetailsObject) {
            throw new BadRequestException(
                "Les détails de l'acte de capacité de mariage sont requis.",
            );
        }

        const prefix = getTicketPrefix(demande.serviceType);
        const ticketNumber = await generateTicketNumber(this.prisma, prefix);
        const amount = await this.calculateAmount(dto.serviceType);

        const documentsData = this.formatDocumentsData(files, userId);

        const request = await this.prisma.request.create({
            data: {
                userId,
                ticketNumber,
                serviceType: dto.serviceType,
                status: RequestStatus.NEW,
                amount,
                contactPhoneNumber: dto.contactPhoneNumber,
                marriageCapacityActDetails: {
                    create: {
                        ...marriageCapacityActDetailsObject,
                        husbandBirthDate: new Date(marriageCapacityActDetailsObject.husbandBirthDate),
                        wifeBirthDate: new Date(marriageCapacityActDetailsObject.wifeBirthDate),
                    },
                },
                documents: {
                    create: documentsData,
                },
            },
            include: {
                marriageCapacityActDetails: true,
                documents: true,
            },
        });

        return {
            message: 'Demande soumise avec succès.',
            ticketNumber: request.ticketNumber,
            data: request,
        };
    }

    private async createDeathActRequest(
        dto: CreateDemandRequestDto,
        userId: string,
        files: Express.Multer.File[],
    ) {
        const { deathActDetails, ...demande } = dto;
        const deathActDetailsObject =
        typeof deathActDetails === 'string'
            ? JSON.parse(deathActDetails)
            : deathActDetails;

    if (!deathActDetailsObject) {
        throw new BadRequestException(
            'Les détails de l\'acte de décès sont requis.',
        );
    }

        const prefix = getTicketPrefix(demande.serviceType);
        const ticketNumber = await generateTicketNumber(this.prisma, prefix);
        const amount = await this.calculateAmount(dto.serviceType);
        const documentsData = this.formatDocumentsData(files, userId);

        const request = await this.prisma.request.create({
            data: {
                userId,
                ticketNumber,
                serviceType: dto.serviceType,
                status: RequestStatus.NEW,
                amount,
                contactPhoneNumber: dto.contactPhoneNumber,
                deathActDetails: {
                    create: {
                        ...deathActDetailsObject,
                        deceasedBirthDate: new Date(deathActDetailsObject.deceasedBirthDate),
                        deceasedDeathDate: new Date(deathActDetailsObject.deceasedDeathDate),
                    },
                },
                documents: {
                    create: documentsData,
                },
            },
            include: {
                deathActDetails: true,
                documents: true,
            },
        });

        return {
            message: 'Demande soumise avec succès.',
            ticketNumber: request.ticketNumber,
            data: request,
        };
    }

    private async createLaissezPasserRequest(
        dto: CreateDemandRequestDto,
        userId: string,
        files: Express.Multer.File[],
    ) {
        const { laissezPasserDetails, ...demande } = dto;

        let laissezPasserDetailsObject: any;

        if (typeof laissezPasserDetails === 'string') {
            try {
                laissezPasserDetailsObject = JSON.parse(laissezPasserDetails);
            } catch (error) {
                throw new BadRequestException(
                    'Format JSON invalide pour les détails du laissez-passer.',
                );
            }
        } else if (
            typeof laissezPasserDetails === 'object' &&
            laissezPasserDetails !== null
        ) {
            laissezPasserDetailsObject = laissezPasserDetails;
        } else {
            throw new BadRequestException(
                'Les détails du laissez-passer sont requis.',
            );
        }

        // Parse accompaniers s'ils sont sous forme string JSON
        if (
            laissezPasserDetailsObject.accompanied &&
            typeof laissezPasserDetailsObject.accompaniers === 'string'
        ) {
            try {
                laissezPasserDetailsObject.accompaniers = JSON.parse(
                    laissezPasserDetailsObject.accompaniers,
                );
                if (Array.isArray(laissezPasserDetailsObject.accompaniers)) {
                    laissezPasserDetailsObject.accompaniers = laissezPasserDetailsObject.accompaniers.map((accompagner: any) => {
                        return {
                            ...accompagner,
                            birthDate: new Date(accompagner.birthDate),
                        };
                    });
                }
            } catch (error) {
                throw new BadRequestException(
                    'Le champ accompaniers doit être un tableau JSON valide.',
                );
            }
        }

        const prefix = getTicketPrefix(demande.serviceType);
        const ticketNumber = await generateTicketNumber(this.prisma, prefix);
        const amount = await this.calculateAmount(dto.serviceType);

        const documentsData = this.formatDocumentsData(files, userId);

        const request = await this.prisma.request.create({
            data: {
                userId,
                ticketNumber,
                serviceType: dto.serviceType,
                status: RequestStatus.NEW,
                amount,
                contactPhoneNumber: dto.contactPhoneNumber,
                laissezPasserDetails: {
                    create: {
                        ...laissezPasserDetailsObject,
                        accompanied: Boolean(laissezPasserDetailsObject.accompanied),
                        personBirthDate: new Date(laissezPasserDetailsObject.personBirthDate),
                        justificationDocumentType:
                            laissezPasserDetailsObject.justificationDocumentType,
                        accompaniers: laissezPasserDetailsObject.accompanied
                            ? {
                                create: laissezPasserDetailsObject.accompaniers || [],
                            }
                            : undefined,
                    },
                },
                documents: {
                    create: documentsData,
                },
            },
            include: {
                laissezPasserDetails: {
                    include: { accompaniers: true },
                },
                documents: true,
            },
        });

        return {
            message: 'Demande de laissez-passer soumise avec succès.',
            ticketNumber: request.ticketNumber,
            data: request,
        };
    }

    private async createNationalityCertificateRequest(
        dto: CreateDemandRequestDto,
        userId: string,
        files: Express.Multer.File[],
    ) {
        const { nationalityCertificateDetails, ...demande } = dto;

        // 1. Parser les détails depuis JSON (si nécessaire)
        const details =
            typeof nationalityCertificateDetails === 'string'
                ? JSON.parse(nationalityCertificateDetails)
                : nationalityCertificateDetails;

        if (!details) {
            throw new BadRequestException(
                'Les détails du certificat de nationalité sont requis.',
            );
        }

        // 2. Générer le ticket et le montant
        const prefix = getTicketPrefix(demande.serviceType); // ex: "NAT-"
        const ticketNumber = await generateTicketNumber(this.prisma, prefix);
        const amount = await this.calculateAmount(dto.serviceType);

        // 3. Formater les fichiers
        const documentsData = this.formatDocumentsData(files, userId);

        // 4. Créer la demande
        const request = await this.prisma.request.create({
            data: {
                userId,
                ticketNumber,
                serviceType: dto.serviceType,
                status: RequestStatus.NEW,
                amount,
                contactPhoneNumber: dto.contactPhoneNumber,
                nationalityCertificateDetails: {
                    create: {
                        ...details,
                        applicantBirthDate: new Date(details.applicantBirthDate),
                    },
                },
                documents: {
                    create: documentsData,
                },
            },
            include: {
                nationalityCertificateDetails: true,
                documents: true,
            },
        });

        return {
            message: 'Demande de certificat de nationalité soumise avec succès.',
            ticketNumber: request.ticketNumber,
            data: request,
        };
    }

    private async calculateAmount(
        serviceType: ServiceType,
        durationMonths?: number,
    ): Promise<number> {
        const service = await this.prisma.service.findUnique({
            where: { type: serviceType },
        });

        if (!service) {
            throw new BadRequestException('Type de service non reconnu ou invalide.');
        }
        if (service.isPriceVariable) {
            if (serviceType === ServiceType.VISA && durationMonths) {
                if (durationMonths <= 3) {
                    // Court séjour : injecter automatiquement le type de visa
                    return service.defaultPrice;
                } else {
                    // Long séjour : injecter automatiquement le type de visa
                    return service.defaultPrice * 2;
                }
            } else {
                throw new BadRequestException('Renseigner la durée du Visa');
            }
        }
        return service.defaultPrice;
    }

    async getAllFiltered(query: GetDemandRequestsFilterDto) {
        const {
            status,
            serviceType,
            userId,
            fromDate,
            toDate,
            ticketNumber,
            page = 1,
            limit = 10,
        } = query;

        const where: Prisma.RequestWhereInput = {}
        if (status) {
            where.status = status
        }
        if (serviceType) {
            where.serviceType = serviceType
        }
        if (userId) {
            where.userId = userId
        }
        if (ticketNumber) {
            where.ticketNumber = { contains: ticketNumber, mode: 'insensitive' }
        }
        if (fromDate || toDate) {
            where.submissionDate = {
                gte: fromDate ? new Date(fromDate) : undefined,
                lte: toDate ? new Date(toDate) : undefined,
            }
        }
        const [total, data] = await Promise.all([
            this.prisma.request.count({ where }),
            this.prisma.request.findMany({
                where,
                orderBy: { submissionDate: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: {
                        select: { id: true, email: true, firstName: true, lastName: true },
                    },
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

        if (
            currentUser.type !== UserType.PERSONNEL &&
            request.userId !== currentUser.id
        ) {
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
        const dateDebut = GenerateDataService.obtenirDateDebut('month');

        const [total, byStatus, byServiceType] = await Promise.all([
            this.prisma.request.count(),
            this.prisma.request.groupBy({ by: ['status'], _count: true }),
            this.prisma.request.groupBy({ by: ['serviceType'], _count: true }),
        ]);

        return {
            total,
            byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
            byServiceType: Object.fromEntries(
                byServiceType.map((s) => [s.serviceType, s._count]),
            ),
        };
    }

    // Statistiques pour le demandeur
    async getStatsForUser(userId: string) {
        const dateDebut = GenerateDataService.obtenirDateDebut('month');
        const userExists = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });

        if (!userExists) {
            throw new NotFoundException('Utilisateur non trouvé.');
        }

        const [total, byStatus, byServiceType] = await Promise.all([
            this.prisma.request.count({ where: { userId, submissionDate: { gte: dateDebut } } }),
            this.prisma.request.groupBy({
                by: ['status'],
                where: { userId, submissionDate: { gte: dateDebut } },
                _count: true,
            }),
            this.prisma.request.groupBy({
                by: ['serviceType'],
                where: { userId, submissionDate: { gte: dateDebut } },
                _count: true,
            }),
        ]);

        return {
            total,
            byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
            byServiceType: Object.fromEntries(
                byServiceType.map((s) => [s.serviceType, s._count]),
            ),
        };
    }

    async getUserRequests(
        userId: string,
        query: Omit<GetDemandRequestsFilterDto, 'contactPhoneNumber' | 'userId'>,
    ): Promise<
        QueryResponseDto<
            Prisma.RequestGetPayload<{
                include: {
                    visaDetails: true;
                    birthActDetails: true;
                    consularCardDetails: true;
                    laissezPasserDetails: { include: { accompaniers: true } };
                    marriageCapacityActDetails: true;
                    deathActDetails: true;
                    powerOfAttorneyDetails: true;
                    nationalityCertificateDetails: true;
                };
            }>
        >
    > {
        const where: Prisma.RequestWhereInput = { userId };

        if (query.status) {
            where.status = query.status;
        }
        if (query.serviceType) {
            where.serviceType = query.serviceType;
        }
        if (query.fromDate) {
            where.submissionDate = {
                gte: new Date(query.fromDate),
            };
        }
        if (query.toDate) {
            where.submissionDate = {
                lte: new Date(query.toDate),
            };
        }

        if (query.ticketNumber) {
            where.ticketNumber = query.ticketNumber;
        }

        const page = Number(query.page ?? 1);
        const limit = Number(query.limit ?? 10);


        const [total, data] = await Promise.all([
            this.prisma.request.count({
                where,
            }),
            this.prisma.request.findMany({
                where,
                orderBy: { submissionDate: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
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
            }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getServicesPrices() {
        const services = await this.prisma.service.findMany({
            select: {
                type: true,
                defaultPrice: true,
                isPriceVariable: true,
            },
        });

        if (services.length === 0) {
            throw new NotFoundException('Aucun service trouvé.');
        }

        return services;
    }

    async findByTicket(ticket: string, userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé.');
        }
        if (user.type !== UserType.PERSONNEL && user.id !== userId) {
            throw new ForbiddenException('Accès refusé.');
        }
        const request = await this.prisma.request.findUnique({
            where: { ticketNumber: ticket },
            include: {
                user: {
                    select: { id: true, email: true, firstName: true, lastName: true },
                },
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
            throw new NotFoundException('Demande non trouvée.');
        }
        return request;
    }
}
