import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { User, UserStatus }
  from '@prisma/client';

@Injectable()
export class JwtDemandeurRefreshAuthGuard extends AuthGuard('jwt-demandeur-refresh') {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(
      context,
    )) as boolean;

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user || user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Accès refusé : compte demandeur inactif ou jeton de rafraîchissement invalide.');
    }
    return result;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentification requise');
    }
    return user;
  }
}