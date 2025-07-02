import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User, UserType, Role, UserStatus, NotificationTarget, NotificationType } from '@prisma/client';
import { IEmailService } from 'src/email/interfaces/email-service.interface';
import { UserEmailTemplates } from '../templates/user-email.template';
import { UserNotificationsTemplate } from '../templates/user-notifications.template';
import { NotificationsWebSocketService } from 'src/notifications/websockets/notifications-websocket.service';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { PrismaService } from 'src/database/services/prisma.service'; // Directement injecté

@Injectable()
export class UserListenerService {
    private readonly logger = new Logger(UserListenerService.name);

    constructor(
        @Inject('EMAIL_SERVICE') private readonly emailService: IEmailService,
        private readonly prisma: PrismaService, // PrismaService pour la récupération des utilisateurs
        private readonly userEmailTemplates: UserEmailTemplates,
        private readonly userNotificationsTemplate: UserNotificationsTemplate,
        private readonly notificationsWebSocketService: NotificationsWebSocketService,
        private readonly notificationsService: NotificationsService,
    ) { }

    /**
     * Gère l'événement `user.created` déclenché après la création d'un utilisateur.
     * Envoie un e-mail de bienvenue et des notifications (WebSocket et BDD) aux parties concernées.
     */
    @OnEvent('user.created')
    async handleUserCreatedEvent(payload: {
        actor: User;
        user: User;
        temporaryPassword?: string; // Présent si un compte PERSONNEL a été créé par un administrateur
    }) {
        const { actor, user, temporaryPassword } = payload;

        try {
            // L'utilisateur nouvellement créé est le destinataire direct pour les communications individuelles
            // Pas besoin de le "mapper" à nouveau car il est déjà un objet User valide.

            // 1. Envoi de l'e-mail de bienvenue au nouvel utilisateur
            await this.emailService.sendEmailTemplate(
                this.userEmailTemplates.WELCOME_NEW_USER,
                {
                    recipients: [user.email],
                    data: { // Structure pour le template d'e-mail
                        user: user,
                        temporaryPassword: temporaryPassword,
                        actor: actor
                    },
                },
            );

            // 2. Envoi de la notification WebSocket de bienvenue au nouvel utilisateur.
            const welcomeNotification = await this.notificationsService.createAndSendMultiple(
                this.userNotificationsTemplate.WELCOME_USER,
                {
                    recipients: [user], // L'utilisateur lui-même est le destinataire
                    data: { user: user, temporaryPasswordSet: !!temporaryPassword }, // Structure pour le template de notification
                },
                NotificationType.SYSTEM,
                NotificationTarget.INDIVIDUAL
            );
            if (welcomeNotification.length > 0) {
                this.notificationsWebSocketService.emitNotification(welcomeNotification[0], user);
            }

            // 3. Notification WebSocket pour le mot de passe temporaire (spécifique au personnel si mot de passe généré)
            if (user.type === UserType.PERSONNEL && temporaryPassword) {
                const tempPwdNotification = await this.notificationsService.createAndSendMultiple(
                    this.userNotificationsTemplate.TEMPORARY_PASSWORD_SET,
                    {
                        recipients: [user], // L'utilisateur lui-même
                        data: { user: user }, // Structure pour le template de notification
                    },
                    NotificationType.SYSTEM,
                    NotificationTarget.INDIVIDUAL
                );
                if (tempPwdNotification.length > 0) {
                    this.notificationsWebSocketService.emitNotification(tempPwdNotification[0], user);
                }
            }

            // 4. Notifications au personnel (Administrateurs/Chefs de Service) concernant la création du nouvel utilisateur.
            // On récupère tous les utilisateurs PERSONNEL avec les rôles ADMIN ou CHEF_SERVICE
            const relevantPersonnelForNotification = await this.prisma.user.findMany({
                where: {
                    type: UserType.PERSONNEL,
                    role: {
                        in: [Role.ADMIN, Role.CHEF_SERVICE, Role.AGENT] // Inclure les agents ici s'ils doivent être notifiés des nouveaux demandeurs
                    },
                    status: UserStatus.ACTIVE
                }
            });

            let targetGroup: NotificationTarget = NotificationTarget.INDIVIDUAL; // Valeur par défaut
            let filteredRecipients: User[] = [];

            if (user.type === UserType.DEMANDEUR) {
                // Les agents (et admins/chefs si configuré) sont notifiés des nouvelles inscriptions des demandeurs.
                filteredRecipients = relevantPersonnelForNotification;
                targetGroup = NotificationTarget.ALL_PERSONNEL; // Ou ROLE_AGENT si vous voulez être plus spécifique
            } else if (user.type === UserType.PERSONNEL) {
                // Les administrateurs et chefs de service sont notifiés des nouvelles créations de personnel.
                // On filtre pour exclure l'utilisateur qui vient d'être créé s'il fait partie de ce groupe.
                filteredRecipients = relevantPersonnelForNotification.filter(p => p.id !== user.id && (p.role === Role.ADMIN || p.role === Role.CHEF_SERVICE));
                targetGroup = NotificationTarget.ROLE_ADMIN; // Ou ROLE_CHEF_SERVICE si vous avez une distinction
            }

            if (filteredRecipients.length > 0) {
                const newUserNotificationForPersonnel = await this.notificationsService.createAndSendMultiple(
                    this.userNotificationsTemplate.NEW_USER_CREATED_FOR_ADMIN,
                    {
                        recipients: filteredRecipients,
                        data: { user: user, actor: actor }, // Structure pour le template de notification
                    },
                    NotificationType.SYSTEM,
                    targetGroup // La cible de groupe appropriée
                );

                if (newUserNotificationForPersonnel.length > 0) {
                    // Émettre la notification à tous les membres du personnel concernés via WebSocket.
                    // On passe le premier destinataire du groupe (pour le type) et la cible de groupe.
                    this.notificationsWebSocketService.emitNotification(newUserNotificationForPersonnel[0], filteredRecipients[0], targetGroup.toLowerCase() as any);
                    // Conversion 'as any' car groupTarget de WebSocketService ne supporte pas directement les NotificationTarget.ROLE_...
                    // Il faut s'assurer que les chaînes correspondent aux clés attendues par AppGateway (ex: 'role_admin' au lieu de 'ROLE_ADMIN')
                }
            }

        } catch (error) {
            this.logger.error(`Erreur lors du traitement de l'événement user.created pour ${user.email}:`, error.stack);
        }
    }

