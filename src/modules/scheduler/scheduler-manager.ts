import { Injectable } from '@nestjs/common';
import * as Agenda from 'agenda';
import { ConfigService } from '../../core/modules/configuration';
import { JobDto } from '../../documents/job';
import { JobRepository } from './job-repository';

@Injectable()
export class SchedulerManager {
  private agenda: Agenda;

  constructor(private configService: ConfigService, private jobRepository: JobRepository) {}

  initialize() {
    const dbConfig = this.configService.dbConfig;
    const connectString = 'mongodb://' + dbConfig.server + '/' + dbConfig.dbname;

    this.agenda = new Agenda({
      db: {
        address: connectString,
        collection: dbConfig.agendaCollectionName,
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
