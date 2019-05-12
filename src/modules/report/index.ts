import { Module } from '@nestjs/common';
import { JobRepository } from '../../core/modules/task-scheduler';
import { ReportController } from './controller';
import { RawReportDataCrawler } from './RawReportDataCrawler';
import ReportDataService from './service';

@Module({
    imports: [],
    providers: [ReportDataService, RawReportDataCrawler],
    controllers: [ReportController],
})
export default class ReportModule {
    /**
     *
     */
    constructor(
        jobRepository: JobRepository,
        rawReportDataCrawler: RawReportDataCrawler) {
            jobRepository.add(rawReportDataCrawler);
    }
}