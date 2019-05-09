import * as Agenda from 'agenda';

export abstract class JobBase {
  protected interval: string;
  abstract name: string;

  public define(agenda: Agenda) {
    agenda.define(this.name, async job => {
      await this.execute();
    });
  }

  public schedule(agenda: Agenda) {
    agenda.every(this.interval, this.name);
  }

  protected abstract async execute();
}
