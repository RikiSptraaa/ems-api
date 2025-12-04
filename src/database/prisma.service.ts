// prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  implements OnModuleInit, OnModuleDestroy {
    private adapter: PrismaPg
    private prisma: PrismaClient

    constructor() {
        this.adapter = new PrismaPg({
          connectionString: process.env.DATABASE_URL,
        });

        this.prisma = new PrismaClient({ adapter: this.adapter });
    }


  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  get client() {
    return this.prisma;
  }
}