    /**
     * Gère l'événement `user.activated` lorsqu'un compte est activé.
     * Informe l'utilisateur et le personnel concerné.
     */
    @OnEvent('user.activated')
    async handleUserActivatedEvent(payload: { actor: User; user: User }) {
        const { actor, user } = payload;

        try {
            // L'utilisateur activé est le destinataire direct.
            // Pas besoin de refaire un findUnique ici car `user` dans le payload est déjà l'objet User complet.

            // 1. Envoi de l'e-mail de mise à jour du statut à l'utilisateur activé.
            await this.emailService.sendEmailTemplate(
                this.userEmailTemplates.ACCOUNT_STATUS_UPDATE,
                {
                    recipients: [user.email],
                    data: { user: user, oldStatus: UserStatus.INACTIVE, newStatus: UserStatus.ACTIVE, actor: actor },
                },
            );

            // 2. Envoi de la notification WebSocket de mise à jour du statut à l'utilisateur activé.
            const notificationToActivatedUser = await this.notificationsService.createAndSendMultiple(
                this.userNotificationsTemplate.ACCOUNT_STATUS_UPDATED,
                {
                    recipients: [user],
                    data: { user: user, newStatus: UserStatus.ACTIVE, actor: actor },
                },
                NotificationType.SYSTEM,
                NotificationTarget.INDIVIDUAL
            );
            if (notificationToActivatedUser.length > 0) {
                this.notificationsWebSocketService.emitNotification(notificationToActivatedUser[0], user);
            }

            // 3. Envoi des notifications WebSocket aux administrateurs.
            const adminRecipients = await this.prisma.user.findMany({
                where: {
                    type: UserType.PERSONNEL,
                    role: { in: [Role.ADMIN, Role.CHEF_SERVICE] },
                    status: UserStatus.ACTIVE
                }
            });

            if (adminRecipients.length > 0) {
                const notificationToAdmins = await this.notificationsService.createAndSendMultiple(
                    this.userNotificationsTemplate.ACCOUNT_STATUS_UPDATED, // Réutilisation du template pour l'admin
                    {
                        recipients: adminRecipients,
                        data: { user: user, newStatus: UserStatus.ACTIVE, actor: actor },
                    },
                    NotificationType.SYSTEM,
                    NotificationTarget.ROLE_ADMIN
                );
                if (notificationToAdmins.length > 0) {
                    this.notificationsWebSocketService.emitNotification(notificationToAdmins[0], adminRecipients[0], 'role_admin');
                }
            }

        } catch (error) {
            this.logger.error(`Erreur lors du traitement de l'événement user.activated pour ${user.email}:`, error.stack);
        }
    }

