import { Controller, Get } from '@nestjs/common';
import { RawReportDataCrawler } from './RawReportDataCrawler';
import ReportDataService from './service';

@Controller('report')
export class ReportController {

    constructor(private readonly reportDataService: ReportDataService,
                private readonly rawReportDataCrawler: RawReportDataCrawler) {}

    @Get()
    async getReport() {
        return await this.reportDataService.getReport();
    }

    @Get('manual-crawl-data')
    async manualCrawlData() {
        return await this.rawReportDataCrawler.crawlRawData();
    }
}