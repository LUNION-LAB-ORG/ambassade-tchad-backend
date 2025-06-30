import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role, UserType } from '@prisma/client'; // Import de notre Enum UserType

@Injectable()
export class JsonWebTokenService {
  // Secrets et expirations pour les tokens du personnel
  private readonly personnelSecret: string;
  private readonly personnelRefreshSecret: string;
  private readonly personnelTokenExpiration: string;
  private readonly personnelRefreshExpiration: string;

  // Secrets et expirations pour les tokens des clients
  private readonly clientSecret: string;
  private readonly clientTokenExpiration: string;
  private readonly clientRefreshSecret: string; // Ajouté pour les refresh tokens clients
  private readonly clientRefreshExpiration: string; // Ajouté pour les refresh tokens clients

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Configuration pour le personnel
    this.personnelSecret = this.configService.get<string>('PERSONNEL_TOKEN_SECRET') ?? '';
    this.personnelRefreshSecret = this.configService.get<string>('PERSONNEL_REFRESH_TOKEN_SECRET') ?? '';
    this.personnelTokenExpiration = this.configService.get<string>('PERSONNEL_TOKEN_EXPIRATION') ?? '';
    this.personnelRefreshExpiration = this.configService.get<string>('PERSONNEL_REFRESH_TOKEN_EXPIRATION') ?? '';

    // Configuration pour les clients
    this.clientSecret = this.configService.get<string>('CLIENT_TOKEN_SECRET') ?? '';
    this.clientTokenExpiration = this.configService.get<string>('CLIENT_TOKEN_EXPIRATION') ?? '';
    this.clientRefreshSecret = this.configService.get<string>('CLIENT_REFRESH_TOKEN_SECRET') ?? ''; // Récupération du secret demandeur refresh
    this.clientRefreshExpiration = this.configService.get<string>('CLIENT_REFRESH_TOKEN_EXPIRATION') ?? ''; // Récupération de l'expiration demandeur refresh

    // Vérification basique que les secrets sont définis
    if (!this.personnelSecret || !this.clientSecret || !this.personnelRefreshSecret || !this.clientRefreshSecret) {
      console.warn('Certains secrets JWT ne sont pas définis. Vérifiez vos variables d\'environnement.');
    }
  }

  /**
   * Génère un jeton d'accès pour un utilisateur du personnel.
   * @param userId L'ID de l'utilisateur du personnel.
   * @returns Le jeton JWT.
   */
  async generateAccessToken(userId: string, userType: UserType, role: Role | null): Promise<string> {
    const payload = { sub: userId, type: userType, role };
    const token = await this.jwtService.signAsync(payload, {
      secret: userType === UserType.PERSONNEL ? this.personnelSecret : this.clientSecret,
      expiresIn: userType === UserType.PERSONNEL ? this.personnelTokenExpiration : this.clientTokenExpiration,
    });
    return token;
  }

  /**
   * Génère un jeton de rafraîchissement pour un utilisateur du personnel.
   * @param userId L'ID de l'utilisateur du personnel.
   * @returns Le jeton de rafraîchissement JWT.
   */
  async generateRefreshToken(userId: string, userType: UserType): Promise<string> {
    const payload = { sub: userId, type: userType };
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: userType === UserType.PERSONNEL ? this.personnelRefreshSecret : this.clientRefreshSecret,
      expiresIn: userType === UserType.PERSONNEL ? this.personnelRefreshExpiration : this.clientRefreshExpiration,
    });
    return refreshToken;
  }

  /**
   * Vérifie et décode un jeton JWT d'accès.
   * @param token Le jeton d'accès à vérifier.
   * @param userType Le type d'utilisateur (DEMANDEUR ou PERSONNEL) pour sélectionner le bon secret.
   * @returns Les données décodées du jeton.
   * @throws UnauthorizedException si le jeton est invalide ou expiré.
   */
  async verifyAccessToken(token: string, userType: UserType): Promise<any> {
    try {
      const secretToUse = userType === UserType.PERSONNEL ? this.personnelSecret : this.clientSecret;
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: secretToUse,
      });

      if (decoded.type !== userType) {
        throw new UnauthorizedException('Type de jeton incompatible');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Jeton d\'accès expiré');
      }
      throw new UnauthorizedException('Jeton d\'accès invalide');
    }
  }

  /**
   * Vérifie et décode un jeton JWT de rafraîchissement.
   * @param token Le jeton de rafraîchissement à vérifier.
   * @param userType Le type d'utilisateur (DEMANDEUR ou PERSONNEL) pour sélectionner le bon secret.
   * @returns Les données décodées du jeton.
   * @throws UnauthorizedException si le jeton est invalide ou expiré.
   */
  async verifyRefreshToken(token: string, userType: UserType): Promise<any> {
    try {
      const secretToUse = userType === UserType.PERSONNEL ? this.personnelRefreshSecret : this.clientRefreshSecret;
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: secretToUse,
      });

      if (decoded.type !== userType) {
        throw new UnauthorizedException('Type de jeton de rafraîchissement incompatible');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Jeton de rafraîchissement expiré');
      }
      throw new UnauthorizedException('Jeton de rafraîchissement invalide');
    }
  }
}