import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { KkiapayService } from 'src/kkiapay/kkiapay.service';
import { PrismaService } from 'src/database/services/prisma.service';
import { CreatePaiementDto } from '../dto/create-paiement.dto';
import { PaymentMethod, UserType } from '@prisma/client';
import { CreatePaiementKkiapayDto } from '../dto/create-paiement-kkiapay.dto';
import { QueryPaiementDto } from '../dto/query-paiement.dto';

@Injectable()
export class PaiementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kkiapay: KkiapayService,
    //   private readonly paiementEvent: PaiementEvent,
  ) { }

  // Payer avec Kkiapay
  async payWithKkiapay(
    createPaiementKkiapayDto: CreatePaiementKkiapayDto,
  ) {
    const transaction = await this.kkiapay.verifyTransaction(
      createPaiementKkiapayDto.transactionRef,
    );

    const paiement = await this.create({
      transactionRef: transaction.transactionId,
      amount: transaction.amount,
      method: transaction.source,
      source: transaction.source_common_name,
      ticketNumber: createPaiementKkiapayDto.ticketNumber,
    });

    return {
      success: transaction.status === 'SUCCESS',
      message:
        transaction.status === 'SUCCESS'
          ? 'Paiement effectué avec succès'
          : 'Paiement echoué',
      transactionId: transaction.transactionId,
      paiement: paiement,
    };
  }

  // Création de paiement
  async create(createPaiementDto: CreatePaiementDto) {

    // Vérification de la demande
    const demande = await this.verifyRequest(
      createPaiementDto.amount,
      createPaiementDto.ticketNumber ?? null,
    );

    // Vérification du personnel
    const personnel = await this.verifyPersonnel(createPaiementDto.recordedById ?? null);

    // Traitement du mode de paiement et du type de mobile money
    const { method, source } = await this.verifyPaiementMethod(
      createPaiementDto.method,
      createPaiementDto.source ?? null,
    );

    const paiement = await this.prisma.payment.create({
      data: {
        ...createPaiementDto,
        paymentDate: createPaiementDto.paymentDate ? new Date(createPaiementDto.paymentDate).toISOString() : new Date().toISOString(),
        requestId: demande?.id ?? null,
        recordedById: personnel?.id ?? null,
        method,
        source,
      },
    });

    // Mise a jour de la commande à payée
    if (demande) {
      await this.prisma.request.update({
        where: { id: demande.id },
        data: {
          paied_at: paiement.paymentDate,
          paied: true,
        },
      });
    }

    // Émission de l'événement de paiement effectué
    // this.paiementEvent.paiementEffectue(paiement);

    return paiement;
  }

  // Récupération de tous les paiements
  async findAll(queryDto: QueryPaiementDto) {
    const {
      page = 1,
      limit = 10,
      ticketNumber,
    } = queryDto;

    const whereClause: any = {};

    if (ticketNumber) {
      whereClause.ticketNumber = ticketNumber;
    }

    const paiements = await this.prisma.payment.findMany({
      where: whereClause,
      orderBy: {
        paymentDate: 'desc',
      },
      select: {
        id: true,
        amount: true,
        paymentDate: true,
        method: true,
        source: true,
        transactionRef: true,
        requestId: true,
        request: {
          select: {
            id: true,
            ticketNumber: true,
            serviceType: true,
            status: true,
            amount: true,
            contactPhoneNumber: true,
            paied_at: true,
            paied: true,
            userId: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                email: true,
              },
            },
          },
        },
        recordedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
      take: limit,
      skip: (page - 1) * limit,
    });
    return paiements;
  }

  // Récupération d'un paiement
  async findOne(paiementId: string) {
    const paiement = await this.prisma.payment.findUnique({
      where: {
        id: paiementId,
      },
    });
    if (!paiement) {
      throw new NotFoundException('Paiement non trouvé');
    }
    return paiement;
  }

  // Suppression d'un paiement
  async remove(paiementId: string) {
    const paiement = await this.findOne(paiementId);
    return this.prisma.payment.delete({
      where: {
        id: paiement.id,
      },
    });
  }

  // Vérification de la commande
  private async verifyRequest(amount: number, ticketNumber: string | null) {

    if (!ticketNumber) {
      return null;
    }
    const request = await this.prisma.request.findUnique({
      where: {
        ticketNumber: ticketNumber.trim(),
      },
    });

    if (!request) {
      throw new BadRequestException(
        'Le ticketNumber est invalide',
      );
    }

    if (amount < request.amount) {
      throw new BadRequestException(
        'Le montant est inférieur au montant de la demande',
      );
    }
    return request;
  }
  // Vérification de l'utilisateur
  private async verifyPersonnel(userId: string | null) {

    if (!userId) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        type: UserType.PERSONNEL,
      },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    return user;
  }

  // Vérification du mode de paiement
  private async verifyPaiementMethod(method: PaymentMethod, source: string | null) {
    // Vérification de l'existence du mode de paiement
    if (!method) {
      throw new BadRequestException('Mode de paiement non fourni');
    }
    // Vérification de la validité du mode de paiement
    if (
      ![
        PaymentMethod.MOBILE_MONEY,
        PaymentMethod.BANK_TRANSFER,
        PaymentMethod.CREDIT_CARD,
        PaymentMethod.CASH,
        PaymentMethod.OTHER,
      ].includes(method)
    ) {
      throw new BadRequestException('Mode de paiement non valide');
    }

    return { method, source };
  }
}
