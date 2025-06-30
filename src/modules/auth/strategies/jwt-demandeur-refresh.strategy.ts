import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/database/services/prisma.service';
import { UserStatus, UserType } from '@prisma/client';

@Injectable()
export class JwtClientRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-demandeur-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('CLIENT_REFRESH_TOKEN_SECRET') ?? '',
    });
  }
  async validate(payload: { sub: string; type: UserType }) {
    const { sub: userId, type: userType } = payload;

    if (userType !== UserType.DEMANDEUR) {
      throw new UnauthorizedException('Type de jeton de rafraîchissement invalide pour cette ressource.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId, status: UserStatus.ACTIVE, type: UserType.DEMANDEUR },
    });
    if (!user) {
      throw new UnauthorizedException('Utilisateur demandeur non trouvé ou inactif');
    }
    const { password, ...rest } = user;
    return rest;
  }
}