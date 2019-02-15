import { Global, Module } from '@nestjs/common';
import { PermissionControllerCollectService } from '../../app.service';
import { PermissionModuleBase } from '../../core/permission';
import { SchedulerController } from './controllers/scheduler.controller';
import { JobRepository } from './job-repository';
import { SchedulerManager } from './scheduler-manager';
import { SchedulerService } from './services/scheduler.service';

@Global()
@Module({
  providers: [JobRepository, SchedulerManager, SchedulerService],
  controllers: [SchedulerController],
  exports: [JobRepository],
})
export class SchedulerModule extends PermissionModuleBase {
  constructor(service: PermissionControllerCollectService) {
    super(service, [SchedulerController]);
  }
}
