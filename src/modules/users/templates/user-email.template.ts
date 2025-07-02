import { Injectable } from "@nestjs/common";
import { User, UserType, Role, OtpToken, UserStatus } from "@prisma/client"; // Importez UserStatus
import { EmailTemplate } from "src/email/interfaces/email-template.interface";
import { EmailComponentsService } from "src/email/components/email.components.service";
import { ConfigService } from "@nestjs/config";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { userGetRole } from "../constantes/user-get-role.constante";

@Injectable()
export class UserEmailTemplates {
    constructor(
        private readonly emailComponentsService: EmailComponentsService,
        private readonly configService: ConfigService
    ) { }

    private getFrontendUrl(): string {
        return this.configService.get<string>('FRONTEND_URL') ?? "https://portail.ambassade-tchad.com";
    }

    private getBackofficeUrl(): string {
        return this.configService.get<string>('BACKOFFICE_URL') ?? "https://ambassade-tchad-dashboard.vercel.app";
    }

    private getSupportEmail(): string {
        return this.configService.get<string>('AMBASSADE_SUPPORT_EMAIL') ?? "support@ambassade-tchad.com";
    }

    /**
     * E-MAIL 1: ACCUEIL DES NOUVEAUX UTILISATEURS (Demandeurs et Personnel)
     * Déclencheur: `UsersService.create` (pour le personnel) ou `AuthService.registerClient` (pour le demandeur - si vous décidez d'envoyer un mail ici).
     * Objet: Indiquer la création d'un compte et les premières étapes.
     */

    WELCOME_NEW_USER: EmailTemplate<{
        user: User; // L'utilisateur nouvellement créé
        temporaryPassword?: string; // Mot de passe temporaire si généré par l'administration (pour le personnel)
        actor?: User; // L'administrateur ou membre du personnel ayant créé le compte (pour le personnel)
    }> = {
            subject: (ctx) => `Confirmation de la Création de Votre Compte - ${this.configService.get<string>('AMBASSADE_NAME') ?? "Ambassade du Tchad"}`,
            content: (ctx) => {
                const userTypeLabel = ctx.data.user.type === UserType.DEMANDEUR
                    ? 'Demandeur de Services'
                    : userGetRole(ctx.data.user.role as Role); // Le rôle sera présent si PERSONNEL

                const emailBody = [
                    this.emailComponentsService.HeroSection(
                        `Bienvenue sur la plateforme de l'Ambassade du Tchad`,
                        `Nous sommes honorés de vous compter parmi nos utilisateurs, ${ctx.data.user.firstName ?? 'cher concitoyen'} !`
                    ),
                    this.emailComponentsService.Message(
                        `Nous avons le plaisir de vous informer que votre compte a été créé avec succès sous l'adresse e-mail : <strong>${ctx.data.user.email}</strong>.`
                    ),
                    ctx.data.actor ? this.emailComponentsService.Message(
                        `Cette création a été effectuée par ${ctx.data.actor.firstName ?? 'un membre du personnel'} ${ctx.data.actor.lastName ?? ''}.`
                    ) : '',
                    this.emailComponentsService.Message(
                        `En tant que **${userTypeLabel}**, vous disposez désormais d'un accès complet aux fonctionnalités dédiées. Nous vous invitons à explorer les divers services proposés.`
                    ),
                    ctx.data.temporaryPassword ? this.emailComponentsService.InfoBox(
                        `Votre mot de passe temporaire est : <strong>${ctx.data.temporaryPassword}</strong>.<br>Pour des raisons de sécurité, nous vous prions de bien vouloir le modifier lors de votre première connexion.`,
                        '🔑'
                    ) : '',
                    ctx.data.user.type === UserType.DEMANDEUR ? this.emailComponentsService.CtaButton('Accéder à la Plateforme', this.getFrontendUrl()) : '',
                    ctx.data.user.type === UserType.PERSONNEL ? this.emailComponentsService.CtaButton('Accéder à la Plateforme', this.getBackofficeUrl()) : '',
                    this.emailComponentsService.Divider(),
                    this.emailComponentsService.Message(
                        `Notre équipe de support reste à votre entière disposition pour toute assistance requise.`
                    ),
                    this.emailComponentsService.Button('Contacter le Service d\'Assistance', `mailto:${this.getSupportEmail()}`, 'outline'),
                ].filter(Boolean).join('\n');

                return this.emailComponentsService.GlassCard(emailBody, 'Détails de Votre Compte');
            }
        };

