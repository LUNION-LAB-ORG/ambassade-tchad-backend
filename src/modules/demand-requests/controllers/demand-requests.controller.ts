
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
import { ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UserRoles } from 'src/modules/users/decorators/user-roles.decorator';
import { UserRolesGuard } from 'src/modules/users/guards/user-roles.guard';
import { Role, RequestStatus, ServiceType } from '@prisma/client';
import { DemandRequestsService } from '../services/demand-requests.service';
import { BirthActRequestDetailsDto, ConsularCardRequestDetailsDto, CreateDemandRequestDto, DeathActRequestDetailsDto, LaissezPasserRequestDetailsDto, MarriageCapacityActRequestDetailsDto, NationalityCertificateRequestDetailsDto, PowerOfAttorneyRequestDetailsDto, VisaRequestDetailsDto } from '../dto/create-demandRequest.dto';
import { UpdateDemandRequestDto } from '../dto/update-damandRequest.dto';
import { GetDemandRequestsFilterDto } from '../dto/get-demandRequests-filter.dto';
import { JwtDemandeurAuthGuard } from 'src/modules/auth/guards/jwt-demandeur-auth.guard';

@ApiTags('Demandes')
@ApiExtraModels(
    VisaRequestDetailsDto,
    BirthActRequestDetailsDto,
    ConsularCardRequestDetailsDto,
    LaissezPasserRequestDetailsDto,
    MarriageCapacityActRequestDetailsDto,
    DeathActRequestDetailsDto,
    PowerOfAttorneyRequestDetailsDto,
    NationalityCertificateRequestDetailsDto
)
@Controller('demandes')
export class DemandRequestsController {
    constructor(private readonly demandRequestsService: DemandRequestsService) {}

    @UseGuards(JwtDemandeurAuthGuard)
    @Post()
    @ApiResponse({ status: 201, description: 'Demande créée avec succès.' })
    @ApiResponse({ status: 400, description: 'Requête invalide.' })
    async create(@Body() dto: CreateDemandRequestDto, @Request() req) {
        return this.demandRequestsService.create(dto, req.user.id);
    }

    @UseGuards(JwtDemandeurAuthGuard)
    @Get('track/:ticket')
    @ApiResponse({ status: 200, description: 'Détails de la demande.' })
    @ApiResponse({ status: 404, description: 'Demande non trouvée.' })
    async trackByTicket(@Param('ticket') ticket: string, @Request() req) {
        return this.demandRequestsService.trackByTicket(ticket, req.user.id);
    }

    @Get('filter')
    @UseGuards(JwtAuthGuard, UserRolesGuard)
    @UserRoles(Role.AGENT, Role.CHEF_SERVICE, Role.CONSUL, Role.ADMIN)
    @ApiResponse({ status: 200, description: 'Liste filtrée des demandes.' })
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

    @Get('/stats')
    @UseGuards(JwtAuthGuard, UserRolesGuard)
    @UserRoles(Role.AGENT, Role.CHEF_SERVICE, Role.CONSUL, Role.ADMIN)
    @ApiResponse({ status: 200, description: 'Statistiques globales des demandes.' })
    async getStats() {
        return this.demandRequestsService.getStats();
    }

    @UseGuards(JwtAuthGuard, UserRolesGuard)
    @UserRoles(Role.AGENT, Role.CHEF_SERVICE, Role.ADMIN, Role.CONSUL)
    @Get(':id')
    @ApiResponse({ status: 200, description: 'Détails d\'une demande.' })
    @ApiResponse({ status: 404, description: 'Demande non trouvée.' })
    async getOne(@Param('id') id: string, @Request() req) {
        return this.demandRequestsService.findOne(id, req.user);
    }

    @Get()
    @UseGuards(JwtAuthGuard, UserRolesGuard)
    @UserRoles(Role.AGENT, Role.CHEF_SERVICE, Role.CONSUL, Role.ADMIN)
    @ApiResponse({ status: 200, description: 'Liste paginée des demandes.' })
    async getAll(
        @Query('page') page: string,
        @Query('limit') limit: string,
    ) {
        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;
        return this.demandRequestsService.getAll(pageNumber, pageSize);
    }

    @Put(':id/status')
    @UseGuards(JwtAuthGuard, UserRolesGuard)
    @UserRoles(Role.AGENT, Role.CHEF_SERVICE, Role.CONSUL, Role.ADMIN)
    @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès.' })
    @ApiResponse({ status: 400, description: 'Mise à jour invalide.' })
    @ApiResponse({ status: 403, description: 'Accès interdit.' })
    @ApiResponse({ status: 404, description: 'Demande non trouvée.' })
    async updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateDemandRequestDto,
        @Request() req,
    ) {
        return this.demandRequestsService.updateStatus(id, dto, req.user.id);
    }
}
