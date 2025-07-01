import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User, UserType, Role, UserStatus, NotificationTarget, NotificationType } from '@prisma/client';
import { IEmailService } from 'src/email/interfaces/email-service.interface';
import { UserEmailTemplates } from '../templates/user-email.template';
import { UserNotificationsTemplate } from '../templates/user-notifications.template';
import { NotificationRecipientService } from 'src/notifications/recipients/notification-recipient.service';
import { NotificationsWebSocketService } from 'src/notifications/websockets/notifications-websocket.service';
import { NotificationsService } from 'src/notifications/services/notifications.service';

@Injectable()
export class UserListenerService {
    private readonly logger = new Logger(UserListenerService.name);

    constructor(
        @Inject('EMAIL_SERVICE') private readonly emailService: IEmailService,
        private readonly userEmailTemplates: UserEmailTemplates,
        private readonly userNotificationsTemplate: UserNotificationsTemplate,
        private readonly notificationRecipientService: NotificationRecipientService,
        private readonly notificationsWebSocketService: NotificationsWebSocketService,
        private readonly notificationsService: NotificationsService,
    ) {}

    /**
     * Handles the 'user.created' event.
     * Sends welcome emails and notifications (WebSocket and DB) to relevant parties.
     */
    @OnEvent('user.created')
    async handleUserCreatedEvent(payload: {
        actor: User;
        user: User;
        temporaryPassword?: string; // Present if a STAFF account was created by an admin
    }) {
        const { actor, user, temporaryPassword } = payload;

        try {
            // Retrieve the newly created user as a recipient.
            // Note: getUserAsRecipient now returns full User object, including password.
            const newlyCreatedUserRecipient = await this.notificationRecipientService.getUserAsRecipient(user.id);

            // 1. Send welcome email to the new user.
            await this.emailService.sendEmailTemplate(
                this.userEmailTemplates.WELCOME_NEW_USER,
                {
                    recipients: [newlyCreatedUserRecipient.email],
                    data: { 
                        user: newlyCreatedUserRecipient, 
                        temporaryPassword: temporaryPassword, 
                        actor: actor 
                    },
                },
            );

            // 2. Send welcome WebSocket notification to the new user.
            const welcomeNotification = await this.notificationsService.createAndSendMultiple(
                this.userNotificationsTemplate.WELCOME_USER,
                { 
                    recipients: [newlyCreatedUserRecipient], 
                    data: { user: newlyCreatedUserRecipient, temporaryPasswordSet: !!temporaryPassword }, 
                    actor: actor 
                },
                NotificationType.SYSTEM,
                NotificationTarget.INDIVIDUAL
            );
            if (welcomeNotification.length > 0) {
                // Ensure to pass the full User object for the recipient here as per NotificationsWebSocketService
                this.notificationsWebSocketService.emitNotification(welcomeNotification[0], newlyCreatedUserRecipient);
            }

            // 3. Send temporary password WebSocket notification (if applicable for STAFF users).
            if (user.type === UserType.PERSONNEL && temporaryPassword) {
                const tempPwdNotification = await this.notificationsService.createAndSendMultiple(
                    this.userNotificationsTemplate.TEMPORARY_PASSWORD_SET,
                    { 
                        recipients: [newlyCreatedUserRecipient], 
                        data: { user: newlyCreatedUserRecipient }, 
                        actor: actor 
                    },
                    NotificationType.SYSTEM,
                    NotificationTarget.INDIVIDUAL
                );
                if (tempPwdNotification.length > 0) {
                    // Ensure to pass the full User object for the recipient here as per NotificationsWebSocketService
                    this.notificationsWebSocketService.emitNotification(tempPwdNotification[0], newlyCreatedUserRecipient);
                }
            }

            // 4. Send notifications to relevant personnel (Admins/Agents) about the new user.
            const adminRecipients = await this.notificationRecipientService.getActiveUsersAsRecipientsByTypeAndRoles(UserType.PERSONNEL, [Role.ADMIN]);
            const agentRecipients = await this.notificationRecipientService.getActiveUsersAsRecipientsByTypeAndRoles(UserType.PERSONNEL, [Role.AGENT]);

            let relevantPersonnelRecipients: User[] = [];
            let notificationTarget: NotificationTarget=NotificationTarget.INDIVIDUAL;

            if (user.type === UserType.DEMANDEUR) {
                // Agents are notified of new applicant registrations.
                relevantPersonnelRecipients = agentRecipients;
                notificationTarget = NotificationTarget.ROLE_AGENT;
            } else if (user.type === UserType.PERSONNEL) {
                // Admins are notified of new staff account creations (excluding the new user if they are an admin themselves).
                relevantPersonnelRecipients = adminRecipients.filter(admin => admin.id !== user.id);
                notificationTarget = NotificationTarget.ROLE_ADMIN;
            }

            if (relevantPersonnelRecipients.length > 0) {
                const newUserNotification = await this.notificationsService.createAndSendMultiple(
                    this.userNotificationsTemplate.NEW_USER_CREATED_FOR_ADMIN,
                    { 
                        recipients: relevantPersonnelRecipients, 
                        data: { user: newlyCreatedUserRecipient, actor: actor }, 
                        actor: actor 
                    },
                    NotificationType.SYSTEM,
                    notificationTarget
                );

                if (newUserNotification.length > 0) {
                    // Emit the notification to all relevant personnel via WebSocket.
                    // Pass the first recipient and the specific group target.
                    if (notificationTarget === NotificationTarget.ROLE_AGENT) {
                         this.notificationsWebSocketService.emitNotification(
                            newUserNotification[0], 
                            relevantPersonnelRecipients[0], 
                            "role_agent"
                        );
                    } else if (notificationTarget === NotificationTarget.ROLE_ADMIN) {
                        this.notificationsWebSocketService.emitNotification(
                            newUserNotification[0], 
                            relevantPersonnelRecipients[0], 
                            'role_admin'
                        );
                    }
                }
            }

        } catch (error) {
            this.logger.error(`Error processing 'user.created' event for ${user.email}:`, error.stack);
        }
    }

