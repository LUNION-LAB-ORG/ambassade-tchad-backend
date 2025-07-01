import { Injectable } from "@nestjs/common";
import { AppGateway } from "src/socket-io/gateways/app.gateway";
import { Notification } from "@prisma/client";
import { UserType, Role, User } from '@prisma/client';

@Injectable()
export class NotificationsWebSocketService {
    constructor(private appGateway: AppGateway) { }

    /**
     * Envoie une notification en temps réel à un ou plusieurs destinataires via WebSocket.
     * La logique de groupe est gérée au niveau de AppGateway.
     * @param notification L'objet notification à envoyer (généralement un enregistrement de la BDD).
     * @param recipient L'objet destinataire (un utilisateur spécifique, utilisé pour déterminer le type d'émission individuelle si groupTarget n'est pas spécifié).
     * @param groupTarget Optionnel. Indique s'il faut cibler un groupe (ex: 'all_personnel', 'role_admin', 'all_demandeurs')
     * Si omis ou non reconnu, envoie à l'utilisateur `recipient` individuellement.
     */

    emitNotification(notification: Notification, recipient: User, groupTarget?: 'all_personnel' | 'role_admin' | 'role_agent' | 'role_chef_service' | 'role_consul' | 'all_demandeurs') {

        const { id: recipientId, type: recipientType } = recipient;

        // Émission basée sur le type de groupe cible ou l'individu
        if (groupTarget === 'all_personnel') {
            this.appGateway.emitToAllPersonnel('notification:new', notification);
            console.log(`[WebSocket] Notification émise à tout le personnel (room 'backoffice_all') pour l'événement 'notification:new'.`);
        } else if (groupTarget && groupTarget.startsWith('role_')) {
            const roleString = groupTarget.split('_')[1].toUpperCase() as Role; // Convertir en Role Enum
            if (Object.values(Role).includes(roleString)) { // Vérifier que le rôle est valide
                this.appGateway.emitToRole(roleString, 'notification:new', notification);
                console.log(`[WebSocket] Notification émise au rôle ${roleString} pour l'événement 'notification:new'.`);
            } else {
                console.warn(`[WebSocket] Rôle non valide '${roleString}' pour émission groupée.`);
            }
        } else if (groupTarget === 'all_demandeurs') {
            this.appGateway.emitToUserTypeGroup('clients', 'notification:new', notification);
            console.log(`[WebSocket] Notification émise à tous les clients pour l'événement 'notification:new'.`);
        } else {
            // Émission à un utilisateur spécifique (par défaut si groupTarget n'est pas spécifié ou non valide)
            if (recipientType === UserType.DEMANDEUR) {
                this.appGateway.emitToUser(recipientId, UserType.DEMANDEUR, 'notification:new', notification);
                console.log(`[WebSocket] Notification émise au demandeur ${recipientId} pour l'événement 'notification:new'.`);
            } else if (recipientType === UserType.PERSONNEL) {
                this.appGateway.emitToUser(recipientId, UserType.PERSONNEL, 'notification:new', notification);
                console.log(`[WebSocket] Notification émise au personnel ${recipientId} pour l'événement 'notification:new'.`);
            } else {
                console.warn(`[WebSocket] Type de destinataire inconnu ou groupTarget non spécifié pour émission: ${recipientType}`);
            }
        }
    }

    /**
     * Diffuse un événement à tous les utilisateurs connectés, quel que soit leur type ou rôle.
     * @param event Le nom de l'événement.
     * @param data Les données à envoyer.
     */
    broadcast<T>(event: string, data: T) {
        this.appGateway.broadcast(event, data);
        console.log(`[WebSocket] Broadcast '${event}' émis à tous les utilisateurs connectés.`);
    }

    /**
     * Émet un événement pour marquer une notification comme lue.
     * @param notificationId L'ID de la notification lue.
     * @param userId L'ID de l'utilisateur qui a lu la notification.
     * @param userType Le type de l'utilisateur.
     */
    emitNotificationRead(notificationId: string, userId: string, userType: UserType) {
        this.appGateway.emitToUser(userId, userType, 'notification:read', {
            notificationId,
            message: 'Notification marquée comme lue'
        });
        console.log(`[WebSocket] Événement 'notification:read' émis pour notification ${notificationId} à ${userId}.`);
    }

    /**
     * Émet un événement pour marquer plusieurs notifications comme lues.
     * @param userId L'ID de l'utilisateur.
     * @param userType Le type de l'utilisateur.
     * @param count Le nombre de notifications lues.
     */
    emitBulkNotificationRead(userId: string, userType: UserType, count: number) {
        this.appGateway.emitToUser(userId, userType, 'notification:bulk_read', {
            count,
            message: `${count} notifications marquées comme lues`
        });
        console.log(`[WebSocket] Événement 'notification:bulk_read' émis pour ${count} notifications à ${userId}.`);
    }
}