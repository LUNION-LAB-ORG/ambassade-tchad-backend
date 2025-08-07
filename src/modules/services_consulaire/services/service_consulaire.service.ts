import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import { QueryServiceDto } from '../dto/query-service.dto';
import { QueryResponseDto } from 'src/common/dto/query-response.dto';
import { Prisma, Service as ServiceModel } from '@prisma/client';

@Injectable()
export class ServiceConsulaireService {
    constructor(private readonly prisma: PrismaService) { }

    async createService(serviceData: CreateServiceDto, userId: string) {
        return this.prisma.service.create({
            data: {
                ...serviceData,
                updatedById: userId
            },
            include: {
                updatedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
    }
    async findOne(id: string) {
        const service = await this.prisma.service.findUnique({ where: { id } });
        if (!service) {
            throw new NotFoundException(`Service avec l'ID ${id} introuvable`);
        }
        return service;
    }

    async getAllWhithFilter(filters: QueryServiceDto): Promise<QueryResponseDto<ServiceModel>> {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        const where: Prisma.ServiceWhereInput = {}
        if (filters.name) { where.name = { contains: filters.name, mode: 'insensitive' } }
        if (filters.type) { where.type = filters.type }
        if (filters.isPriceVariable) { where.isPriceVariable = filters.isPriceVariable }
        if (filters.defaultPrice) { where.defaultPrice = filters.defaultPrice }
        if (filters.updatedBy) { where.updatedBy = { id: filters.updatedBy } }
        const [total_service, all_service] = await Promise.all([
            this.prisma.service.count({ where }),
            this.prisma.service.findMany({
                skip,
                take: limit,
                include: {
                    updatedBy: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            })
        ])

        const total_page = Math.ceil(total_service / limit)
        return ({
            data: all_service,
            meta: {
                total: total_service,
                page: page,
                limit: limit,
                totalPages: total_page
            }
        })
    }

    async getStats() {
        const isPriceVariable = await this.prisma.service.count({ where: { isPriceVariable: true } })
        const isNotPriceVariable = await this.prisma.service.count({ where: { isPriceVariable: false } })
        const total = await this.prisma.service.count()
        const byAuthor = await this.prisma.service.groupBy({
            by: ['updatedById'],
            _count: { id: true },
        });
        return {
            total,
            isPriceVariable,
            isNotPriceVariable,
            byAuthor,
        };
    }
    
    async updateService(serviceId: string, serviceData: UpdateServiceDto, userId: string) {
        return this.prisma.service.update({
            where: { id: serviceId },
            data: {
                ...serviceData,
                updatedById: userId
            },
            include: {
                updatedBy: {
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
        await this.prisma.service.delete({ where: { id } })

        return { message: `Service avec l'ID ${id} supprimée avec succès.` };
    }

}
