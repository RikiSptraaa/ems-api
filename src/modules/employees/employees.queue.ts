import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class EmployeesQueue {
  private queue: Queue;

  constructor() {
    this.queue = new Queue('csv-queue', {
      connection: { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT) },
    });
  }

  async addImportJob(data: any) {
    await this.queue.add('csv-import', data);
    console.log('📩 CSV Import Employee added to queue');
  }
}