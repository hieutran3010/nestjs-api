import { Injectable } from '@nestjs/common';
import { LoggingService } from '../logging';
import { JobBase } from './base-jobs';

@Injectable()
export class JobRepository {
  logger: any;
  private jobs: JobBase[] = [];

  constructor(loggerService: LoggingService) {
    this.logger = loggerService.createLogger('JobRepository');
  }

  add(job: JobBase) {
    this.jobs.push(job);
    this.logger.debug(
      `[JobRepository] Add job [${job.name}] to scheduler repository. Total jobs [${this.jobs.length}]`,
    );
  }

  getAllJobs(): JobBase[] {
    this.logger.debug(`[JobRepository] Total jobs [${this.jobs.length}]`);
    return this.jobs;
  }
}
