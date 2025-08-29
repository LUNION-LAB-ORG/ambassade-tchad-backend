import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { PaiementService } from '../services/paiement.service';
import { QueryPaiementDto } from '../dto/query-paiement.dto';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreatePaiementDto } from '../dto/create-paiement.dto';
import { CreatePaiementKkiapayDto } from '../dto/create-paiement-kkiapay.dto';
import { JwtDemandeurAuthGuard } from 'src/modules/auth/guards/jwt-demandeur-auth.guard';
import { Request } from 'express';
import { PaymentMethod, User } from '@prisma/client';

@ApiTags('Paiements')
@Controller('paiements')
export class PaiementController {
  constructor(private readonly paiementsService: PaiementService) { }

  @Post('pay')
  @UseGuards(JwtDemandeurAuthGuard)
  @ApiOperation({ summary: 'Payer avec Kkiapay' })
  @ApiBody({ type: CreatePaiementKkiapayDto })
  payWithKkiapay(@Body() createPaiementKkiapayDto: CreatePaiementKkiapayDto) {
    return this.paiementsService.payWithKkiapay(createPaiementKkiapayDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Créer un paiement' })
  @ApiBody({ type: CreatePaiementDto })
  create(@Req() req: Request, @Body() createPaiementDto: CreatePaiementDto) {
    const userId = req.user as User;
    if (createPaiementDto.method !== PaymentMethod.CASH && !createPaiementDto.source) {
      throw new BadRequestException('Précisez la source du paiement');
    }
    return this.paiementsService.create({
      ...createPaiementDto,
      recordedById: userId.id,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lister tous les paiements' })
  @ApiQuery({ name: 'page', required: false, type: Number, default: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({ name: 'ticketNumber', required: false, type: String })
  @Get()
  findAll(@Query() queryDto: QueryPaiementDto) {
    return this.paiementsService.findAll(queryDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtenir un paiement par son ID' })
  @ApiParam({ name: 'id', required: true, type: String })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paiementsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Supprimer un paiement' })
  @ApiParam({ name: 'id', required: true, type: String })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paiementsService.remove(id);
  }
}