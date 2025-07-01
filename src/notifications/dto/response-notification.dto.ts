import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { NotificationType, NotificationTarget } from "@prisma/client";
import {
    IsBoolean,
    IsDate,
    IsEnum,
    IsObject,
    IsOptional,
    IsString,
    IsUUID
} from "class-validator";

export class NotificationResponseDto {
    @ApiProperty({
        description: 'Identifiant unique de la notification',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsUUID()
    id: string;

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
        description: 'Type de notification (ex: SYSTEM, REQUEST_UPDATE)'
    })
    @IsEnum(NotificationType)
    type: NotificationType;

    @ApiProperty({
        description: 'Statut de lecture (true si lue, false sinon)',
        example: false
    })
    @IsBoolean()
    isRead: boolean;

    @ApiProperty({
        description: 'Identifiant de l\'utilisateur destinataire de la notification',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        enum: NotificationTarget,
        description: 'Cible de la notification (ex: INDIVIDUAL, ALL_PERSONNEL)'
    })
    @IsEnum(NotificationTarget)
    target: NotificationTarget;

    @ApiProperty({
        description: 'Nom de l\'icône associée à la notification (ex: "bell-ring" pour FontAwesome)',
        example: 'bell-ring'
    })
    @IsString()
    icon: string;

    @ApiProperty({
        description: 'Couleur de fond de l\'icône (format hexadécimal ou nom de couleur)',
        example: '#4CAF50'
    })
    @IsString()
    iconBgColor: string;

    @ApiProperty({
        description: 'Indique si un chevron (>) doit être affiché (pour indiquer une action ou un détail)',
        example: true
    })
    @IsBoolean()
    showChevron: boolean;

    @ApiPropertyOptional({
        description: 'Données supplémentaires au format JSON, spécifiques à la notification (ex: { requestId: "...", newStatus: "..." })',
        required: false,
        example: { requestId: '12345', newStatus: 'DELIVERED' }
    })
    @IsOptional()
    @IsObject()
    data?: any;

    @ApiProperty({
        description: 'Date et heure de création de la notification',
        example: '2024-01-15T10:30:00.000Z'
    })
    @IsDate()
    createdAt: Date;

    @ApiProperty({
        description: 'Date et heure de la dernière mise à jour de la notification',
        example: '2024-01-15T10:45:00.000Z'
    })
    @IsDate()
    updatedAt: Date;
}