import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserType, Role, UserStatus } from '@prisma/client'; // Import de nos Enums
import { PrismaService } from 'src/database/services/prisma.service';
import { JsonWebTokenService } from 'src/json-web-token/json-web-token.service'; // Assurez-vous que ce service est correct
import { ConnectedUser } from '../interfaces/app.gateway.interface'; // Assurez-vous du chemin correct

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/app'
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedUsers = new Map<string, ConnectedUser>();

    constructor(
        private prisma: PrismaService,
        private jwtService: JsonWebTokenService,
    ) { }

    async handleConnection(demandeur: Socket) {
        try {
            const token = demandeur.handshake.query.token as string || '';
            // Le type d'utilisateur doit correspondre à notre Enum UserType
            const userType = demandeur.handshake.query.type as UserType;

            if (!token || !userType) {
                console.log('Connexion WebSocket: Token ou type d\'utilisateur manquant dans les query params.');
                demandeur.disconnect();
                return;
            }

            // Vérifier et décoder le token en fonction du type d'utilisateur attendu
            // Maintenant, le JsonWebTokenService a `verifyAccessToken`
            const decoded = await this.jwtService.verifyAccessToken(token, userType);

            if (!decoded || !decoded.sub) {
                console.log('Connexion WebSocket: Token invalide ou décodage échoué.');
                demandeur.disconnect();
                return;
            }

            // Identifier l'utilisateur et récupérer ses informations via Prisma
            const userInfo = await this.identifyUser(decoded, userType);

            if (!userInfo) {
                console.log(`Connexion WebSocket: Utilisateur ${decoded.sub} de type ${userType} non trouvé ou inactif.`);
                demandeur.disconnect();
                return;
            }

            // Stocker la connexion
            this.connectedUsers.set(demandeur.id, {
                ...userInfo,
                socketId: demandeur.id
            });

            // Rejoindre les rooms pertinentes
            await this.joinRooms(demandeur, userInfo);
            console.log(`Connexion WebSocket: ${userInfo.type} ${userInfo.id} connecté. (Socket ID: ${demandeur.id})`);

        } catch (error) {
            console.error('Connexion WebSocket: Erreur lors de la connexion:', error.message);
            demandeur.disconnect();
        }
    }

    handleDisconnect(demandeur: Socket) {
        const user = this.connectedUsers.get(demandeur.id);
        if (user) {
            console.log(`Déconnexion WebSocket: ${user.type} ${user.id} déconnecté. (Socket ID: ${demandeur.id})`);
            this.connectedUsers.delete(demandeur.id);
        }
    }

    private async identifyUser(decoded: { sub: string }, type: UserType): Promise<ConnectedUser | null> {
        if (!decoded.sub) return null;

        // Requête unique pour le modèle User
        const user = await this.prisma.user.findUnique({
            where: {
                id: decoded.sub,
                status: UserStatus.ACTIVE, // Utilisation de notre Enum UserStatus
                type: type // Vérifie que le type correspond à celui déclaré par le demandeur
            },
        });

        if (!user) {
            return null;
        }

        // Construction de l'objet ConnectedUser
        if (user.type === UserType.DEMANDEUR) {
            return {
                id: user.id,
                type: UserType.DEMANDEUR,
                role: null, // Les clients n'ont pas de rôle
                socketId: '' // Sera rempli par handleConnection
            };
        } else if (user.type === UserType.PERSONNEL) {
            return {
                id: user.id,
                type: UserType.PERSONNEL,
                role: user.role, // Le personnel a un rôle
                socketId: '' // Sera rempli par handleConnection
            };
        }

        return null; // En cas de type d'utilisateur inattendu
    }

    private async joinRooms(demandeur: Socket, userInfo: ConnectedUser) {
        // Room générale par type d'utilisateur (ex: 'clients', 'personnels')
        await demandeur.join(`${userInfo.type.toLowerCase()}s`);

        // Room spécifique à l'utilisateur individuel (ex: 'client_ID', 'personnel_ID')
        await demandeur.join(`${userInfo.type.toLowerCase()}_${userInfo.id}`);

        if (userInfo.type === UserType.PERSONNEL) {
            // Room pour tous les membres du personnel qui ont accès au back-office général
            await demandeur.join('backoffice_all');

            // Room spécifique au rôle du personnel (ex: 'role_admin', 'role_agent', 'role_chef_service', 'role_consul')
            if (userInfo.role) {
                await demandeur.join(`role_${userInfo.role.toLowerCase()}`);
            }
        }
    }

    // ================================
    // MÉTHODES D'ÉMISSION GÉNÉRIQUES
    // ================================

    /**
     * Émet un événement à un utilisateur spécifique (demandeur ou personnel).
     * @param userId L'ID de l'utilisateur cible.
     * @param userType Le type de l'utilisateur ('DEMANDEUR' ou 'PERSONNEL').
     * @param event Le nom de l'événement.
     * @param data Les données à envoyer.
     */
    emitToUser<T>(userId: string, userType: UserType, event: string, data: T) {
        const room = userType === UserType.DEMANDEUR ? `client_${userId}` : `personnel_${userId}`;
        this.server.to(room).emit(event, data);
    }

    /**
     * Émet un événement à tous les membres du personnel connectés.
     * @param event Le nom de l'événement.
     * @param data Les données à envoyer.
     */
    emitToAllPersonnel<T>(event: string, data: T) {
        this.server.to('backoffice_all').emit(event, data);
    }

    /**
     * Émet un événement à tous les membres du personnel d'un rôle spécifique.
     * @param role Le rôle cible (ex: 'ADMIN', 'AGENT').
     * @param event Le nom de l'événement.
     * @param data Les données à envoyer.
     */
    emitToRole<T>(role: Role, event: string, data: T) {
        this.server.to(`role_${role.toLowerCase()}`).emit(event, data);
    }

    /**
     * Émet un événement à tous les utilisateurs d'un type de groupe donné (clients ou personnels).
     * @param groupType Le type de groupe ('clients' ou 'personnels').
     * @param event Le nom de l'événement.
     * @param data Les données à envoyer.
     */
    emitToUserTypeGroup<T>(groupType: 'clients' | 'personnels', event: string, data: T) {
        this.server.to(groupType).emit(event, data);
    }

    /**
     * Diffuse un événement à tous les utilisateurs connectés, quel que soit leur type ou rôle.
     * @param event Le nom de l'événement.
     * @param data Les données à envoyer.
     */
    broadcast<T>(event: string, data: T) {
        this.server.emit(event, data);
    }

    @SubscribeMessage('ping')
    handlePing(@ConnectedSocket() demandeur: Socket) {
        const user = this.connectedUsers.get(demandeur.id);
        if (!user) return;
        this.emitToUser(user.id, user.type, 'pong', `pong from ${user.type} ${user.id}`);
    }

    // Getter pour les statistiques de connexion
    getConnectedUsers() {
        return this.connectedUsers;
    }

    getConnectionStats() {
        const stats = {
            total: this.connectedUsers.size,
            clients: 0,
            personnel: 0,
            personnelByRole: new Map<Role, number>(),
        };

        this.connectedUsers.forEach(user => {
            if (user.type === UserType.DEMANDEUR) {
                stats.clients++;
            } else if (user.type === UserType.PERSONNEL) {
                stats.personnel++;
                if (user.role) {
                    const current = stats.personnelByRole.get(user.role) || 0;
                    stats.personnelByRole.set(user.role, current + 1);
                }
            }
        });

        return stats;
    }
}