    /**
     * Gère l'événement `user.deactivated` lorsqu'un compte est désactivé.
     * Informe l'utilisateur et le personnel concerné.
     */
    @OnEvent('user.deactivated')
    async handleUserDeactivatedEvent(payload: { actor: User; user: User }) {
        const { actor, user } = payload;

        try {
            // L'utilisateur désactivé est le destinataire direct.

            // 1. Envoi de l'e-mail de mise à jour du statut à l'utilisateur désactivé.
            await this.emailService.sendEmailTemplate(
                this.userEmailTemplates.ACCOUNT_STATUS_UPDATE,
                {
                    recipients: [user.email],
                    data: { user: user, oldStatus: UserStatus.ACTIVE, newStatus: UserStatus.INACTIVE, actor: actor },
                },
            );

            // 2. Envoi de la notification WebSocket de mise à jour du statut à l'utilisateur désactivé.
            const notificationToDeactivatedUser = await this.notificationsService.createAndSendMultiple(
                this.userNotificationsTemplate.ACCOUNT_STATUS_UPDATED,
                {
                    recipients: [user],
                    data: { user: user, newStatus: UserStatus.INACTIVE, actor: actor },
                },
                NotificationType.SYSTEM,
                NotificationTarget.INDIVIDUAL
            );
            if (notificationToDeactivatedUser.length > 0) {
                this.notificationsWebSocketService.emitNotification(notificationToDeactivatedUser[0], user);
            }

            // 3. Envoi des notifications WebSocket aux administrateurs.
            const adminRecipients = await this.prisma.user.findMany({
                where: {
                    type: UserType.PERSONNEL,
                    role: { in: [Role.ADMIN, Role.CHEF_SERVICE] },
                    status: UserStatus.ACTIVE
                }
            });

            if (adminRecipients.length > 0) {
                const notificationToAdmins = await this.notificationsService.createAndSendMultiple(
                    this.userNotificationsTemplate.ACCOUNT_STATUS_UPDATED, // Réutilisation du template pour l'admin
                    {
                        recipients: adminRecipients,
                        data: { user: user, newStatus: UserStatus.INACTIVE, actor: actor },
                    },
                    NotificationType.SYSTEM,
                    NotificationTarget.ROLE_ADMIN
                );
                if (notificationToAdmins.length > 0) {
                    this.notificationsWebSocketService.emitNotification(notificationToAdmins[0], adminRecipients[0], 'role_admin');
                }
            }

        } catch (error) {
            this.logger.error(`Erreur lors du traitement de l'événement user.deactivated pour ${user.email}:`, error.stack);
        }
    }

    /**
     * Gère l'événement `user.deleted` (suppression définitive).
     * Notifie les administrateurs. Note: L'envoi d'e-mails à un utilisateur supprimé doit être géré en amont si nécessaire.
     */
    @OnEvent('user.deleted')
    async handleUserDeletedEvent(payload: { actor: User; user: User }) {
        const { actor, user } = payload;

        try {
            const adminRecipients = await this.prisma.user.findMany({
                where: {
                    type: UserType.PERSONNEL,
                    role: { in: [Role.ADMIN, Role.CHEF_SERVICE] },
                    status: UserStatus.ACTIVE
                }
            });

            if (adminRecipients.length > 0) {
                // Création et envoi de la notification de suppression aux administrateurs.
                const deleteNotification = await this.notificationsService.createAndSendMultiple(
                    // Template ad-hoc pour la suppression; un template dédié `USER_DELETED_FOR_ADMIN` serait idéal.
                    {
                        title: () => `🚫 Suppression d'utilisateur`,
                        message: () => `L'utilisateur ${user.firstName ?? ''} ${user.lastName ?? ''} (${user.email}) a été supprimé par ${actor.firstName ?? ''} ${actor.lastName ?? ''}.`,
                        icon: () => '❌', // Utiliser un icône d'erreur ou de suppression approprié
                        iconBgColor: () => '#FF0000', // Couleur de fond rouge pour l'urgence
                        showChevron: false,
                    },
                    {
                        recipients: adminRecipients,
                        data: { userId: user.id, actorId: actor.id, type: 'USER_DELETED' }, // Données spécifiques pour la notification
                    },
                    NotificationType.SYSTEM,
                    NotificationTarget.ROLE_ADMIN
                );
                if (deleteNotification.length > 0) {
                    this.notificationsWebSocketService.emitNotification(deleteNotification[0], adminRecipients[0], 'role_admin');
                }
            }
        } catch (error) {
            this.logger.error(`Erreur lors du traitement de l'événement user.deleted pour ${user.email}:`, error.stack);
        }
    }

