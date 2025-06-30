import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/services/prisma.service";
import { Prisma, Role, UserType, UserStatus } from "@prisma/client"; // Importations des Enums mis à jour

@Injectable()
export class EmailRecipientService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Récupère les emails de tous les utilisateurs actifs d'un certain type (DEMANDEUR ou PERSONNEL)
     * et optionnellement filtrés par rôle si le type est PERSONNEL.
     * @param userType Le type d'utilisateur à récupérer (DEMANDEUR ou PERSONNEL).
     * @param roles Optionnel : Un tableau de rôles si userType est PERSONNEL.
     * @returns Un tableau de chaînes d'adresses email.
     */
    async getActiveUsersEmailsByTypeAndRoles(userType: UserType, roles?: Role[]): Promise<string[]> {
        const whereClause: Prisma.UserWhereInput = {
            status: UserStatus.ACTIVE, // Filtre par statut actif
            type: userType, // Filtre par type d'utilisateur (DEMANDEUR ou PERSONNEL)
        };

        // Si c'est du PERSONNEL et que des rôles sont spécifiés, filtre par rôle
        if (userType === UserType.PERSONNEL && roles && roles.length > 0) {
            whereClause.role = {
                in: roles
            };
        }

        const users = await this.prisma.user.findMany({
            where: whereClause,
            select: {
                email: true, // Sélectionne uniquement l'email
            }
        });

        // Retourne un tableau d'emails non nuls (bien que notre schéma assure que l'email est obligatoire)
        return users.map(user => user.email);
    }

    /**
     * Récupère les emails de tous les clients actifs.
     * @returns Un tableau de chaînes d'adresses email des clients.
     */
    async getAllActiveClientsEmails(): Promise<string[]> {
        return this.getActiveUsersEmailsByTypeAndRoles(UserType.DEMANDEUR);
    }

    /**
     * Récupère les emails de tous les membres du personnel actifs.
     * @returns Un tableau de chaînes d'adresses email du personnel.
     */
    async getAllActivePersonnelEmails(): Promise<string[]> {
        return this.getActiveUsersEmailsByTypeAndRoles(UserType.PERSONNEL);
    }

    /**
     * Récupère les emails de tous les Administrateurs actifs.
     * @returns Un tableau de chaînes d'adresses email des administrateurs.
     */
    async getAllActiveAdminsEmails(): Promise<string[]> {
        return this.getActiveUsersEmailsByTypeAndRoles(UserType.PERSONNEL, [Role.ADMIN]);
    }

    /**
     * Récupère les emails de tous les Chefs de Service actifs.
     * @returns Un tableau de chaînes d'adresses email des chefs de service.
     */
    async getAllActiveChefServiceEmails(): Promise<string[]> {
        return this.getActiveUsersEmailsByTypeAndRoles(UserType.PERSONNEL, [Role.CHEF_SERVICE]);
    }

    /**
     * Récupère les emails de tous les Agents actifs.
     * @returns Un tableau de chaînes d'adresses email des agents.
     */
    async getAllActiveAgentsEmails(): Promise<string[]> {
        return this.getActiveUsersEmailsByTypeAndRoles(UserType.PERSONNEL, [Role.AGENT]);
    }

    /**
     * Récupère les emails de tous les Consuls actifs.
     * @returns Un tableau de chaînes d'adresses email des consuls.
     */
    async getAllActiveConsulsEmails(): Promise<string[]> {
        return this.getActiveUsersEmailsByTypeAndRoles(UserType.PERSONNEL, [Role.CONSUL]);
    }
}