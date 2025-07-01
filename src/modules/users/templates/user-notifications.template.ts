import { notificationIcons } from "src/notifications/constantes/notifications.constante";
import { NotificationTemplate } from "src/notifications/interfaces/notifications.interface";
import { User, UserType, Role, UserStatus } from "@prisma/client";
import { userGetRole } from "../constantes/user-get-role.constante";

export class UserNotificationsTemplate {

    /**
     * NOTIFICATION 1: NOUVEL UTILISATEUR CRÉÉ (Pour les Administrateurs/Personnel de gestion)
     * Déclencheur: `UsersService.create` ou `AuthService.registerClient`.
     * Contexte: Un nouvel utilisateur (demandeur ou membre du personnel) a été ajouté au système.
     */
    NEW_USER_CREATED_FOR_ADMIN: NotificationTemplate<{
        user: User; // Le nouvel utilisateur créé
        actor?: User; // L'administrateur ou membre du personnel qui a créé le compte (si applicable)
    }> = {
            title: (ctx) => `👥 Nouvel Enregistrement Utilisateur`,
            message: (ctx) => {
                const userRoleLabel = ctx.data.user.type === UserType.DEMANDEUR
                    ? 'Demandeur de Services'
                    : userGetRole(ctx.data.user.role as Role);

                const createdBy = ctx.data.actor
                    ? `par ${ctx.data.actor.firstName ?? ''} ${ctx.data.actor.lastName ?? ''}`.trim()
                    : 'via auto-enregistrement';

                return `Un nouveau compte a été créé pour ${ctx.data.user.firstName ?? ''} ${ctx.data.user.lastName ?? ''} (${ctx.data.user.email}) en tant que **${userRoleLabel}** ${createdBy}.`;
            },
            icon: (ctx) => notificationIcons.joice.url,
            iconBgColor: (ctx) => notificationIcons.joice.color,
            showChevron: false,
        };

    /**
     * NOTIFICATION 2: BIENVENUE À L'UTILISATEUR (Pour le nouvel utilisateur lui-même)
     * Déclencheur: `UsersService.create` ou `AuthService.registerClient`.
     * Contexte: Le compte de l'utilisateur a été créé et est prêt.
     */
    WELCOME_USER: NotificationTemplate<{
        user: User; // Le nouvel utilisateur
        temporaryPasswordSet?: boolean; // Indique si un mot de passe temporaire a été défini
    }> = {
            title: (ctx) => `🎉 Bienvenue sur la plateforme !`,
            message: (ctx) => {
                if (ctx.data.user.type === UserType.PERSONNEL && ctx.data.temporaryPasswordSet) {
                    return `Votre compte est prêt. Veuillez vous connecter et changer votre mot de passe initial.`;
                }
                return `Votre compte est désormais actif. Connectez-vous pour accéder à nos services.`;
            },
            icon: (ctx) => notificationIcons.joice.url,
            iconBgColor: (ctx) => notificationIcons.joice.color,
            showChevron: false,
        };

    /**
     * NOTIFICATION 3: MOT DE PASSE TEMPORAIRE DÉFINI (Pour l'utilisateur personnel)
     * Déclencheur: `UsersService.create` (lors de la création d'un personnel par un admin).
     * Contexte: Un compte personnel a été créé avec un mot de passe temporaire.
     */
    TEMPORARY_PASSWORD_SET: NotificationTemplate<{
        user: User; // L'utilisateur personnel concerné
    }> = {
            title: (ctx) => `🔑 Mot de passe initial défini`,
            message: (ctx) => `Votre compte personnel a été créé. Pour des raisons de sécurité, veuillez modifier votre mot de passe lors de votre première connexion.`,
            icon: (ctx) => notificationIcons.setting.url,
            iconBgColor: (ctx) => notificationIcons.setting.color,
            showChevron: false,
        };

    /**
     * NOTIFICATION 4: MOT DE PASSE CHANGÉ AVEC SUCCÈS (Pour l'utilisateur concerné)
     * Déclencheur: `AuthService.resetPassword` ou le premier changement de mot de passe du personnel.
     * Contexte: L'utilisateur a modifié son mot de passe.
     */
    PASSWORD_CHANGED_SUCCESS: NotificationTemplate<{
        user: User; // L'utilisateur dont le mot de passe a été changé
    }> = {
            title: (ctx) => `✅ Mot de passe modifié`,
            message: (ctx) => `Votre mot de passe a été modifié avec succès. Si vous n'êtes pas à l'origine de cette action, veuillez nous contacter.`,
            icon: (ctx) => notificationIcons.ok.url,
            iconBgColor: (ctx) => notificationIcons.ok.color,
            showChevron: false,
        };

