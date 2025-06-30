import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JsonWebTokenModule } from 'src/json-web-token/json-web-token.module';
import { OtpModule } from '../otp/otp.module';
import { JwtClientStrategy } from './strategies/jwt-demandeur.strategy';
import { JwtClientRefreshStrategy } from './strategies/jwt-demandeur-refresh.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [JsonWebTokenModule, OtpModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, JwtClientStrategy, JwtClientRefreshStrategy],
})
export class AuthModule { }
