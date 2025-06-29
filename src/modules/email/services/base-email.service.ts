import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { sendEmailDto } from '../dto/sendEmailDto';
import { IEmailService } from '../interfaces/email-service.interface';
import { EmailContext, EmailTemplate } from '../interfaces/email-template.interface';
import { EmailTemplateService } from '../templates/email-template.service';
import { EmailComponentsService } from '../components/email.components.service';

@Injectable()
export abstract class BaseEmailService implements IEmailService {
    private readonly logger = new Logger(BaseEmailService.name);

    private AMBASSADE_TCHAD_LOGO: string;
    private AMBASSADE_TCHAD_NAME: string;
    private AMBASSADE_TCHAD_DESCRIPTION: string;
    private AMBASSADE_TCHAD_SUPPORT: string;
    private AMBASSADE_TCHAD_UNSUBSCRIBE_URL: string;
    private AMBASSADE_TCHAD_URL: string;
    private AMBASSADE_TCHAD_SOCIAL_LINKS: { icon: string, url: string }[];

    constructor(
        protected readonly configService: ConfigService,
        protected readonly emailTemplateService: EmailTemplateService,
        protected readonly emailComponentsService: EmailComponentsService
    ) {
        this.AMBASSADE_TCHAD_LOGO = this.configService.get<string>('AMBASSADE_TCHAD_LOGO') ?? ""
        this.AMBASSADE_TCHAD_NAME = this.configService.get<string>('AMBASSADE_TCHAD_NAME') ?? ""
        this.AMBASSADE_TCHAD_DESCRIPTION = this.configService.get<string>('AMBASSADE_TCHAD_DESCRIPTION') ?? ""
        this.AMBASSADE_TCHAD_SUPPORT = this.configService.get<string>('AMBASSADE_TCHAD_SUPPORT') ?? ""
        this.AMBASSADE_TCHAD_UNSUBSCRIBE_URL = this.configService.get<string>('AMBASSADE_TCHAD_SUPPORT') ?? ""
        this.AMBASSADE_TCHAD_URL = this.configService.get<string>('AMBASSADE_TCHAD_URL') ?? ""
        this.AMBASSADE_TCHAD_SOCIAL_LINKS = this.configService.get<string>('AMBASSADE_TCHAD_SOCIAL_LINKS')?.split("+").flatMap((link) => {
            const item = link.split(",")
            return ({ icon: item[0], url: item[1] })
        }) ?? []
    }

    protected abstract getTransportOptions(): nodemailer.TransportOptions;

    protected getTransport() {
        const options = this.getTransportOptions();
        return nodemailer.createTransport(options);
    }

    async sendEmail(dto: sendEmailDto): Promise<void> {
        const { recipients, subject, html, text } = dto;

        try {
            // Validation des données d'entrée
            if (!recipients || recipients.length === 0) {
                throw new Error('Aucun destinataire spécifié');
            }

            if (!subject || subject.trim() === '') {
                throw new Error('Sujet de l\'email manquant');
            }

            const transport = this.getTransport();

            // Test de connexion avant envoi
            try {
                await transport.verify();
                this.logger.log('Connexion SMTP vérifiée avec succès');
            } catch (verifyError) {
                this.logger.error('Erreur de vérification SMTP:', verifyError.message);
                throw new Error(`Erreur de connexion SMTP: ${verifyError.message}`);
            }

            const mailOptions: nodemailer.SendMailOptions = {
                from: this.getFromEmail(),
                to: Array.isArray(recipients) ? recipients.join(', ') : recipients,
                subject: subject,
                html: html,
                text: text,
                // Options supplémentaires pour une meilleure delivrabilité
                envelope: {
                    from: this.getFromEmail(),
                    to: Array.isArray(recipients) ? recipients.join(', ') : recipients
                },
                priority: 'normal',
            };

            this.logger.log(`Tentative d'envoi email à: ${recipients}`);

            const result = await transport.sendMail(mailOptions);

            this.logger.log(`Email envoyé avec succès. MessageId: ${result.messageId}`);

            // Fermer la connexion proprement
            transport.close();

        } catch (error) {
            this.logger.error('Erreur lors de l\'envoi de l\'email:', {
                error: error.message,
                stack: error.stack,
                recipients: recipients,
                subject: subject
            });

            // Re-throw l'erreur pour que l'appelant puisse la gérer
            throw new Error(`Échec de l'envoi de l'email: ${error.message}`);
        }
    }

    /**
    * Envoie une notification à plusieurs destinataires avec un template
    */
    async sendEmailTemplate<T>(
        template: EmailTemplate<T>,
        context: EmailContext<T>,
    ) {
        try {
            await this.sendEmail({
                recipients: context.recipients,
                subject: template.subject(context),
                html: this.emailTemplateService.generateEmailTemplate({
                    content: template.content(context),
                    header: this.emailComponentsService.Header(this.AMBASSADE_TCHAD_LOGO, this.AMBASSADE_TCHAD_NAME, this.AMBASSADE_TCHAD_DESCRIPTION),
                    footer: this.emailComponentsService.Footer(
                        this.AMBASSADE_TCHAD_NAME, // Nom de votre entreprise
                        this.AMBASSADE_TCHAD_DESCRIPTION, // Description de votre entreprise
                        this.AMBASSADE_TCHAD_SUPPORT, // Email de support
                        this.AMBASSADE_TCHAD_UNSUBSCRIBE_URL, // URL de désabonnement
                        this.AMBASSADE_TCHAD_URL, // URL de votre site web
                        this.emailComponentsService.SocialLinks(this.AMBASSADE_TCHAD_SOCIAL_LINKS)
                    )
                }),
            });
        } catch (error) {
            this.logger.error('Erreur lors de l\'envoi du template email:', error.message);
            throw error;
        }
    }

    protected abstract getFromEmail(): string;
}