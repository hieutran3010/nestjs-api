import { Body, Controller, Get, Post } from '@nestjs/common';
import { Permission } from '../../../core/permission/common';
import { JobDto } from '../../../documents/job';
import { SchedulerManager } from '../scheduler-manager';
import { SchedulerService } from '../services/scheduler.service';

@Permission('246667E39610', 'Task Scheduler')
@Controller('task-scheduler')
export class SchedulerController {
  constructor(
    private schedulerService: SchedulerService,
    private schedulerManager: SchedulerManager,
  ) {}

  @Get('getall')
  async getAllJob() {
    return await this.schedulerService.getAll();
  }

  @Post('trigger')
  async trigger(@Body() jobs: JobDto[]) {
    this.schedulerManager.enable(jobs);
  }
}
