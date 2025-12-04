import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { EmployeesRepository } from '../employees.repository';

@Injectable()
export class EmployeesWorker implements OnModuleInit, OnModuleDestroy {
  private worker: Worker;
  private readonly logger = new Logger(EmployeesWorker.name);

  constructor(private readonly employeeRepos: EmployeesRepository) {}

  onModuleInit() {
    this.worker = new Worker(
      'csv-queue',
      async (job: Job) => {
        const total = job.data.length;

        await this.logger.log(
          `Proccessing job queue ${job.id} with streamed employee data`,
        );

        const parsed = await job.data.map((item) => ({
          ...item,
          age: Number(item.age),
          salary: Number(item.salary),
        }));

        const insertMany = await this.employeeRepos.createMany(parsed);

        if (!insertMany.success) {
          await this.logger.log(`Import Employee job failed ${job.id}`);
        } else {
          await this.logger.log(`Import Employee job success ${job.id}`);
        }

         this.worker.on('failed', (job, err) => {
            this.logger.error(`❌ Job ${job?.id} failed`, err.stack);
        });
      },
      {
        connection: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT),
        },
        lockDuration: 600000,
      },
    );
  }

  onModuleDestroy() {
    return this.worker?.close();
  }
}
