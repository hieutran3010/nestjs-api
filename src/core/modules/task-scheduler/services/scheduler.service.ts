import { Injectable } from '@nestjs/common';
import { RepositoryBase, RepositoryFactory } from '../../database/factory';
import { ServiceBase } from '../../database/service';
import { Job, JobSchema } from '../models/job';
import {
  JobInfomationSchema,
  JobInformation,
  JobInformationDto,
  jobInformationFields,
  JobStatus,
} from '../models/job-information';

@Injectable()
export class SchedulerService extends ServiceBase {
  private jobRepository: RepositoryBase<Job>;
  private jobInfoRepository: RepositoryBase<JobInformation>;

  constructor(repositoryFactory: RepositoryFactory) {
    super(repositoryFactory);
    this.jobRepository = repositoryFactory.getRepository('task-scheduler', JobSchema);
    this.jobInfoRepository = repositoryFactory.getRepository('job-information', JobInfomationSchema);
  }

  async getAll() {
    const jobs = await this.jobRepository.findAll();
    for (const job of jobs) {
      const searchCondition = {};
      searchCondition[jobInformationFields.jobId] = job._id;
      const jobInfo = await this.jobInfoRepository.findOne(searchCondition);
      if (jobInfo) {
        job.jobStatuses = jobInfo.jobStatuses;
      }
    }

    return jobs;
  }

  async updateJobStatus(jobId: string, jobStatus: JobStatus) {
    const newJobStatuses = this.addOrUpdateJobStatuses(jobStatus);
    const searchCondition = {};
    searchCondition[jobInformationFields.jobId] = jobId;
    let job = await this.jobInfoRepository.findOne(searchCondition);
    if (!job) {
      job = new JobInformationDto();
      job.jobId = jobId;
      job.jobStatus = newJobStatuses;

      this.jobInfoRepository.create(job);
    } else {
      const updatingFields = {};
      updatingFields[jobInformationFields.jobStatuses] = newJobStatuses;

      this.jobInfoRepository.update(job._id, updatingFields);
    }
  }

  private addOrUpdateJobStatuses(jobStatus: JobStatus): any {
    let jobStatuses = [];
    switch (jobStatus) {
      case JobStatus.Scheduled:
        jobStatuses = [JobStatus.Scheduled];
        break;
      case JobStatus.Failed:
        jobStatuses = [JobStatus.Scheduled, JobStatus.Failed];
        break;
      case JobStatus.Completed:
        jobStatuses = [JobStatus.Scheduled, JobStatus.Completed];
        break;
      default:
        break;
    }

    return jobStatuses;
  }
}
