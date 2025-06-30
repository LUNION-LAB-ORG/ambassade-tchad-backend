import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const USER_ROLES_KEY = 'user-roles';
export const UserRoles = (...roles: Role[]) => SetMetadata(USER_ROLES_KEY, roles);
