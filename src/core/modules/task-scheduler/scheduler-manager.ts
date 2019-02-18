import { Injectable } from '@nestjs/common';
import * as Agenda from 'agenda';
import { loadYamlConfigure } from '../../utils';
import { TaskSchedulerConfig } from './config/model';
import { JobRepository } from './job-repository';
import { JobDto } from './models/job';

@Injectable()
export class TaskSchedulerManager {
  private agenda: Agenda;
  private config: TaskSchedulerConfig;

  constructor(private jobRepository: JobRepository) {}

  private doInitialize() {
    const connectString = 'mongodb://' + this.config.dbServer + '/' + this.config.dbName;

    this.agenda = new Agenda({
      db: {
        address: connectString,
        collection: this.config.collectionName,
      },
    });

    // Define jobs
    const jobs = this.jobRepository.getAllJobs();
    for (const job of jobs) {
      job.define(this.agenda);
    }

    // Start jobs
    this.agenda.on('ready', () => {
      // Create jobs
      for (const job of jobs) {
        job.schedule(this.agenda);
      }

      // Start agenda
      this.agenda.start();
    });
  }

  initialize(config: TaskSchedulerConfig) {
    this.config = config;
    this.doInitialize();
  }

  initializeByConfigFile(configYmlFilePath: string) {
    this.config = loadYamlConfigure(TaskSchedulerConfig, configYmlFilePath);
    this.doInitialize();
  }

  disable(processingJobs: JobDto[]) {
    for (const processingJob of processingJobs) {
      this.agenda.jobs({ name: processingJob.name }, (err, jobs) => {
        for (const job of jobs) {
          job.disable();
          job.save();
        }
      });
    }
  }

  enable(processingJobs: JobDto[]) {
    for (const processingJob of processingJobs) {
      this.agenda.jobs({ name: processingJob.name }, (err, jobs) => {
        for (const job of jobs) {
          job.enable();
          job.save();
        }
      });
    }
  }
}
