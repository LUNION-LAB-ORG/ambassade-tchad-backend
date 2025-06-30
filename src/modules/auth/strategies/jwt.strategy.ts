import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/database/services/prisma.service';
import { Role, UserStatus, UserType } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('PERSONNEL_TOKEN_SECRET') ?? '',
    });
  }
  async validate(payload: { sub: string; type: UserType; role: Role | null }) {
    const { sub: userId, type: userType, role } = payload;

    if (userType !== UserType.PERSONNEL) {
      throw new UnauthorizedException('Type de token invalide pour cette ressource.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId, status: UserStatus.ACTIVE, type: UserType.PERSONNEL, role },
    });
    if (!user) {
      throw new UnauthorizedException('Utilisateur personnel non trouvé ou inactif');
    }
    const { password, ...rest } = user;
    return rest;
  }
}