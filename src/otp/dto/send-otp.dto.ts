// send-otp.dto.ts
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendOtpDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?:\+225|225)?[0-9]{10}$/, {
    message: 'Le numéro doit être un numéro ivoirien valide'
  })
  phoneNumber: string;
}

