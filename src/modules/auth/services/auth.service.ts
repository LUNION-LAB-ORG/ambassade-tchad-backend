import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { CompleteOtpLoginDto } from '../dto/complete-otp-login.dto';
import { RequestPasswordResetOtpDto } from '../dto/request-password-reset-otp.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UserType, UserStatus, User } from '@prisma/client'; // Ajout de Role
import { PrismaService } from 'src/database/services/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JsonWebTokenService } from 'src/json-web-token/json-web-token.service';
import { OtpService } from 'src/otp/otp.service';
import { LoginDto } from '../dto/login.dto';
import { LoginSuccessResponse, PreLoginResponse } from '../interfaces/auth.interface';
import { TwilioService } from 'src/twilio/services/twilio.service';
import { RegisterClientDto } from '../dto/register-demandeur.dto';

//- DEMANDEUR : 
// 1. INSCRIPTION (nom, prenom, email, mot de passe, numero de telephone) 
// 2. CONNEXION (email, mot de passe) -> RECEVOIR OTP
// 3. VERIFIER OTP
// 4. GENERER JWT (ACCESS TOKEN ET REFRESH TOKEN) ET CONNECTÉ

//- PERSONNEL, ADMIN (CRÉÉ PAR LE SEED) : 
// 1. ADMIN CREER LES COMPTES DU PERSONNEL (role, nom, prenom, email, numero de telephone, mot de passe généré) 
// 2. ADMIN ENVOIE LES ACCES AUX MEMBRES (email, mot de passe) 
// 3. MEMBRE CONNEXION (email, mot de passe) -> MODIFIER LA PREMIERE FOIS SON MOT DE PASSE
// 4. MEMBRE GENERER JWT (ACCESS TOKEN ET REFRESH TOKEN) ET CONNECTÉ

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jsonWebTokenService: JsonWebTokenService,
    private readonly otpService: OtpService,
    private readonly twilioService: TwilioService,
  ) { }

  /**
    * Gère l'inscription d'un nouveau demandeur.
    * Génère un mot de passe initial, crée l'utilisateur de type DEMANDEUR, et envoie un OTP pour validation.
    * @param registerClientDto DTO contenant les informations du nouveau demandeur.
    * @returns Un objet indiquant que l'OTP a été envoyé.
    * @throws ConflictException si un utilisateur avec cet email existe déjà.
    */
  async registerClient(registerClientDto: RegisterClientDto): Promise<Omit<User, 'password'>> {
    const { email, password, firstName, lastName, phoneNumber } = registerClientDto;

    // 1. Vérifier si l'utilisateur existe déjà
    const userExist = await this.prisma.user.findUnique({
      where: { email: email.toLocaleLowerCase()},
    });
    if (userExist) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà.');
    }

    // 2. Hacher le mot de passe fourni par le demandeur
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Créer l'utilisateur demandeur
    const newUser = await this.prisma.user.create({
      data: {
        email: email.toLocaleLowerCase(), // Utilisation de l'email en minuscules
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        type: UserType.DEMANDEUR,
        status: UserStatus.ACTIVE,
        isPasswordChangeRequired: false,
        role: null,
      },
    });

    const { password: passwordUser, ...restUser } = newUser;

    return restUser;
  }

  /**
   * Gère la connexion des utilisateurs (PERSONNEL et DEMANDEUR).
   * Authentifie l'utilisateur, vérifie son statut et génère un OTP
   * @param loginDto DTO contenant l'email et le mot de passe de l'utilisateur.
   * @returns Un objet contenant un message, un indicateur d'envoi OTP et l'email.
   * @throws UnauthorizedException si l'authentification échoue.
   */
  async signIn(loginDto: LoginDto): Promise<PreLoginResponse> {
    const { email, password } = loginDto;

    // 1. Trouver l'utilisateur par email
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (!user.phoneNumber) {
      throw new BadRequestException('Aucun numéro de téléphone n\'est associé à ce compte pour l\'envoi de l\'OTP.');
    }

    // 2. Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // 3. Vérifier le statut de l'utilisateur
    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Votre compte est inactif. Veuillez contacter l\'administration.');
    }

    // 4. Pour les utilisateurs de type PERSONNEL, vérifier si le changement de mot de passe est requis
    if (user.type === UserType.PERSONNEL && user.isPasswordChangeRequired) {
      throw new ForbiddenException('Le changement de mot de passe initial est requis. Veuillez réinitialiser votre mot de passe.');
    }

    //5. Générer l'OTP
    const otpCode = await this.otpService.generate(user.id);

    // //6. Envoyer l'OTP
    // const isSent = await this.twilioService.sendOtp({ phoneNumber: user.phoneNumber, otp: otpCode });
    // if (!isSent) {
    //   throw new Error('Envoi de l\'OTP impossible');
    // }
    console.log(otpCode)

    return {
      message: 'Un code OTP a été envoyé à votre numéro de téléphone',
      otpSent: true,
      email: user.email
    };
  }

  /**
   * Gère le processus de connexion où un utilisateur complète la connexion avec un OTP.
   * @param completeOtpLoginDto DTO contenant l'email de l'utilisateur et l'OTP.
   * @returns Un objet contenant l'utilisateur, le jeton d'accès et le jeton de rafraîchissement.
   * @throws UnauthorizedException si l'OTP est invalide ou expiré, ou si l'utilisateur est inactif.
   */
  async completeLogin(completeOtpLoginDto: CompleteOtpLoginDto): Promise<LoginSuccessResponse> {
    const { email, otp } = completeOtpLoginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé.');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Votre compte est inactif. Veuillez contacter l\'administration.');
    }

    // Vérifier l'OTP
    const isOtpValid = await this.otpService.verify(otp);
    if (!isOtpValid) {
      throw new UnauthorizedException('Code OTP invalide ou expiré.');
    }

    // Générer les tokens en passant le rôle de l'utilisateur
    const accessToken = await this.jsonWebTokenService.generateAccessToken(user.id, user.type, user.role);
    const refreshToken = await this.jsonWebTokenService.generateRefreshToken(user.id, user.type);

    const { password, ...restUser } = user;

    return { user: restUser, accessToken, refreshToken };
  }


  /**
   * Lance le processus de réinitialisation du mot de passe en envoyant un OTP au numéro de téléphone de l'utilisateur
   * associé à l'email fourni.
   * @param requestPasswordResetOtpDto DTO contenant l'email de l'utilisateur.
   * @returns Un objet contenant un message, un indicateur d'envoi OTP et l'email.
   * @throws UnauthorizedException si l'utilisateur n'est pas trouvé.
   * @throws BadRequestException si l'utilisateur n'a pas de numéro de téléphone.
   */
  async requestPasswordResetOtp(requestPasswordResetOtpDto: RequestPasswordResetOtpDto): Promise<PreLoginResponse> {
    const { email } = requestPasswordResetOtpDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé.');
    }

    if (!user.phoneNumber) {
      throw new BadRequestException('Aucun numéro de téléphone n\'est associé à ce compte pour l\'envoi de l\'OTP.');
    }

    // Générer l'OTP
    const otpCode = await this.otpService.generate(user.id);

    // Envoyer l'OTP
    const isSent = await this.twilioService.sendOtp({ phoneNumber: user.phoneNumber, otp: otpCode });
    if (!isSent) {
      throw new Error('Envoi de l\'OTP impossible');
    }
    return { message: 'Un code OTP a été envoyé à votre numéro de téléphone. Il est valide 5 minutes.', otpSent: true, email: user.email };
  }

  /**
   * Complète le processus de réinitialisation du mot de passe en vérifiant l'OTP et en mettant à jour le mot de passe de l'utilisateur.
   * @param resetPasswordDto DTO contenant l'email, le nouveau mot de passe et l'OTP.
   * @returns Un objet contenant l'utilisateur, le jeton d'accès et le jeton de rafraîchissement.
   * @throws UnauthorizedException si l'OTP est invalide, ou si l'utilisateur n'est pas trouvé.
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<LoginSuccessResponse> {
    const { email, newPassword, otp } = resetPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé.');
    }
    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Votre compte est inactif. Veuillez contacter l\'administration.');
    }

    // Vérifier l'OTP
    const isOtpValid = await this.otpService.verify(otp);
    if (!isOtpValid) {
      throw new UnauthorizedException('Code OTP invalide ou expiré.');
    }

    // Hacher le nouveau mot de passe
    const salt = await bcrypt.genSalt();
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe de l'utilisateur et réinitialiser l'exigence de changement de mot de passe
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        isPasswordChangeRequired: false,
      },
    });

    // Générer les tokens en passant le rôle de l'utilisateur
    const accessToken = await this.jsonWebTokenService.generateAccessToken(user.id, user.type, user.role);
    const refreshToken = await this.jsonWebTokenService.generateRefreshToken(user.id, user.type);

    const { password, ...restUser } = user;

    return { user: restUser, accessToken, refreshToken };
  }

  /**
   * Rafraîchit le jeton d'accès pour un utilisateur donné.
   * Cette méthode est appelée après qu'un jeton de rafraîchissement a été validé avec succès par une stratégie JWT de rafraîchissement.
   * @param userId L'ID de l'utilisateur.
   * @param userType Le type de l'utilisateur (DEMANDEUR ou PERSONNEL).
   * @returns Un objet contenant le nouveau jeton d'accès.
   */
  async refreshTokens(userId: string, userType: UserType): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, status: UserStatus.ACTIVE, type: userType },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
    }

    // Générer un nouveau jeton d'accès en passant le rôle de l'utilisateur
    const newAccessToken = await this.jsonWebTokenService.generateAccessToken(user.id, user.type, user.role);

    return { accessToken: newAccessToken };
  }

  /**
   * Obtient le profil d'un utilisateur personnel.
   * @param userId L'ID de l'utilisateur personnel.
   * @param userType Le type de l'utilisateur (PERSONNEL).
   * @returns L'utilisateur personnel.
   * @throws UnauthorizedException si l'utilisateur n'est pas trouvé ou inactif.
   */
  async getProfile(userId: string, userType: UserType): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, status: UserStatus.ACTIVE, type: userType },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
    }
    const { password, ...restUser } = user;

    return restUser;
  }
}
