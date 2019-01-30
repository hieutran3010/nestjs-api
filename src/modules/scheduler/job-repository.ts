import { Injectable } from '@nestjs/common';
import { LoggingService } from '../../core/modules/logging/logging.service';
import { JobBase } from './jobs/base/job-base';

@Injectable()
export class JobRepository {
  private jobs: JobBase[] = [];

  constructor(private readonly loggerService: LoggingService) {}

  add(job: JobBase) {
    this.jobs.push(job);
    this.loggerService.logger.debug(
      `[JobRepository] Add job [${job.name}] to scheduler repository. Total jobs [${this.jobs.length}]`,
    );
  }

  getAllJobs(): JobBase[] {
    this.loggerService.logger.debug(`[JobRepository] Total jobs [${this.jobs.length}]`);
    return this.jobs;
  }
}