    /**
     * Handles the 'user.activated' event when an account is activated.
     * Informs the activated user and relevant personnel.
     */
    @OnEvent('user.activated')
    async handleUserActivatedEvent(payload: { actor: User; user: User }) {
        const { actor, user } = payload;

        try {
            const activatedUserRecipient = await this.notificationRecipientService.getUserAsRecipient(user.id);
            const adminRecipients = await this.notificationRecipientService.getActiveUsersAsRecipientsByTypeAndRoles(UserType.PERSONNEL, [Role.ADMIN]);

            // 1. Send account status update email to the activated user.
            await this.emailService.sendEmailTemplate(
                this.userEmailTemplates.ACCOUNT_STATUS_UPDATE,
                {
                    recipients: [activatedUserRecipient.email],
                    data: {
                        user: activatedUserRecipient, 
                        oldStatus: UserStatus.INACTIVE, 
                        newStatus: UserStatus.ACTIVE, 
                        adminUser: actor 
                    },
                },
            );

            // 2. Send account status update WebSocket notification to the activated user.
            const notificationToActivatedUser = await this.notificationsService.createAndSendMultiple(
                this.userNotificationsTemplate.ACCOUNT_STATUS_UPDATED,
                { 
                    recipients: [activatedUserRecipient], 
                    data: { user: activatedUserRecipient, newStatus: UserStatus.ACTIVE, actor: actor }, 
                    actor: actor 
                },
                NotificationType.SYSTEM,
                NotificationTarget.INDIVIDUAL
            );
            if (notificationToActivatedUser.length > 0) {
                this.notificationsWebSocketService.emitNotification(notificationToActivatedUser[0], activatedUserRecipient);
            }

            // 3. Send WebSocket notifications to administrators.
            if (adminRecipients.length > 0) {
                const notificationToAdmins = await this.notificationsService.createAndSendMultiple(
                    this.userNotificationsTemplate.ACCOUNT_STATUS_UPDATED, // Reuse template for admin notification.
                    { 
                        recipients: adminRecipients, 
                        data: { user: activatedUserRecipient, newStatus: UserStatus.ACTIVE, actor: actor }, 
                        actor: actor 
                    },
                    NotificationType.SYSTEM,
                    NotificationTarget.ROLE_ADMIN
                );
                if (notificationToAdmins.length > 0) {
                    this.notificationsWebSocketService.emitNotification(notificationToAdmins[0], adminRecipients[0], 'role_admin');
                }
            }

        } catch (error) {
            this.logger.error(`Error processing 'user.activated' event for ${user.email}:`, error.stack);
        }
    }

