import { Body, Controller, Get, Post } from '@nestjs/common';
import { Permission } from '../../../permission/common';
import { JobDto } from '../models/job';
import { TaskSchedulerManager } from '../scheduler-manager';
import { SchedulerService } from '../services/scheduler.service';

@Permission('246667E39610', 'Task Scheduler')
@Controller('task-scheduler')
export class SchedulerController {
  constructor(
    private schedulerService: SchedulerService,
    private schedulerManager: TaskSchedulerManager,
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