    /**
     * E-MAIL 2: DEMANDE DE RÉINITIALISATION DE MOT DE PASSE
     * Déclencheur: `AuthService.requestPasswordResetOtp`.
     * Objet: Fournir les instructions et le code pour réinitialiser le mot de passe.
     */
    PASSWORD_RESET_REQUEST: EmailTemplate<{ user: User, otpToken: OtpToken }> = {
        subject: (ctx) => `Procédure de Réinitialisation de Votre Mot de Passe - ${this.configService.get<string>('AMBASSADE_NAME') ?? "Ambassade du Tchad"}`,
        content: (ctx) => {
            // Le lien pour la réinitialisation du mot de passe doit inclure le token et l'email.
            let resetLink;

            if (ctx.data.user.type === UserType.DEMANDEUR) {
                resetLink = `${this.getFrontendUrl()}/auth/reinitialisation-mot-de-passe?code=${ctx.data.otpToken.code}&email=${encodeURIComponent(ctx.data.user.email)}`;
            } else {
                resetLink = `${this.getBackofficeUrl()}/auth/reinitialisation-mot-de-passe?code=${ctx.data.otpToken.code}&email=${encodeURIComponent(ctx.data.user.email)}`;
            }

            const emailBody = [
                this.emailComponentsService.Greeting(`Cher ${ctx.data.user.firstName ?? 'utilisateur'},`),
                this.emailComponentsService.Message(
                    `Nous avons bien reçu votre requête de réinitialisation de mot de passe pour le compte associé à l'adresse e-mail : <strong>${ctx.data.user.email}</strong>.`
                ),
                this.emailComponentsService.InfoBox(
                    `Votre code de vérification est : <strong>${ctx.data.otpToken.code}</strong>.`,
                    '⏰'
                ),
                this.emailComponentsService.CtaButton('Réinitialiser Mon Mot de Passe', resetLink),
                this.emailComponentsService.Message(
                    `Si cette demande n'émane pas de votre part, nous vous prions d'ignorer cet e-mail. Votre mot de passe actuel demeurera inchangé.`
                ),
                this.emailComponentsService.Divider(),
                this.emailComponentsService.Message(
                    `Pour toute assistance supplémentaire, veuillez contacter notre service de support.`
                ),
                this.emailComponentsService.Button('Contacter le Service d\'Assistance', `mailto:${this.getSupportEmail()}`, 'outline'),
            ].filter(Boolean).join('\n');

            return this.emailComponentsService.GlassCard(emailBody, 'Réinitialisation de Mot de Passe');
        }
    };

    /**
     * E-MAIL 3: CONFIRMATION DE CHANGEMENT DE MOT DE PASSE
     * Déclencheur: `AuthService.resetPassword`.
     * Objet: Confirmer que le mot de passe a été modifié avec succès.
     */
    PASSWORD_CHANGED_SUCCESS: EmailTemplate<{ user: User }> = {
        subject: (ctx) => `Confirmation de la Modification de Votre Mot de Passe - ${this.configService.get<string>('AMBASSADE_NAME') ?? "Ambassade du Tchad"}`,
        content: (ctx) => {
            const emailBody = [
                this.emailComponentsService.Greeting(`Cher ${ctx.data.user.firstName ?? 'utilisateur'},`),
                this.emailComponentsService.Alert(
                    `Nous vous confirmons que le mot de passe de votre compte <strong>${ctx.data.user.email}</strong> a été modifié avec succès.`,
                    'success'
                ),
                this.emailComponentsService.Message(
                    `Si vous n'êtes pas à l'origine de cette modification, nous vous prions de contacter notre service de support sans délai. Votre sécurité est notre priorité absolue.`
                ),
                ctx.data.user.type === UserType.DEMANDEUR ? this.emailComponentsService.CtaButton('Accéder à Votre Compte', this.getFrontendUrl()) : '',
                ctx.data.user.type === UserType.PERSONNEL ? this.emailComponentsService.CtaButton('Accéder à Votre Compte', this.getBackofficeUrl()) : '',
                this.emailComponentsService.Divider(),
                this.emailComponentsService.Message(
                    `Notre équipe est à votre disposition pour toute question ou préoccupation.`
                ),
                this.emailComponentsService.Button('Contacter le Service d\'Assistance', `mailto:${this.getSupportEmail()}`, 'outline'),
            ].filter(Boolean).join('\n');

            return this.emailComponentsService.GlassCard(emailBody, 'Modification de Mot de Passe Confirmée');
        }
    };

