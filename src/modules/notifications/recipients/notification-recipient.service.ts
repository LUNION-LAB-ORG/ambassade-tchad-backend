import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/database/services/prisma.service";
import { Prisma, User, Role, UserType, UserStatus } from "@prisma/client"; // Imports ajustés
import { NotificationRecipient } from "../interfaces/notifications.interface"; // Interface ajustée

@Injectable()
export class NotificationRecipientService { // Renommé pour correspondre à notre convention
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Méthode interne pour mapper un objet User de Prisma vers notre interface NotificationRecipient.
     * Cette méthode est essentielle pour uniformiser les données des destinataires.
     * @param user L'objet User récupéré depuis Prisma.
     * @returns Un objet NotificationRecipient.
     */
    private mapUserToNotificationRecipient(user: User): NotificationRecipient {
        return {
            id: user.id,
            email: user.email,
            type: user.type,
            role: user.role, // Le rôle sera null pour les clients
            firstName: user.firstName ?? undefined,
            lastName: user.lastName ?? undefined,
            phoneNumber: user.phoneNumber ?? undefined,
        };
    }

    /**
     * Récupère un utilisateur spécifique et le mappe en NotificationRecipient.
     * @param userId L'ID de l'utilisateur à récupérer.
     * @returns L'utilisateur mappé en NotificationRecipient.
     * @throws NotFoundException si l'utilisateur n'est pas trouvé ou inactif.
     */
    async getUserAsRecipient(userId: string): Promise<NotificationRecipient> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
                status: UserStatus.ACTIVE,
            },
        });
        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé ou inactif');
        }
        return this.mapUserToNotificationRecipient(user);
    }

    /**
     * Récupère tous les utilisateurs actifs d'un certain type (DEMANDEUR ou PERSONNEL)
     * et optionnellement filtrés par rôle si le type est PERSONNEL.
     * Cette méthode retourne des objets NotificationRecipient complets.
     * @param userType Le type d'utilisateur à récupérer (DEMANDEUR ou PERSONNEL).
     * @param roles Optionnel : Un tableau de rôles si userType est PERSONNEL.
     * @returns Un tableau d'objets NotificationRecipient.
     */
    async getActiveUsersAsRecipientsByTypeAndRoles(userType: UserType, roles?: Role[]): Promise<NotificationRecipient[]> {
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

        return users.map(user => this.mapUserToNotificationRecipient(user));
    }

    /**
     * Récupère tous les clients actifs en tant que destinataires de notification.
     * @returns Un tableau de NotificationRecipient pour tous les clients actifs.
     */
    async getAllActiveClientsAsRecipients(): Promise<NotificationRecipient[]> {
        return this.getActiveUsersAsRecipientsByTypeAndRoles(UserType.DEMANDEUR);
    }

    /**
     * Récupère tous les membres du personnel actifs en tant que destinataires de notification.
     * @returns Un tableau de NotificationRecipient pour tous les membres du personnel actifs.
     */
    async getAllActivePersonnelAsRecipients(): Promise<NotificationRecipient[]> {
        return this.getActiveUsersAsRecipientsByTypeAndRoles(UserType.PERSONNEL);
    }

    /**
     * Récupère tous les Administrateurs actifs en tant que destinataires de notification.
     * @returns Un tableau de NotificationRecipient pour tous les administrateurs actifs.
     */
    async getAllActiveAdminsAsRecipients(): Promise<NotificationRecipient[]> {
        return this.getActiveUsersAsRecipientsByTypeAndRoles(UserType.PERSONNEL, [Role.ADMIN]);
    }

    /**
     * Récupère tous les Chefs de Service actifs en tant que destinataires de notification.
     * @returns Un tableau de NotificationRecipient pour tous les chefs de service actifs.
     */
    async getAllActiveChefServiceAsRecipients(): Promise<NotificationRecipient[]> {
        return this.getActiveUsersAsRecipientsByTypeAndRoles(UserType.PERSONNEL, [Role.CHEF_SERVICE]);
    }

    /**
     * Récupère tous les Agents actifs en tant que destinataires de notification.
     * @returns Un tableau de NotificationRecipient pour tous les agents actifs.
     */
    async getAllActiveAgentsAsRecipients(): Promise<NotificationRecipient[]> {
        return this.getActiveUsersAsRecipientsByTypeAndRoles(UserType.PERSONNEL, [Role.AGENT]);
    }

    /**
     * Récupère tous les Consuls actifs en tant que destinataires de notification.
     * @returns Un tableau de NotificationRecipient pour tous les consuls actifs.
     */
    async getAllActiveConsulsAsRecipients(): Promise<NotificationRecipient[]> {
        return this.getActiveUsersAsRecipientsByTypeAndRoles(UserType.PERSONNEL, [Role.CONSUL]);
    }
}