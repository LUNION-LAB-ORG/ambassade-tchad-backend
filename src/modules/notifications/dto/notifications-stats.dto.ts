import { ApiProperty } from "@nestjs/swagger";

export class NotificationStatsDto {
    @ApiProperty({
        description: 'Nombre total de notifications',
        example: 50
    })
    total: number;

    @ApiProperty({
        description: 'Nombre de notifications non lues',
        example: 12
    })
    unread: number;

    @ApiProperty({
        description: 'Nombre de notifications lues',
        example: 38
    })
    read: number;

    @ApiProperty({
        description: 'Répartition par type de notification',
        example: {
            SYSTEM: 25,
            PROMOTION: 15,
            REQUEST_UPDATE: 10
        }
    })
    byType: Record<string, number>;
}