    /**
     * Handles the 'user.deactivated' event when an account is deactivated.
     * Informs the deactivated user and relevant personnel.
     */
    @OnEvent('user.deactivated')
    async handleUserDeactivatedEvent(payload: { actor: User; user: User }) {
        const { actor, user } = payload;

        try {
            const deactivatedUserRecipient = await this.notificationRecipientService.getUserAsRecipient(user.id);
            const adminRecipients = await this.notificationRecipientService.getActiveUsersAsRecipientsByTypeAndRoles(UserType.PERSONNEL, [Role.ADMIN]);

            // 1. Send account status update email to the deactivated user.
            await this.emailService.sendEmailTemplate(
                this.userEmailTemplates.ACCOUNT_STATUS_UPDATE,
                {
                    recipients: [deactivatedUserRecipient.email],
                    data: { 
                        user: deactivatedUserRecipient, 
                        oldStatus: UserStatus.ACTIVE, 
                        newStatus: UserStatus.INACTIVE, 
                        adminUser: actor 
                    },
                },
            );

            // 2. Send account status update WebSocket notification to the deactivated user.
            const notificationToDeactivatedUser = await this.notificationsService.createAndSendMultiple(
                this.userNotificationsTemplate.ACCOUNT_STATUS_UPDATED,
                { 
                    recipients: [deactivatedUserRecipient], 
                    data: { user: deactivatedUserRecipient, newStatus: UserStatus.INACTIVE, actor: actor }, 
                    actor: actor 
                },
                NotificationType.SYSTEM,
                NotificationTarget.INDIVIDUAL
            );
            if (notificationToDeactivatedUser.length > 0) {
                this.notificationsWebSocketService.emitNotification(notificationToDeactivatedUser[0], deactivatedUserRecipient);
            }

            // 3. Send WebSocket notifications to administrators.
            if (adminRecipients.length > 0) {
                const notificationToAdmins = await this.notificationsService.createAndSendMultiple(
                    this.userNotificationsTemplate.ACCOUNT_STATUS_UPDATED, // Reuse template for admin notification.
                    { 
                        recipients: adminRecipients, 
                        data: { user: deactivatedUserRecipient, newStatus: UserStatus.INACTIVE, actor: actor }, 
                        actor: actor 
                    },
                    NotificationType.SYSTEM,
                    NotificationTarget.ROLE_ADMIN
                );
                if (notificationToAdmins.length > 0) {
                    this.notificationsWebSocketService.emitNotification(notificationToAdmins[0], adminRecipients[0], 'role_admin');
                }
            }

        } catch (error) {
            this.logger.error(`Error processing 'user.deactivated' event for ${user.email}:`, error.stack);
        }
    }

    /**
     * Handles the 'user.deleted' event (permanent deletion).
     * Notifies administrators. Note: Sending emails to a deleted user should be handled upstream if needed.
     */
    @OnEvent('user.deleted')
    async handleUserDeletedEvent(payload: { actor: User; user: User }) {
        const { actor, user } = payload;

        try {
            const adminRecipients = await this.notificationRecipientService.getActiveUsersAsRecipientsByTypeAndRoles(UserType.PERSONNEL, [Role.ADMIN]);

            if (adminRecipients.length > 0) {
                // Create and send deletion notification to administrators.
                const deleteNotification = await this.notificationsService.createAndSendMultiple(
                    // Ad-hoc template for deletion; a dedicated `USER_DELETED_FOR_ADMIN` template is ideal.
                    {
                        title: () => `🚫 Suppression d'utilisateur`,
                        message: () => `L'utilisateur ${user.firstName ?? ''} ${user.lastName ?? ''} (${user.email}) a été supprimé par ${actor.firstName ?? ''} ${actor.lastName ?? ''}.`,
                        icon: () => '❌', // Use an appropriate error or deletion icon.
                        iconBgColor: () => '#FF0000', // Red background color for urgency.
                        showChevron: false,
                    },
                    { 
                        recipients: adminRecipients, 
                        data: { userId: user.id, actorId: actor.id, type: 'USER_DELETED' }, 
                        actor: actor 
                    },
                    NotificationType.SYSTEM,
                    NotificationTarget.ROLE_ADMIN
                );
                if (deleteNotification.length > 0) {
                    this.notificationsWebSocketService.emitNotification(deleteNotification[0], adminRecipients[0], 'role_admin');
                }
            }
        } catch (error) {
            this.logger.error(`Error processing 'user.deleted' event for ${user.email}:`, error.stack);
        }
    }

