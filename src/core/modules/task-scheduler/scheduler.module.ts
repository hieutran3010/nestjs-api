import { Global, Module } from '@nestjs/common';
import { SchedulerController } from './controllers/scheduler.controller';
import { JobRepository } from './job-repository';
import { TaskSchedulerManager } from './scheduler-manager';
import { SchedulerService } from './services/scheduler.service';

@Global()
@Module({
  providers: [JobRepository, TaskSchedulerManager, SchedulerService],
  controllers: [SchedulerController],
  exports: [JobRepository],
})
export class TaskSchedulerModule {
}
