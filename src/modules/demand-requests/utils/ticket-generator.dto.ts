
import { PrismaService } from 'src/database/services/prisma.service';

/**
 * Générateur de ticket unique avec préfixe selon le type de service.
 * @param prisma PrismaService
 * @param prefix Préfixe (ex. 'VISA', 'BIRTH')
 */
export async function generateTicketNumber(
  prisma: PrismaService,
  prefix: string
): Promise<string> {
  let ticketNumber = '';
  let exists = true;

  while (exists) {
    const random = Math.floor(1000 + Math.random() * 9000); // 4 chiffres aléatoires
    ticketNumber = `${prefix}-${random}`;
    exists = (await prisma.request.findUnique({ where: { ticketNumber } })) !== null;
  }

  return ticketNumber;
}