    /**
     * E-MAIL 4: MISE À JOUR DU STATUT DU COMPTE
     * Déclencheur: `UsersService.deactivate` ou `UsersService.activate`.
     * Objet: Informer l'utilisateur d'un changement de statut de son compte (actif/inactif).
     */
    ACCOUNT_STATUS_UPDATE: EmailTemplate<{
        user: User; // L'utilisateur dont le statut a été mis à jour
        oldStatus: UserStatus; // Ancien statut (utilisez l'enum pour la clarté)
        newStatus: UserStatus; // Nouveau statut (utilisez l'enum pour la clarté)
        reason?: string; // Raison du changement (optionnel)
        actor?: User; // L'administrateur ayant effectué l'action (optionnel)
    }> = {
            subject: (ctx) => `Notification de Mise à Jour du Statut de Votre Compte - ${this.configService.get<string>('AMBASSADE_NAME') ?? "Ambassade du Tchad"}`,
            content: (ctx) => {
                // Traduction des statuts pour l'affichage
                const oldStatusTranslated = this.translateUserStatus(ctx.data.oldStatus);
                const newStatusTranslated = this.translateUserStatus(ctx.data.newStatus);

                const emailBody = [
                    this.emailComponentsService.Greeting(`Cher ${ctx.data.user.firstName ?? 'utilisateur'},`),
                    this.emailComponentsService.Alert(
                        `Le statut de votre compte utilisateur <strong>${ctx.data.user.email}</strong> a été mis à jour de <strong>${oldStatusTranslated}</strong> à <strong>${newStatusTranslated}</strong>.`,
                        ctx.data.newStatus === UserStatus.ACTIVE ? 'success' : 'warning'
                    ),
                    ctx.data.reason ? this.emailComponentsService.Message(
                        `<strong>Raison de cette mise à jour :</strong> ${ctx.data.reason}`
                    ) : '',
                    ctx.data.actor ? this.emailComponentsService.Message(
                        `Cette modification a été effectuée par ${ctx.data.actor.firstName ?? 'un administrateur'} ${ctx.data.actor.lastName ?? ''}.`
                    ) : '',
                    ctx.data.user.type === UserType.DEMANDEUR ? this.emailComponentsService.CtaButton('Accéder à Mon Compte', this.getFrontendUrl()) : '',
                    ctx.data.user.type === UserType.PERSONNEL ? this.emailComponentsService.CtaButton('Accéder à Mon Compte', this.getBackofficeUrl()) : '',
                    this.emailComponentsService.Divider(),
                    this.emailComponentsService.Message(
                        `Pour toute clarification, nous vous invitons à contacter notre service de support.`
                    ),
                    this.emailComponentsService.Button('Contacter le Service d\'Assistance', `mailto:${this.getSupportEmail()}`, 'outline'),
                ].filter(Boolean).join('\n');

                return this.emailComponentsService.GlassCard(emailBody, 'Statut de Votre Compte Mis à Jour');
            }
        };

    /**
     * E-MAIL 5: MISE À JOUR DU PROFIL UTILISATEUR
     * Déclencheur: `UsersService.update` (lorsque des champs du profil sont modifiés).
     * Objet: Informer l'utilisateur des modifications apportées à son profil.
     */
    ACCOUNT_PROFILE_UPDATED: EmailTemplate<{
        user: User; // L'utilisateur dont le profil a été mis à jour
        actor?: User; // L'utilisateur (ou l'administrateur) ayant effectué la modification (optionnel)
        // updatedFields: string[]; // Retiré car difficile à suivre précisément sans comparaison avant/après
    }> = {
            subject: (ctx) => `Mise à Jour de Votre Profil Utilisateur - ${this.configService.get<string>('AMBASSADE_NAME') ?? "Ambassade du Tchad"}`,
            content: (ctx) => {
                const emailBody = [
                    this.emailComponentsService.Greeting(`Cher ${ctx.data.user.firstName ?? 'utilisateur'},`),
                    this.emailComponentsService.Alert(
                        `Nous tenons à vous informer que votre profil utilisateur associé à l'adresse <strong>${ctx.data.user.email}</strong> a été mis à jour.`,
                        'info'
                    ),
                    ctx.data.actor ? this.emailComponentsService.Message(
                        `Cette modification a été effectuée par : ${ctx.data.actor.firstName ?? 'un utilisateur'} ${ctx.data.actor.lastName ?? ''}.`
                    ) : '',
                    ctx.data.user.type === UserType.DEMANDEUR ? this.emailComponentsService.CtaButton('Accéder à Mon Profil', `${this.getFrontendUrl()}/profil`) : '',
                    ctx.data.user.type === UserType.PERSONNEL ? this.emailComponentsService.CtaButton('Accéder à Mon Profil', `${this.getBackofficeUrl()}/profil`) : '',
                    this.emailComponentsService.Divider(),
                    this.emailComponentsService.Message(
                        `Si cette modification n'a pas été initiée par vous, nous vous prions de nous contacter immédiatement.`
                    ),
                    this.emailComponentsService.Button('Contacter le Service d\'Assistance', `mailto:${this.getSupportEmail()}`, 'outline'),
                ].filter(Boolean).join('\n');

                return this.emailComponentsService.GlassCard(emailBody, 'Mise à Jour de Votre Profil');
            }
        };

