import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';

import { ResetPasswordDto } from '../dto/reset-password.dto';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtDemandeurRefreshAuthGuard } from '../guards/jwt-demandeur-refresh-auth.guard';
import { JwtDemandeurAuthGuard } from '../guards/jwt-demandeur-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginSuccessResponse /*, PreLoginResponse */ } from '../interfaces/auth.interface';
import { Request } from 'express';
import { User } from '@prisma/client';
import { RegisterClientDto } from '../dto/register-demandeur.dto';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * Endpoint de connexion pour les utilisateurs (personnel et clients).
   * @param loginDto Données de connexion (email, mot de passe).
   * @returns Un objet contenant les jetons d'accès et l'utilisateur.
   */
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion: Authentifie un utilisateur (sans OTP)' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Connexion réussie',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Identifiants invalides ou compte inactif',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Changement de mot de passe initial requis (pour le personnel)',
  })
  async signIn(@Body() loginDto: LoginDto): Promise<LoginSuccessResponse> {
    return this.authService.signIn(loginDto);
  }

  // ❌ OTP désactivé — Endpoint supprimé
  // @Post('complete-login')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Étape 2 de la connexion: Finalise la connexion avec un code OTP' })
  // @ApiBody({ type: CompleteOtpLoginDto })
  // @ApiResponse({ status: HttpStatus.OK, description: 'Connexion OTP réussie' })
  // @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'OTP invalide ou expiré' })
  // async completeLogin(@Body() completeOtpLoginDto: CompleteOtpLoginDto): Promise<LoginSuccessResponse> {
  //   return this.authService.completeLogin(completeOtpLoginDto);
  // }

  @Post('register-client')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inscription d\'un nouveau demandeur' })
  @ApiBody({ type: RegisterClientDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Demandeur inscrit avec succès',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Un utilisateur avec cet email existe déjà',
  })
  registerClient(@Body() registerClientDto: RegisterClientDto): Promise<Omit<User, 'password'>> {
    return this.authService.registerClient(registerClientDto);
  }

  // ❌ OTP désactivé — Endpoint supprimé
  // @Post('request-password-reset-otp')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({
  //   summary: 'Demande un code OTP pour la réinitialisation du mot de passe',
  // })
  // @ApiBody({ type: RequestPasswordResetOtpDto })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Un code OTP a été envoyé à votre numéro de téléphone.',
  // })
  // @ApiResponse({
  //   status: HttpStatus.UNAUTHORIZED,
  //   description: 'Utilisateur non trouvé',
  // })
  // async requestPasswordResetOtp(
  //   @Body() requestPasswordResetOtpDto: RequestPasswordResetOtpDto,
  // ): Promise<PreLoginResponse> {
  //   return this.authService.requestPasswordResetOtp(requestPasswordResetOtpDto);
  // }

  /**
   * Endpoint pour réinitialiser le mot de passe sans OTP.
   * @param resetPasswordDto Email et nouveau mot de passe.
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Réinitialise le mot de passe sans code OTP',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mot de passe réinitialisé avec succès',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non trouvé',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<LoginSuccessResponse> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Rafraîchit le jeton d\'accès pour un utilisateur du personnel',
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

  @UseGuards(JwtDemandeurRefreshAuthGuard)
  @Get('demandeur/refresh')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Rafraîchit le jeton d\'accès pour un utilisateur demandeur',
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
  async refreshClientTokens(@Req() req: Request): Promise<{ accessToken: string }> {
    const user = req.user as User;
    return this.authService.refreshTokens(user.id, user.type);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtient le profil de l\'utilisateur personnel authentifié',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profil utilisateur personnel',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Accès non autorisé',
  })
  getPersonnelProfile(@Req() req: Request) {
    const user = req.user as User;
    return this.authService.getProfile(user.id, user.type);
  }

  @UseGuards(JwtDemandeurAuthGuard)
  @Get('demandeur/profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtient le profil de l\'utilisateur demandeur authentifié',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profil utilisateur demandeur',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Accès non autorisé',
  })
  getClientProfile(@Req() req: Request) {
    const user = req.user as User;
    return this.authService.getProfile(user.id, user.type);
  }

  // Endpoint pour modifier le profile utilisateur demandeur

  @UseGuards(JwtDemandeurAuthGuard)
  @Put('demandeur/profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Met à jour le profil de l\'utilisateur demandeur' })
  @ApiBody({ type: RegisterClientDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profil mis à jour avec succès',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non trouvé ou inactif',
  })
  async updateClientProfile(
    @Req() req: Request,
    @Body() updateClientDto: RegisterClientDto
  ): Promise<Omit<User, 'password'>> {
    const user = req.user as User;
    return this.authService.updateClientProfile(user.id, user.type, updateClientDto);
  }

  // Endpoint pour changer le mot de passe d'un utilisateur demandeur
  @UseGuards(JwtDemandeurAuthGuard)
  @Put('demandeur/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change le mot de passe de l\'utilisateur' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mot de passe changé avec succès',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Mot de passe actuel invalide ou utilisateur non trouvé',
  })
  async changePassword(
    @Req() req: Request,
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<{ message: string }> {
    const user = req.user as User;

    if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    await this.authService.changePassword(
      user.id,
      user.type,
      resetPasswordDto.currentPassword,
      resetPasswordDto.newPassword
    );

    return { message: 'Mot de passe changé avec succès' };
  }



}
