import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Notification, NotificationType, NotificationTarget, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/services/prisma.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { NotificationStatsDto } from '../dto/notifications-stats.dto';
import { QueryNotificationDto } from '../dto/query-notification.dto';
import { QueryResponseDto } from 'src/common/dto/query-response.dto';
import { NotificationResponseDto } from '../dto/response-notification.dto';
import { NotificationContext, NotificationTemplate } from '../interfaces/notifications.interface';

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Créer une nouvelle notification.
     * @param createNotificationDto Les données de la notification à créer.
     * @returns La notification créée.
     */
    async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
        const notification = await this.prisma.notification.create({
            data: {
                title: createNotificationDto.title,
                message: createNotificationDto.message,
                type: createNotificationDto.type,
                isRead: createNotificationDto.isRead ?? false,
                target: createNotificationDto.target,
                icon: createNotificationDto.icon,
                iconBgColor: createNotificationDto.iconBgColor,
                showChevron: createNotificationDto.showChevron ?? false,
                data: createNotificationDto.data,
                user: {
                    connect: { id: createNotificationDto.userId }
                }
            },
        });
        return notification;
    }

    /**
     * Obtenir toutes les notifications avec pagination et filtres.
     * @param query Les paramètres de requête pour le filtrage et la pagination.
     * @returns Une réponse paginée contenant les notifications.
     */
    async findAll(query: QueryNotificationDto): Promise<QueryResponseDto<NotificationResponseDto>> {
        const page = Number(query.page ?? 1);
        const limit = Number(query.limit ?? 10);
        const skip = (page - 1) * limit;

        const where: Prisma.NotificationWhereInput = {};

        if (query.userId) where.userId = query.userId;
        if (query.target) where.target = query.target;
        if (query.type) where.type = query.type;
        if (query.isRead !== undefined) where.isRead = query.isRead;

        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where }),
        ]);

        return {
            data: notifications,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Obtenir les notifications d'un utilisateur spécifique.
     * @param query Les paramètres de requête pour le filtrage et la pagination (sans userId ni target).
     * @param userId L'ID de l'utilisateur.
     * @param target La cible de la notification (ex: INDIVIDUAL).
     * @returns Une réponse paginée contenant les notifications de l'utilisateur.
     */
    async findByUser(
        query: Omit<QueryNotificationDto, 'userId' | 'target'>,
        userId: string,
        target: NotificationTarget,
    ): Promise<QueryResponseDto<NotificationResponseDto>> {
        const page = Number(query.page ?? 1);
        const limit = Number(query.limit ?? 10);
        const skip = (page - 1) * limit;

        const where: Prisma.NotificationWhereInput = {
            userId: userId,
            target,
        };

        if (query.type) where.type = query.type;
        if (query.isRead !== undefined) where.isRead = query.isRead;

        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where }),
        ]);

        return {
            data: notifications,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Obtenir une notification par son ID.
     * @param id L'ID de la notification.
     * @returns La notification trouvée.
     * @throws NotFoundException si la notification n'est pas trouvée.
     */
    async findOne(id: string): Promise<Notification> {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            throw new NotFoundException('Notification non trouvée');
        }
        return notification;
    }

    /**
     * Mettre à jour une notification.
     * @param id L'ID de la notification à mettre à jour.
     * @param updateNotificationDto Les données de mise à jour.
     * @returns La notification mise à jour.
     * @throws NotFoundException si la notification n'est pas trouvée.
     */
    async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
        try {
            const notification = await this.prisma.notification.update({
                where: { id },
                data: {
                    ...updateNotificationDto,
                    updatedAt: new Date(),
                },
            });
            return notification;
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException('Notification non trouvée');
            }
            throw new BadRequestException('Erreur lors de la mise à jour de la notification');
        }
    }

    /**
     * Marquer une notification comme lue.
     * @param id L'ID de la notification.
     * @returns La notification mise à jour.
     */
    async markAsRead(id: string): Promise<Notification> {
        return this.update(id, { isRead: true });
    }

    /**
     * Marquer une notification comme non lue.
     * @param id L'ID de la notification.
     * @returns La notification mise à jour.
     */
    async markAsUnread(id: string): Promise<Notification> {
        return this.update(id, { isRead: false });
    }

    /**
     * Marquer toutes les notifications d'un utilisateur comme lues.
     * @param userId L'ID de l'utilisateur.
     * @param target La cible des notifications (ex: INDIVIDUAL).
     * @returns Un objet contenant un message et le nombre de notifications mises à jour.
     */
    async markAllAsReadByUser(userId: string, target: NotificationTarget): Promise<{ message: string; count: number }> {
        const result = await this.prisma.notification.updateMany({
            where: {
                userId: userId,
                target,
                isRead: false,
            },
            data: {
                isRead: true,
                updatedAt: new Date(),
            },
        });
        return {
            message: `${result.count} notification(s) marquée(s) comme lue(s)`,
            count: result.count,
        };
    }

    /**
     * Supprimer une notification.
     * @param id L'ID de la notification.
     * @returns Un objet message.
     * @throws NotFoundException si la notification n'est pas trouvée.
     */
    async remove(id: string): Promise<{ message: string }> {
        try {
            await this.prisma.notification.delete({
                where: { id },
            });
            return { message: 'Notification supprimée avec succès' };
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException('Notification non trouvée');
            }
            throw new BadRequestException('Erreur lors de la suppression de la notification');
        }
    }

    /**
     * Supprimer toutes les notifications d'un utilisateur.
     * @param userId L'ID de l'utilisateur.
     * @param target La cible des notifications (ex: INDIVIDUAL).
     * @returns Un objet contenant un message et le nombre de notifications supprimées.
     */
    async removeAllByUser(userId: string, target: NotificationTarget): Promise<{ message: string; count: number }> {
        const result = await this.prisma.notification.deleteMany({
            where: {
                userId: userId,
                target,
            },
        });
        return {
            message: `${result.count} notification(s) supprimée(s)`,
            count: result.count,
        };
    }

    /**
     * Obtenir les statistiques des notifications d'un utilisateur.
     * @param userId L'ID de l'utilisateur.
     * @param target La cible des notifications.
     * @returns Les statistiques des notifications.
     */
    async getStatsByUser(userId: string, target: NotificationTarget): Promise<NotificationStatsDto> {
        const [total, unread, typeStats] = await Promise.all([
            this.prisma.notification.count({
                where: { userId: userId, target },
            }),
            this.prisma.notification.count({
                where: { userId: userId, target, isRead: false },
            }),
            this.prisma.notification.groupBy({
                by: ['type'],
                where: { userId: userId, target },
                _count: { type: true },
            }),
        ]);

        const byType = typeStats.reduce((acc, stat) => {
            acc[stat.type] = stat._count.type;
            return acc;
        }, {} as Record<string, number>);

        return {
            total,
            unread,
            read: total - unread,
            byType: byType,
        };
    }

    /**
     * Nettoyer les anciennes notifications (plus de X jours) qui sont lues.
     * @param daysOld Le nombre de jours au-delà desquels les notifications lues sont supprimées.
     * @returns Le nombre de notifications supprimées.
     */
    async cleanupOldNotifications(daysOld: number = 30): Promise<{ message: string; count: number }> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await this.prisma.notification.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate,
                },
                isRead: true,
            },
        });

        return {
            message: `${result.count} ancienne(s) notification(s) supprimée(s)`,
            count: result.count,
        };
    }

    /**
     * Crée et enregistre plusieurs notifications en BDD basées sur un template et un contexte.
     * Cette méthode ne gère PAS l'émission WebSocket, seulement la persistance.
     * @param template Le template de notification à utiliser.
     * @param context Le contexte de la notification (acteur, destinataires, données).
     * @param notificationType Le type de notification (SYSTEM, PROMOTION, etc.).
     * @param notificationTarget La cible de la notification (INDIVIDUAL, ALL_CLIENTS, ALL_PERSONNEL, etc.).
     * @returns Un tableau des notifications créées.
     */
    async createAndSendMultiple<T>(
        template: NotificationTemplate<T>,
        context: NotificationContext<T>,
        notificationType: NotificationType,
        notificationTarget: NotificationTarget,
    ): Promise<Notification[]> {
        const notificationsToCreate = context.recipients.map(recipient => {
            const individualContext = { ...context, currentRecipient: recipient };

            return {
                title: template.title(individualContext),
                message: template.message(individualContext),
                type: notificationType,
                isRead: false,
                target: notificationTarget,
                icon: template.icon(individualContext),
                iconBgColor: template.iconBgColor(individualContext),
                showChevron: template.showChevron || false,
                data: context.data,
                user: {
                    connect: { id: recipient.id }
                }
            } as Prisma.NotificationCreateInput;
        });

        const createdNotifications = await Promise.all(
            notificationsToCreate.map(async notifData => {
                try {
                    return await this.prisma.notification.create({ data: notifData });
                } catch (error) {
                    console.error(`Erreur lors de la création d'une notification pour le destinataire ${notifData.user?.connect?.id || 'inconnu'}:`, error);
                    return null;
                }
            })
        );

        return createdNotifications.filter(Boolean) as Notification[];
    }
}