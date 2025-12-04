import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { PrismaModule } from 'src/database/prisma.module';
import { HelpersModule } from 'src/helpers/helpers.module';
import { AuthenticationRepository } from './authentication.repository';
import { PrismaService } from 'src/database/prisma.service';
import { HelperService } from 'src/helpers/helpers.service';

@Module({
  controllers: [AuthenticationController],
  imports: [
    PrismaModule,
    HelpersModule,
  ],
  providers: [AuthenticationService, AuthenticationRepository, PrismaService, HelperService],
  exports: [AuthenticationRepository]
})
export class AuthenticationModule {}
