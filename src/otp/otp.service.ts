import { Injectable } from "@nestjs/common";
import { hotp } from "otplib";
import { PrismaService } from "src/database/services/prisma.service";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
  private readonly secret: string;

  constructor(private readonly configService: ConfigService, private readonly prisma: PrismaService) {

    this.secret = this.configService.get<string>("OTP_SECRET") ?? "";
    // hotp.options = { digits: 4 };
    hotp.options = {
      digits: this.configService.get<number>('CODE_OTP_LENGTH') ?? 4
    }
  }

  async generate(userId: string) {

    // @Value("${code.opt.length}")
    // private Integer CODE_LENGTH;
    
    // @Value("${twilio.whatsapp.numero}")
    // private String TWILIO_WHATSAPP_NUMBER;

    // private static final String TO_PHONE_NUMBER = "2250768741393";

    // Get OTP code length and Twilio WhatsApp number from config
    const codeLength = this.configService.get<number>('CODE_OTP_LENGTH') ?? 4;
    // const twilioWhatsappNumber = this.configService.get<string>('TWILIO_WHATSAPP_NUMERO') ?? '';
    // const toPhoneNumber = '2250768741393'; // Example, not used here

    // Set OTP code length dynamically
    hotp.options = { digits: codeLength };



    // Récupérer le OTP s'il n'a pas encore expiré
    const otpToken = await this.prisma.otpToken.findFirst({
      where: {
        userId,
        expire: {
          gte: new Date(),
        },
      },
    });

    if (otpToken) {
      return otpToken.code;
    }

    // Si Non trouvé, on génère un nouveau OTP
    let counter = 1;
    const counterOtp = await this.prisma.counterOtp.findFirst();


    // Création ou mise à jour du counter
    if (counterOtp) {
      counter = counterOtp.counter + 1;

      await this.prisma.counterOtp.update({
        where: { id: counterOtp.id },
        data: { counter },
      });
    } else {
      await this.prisma.counterOtp.create({ data: { counter } });
    }


    // GENERATE OTP TOKEN
    const token = hotp.generate(this.secret, counter);


    // CREATE OTP TOKEN
    await this.prisma.otpToken.create({
      data: {
        code: token,
        userId,
        counter,
        expire: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    return token;
  }

  async verify(token: string) {
    const counter = await this.prisma.counterOtp.findFirst();
    return hotp.verify({ token, counter: counter?.counter ?? 1, secret: this.secret });
  }
}


// import { Injectable } from '@nestjs/common';
// import { hotp } from 'otplib';
// import { ConfigService } from '@nestjs/config';
// import { PrismaService } from 'src/database/services/prisma.service';
// import { WhatsAppService } from 'src/generic-service/generic-service.service';

// @Injectable()
// export class OtpService {
//   constructor(
//     private configService: ConfigService,
//     private prisma: PrismaService,
//     private whatsAppService: WhatsAppService
//   ) {
//     hotp.options = { 
//       digits: this.configService.get<number>('CODE_OTP_LENGTH') ?? 4 
//     };
//   }

//   async generateAndSend(userId: string, phoneNumber: string) {
//     // Vérifier si un OTP valide existe déjà
//     const existingOtp = await this.prisma.otpToken.findFirst({
//       where: {
//         userId,
//         expire: { gte: new Date() },
//       },
//     });

//     if (existingOtp) {
//       await this.whatsAppService.sendOtp(phoneNumber, existingOtp.code);
//       return { code: existingOtp.code, isNew: false };
//     }

//     // Générer un nouveau OTP
//     const counter = await this.getNextCounter();
//     const code = hotp.generate(this.configService.get<string>('OTP_SECRET') ?? '', counter);

//     // Enregistrer en base
//     await this.prisma.otpToken.create({
//       data: {
//         code,
//         userId,
//         counter,
//         expire: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
//       },
//     });

//     // Envoyer via WhatsApp
//     const isSent = await this.whatsAppService.sendOtp(phoneNumber, code);

//     if (!isSent) {
//       throw new Error('Failed to send OTP via WhatsApp');
//     }

//     return { code, isNew: true };
//   }

//   async verify(userId: string, token: string) {
//     const counter = await this.prisma.counterOtp.findFirst();
//     const isValid = hotp.verify({
//       token,
//       counter: counter?.counter ?? 1,
//       secret: this.configService.get<string>('OTP_SECRET') ?? '',
//     });

//     if (!isValid) return false;

//     // Supprimer le token après vérification réussie
//     await this.prisma.otpToken.deleteMany({
//       where: { userId, code: token },
//     });

//     return true;
//   }

//   private async getNextCounter(): Promise<number> {
//     const counter = await this.prisma.counterOtp.findFirst();
//     const newCounter = (counter?.counter ?? 0) + 1;

//     if (counter) {
//       await this.prisma.counterOtp.update({
//         where: { id: counter.id },
//         data: { counter: newCounter },
//       });
//     } else {
//       await this.prisma.counterOtp.create({ data: { counter: newCounter } });
//     }

//     return newCounter;
//   }
// }

