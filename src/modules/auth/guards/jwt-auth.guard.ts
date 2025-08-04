import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { User, UserStatus } from '@prisma/client';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(
      context,
    )) as boolean;

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    // Vérifier l'état du compte
    if (!user || user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Accès refusé : compte inactif ou non authentifié.');
    }

    // Vérifier si le personnel doit changer son mot de passe initial
    // if (user.isPasswordChangeRequired) {
    //   throw new UnauthorizedException('Changement de mot de passe requis.');
    // }
    return result;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentification requise');
    }
    return user;
  }
}