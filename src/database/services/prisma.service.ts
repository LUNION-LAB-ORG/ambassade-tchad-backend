// import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
// import { PrismaClient } from "@prisma/client";

// @Injectable()
// export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
//   news: any;
//     newsImage: any;

//   constructor() {
//     super({
//       log: process.env.NODE_ENV === 'dev'
//         ? ['query', 'info', 'warn', 'error']
//         : ['error'],
//     });
//   }

//   async onModuleInit() {
//     await this.$connect();
//   }
//   async onModuleDestroy() {
//     await this.$disconnect();
//   }

//   async cleanDatabase() {
//     if (process.env.NODE_ENV === 'production') {
//       return;
//     }

//     // Pour les tests: vider la base
//     const models = Reflect.ownKeys(this).filter(
//       (key) => key[0] !== '_' && key[0] !== '$' && key !== 'constructor',
//     );

//     return Promise.all(
//       models.map((modelKey) => this[modelKey as string].deleteMany()),
//     );
//   }
// }

import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'dev'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Nettoie toute la base de données.
   * À utiliser uniquement dans un environnement de développement/test.
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      console.warn('cleanDatabase ne doit jamais être utilisé en production !');
      return;
    }

    const modelKeys = Object.keys(this).filter((key) => {
      const value = (this as any)[key];
      return typeof value?.deleteMany === 'function';
    });

    await Promise.all(
      modelKeys.map((modelKey) => {
        return (this as any)[modelKey].deleteMany();
      })
    );
  }
}
