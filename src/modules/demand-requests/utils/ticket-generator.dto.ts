import { ServiceType } from '@prisma/client';
import { PrismaService } from 'src/database/services/prisma.service';

/**
 * Générateur de ticket unique au format :
 * [prefixe]_[createdAt au format yyyymmdd]_[numéro d'ordre global sur 4 chiffres]
 * 
 * Exemple : VISA_20250716_0001
 *
 * @param prisma PrismaService
 * @param prefix Préfixe du service (ex: "VISA", "BIRTH", etc.)
 */
export async function generateTicketNumber(
  prisma: PrismaService,
  prefix: string
): Promise<string> {
  const date = new Date();
  const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, ''); // yyyymmdd

  // Compte total des demandes existantes (toutes confondues)
  const count = await prisma.request.count();

  const orderNumber = String(count + 1).padStart(4, '0'); // ex: 0001
  const ticketNumber = `${prefix}_${formattedDate}_${orderNumber}`;

  return ticketNumber;
}

 export function getTicketPrefix(serviceType: ServiceType): string {
        switch (serviceType) {
            case ServiceType.VISA:
                return 'VISA';
            case ServiceType.BIRTH_ACT_APPLICATION:
                return 'NAIS';
            case ServiceType.CONSULAR_CARD:
                return 'CART';
            case ServiceType.POWER_OF_ATTORNEY:
                return 'PROC';
            case ServiceType.MARRIAGE_CAPACITY_ACT:
                return 'MAR';
            case ServiceType.DEATH_ACT_APPLICATION:
                return 'DECES';
            case ServiceType.LAISSEZ_PASSER:
                return 'LPASS';
            case ServiceType.NATIONALITY_CERTIFICATE:
                return 'NAT';
            default:
                return 'REQ';
        }
    }