import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { CompleteOtpLoginDto } from '../dto/complete-otp-login.dto';
import { RequestPasswordResetOtpDto } from '../dto/request-password-reset-otp.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtClientRefreshAuthGuard } from '../guards/jwt-demandeur-refresh-auth.guard';
import { JwtClientAuthGuard } from '../guards/jwt-demandeur-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginSuccessResponse, PreLoginResponse } from '../interfaces/auth.interface';
import { Request } from 'express';
import { User } from '@prisma/client';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * Endpoint de connexion initial pour les utilisateurs (personnel et clients).
   * Retourne un message indiquant l'envoi de l'OTP pour la seconde étape.
   * @param loginDto Données de connexion (email, mot de passe).
   * @returns Un objet indiquant que l'OTP a été envoyé.
   */
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Étape 1 de la connexion: Authentifie un utilisateur et envoie un OTP' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OTP envoyé avec succès',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Identifiants invalides ou compte inactif',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Changement de mot de passe initial requis (pour le personnel)',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Aucun numéro de téléphone associé pour l\'OTP',
  })
  async signIn(@Body() loginDto: LoginDto): Promise<PreLoginResponse> {
    return this.authService.signIn(loginDto);
  }

  /**
   * Endpoint pour la connexion finale par OTP.
   * @param completeOtpLoginDto Données pour compléter la connexion OTP (email, OTP).
   * @returns Jeton d'accès, jeton de rafraîchissement et informations utilisateur.
   */
  @Post('complete-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Étape 2 de la connexion: Finalise la connexion avec un code OTP' })
  @ApiBody({ type: CompleteOtpLoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Connexion OTP réussie',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Code OTP invalide/expiré ou utilisateur non trouvé/inactif',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Méthode de connexion réservée aux clients', // Cette description est spécifique si `AuthService` le gère
  })
  async completeLogin(@Body() completeOtpLoginDto: CompleteOtpLoginDto): Promise<LoginSuccessResponse> {
    return this.authService.completeLogin(completeOtpLoginDto);
  }

  /**
   * Endpoint pour demander un OTP pour la réinitialisation du mot de passe.
   * @param requestPasswordResetOtpDto Email de l'utilisateur.
   * @returns Message de succès.
   */
  @Post('request-password-reset-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Demande un code OTP pour la réinitialisation du mot de passe',
  })
  @ApiBody({ type: RequestPasswordResetOtpDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Un code OTP a été envoyé à votre numéro de téléphone. Il est valide 5 minutes.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non trouvé',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Aucun numéro de téléphone associé à ce compte pour l\'envoi de l\'OTP.',
  })
  async requestPasswordResetOtp(
    @Body() requestPasswordResetOtpDto: RequestPasswordResetOtpDto,
  ): Promise<PreLoginResponse> {
    return this.authService.requestPasswordResetOtp(requestPasswordResetOtpDto);
  }

  /**
   * Endpoint pour réinitialiser le mot de passe en utilisant un OTP.
   * @param resetPasswordDto Email, nouveau mot de passe et OTP.
   * @returns Un objet contenant l'utilisateur, le jeton d'accès et le jeton de rafraîchissement.
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Réinitialise le mot de passe d\'un utilisateur avec un code OTP',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mot de passe réinitialisé avec succès',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Code OTP invalide/expiré ou utilisateur non trouvé',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<LoginSuccessResponse> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * Endpoint pour rafraîchir les jetons d'un utilisateur personnel.
   * Utilise le JwtRefreshAuthGuard pour valider le jeton de rafraîchissement.
   * @param req L'objet de requête contenant l'utilisateur authentifié (via le jeton de rafraîchissement).
   * @returns Nouveau jeton d'accès.
   */
  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Rafraîchit le jeton d\'accès pour un utilisateur du personnel',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Jeton d\'accès rafraîchi avec succès',
    schema: {
      properties: {
        accessToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Jeton de rafraîchissement invalide ou expiré',
  })
  async refreshPersonnelTokens(@Req() req: Request): Promise<{ accessToken: string }> {
    const user = req.user as User;
    return this.authService.refreshTokens(user.id, user.type);
  }

  /**
   * Endpoint pour rafraîchir les jetons d'un utilisateur demandeur.
   * Utilise le JwtClientRefreshAuthGuard pour valider le jeton de rafraîchissement du demandeur.
   * @param req L'objet de requête contenant l'utilisateur demandeur authentifié.
   * @returns Nouveau jeton d'accès.
   */
  @UseGuards(JwtClientRefreshAuthGuard)
  @Get('demandeur/refresh')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Rafraîchit le jeton d\'accès pour un utilisateur demandeur',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Jeton d\'accès rafraîchi avec succès',
    schema: {
      properties: {
        accessToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Jeton de rafraîchissement demandeur invalide ou expiré',
  })
  async refreshClientTokens(@Req() req: Request): Promise<{ accessToken: string }> {
    const user = req.user as User;
    return this.authService.refreshTokens(user.id, user.type);
  }

  /**
   * Exemple d'endpoint protégé pour le personnel.
   * @param req L'objet de requête contenant l'utilisateur authentifié.
   * @returns Les informations du profil de l'utilisateur (sans le mot de passe).
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtient le profil de l\'utilisateur personnel authentifié',
    description:
      'Cet endpoint est protégé par un JWT et retourne les informations du personnel connecté.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profil utilisateur personnel',
    schema: { type: 'object' },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Accès non autorisé',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Changement de mot de passe requis ou compte inactif',
  })
  getPersonnelProfile(@Req() req: Request) {
    const user = req.user as User;
    return this.authService.getProfile(user.id, user.type);
  }

  /**
   * Exemple d'endpoint protégé pour les clients.
   * @param req L'objet de requête contenant l'utilisateur demandeur authentifié.
   * @returns Les informations du profil du demandeur (sans le mot de passe).
   */
  @UseGuards(JwtClientAuthGuard)
  @Get('demandeur/profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtient le profil de l\'utilisateur demandeur authentifié',
    description:
      'Cet endpoint est protégé par un JWT demandeur et retourne les informations du demandeur connecté.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profil utilisateur demandeur',
    schema: { type: 'object' },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Accès non autorisé',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Compte inactif',
  })
  getClientProfile(@Req() req: Request) {
    const user = req.user as User;
    return this.authService.getProfile(user.id, user.type);
  }
}
