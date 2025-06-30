import { UserType, Role } from '@prisma/client';

export interface ConnectedUser {
    id: string;
    type: UserType;
    role?: Role | null;
    socketId: string;
}