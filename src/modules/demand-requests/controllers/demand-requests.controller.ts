import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    Req,
    UseGuards,
    Query,
    UseInterceptors,
    UploadedFiles,
    Patch,
} from '@nestjs/common';
import {
    ApiBody,
    ApiConsumes,
    ApiExtraModels,
    ApiResponse,
    ApiTags,
    ApiOperation,
    ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UserRoles } from 'src/modules/users/decorators/user-roles.decorator';
import { UserRolesGuard } from 'src/modules/users/guards/user-roles.guard';
import { Role, User } from '@prisma/client';
import { DemandRequestsService } from '../services/demand-requests.service';
import { UpdateDemandRequestDto } from '../dto/update-damandRequest.dto';
import { GetDemandRequestsFilterDto } from '../dto/get-demandRequests-filter.dto';
import { JwtDemandeurAuthGuard } from 'src/modules/auth/guards/jwt-demandeur-auth.guard';
import { VisaRequestDetailsDto } from '../dto/type-demand-dto/visa-request-details.dto';
import { BirthActRequestDetailsDto } from '../dto/type-demand-dto/birth-act-request-details.dto';
import { ConsularCardRequestDetailsDto } from '../dto/type-demand-dto/consular-card-request-details.dto';
import { LaissezPasserRequestDetailsDto } from '../dto/type-demand-dto/laissez-passer-request-details.dto';
import { MarriageCapacityActRequestDetailsDto } from '../dto/type-demand-dto/marriage-capacity-act-request-details.dto';
import { NationalityCertificateRequestDetailsDto } from '../dto/type-demand-dto/nationality-certificate-request-details.dto';
import { PowerOfAttorneyRequestDetailsDto } from '../dto/type-demand-dto/power-of-attorney-request-details.dto';
import { DeathActRequestDetailsDto } from '../dto/type-demand-dto/death-act-request-details.dto';
import { CreateDemandRequestDto } from '../dto/create-demandRequest.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { GenerateConfigService } from 'src/common/services/generate-config.service';
import { Request } from 'express';

@ApiTags('Demandes')
@ApiExtraModels(
    VisaRequestDetailsDto,
    BirthActRequestDetailsDto,
    ConsularCardRequestDetailsDto,
    LaissezPasserRequestDetailsDto,
    MarriageCapacityActRequestDetailsDto,
    DeathActRequestDetailsDto,
    PowerOfAttorneyRequestDetailsDto,
    NationalityCertificateRequestDetailsDto,
)
@Controller('demandes')
export class DemandRequestsController {
    constructor(private readonly demandRequestsService: DemandRequestsService) { }

    @Post()
    @ApiOperation({ summary: 'Créer une nouvelle demande avec fichiers PDF' })
    @ApiResponse({ status: 201, description: 'Demande créée avec succès.' })
    @ApiResponse({ status: 400, description: 'Requête invalide.' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Formulaire de demande + fichiers PDF',
        type: CreateDemandRequestDto,
    })
    @UseInterceptors(
        AnyFilesInterceptor(GenerateConfigService.generateConfigMultipleDocumentsUpload('./uploads/documents')),
    )
    @UseGuards(JwtDemandeurAuthGuard)
    async create(
        @Body() dto: CreateDemandRequestDto,
        @UploadedFiles() files: Express.Multer.File[],
        @Req() req: Request,
    ) {
        const user = req.user as User;

        return this.demandRequestsService.create(dto, user.id, files);
    }


    @Post("/admin/:userId")
    @ApiOperation({ summary: 'Créer une nouvelle demande avec fichiers PDF' })
    @ApiResponse({ status: 201, description: 'Demande créée avec succès.' })
    @ApiResponse({ status: 400, description: 'Requête invalide.' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Formulaire de demande + fichiers PDF',
        type: CreateDemandRequestDto,
    })
    @UseInterceptors(
        AnyFilesInterceptor(GenerateConfigService.generateConfigMultipleDocumentsUpload('./uploads/documents')),
    )
    @UseGuards(JwtAuthGuard)
    async createAdmin(
        @Body() dto: CreateDemandRequestDto,
        @UploadedFiles() files: Express.Multer.File[],
        @Param('userId') userId: string,
    ) {
        return this.demandRequestsService.create(dto, userId, files);
    }

