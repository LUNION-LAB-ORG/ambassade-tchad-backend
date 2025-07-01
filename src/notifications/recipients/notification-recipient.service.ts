import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/database/services/prisma.service";
import { Prisma, User, Role, UserType, UserStatus } from "@prisma/client";

@Injectable()
export class NotificationRecipientService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Récupère un utilisateur spécifique et le mappe en NotificationRecipient.
     * @param userId L'ID de l'utilisateur à récupérer.
     * @returns L'utilisateur mappé en NotificationRecipient.
     * @throws NotFoundException si l'utilisateur n'est pas trouvé ou inactif.
     */
    async getUserAsRecipient(userId: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
                status: UserStatus.ACTIVE,
            },
        });
        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé ou inactif');
        }
       return user;
    }

    /**
     * Récupère tous les utilisateurs actifs d'un certain type (DEMANDEUR ou PERSONNEL)
     * et optionnellement filtrés par rôle si le type est PERSONNEL.
     * Cette méthode retourne des objets NotificationRecipient complets.
     * @param userType Le type d'utilisateur à récupérer (DEMANDEUR ou PERSONNEL).
     * @param roles Optionnel : Un tableau de rôles si userType est PERSONNEL.
     * @returns Un tableau d'objets NotificationRecipient.
     */
    async getActiveUsersAsRecipientsByTypeAndRoles(userType: UserType, roles?: Role[]): Promise<User[]> {
        const whereClause: Prisma.UserWhereInput = {
            status: UserStatus.ACTIVE,
            type: userType,
        };

        if (userType === UserType.PERSONNEL && roles && roles.length > 0) {
            whereClause.role = {
                in: roles
            };
        }

        const users = await this.prisma.user.findMany({
            where: whereClause,
        });

        return users;
    }
}