import {
    Controller,
    Post,
    Get,
    Put,
    Param,
    Body,
    Request,
    UseGuards,
    Query,
    ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UserRoles } from 'src/modules/users/decorators/user-roles.decorator';
import { UserRolesGuard } from 'src/modules/users/guards/user-roles.guard';
import { Role, RequestStatus, ServiceType } from '@prisma/client';
import { DemandRequestsService } from '../services/demand-requests.service';
import { CreateDemandRequestDto } from '../dto/create-demandRequest.dto';
import { UpdateDemandRequestDto } from '../dto/update-damandRequest.dto';
import { GetDemandRequestsFilterDto } from '../dto/get-demandRequests-filter.dto';

@Controller('demandes')
@UseGuards(JwtAuthGuard)
export class DemandRequestsController {
    constructor(private readonly demandRequestsService: DemandRequestsService) { }

    // Création de la demande par un utilisateur
    @Post()
    async create(@Body() dto: CreateDemandRequestDto, @Request() req) {
        return this.demandRequestsService.create(dto, req.user.id);
    }

    // L'utilisateur peut suivre sa propre demande par ticket
    @Get('track/:ticket')
    async trackByTicket(@Param('ticket') ticket: string, @Request() req) {
        return this.demandRequestsService.trackByTicket(ticket, req.user.id);
    }

    // Récupérer une seule demande au personnel
    @Get(':id')
    @UseGuards(UserRolesGuard)
    @UserRoles(Role.AGENT, Role.CHEF_SERVICE, Role.ADMIN, Role.CONSUL)
    async getOne(@Param('id') id: string, @Request() req) {
        return this.demandRequestsService.findOne(id, req.user);
    }

    // Seul le personnel peut voir toutes les demandes paginées
    @Get()
    @UseGuards(UserRolesGuard)
    @UserRoles(Role.AGENT, Role.CHEF_SERVICE, Role.CONSUL, Role.ADMIN)
    async getAll(
        @Query('page') page: string,
        @Query('limit') limit: string,
    ) {
        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;
        return this.demandRequestsService.getAll(pageNumber, pageSize);
    }


    // Pagination pour les demandes

    @Get('admin')
    @UseGuards(UserRolesGuard)
    @UserRoles(Role.AGENT, Role.CHEF_SERVICE, Role.CONSUL, Role.ADMIN)
    async getAllFiltered(
        @Query(new ValidationPipe({ transform: true }))
        query: GetDemandRequestsFilterDto,
    ) {
        const {
            status,
            serviceType,
            userId,
            fromDate,
            toDate,
            page = '1',
            limit = '10',
        } = query;

        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);

        return this.demandRequestsService.getAllFiltered(
            { status, serviceType, userId, fromDate, toDate },
            pageNumber,
            pageSize,
        );
    }

    // Voir les statistiques de demande
    @Get('stats')
    @UseGuards(UserRolesGuard)
    @UserRoles(Role.AGENT, Role.CHEF_SERVICE, Role.CONSUL, Role.ADMIN)
    async getStats() {
        return this.demandRequestsService.getStats();
    }

    // Mise à jour du statut uniquement par le personnel autorisé
    @Put(':id/status')
    @UseGuards(UserRolesGuard)
    @UserRoles(Role.AGENT, Role.CHEF_SERVICE, Role.CONSUL, Role.ADMIN)
    async updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateDemandRequestDto,
        @Request() req,
    ) {
        return this.demandRequestsService.updateStatus(id, dto, req.user.id);
    }
}
