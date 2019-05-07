import { JobBase } from './job-base';

export abstract class DailyJobBase extends JobBase {
  constructor() {
    super();
    this.interval = '00 12 * * *';
  }
}
