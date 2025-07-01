import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsBoolean, IsOptional, IsUUID, IsObject } from 'class-validator';
import { NotificationTarget, NotificationType } from '@prisma/client';

export class CreateNotificationDto {
    @ApiProperty({
        description: 'Titre de la notification',
        example: 'Nouvelle demande reçue'
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Message de la notification',
        example: 'Votre demande de visa (Ticket #ABC123) est en cours de traitement.'
    })
    @IsString()
    message: string;

    @ApiProperty({
        enum: NotificationType,
        description: 'Type de notification',
        example: NotificationType.REQUEST_UPDATE
    })
    @IsEnum(NotificationType)
    type: NotificationType;

    @ApiProperty({
        description: 'Identifiant de l\'utilisateur destinataire',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        enum: NotificationTarget,
        description: 'Cible de la notification',
        example: NotificationTarget.INDIVIDUAL
    })
    @IsEnum(NotificationTarget)
    target: NotificationTarget;

    @ApiProperty({
        description: 'Nom de l\'icône de la notification',
        example: 'bell-ring'
    })
    @IsString()
    icon: string;

    @ApiProperty({
        description: 'Couleur de fond de l\'icône (code hexadécimal)',
        example: '#4CAF50'
    })
    @IsString()
    iconBgColor: string;

    @ApiPropertyOptional({
        description: 'Afficher ou non le chevron (flèche)',
        example: true,
        default: false
    })
    @IsBoolean()
    @IsOptional()
    showChevron?: boolean;

    @ApiPropertyOptional({
        description: 'Statut de lecture de la notification',
        example: false,
        default: false
    })
    @IsBoolean()
    @IsOptional()
    isRead?: boolean;

    @ApiPropertyOptional({
        description: 'Données supplémentaires de la notification (JSON)',
        example: { requestId: 'REQ-001', newStatus: 'IN_REVIEW_DOCS' }
    })
    @IsOptional()
    @IsObject()
    data?: Record<string, any>;
}