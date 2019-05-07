import {
  DTOBase,
  InterfaceBase,
  SchemaBase,
} from '../../database/contract/base.document';

const jobFields = {
  NAME: 'name',
  PRIORITY: 'priority',
  TYPE: 'type',
  REPEAT_INTERVAL: 'repeatInterval',
  LAST_FINISHED_AT: 'lastFinishedAt',
  LAST_MODIFIED_BY: 'lastModifiedBy',
  LAST_RUN_AT: 'lastRunAt',
  LOCKED_AT: 'lockedAt',
  NEXT_RUN_AT: 'nextRunAt',
};

class JobDto extends DTOBase {
  lastFinishedAt: Date;
  lastModifiedBy: Date;
  lastRunAt: Date;
  lockedAt: Date;
  name: string;
  nextRunAt: Date;
  priority: number;
  repeatInterval: string;
  type: string;
  jobStatuses: Array<number>;
}

interface Job extends InterfaceBase {
  lastFinishedAt: Date;
  lastModifiedBy: Date;
  lastRunAt: Date;
  lockedAt: Date;
  name: string;
  nextRunAt: Date;
  priority: number;
  repeatInterval: string;
  type: string;
}

const JobSchema = new SchemaBase({
  lastFinishedAt: { type: Date },
  lastModifiedBy: { type: Date },
  lastRunAt: { type: Date },
  lockedAt: { type: Date },
  name: { type: String },
  nextRunAt: { type: Date },
  priority: { type: Number },
  repeatInterval: { type: String },
  type: { type: String },
});

export { JobDto, Job, JobSchema, jobFields };
