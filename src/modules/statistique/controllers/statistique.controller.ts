import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { StatistiqueService } from '../services/statistique.service';
import { GetStatistiqueDto } from '../dtos/get-statistique.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StatistiqueResponseDto } from '../types/statistique.type';

@ApiTags('Statistiques')
@Controller('statistiques')
export class StatistiqueController {
    constructor(private readonly statistiqueService: StatistiqueService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtenir les statistiques du tableau de bord' })
    @ApiQuery({ name: 'fromDate', required: false, type: String, description: 'Date de début de la période (format YYYY-MM-DD)' })
    @ApiQuery({ name: 'toDate', required: false, type: String, description: 'Date de fin de la période (format YYYY-MM-DD)' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Statistiques récupérées avec succès.', type: StatistiqueResponseDto })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Accès non autorisé.' })

    async getStatistiques(
        @Query() filter: GetStatistiqueDto
    ): Promise<StatistiqueResponseDto> {
        return this.statistiqueService.getStatistique(filter);
    }
}