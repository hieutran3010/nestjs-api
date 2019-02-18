import { JobBase } from './job-base';

export abstract class MinuteJobBase extends JobBase {
  constructor() {
    super();
    this.interval = '* * * * *';
  }
}