    /**
     * Handles the 'user.passwordResetSuccess' event after a successful password reset.
     * Informs the user of the change.
     */
    @OnEvent('user.passwordResetSuccess')
    async handlePasswordResetSuccessEvent(payload: { user: User }) {
        const { user } = payload;

        try {
            const userRecipient = await this.notificationRecipientService.getUserAsRecipient(user.id);

            // 1. Send password change confirmation email.
            await this.emailService.sendEmailTemplate(
                this.userEmailTemplates.PASSWORD_CHANGED_SUCCESS,
                { recipients: [userRecipient.email], data: { user: userRecipient } },
            );

            // 2. Send password change confirmation WebSocket notification.
            const notificationToUser = await this.notificationsService.createAndSendMultiple(
                this.userNotificationsTemplate.PASSWORD_CHANGED_SUCCESS,
                { 
                    recipients: [userRecipient], 
                    data: { user: userRecipient }, 
                    actor: user 
                },
                NotificationType.ACCOUNT_UPDATE,
                NotificationTarget.INDIVIDUAL
            );
            if (notificationToUser.length > 0) {
                this.notificationsWebSocketService.emitNotification(notificationToUser[0], userRecipient);
            }
        } catch (error) {
            this.logger.error(`Error processing 'user.passwordResetSuccess' event for ${user.email}:`, error.stack);
        }
    }

    /**
     * Handles the 'user.profileUpdated' event after a profile modification.
     * Informs the user about the updates.
     */
    @OnEvent('user.profileUpdated')
    async handleUserProfileUpdatedEvent(payload: { actor: User; user: User }) {
        const { actor, user } = payload;

        try {
            const updatedUserRecipient = await this.notificationRecipientService.getUserAsRecipient(user.id);

            // 1. Send profile update email.
            await this.emailService.sendEmailTemplate(
                this.userEmailTemplates.ACCOUNT_PROFILE_UPDATED,
                { recipients: [updatedUserRecipient.email], data: { user: updatedUserRecipient, updatedBy: actor } },
            );

            // 2. Send profile update WebSocket notification.
            const notificationToUser = await this.notificationsService.createAndSendMultiple(
                this.userNotificationsTemplate.PROFILE_UPDATED,
                { 
                    recipients: [updatedUserRecipient], 
                    data: { user: updatedUserRecipient, actor: actor }, 
                    actor: actor 
                },
                NotificationType.ACCOUNT_UPDATE,
                NotificationTarget.INDIVIDUAL
            );
            if (notificationToUser.length > 0) {
                this.notificationsWebSocketService.emitNotification(notificationToUser[0], updatedUserRecipient);
            }
        } catch (error) {
            this.logger.error(`Error processing 'user.profileUpdated' event for ${user.email}:`, error.stack);
        }
    }

    /**
     * Handles the 'user.roleUpdated' event after a staff member's role is modified.
     * Informs the affected staff member.
     */
    @OnEvent('user.roleUpdated')
    async handleUserRoleUpdatedEvent(payload: { actor: User; user: User; oldRole: Role | null; newRole: Role }) {
        const { actor, user, oldRole, newRole } = payload;

        try {
            const updatedPersonnelRecipient = await this.notificationRecipientService.getUserAsRecipient(user.id);

            // 1. Send role update email.
            await this.emailService.sendEmailTemplate(
                this.userEmailTemplates.PERSONNEL_ROLE_UPDATED,
                { recipients: [updatedPersonnelRecipient.email], data: { 
                    user: updatedPersonnelRecipient, 
                    oldRole, 
                    newRole, 
                    adminUser: actor 
                } },
            );

            // 2. Send role update WebSocket notification.
            const notificationToPersonnel = await this.notificationsService.createAndSendMultiple(
                this.userNotificationsTemplate.PERSONNEL_ROLE_UPDATED,
                { 
                    recipients: [updatedPersonnelRecipient], 
                    data: { user: updatedPersonnelRecipient, oldRole, newRole, actor }, 
                    actor: actor 
                },
                NotificationType.SYSTEM,
                NotificationTarget.INDIVIDUAL
            );
            if (notificationToPersonnel.length > 0) {
                this.notificationsWebSocketService.emitNotification(notificationToPersonnel[0], updatedPersonnelRecipient);
            }
        } catch (error) {
            this.logger.error(`Error processing 'user.roleUpdated' event for ${user.email}:`, error.stack);
        }
    }
}