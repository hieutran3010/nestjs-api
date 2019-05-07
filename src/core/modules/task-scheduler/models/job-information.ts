import { DTOBase, InterfaceBase, SchemaBase } from '../../database/contract/base.document';

const jobInformationFields = {
    jobId: 'jobId',
    jobStatuses: 'jobStatuses'
};

enum JobStatus {
  Unknown = 0,
  Scheduled,
  Completed,
  Failed
}

class JobInformationDto extends DTOBase {
  jobId: string;
  jobStatuses: Array<number>;
}

const JobInfomationSchema = new SchemaBase({
  jobId: {type: String, required: true},
  jobStatuses: {type: [Number]}
});

interface JobInformation extends InterfaceBase {
 jobId: string;
 jobStatuses: Array<number>;
}

export { JobInfomationSchema, JobInformationDto, JobStatus, JobInformation, jobInformationFields };