import { Body, Controller, Param, Post, Req, UseGuards, Get, Query, Patch, Delete       } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ServiceConsulaireService } from '../services/service_consulaire.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import { QueryServiceDto } from '../dto/query-service.dto';
@ApiTags('Services Consulaire')
@Controller('services')
export class ServiceConsulaireController {
    constructor(private serviceConsulaireService: ServiceConsulaireService) { }

    // @Post()
    // @UseGuards(JwtAuthGuard)
    // @ApiOperation({ summary: 'Créer un service consulaire' })
    // @ApiResponse({ status: 201, description: 'Service consulaire créé avec succès' })
    // @ApiResponse({ status: 401, description: 'Non autorisé' })
    // async createService(@Body() dto: CreateServiceDto, @Req() req) {
    //     return this.serviceConsulaireService.createService(dto, req.user.id);
    // }
    
    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Obtenir tous les services consulaires' })
    @ApiResponse({ status: 200, description: 'Liste des services consulaires' })
    @ApiResponse({ status: 401, description: 'Non autorisé' })
    async findAll(@Query() query: QueryServiceDto) {
        return this.serviceConsulaireService.getAllWhithFilter(query);

    }
    @Get('stats')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Obtenir les statistiques des services consulaires' })
    @ApiResponse({ status: 200, description: 'Statistiques des services consulaires' })
    @ApiResponse({ status: 401, description: 'Non autorisé' })
    async getStats() {
        return this.serviceConsulaireService.getStats();
    }   

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Obtenir un service consulaire par ID' })
    @ApiResponse({ status: 200, description: 'Service consulaire trouvé' })
    @ApiResponse({ status: 401, description: 'Non autorisé' })
    async findOne(@Param('id') id: string) {
        return this.serviceConsulaireService.findOne(id);
    }   
    
            
    
    @Patch('/price/:id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Mettre à jour un service consulaire' })
    @ApiResponse({ status: 200, description: 'Service consulaire mis à jour' })
    @ApiResponse({ status: 401, description: 'Non autorisé' })
    async updateService(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto, @Req() req) {
        return this.serviceConsulaireService.updateService(id, updateServiceDto, req.user.id);
    }                 

    // @Delete(':id')
    // @UseGuards(JwtAuthGuard)
    // @ApiOperation({ summary: 'Supprimer un service consulaire' })
    // @ApiResponse({ status: 200, description: 'Service consulaire supprimé' })
    // @ApiResponse({ status: 401, description: 'Non autorisé' })
    // async deleteService(@Param('id') id: string) {
    //     return this.serviceConsulaireService.delete(id);
    // }                            
}