    @Get()
    @ApiOperation({ summary: 'Lister les demandes filtrées' })
    @ApiResponse({ status: 200, description: 'Liste filtrée des demandes.' })
    @ApiQuery({ type: GetDemandRequestsFilterDto })
    @UseGuards(JwtAuthGuard)
    async getAllFiltered(
        @Query() query: GetDemandRequestsFilterDto,
    ) {
        return this.demandRequestsService.getAllFiltered(query);
    }

    @Get('/stats')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Statistiques globales des demandes' })
    @ApiResponse({ status: 200, description: 'Statistiques globales des demandes.' })
    async getStats() {
        return this.demandRequestsService.getStats();
    }

    @Get('me')
    @UseGuards(JwtDemandeurAuthGuard)
    async getMyRequests(
        @Req() req: Request,
        @Query() query: Omit<GetDemandRequestsFilterDto, 'contactPhoneNumber' | 'userId'>,
    ) {
        const user = req.user as User;
        return this.demandRequestsService.getUserRequests(user.id, query);
    }


    @Get('/stats/demandeur')
    @UseGuards(JwtDemandeurAuthGuard)
    @ApiOperation({ summary: 'Statistiques personnelles du demandeur' })
    @ApiResponse({ status: 200, description: 'Statistiques personnelles du demandeur.' })
    @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
    async getUserStats(@Req() req) {
        return this.demandRequestsService.getStatsForUser(req.user.id);
    }

    @Get('/track/:ticket')
    @UseGuards(JwtDemandeurAuthGuard)
    @ApiOperation({ summary: 'Suivre une demande par son numéro de ticket' })
    @ApiResponse({ status: 200, description: 'Détails de la demande.' })
    @ApiResponse({ status: 404, description: 'Demande non trouvée.' })
    async trackByTicket(@Param('ticket') ticket: string, @Req() req) {
        return this.demandRequestsService.trackByTicket(ticket, req.user.id);
    }

    @Get('/admin/:ticket')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Détails d\'une demande par ticket' })
    @ApiResponse({ status: 200, description: 'Détails d\'une demande.' })
    @ApiResponse({ status: 404, description: 'Demande non trouvée.' })
    async getByTicketAdmin(@Param('ticket') ticket: string, @Req() req) {
        return this.demandRequestsService.findByTicket(ticket, req.user.id);
    }

    @Get('/demande/:ticket')
    @UseGuards(JwtDemandeurAuthGuard)
    @ApiOperation({ summary: 'Détails d\'une demande par ticket' })
    @ApiResponse({ status: 200, description: 'Détails d\'une demande.' })
    @ApiResponse({ status: 404, description: 'Demande non trouvée.' })
    async getByTicket(@Param('ticket') ticket: string, @Req() req) {
        return this.demandRequestsService.findByTicket(ticket, req.user.id);
    }


    @Get('/services')
    @ApiOperation({ summary: 'Lister les types de services disponibles' })
    @ApiResponse({ status: 200, description: 'Liste des types de services.' })
    async getSerrvicesPrices() {
        return this.demandRequestsService.getServicesPrices();
    }

    @Patch(':id/status')
    @UserRoles(Role.AGENT, Role.CHEF_SERVICE, Role.CONSUL, Role.ADMIN)
    @UseGuards(JwtAuthGuard, UserRolesGuard)
    @ApiOperation({ summary: 'Mettre à jour le statut d\'une demande' })
    @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès.' })
    @ApiResponse({ status: 400, description: 'Mise à jour invalide.' })
    @ApiResponse({ status: 403, description: 'Accès interdit.' })
    @ApiResponse({ status: 404, description: 'Demande non trouvée.' })
    async updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateDemandRequestDto,
        @Req() req,
    ) {
        return this.demandRequestsService.updateStatus(id, dto, req.user.id);
    }
}
