import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { PrismaModule } from 'src/database/prisma.module';
import { HelpersModule } from 'src/helpers/helpers.module';
import { HelperService } from 'src/helpers/helpers.service';
import { PrismaService } from 'src/database/prisma.service';
import { EmployeesRepository } from './employees.repository';
import { EmployeesQueue } from './employees.queue';
import { EmployeesWorker } from './worker/employees.worker';

@Module({
  controllers: [EmployeesController],
  imports: [PrismaModule, HelpersModule],
  providers: [EmployeesService, EmployeesRepository, HelperService, PrismaService, EmployeesQueue, EmployeesWorker],
})
export class EmployeesModule {}