    /**
     * NOTIFICATION 5: COMPTE ACTIF / INACTIF (Pour l'utilisateur concerné)
     * Déclencheur: `UsersService.activate` ou `UsersService.deactivate`.
     * Contexte: Le statut d'activation du compte d'un utilisateur a été modifié.
     */
    ACCOUNT_STATUS_UPDATED: NotificationTemplate<{
        user: User; // L'utilisateur dont le statut a été modifié
        newStatus: UserStatus; // Le nouveau statut du compte
        actor?: User; // L'administrateur ayant effectué la modification
    }> = {
            title: (ctx) => ctx.data.newStatus === UserStatus.ACTIVE ? `Compte Activé` : `Compte Désactivé`,
            message: (ctx) => {
                const actionBy = ctx.data.actor
                    ? `par ${ctx.data.actor.firstName ?? ''} ${ctx.data.actor.lastName ?? ''}`.trim()
                    : '';
                return ctx.data.newStatus === UserStatus.ACTIVE
                    ? `Votre compte ${ctx.data.user.email} est désormais actif ${actionBy}. Vous pouvez vous connecter.`
                    : `Votre compte ${ctx.data.user.email} a été désactivé ${actionBy}. Contactez l'administration pour plus d'informations.`;
            },
            icon: (ctx) => ctx.data.newStatus === UserStatus.ACTIVE ? notificationIcons.ok.url : notificationIcons.setting.url,
            iconBgColor: (ctx) => ctx.data.newStatus === UserStatus.ACTIVE ? notificationIcons.ok.color : notificationIcons.setting.color,
            showChevron: false,
        };

    /**
     * NOTIFICATION 6: MISE À JOUR DU PROFIL (Pour l'utilisateur concerné)
     * Déclencheur: `UsersService.update` (lorsque l'utilisateur modifie son propre profil ou un admin le modifie).
     * Contexte: Certaines informations du profil utilisateur ont été modifiées.
     */
    PROFILE_UPDATED: NotificationTemplate<{
        user: User; // L'utilisateur dont le profil a été mis à jour
        actor?: User; // L'utilisateur (ou l'administrateur) qui a effectué la mise à jour
    }> = {
            title: (ctx) => `⚙️ Profil mis à jour`,
            message: (ctx) => {
                const updatedBy = ctx.data.actor && ctx.data.actor.id !== ctx.data.user.id
                    ? ` par ${ctx.data.actor.firstName ?? ''} ${ctx.data.actor.lastName ?? ''}`.trim()
                    : '';
                return `Votre profil a été mis à jour avec succès${updatedBy}. Vérifiez les informations.`;
            },
            icon: (ctx) => notificationIcons.setting.url,
            iconBgColor: (ctx) => notificationIcons.setting.color,
            showChevron: true,
        };

    /**
     * NOTIFICATION 7: COMPTE VERROUILLÉ (Pour l'utilisateur concerné)
     * Déclencheur: Logique de sécurité après des tentatives de connexion échouées (souvent dans AuthService ou un middleware).
     * Contexte: Le compte de l'utilisateur a été temporairement verrouillé.
     */
    ACCOUNT_LOCKED: NotificationTemplate<{
        user: User; // L'utilisateur dont le compte est verrouillé
    }> = {
            title: (ctx) => `🔒 Compte Temporairement Verrouillé`,
            message: (ctx) => `Votre compte a été verrouillé suite à des tentatives de connexion infructueuses. Veuillez réessayer plus tard ou réinitialiser votre mot de passe.`,
            icon: (ctx) => notificationIcons.setting.url,
            iconBgColor: (ctx) => notificationIcons.setting.color,
            showChevron: false,
        };

    /**
     * NOTIFICATION 8: RÔLE DU PERSONNEL MIS À JOUR (Pour le membre du personnel concerné)
     * Déclencheur: `UsersService.update` (lorsqu'un admin modifie le rôle d'un membre du personnel).
     * Contexte: Le rôle d'un membre du personnel a été modifié.
     */
    PERSONNEL_ROLE_UPDATED: NotificationTemplate<{
        user: User; // Le membre du personnel dont le rôle a été mis à jour
        oldRole: Role | null; // L'ancien rôle
        newRole: Role; // Le nouveau rôle
        actor?: User; // L'administrateur ayant effectué l'action
    }> = {
            title: (ctx) => `Mise à Jour de Votre Rôle`,
            message: (ctx) => {
                const oldRoleLabel = userGetRole(ctx.data.oldRole as Role);
                const newRoleLabel = userGetRole(ctx.data.newRole);
                const actionBy = ctx.data.actor
                    ? `par ${ctx.data.actor.firstName ?? ''} ${ctx.data.actor.lastName ?? ''}.`
                    : '.';
                return `Votre rôle a été modifié de **${oldRoleLabel}** à **${newRoleLabel}** ${actionBy} Vos accès ont été ajustés.`;
            },
            icon: (ctx) => notificationIcons.setting.url,
            iconBgColor: (ctx) => notificationIcons.setting.color,
            showChevron: true,
        };
}