import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { RequestPasswordResetOtpDto } from '../dto/request-password-reset-otp.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UserType, UserStatus, User } from '@prisma/client';
import { PrismaService } from 'src/database/services/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JsonWebTokenService } from 'src/json-web-token/json-web-token.service';
// import { OtpService } from 'src/otp/otp.service'; // ❌ Désactivé
import { LoginDto } from '../dto/login.dto';
import { LoginSuccessResponse /*, PreLoginResponse */ } from '../interfaces/auth.interface';
// import { TwilioService } from 'src/twilio/services/twilio.service'; // ❌ Désactivé
import { RegisterClientDto } from '../dto/register-demandeur.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jsonWebTokenService: JsonWebTokenService,
    // private readonly otpService: OtpService, // ❌ Désactivé
    // private readonly twilioService: TwilioService, // ❌ Désactivé
  ) { }

  async registerClient(registerClientDto: RegisterClientDto): Promise<Omit<User, 'password'>> {
    const { email, password, firstName, lastName, phoneNumber } = registerClientDto;

    const userExist = await this.prisma.user.findUnique({
      where: { email: email.toLocaleLowerCase() },
    });
    if (userExist) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await this.prisma.user.create({
      data: {
        email: email.toLocaleLowerCase(),
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

  async signIn(loginDto: LoginDto): Promise<LoginSuccessResponse> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Votre compte est inactif. Veuillez contacter l\'administration.');
    }

    if (user.type === UserType.PERSONNEL && user.isPasswordChangeRequired) {
      throw new ForbiddenException(
        'Le changement de mot de passe initial est requis. Veuillez réinitialiser votre mot de passe.'
      );
    }

    // 🔒 OTP désactivé
    // const otpCode = await this.otpService.generate(user.id);
    // const isSent = await this.twilioService.sendOtp({ phoneNumber: user.phoneNumber, otp: otpCode });
    // if (!isSent) {
    //   throw new Error('Envoi de l\'OTP impossible');
    // }

    const accessToken = await this.jsonWebTokenService.generateAccessToken(user.id, user.type, user.role);
    const refreshToken = await this.jsonWebTokenService.generateRefreshToken(user.id, user.type);

    const { password: _, ...restUser } = user;

    return {
      user: restUser,
      accessToken,
      refreshToken,
    };
  }

  // ❌ Fonctionnalité OTP désactivée
  // async completeLogin(completeOtpLoginDto: CompleteOtpLoginDto): Promise<LoginSuccessResponse> {
  //   throw new Error("Cette fonctionnalité est désactivée");
  // }

  // ❌ Fonctionnalité OTP désactivée pour la réinitialisation
  // async requestPasswordResetOtp(requestPasswordResetOtpDto: RequestPasswordResetOtpDto): Promise<PreLoginResponse> {
  //   throw new Error("Réinitialisation par OTP désactivée");
  // }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<LoginSuccessResponse> {
    const { email, newPassword /*, otp*/ } = resetPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé.');
    }
    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Votre compte est inactif. Veuillez contacter l\'administration.');
    }

    // 🔒 OTP désactivé
    // const isOtpValid = await this.otpService.verify(otp);
    // if (!isOtpValid) {
    //   throw new UnauthorizedException('Code OTP invalide ou expiré.');
    // }

    const salt = await bcrypt.genSalt();
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        isPasswordChangeRequired: false,
      },
    });

    const accessToken = await this.jsonWebTokenService.generateAccessToken(user.id, user.type, user.role);
    const refreshToken = await this.jsonWebTokenService.generateRefreshToken(user.id, user.type);

    const { password, ...restUser } = user;

    return { user: restUser, accessToken, refreshToken };
  }

  async refreshTokens(userId: string, userType: UserType): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, status: UserStatus.ACTIVE, type: userType },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
    }

    const newAccessToken = await this.jsonWebTokenService.generateAccessToken(user.id, user.type, user.role);

    return { accessToken: newAccessToken };
  }

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

  async changePassword(
    userId: string,
    userType: UserType,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // 1. Vérifie que l'utilisateur existe, est actif, et du bon type
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        status: UserStatus.ACTIVE,
        type: userType,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
    }

    // 2. Vérifie que le mot de passe actuel est correct
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Mot de passe actuel invalide');
    }

    // 3. Hash le nouveau mot de passe
    const salt = await bcrypt.genSalt();
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // 4. Met à jour le mot de passe dans la base de données
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        isPasswordChangeRequired: false,
      },
    });
  }

  //  Met à jour le profil du demandeur (hors mot de passe, type, statut)
 async updateClientProfile(
  userId: string,
  userType: UserType,
  updateData: Partial<Omit<User, 'password' | 'type' | 'status'>>
): Promise<Omit<User, 'password'>> {
  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
      status: UserStatus.ACTIVE,
      type: userType,
    },
  });

  if (!user) {
    throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
  }

  const updatedUser = await this.prisma.user.update({
    where: { id: user.id },
    data: updateData, // Typescript empêche déjà les champs interdits ici
  });

  const { password, ...rest } = updatedUser;
  return rest;
}



}