    /**
     * E-MAIL 6: COMPTE UTILISATEUR VERROUILLÉ
     * Déclencheur: (Logic de sécurité externe, par ex. suite à trop de tentatives de connexion échouées).
     * Objet: Informer l'utilisateur que son compte a été temporairement verrouillé.
     */
    USER_ACCOUNT_LOCKED: EmailTemplate<{ user: User }> = {
        subject: (ctx) => `Notification de Verrouillage Temporaire de Votre Compte - ${this.configService.get<string>('AMBASSADE_NAME') ?? "Ambassade du Tchad"}`,
        content: (ctx) => {
            const emailBody = [
                this.emailComponentsService.Greeting(`Cher ${ctx.data.user.firstName ?? 'utilisateur'},`),
                this.emailComponentsService.Alert(
                    `Nous vous informons que votre compte <strong>${ctx.data.user.email}</strong> a été temporairement verrouillé suite à de multiples tentatives de connexion infructueuses.`,
                    'error'
                ),
                this.emailComponentsService.Message(
                    `Cette mesure est appliquée dans un souci de sécurité afin de protéger vos informations. Le verrouillage est généralement temporaire et sera automatiquement levé après une brève période.`,
                ),
                this.emailComponentsService.Message(
                    `Si le problème persiste, vous avez la possibilité de réinitialiser votre mot de passe ou de contacter notre service de support.`
                ),
                ctx.data.user.type === UserType.DEMANDEUR ? this.emailComponentsService.CtaButton('Réinitialiser Mon Mot de Passe', `${this.getFrontendUrl()}/auth/mot-de-passe-oublie`) : '',
                ctx.data.user.type === UserType.PERSONNEL ? this.emailComponentsService.CtaButton('Réinitialiser Mon Mot de Passe', `${this.getBackofficeUrl()}/auth/mot-de-passe-oublie`) : '',
                this.emailComponentsService.Divider(),
                this.emailComponentsService.Message(
                    `Si ces tentatives de connexion ne proviennent pas de votre part, nous vous prions de nous contacter immédiatement.`
                ),
                this.emailComponentsService.Button('Contacter le Service d\'Assistance', `mailto:${this.getSupportEmail()}`, 'outline'),
            ].filter(Boolean).join('\n');

            return this.emailComponentsService.GlassCard(emailBody, 'Compte Verrouillé');
        }
    };

    /**
     * E-MAIL 7: MISE À JOUR DU RÔLE DU PERSONNEL
     * Déclencheur: `UsersService.update` (lorsqu'un administrateur modifie le rôle d'un membre du personnel).
     * Objet: Informer un membre du personnel que son rôle a été modifié.
     */
    PERSONNEL_ROLE_UPDATED: EmailTemplate<{
        user: User; // Le membre du personnel dont le rôle a été mis à jour
        oldRole: Role | null; // L'ancien rôle
        newRole: Role; // Le nouveau rôle
        adminUser?: User; // L'administrateur ayant effectué l'action (optionnel)
    }> = {
            subject: (ctx) => `Mise à Jour de Votre Rôle au Sein de l'Ambassade du Tchad`,
            content: (ctx) => {
                const emailBody = [
                    this.emailComponentsService.Greeting(`Cher ${ctx.data.user.firstName ?? 'membre du personnel'},`),
                    this.emailComponentsService.Alert(
                        `Nous vous informons que votre rôle sur la plateforme de l'Ambassade du Tchad a été modifié.`,
                        'info'
                    ),
                    this.emailComponentsService.Summary([
                        { label: 'Ancien rôle', value: userGetRole(ctx.data.oldRole as Role) },
                        { label: 'Nouveau rôle', value: userGetRole(ctx.data.newRole) },
                    ]),
                    ctx.data.adminUser ? this.emailComponentsService.Message(
                        `Cette mise à jour a été effectuée par ${ctx.data.adminUser.firstName ?? 'un administrateur'} ${ctx.data.adminUser.lastName ?? ''}.`
                    ) : '',
                    this.emailComponentsService.Message(
                        `Vos accès et permissions au sein du système ont été ajustés en conséquence. Nous vous invitons à consulter le tableau de bord pour prendre connaissance des changements.`
                    ),
                    this.emailComponentsService.CtaButton('Accéder au Tableau de Bord', `${this.getBackofficeUrl()}/tableau-de-bord`),
                    this.emailComponentsService.Divider(),
                    this.emailComponentsService.Message(
                        `Pour toute question relative à cette modification, nous vous prions de contacter un administrateur système.`
                    ),
                ].filter(Boolean).join('\n');

                return this.emailComponentsService.GlassCard(emailBody, 'Mise à Jour de Votre Rôle Professionnel');
            }
        };

    // --- Fonctions utilitaires internes au service de template pour la traduction ---
    private translateUserStatus(status: UserStatus): string {
        switch (status) {
            case UserStatus.ACTIVE: return 'Actif';
            case UserStatus.INACTIVE: return 'Inactif';
            default: return status;
        }
    }
}