import { JobBase } from './job-base';

export abstract class WeeklyJobBase extends JobBase {
  constructor() {
    super();
    this.interval = '00 12 * * 1';
  }
}
