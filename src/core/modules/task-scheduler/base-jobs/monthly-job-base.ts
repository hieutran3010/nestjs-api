import { JobBase } from './job-base';

export abstract class MonthlyJobBase extends JobBase {
  constructor() {
    super();
    this.interval = '00 12 1 * *';
  }
}