    /**
     * Gère l'événement `user.passwordResetSuccess` après une réinitialisation réussie.
     * Informe l'utilisateur de la modification.
     */
    @OnEvent('user.passwordResetSuccess')
    async handlePasswordResetSuccessEvent(payload: { user: User }) {
        const { user } = payload;

        try {
            // L'utilisateur est le destinataire direct.

            // 1. Envoi de l'e-mail de confirmation de changement de mot de passe.
            await this.emailService.sendEmailTemplate(
                this.userEmailTemplates.PASSWORD_CHANGED_SUCCESS,
                { recipients: [user.email], data: { user: user } },
            );

            // 2. Envoi de la notification WebSocket de confirmation.
            const notificationToUser = await this.notificationsService.createAndSendMultiple(
                this.userNotificationsTemplate.PASSWORD_CHANGED_SUCCESS,
                {
                    recipients: [user],
                    data: { user: user },
                },
                NotificationType.ACCOUNT_UPDATE,
                NotificationTarget.INDIVIDUAL
            );
            if (notificationToUser.length > 0) {
                this.notificationsWebSocketService.emitNotification(notificationToUser[0], user);
            }
        } catch (error) {
            this.logger.error(`Erreur lors du traitement de l'événement user.passwordResetSuccess pour ${user.email}:`, error.stack);
        }
    }

    /**
     * Gère l'événement `user.profileUpdated` après une modification du profil.
     * Informe l'utilisateur des mises à jour.
     */
    @OnEvent('user.profileUpdated')
    async handleUserProfileUpdatedEvent(payload: { actor: User; user: User }) {
        const { actor, user } = payload;

        try {
            // L'utilisateur mis à jour est le destinataire direct.

            // 1. Envoi de l'e-mail de mise à jour de profil.
            await this.emailService.sendEmailTemplate(
                this.userEmailTemplates.ACCOUNT_PROFILE_UPDATED,
                { recipients: [user.email], data: { user: user, actor: actor } },
            );

            // 2. Envoi de la notification WebSocket de mise à jour de profil.
            const notificationToUser = await this.notificationsService.createAndSendMultiple(
                this.userNotificationsTemplate.PROFILE_UPDATED,
                {
                    recipients: [user],
                    data: { user: user, actor: actor },
                },
                NotificationType.ACCOUNT_UPDATE,
                NotificationTarget.INDIVIDUAL
            );
            if (notificationToUser.length > 0) {
                this.notificationsWebSocketService.emitNotification(notificationToUser[0], user);
            }
        } catch (error) {
            this.logger.error(`Erreur lors du traitement de l'événement user.profileUpdated pour ${user.email}:`, error.stack);
        }
    }

    /**
     * Gère l'événement `user.roleUpdated` après une modification du rôle d'un membre du personnel.
     * Informe le membre du personnel concerné.
     */
    @OnEvent('user.roleUpdated')
    async handleUserRoleUpdatedEvent(payload: { actor: User; user: User; oldRole: Role | null; newRole: Role }) {
        const { actor, user, oldRole, newRole } = payload;

        try {
            // Le membre du personnel mis à jour est le destinataire direct.

            // 1. Envoi de l'e-mail de mise à jour de rôle.
            await this.emailService.sendEmailTemplate(
                this.userEmailTemplates.PERSONNEL_ROLE_UPDATED,
                {
                    recipients: [user.email],
                    data: {
                        user: user,
                        oldRole,
                        newRole,
                        adminUser: actor
                    }
                },
            );

            // 2. Envoi de la notification WebSocket de mise à jour de rôle.
            const notificationToPersonnel = await this.notificationsService.createAndSendMultiple(
                this.userNotificationsTemplate.PERSONNEL_ROLE_UPDATED,
                {
                    recipients: [user],
                    data: { user: user, oldRole, newRole, actor: actor },
                },
                NotificationType.SYSTEM,
                NotificationTarget.INDIVIDUAL
            );
            if (notificationToPersonnel.length > 0) {
                this.notificationsWebSocketService.emitNotification(notificationToPersonnel[0], user);
            }
        } catch (error) {
            this.logger.error(`Erreur lors du traitement de l'événement user.roleUpdated pour ${user.email}:`, error.stack);
        }
    }
}