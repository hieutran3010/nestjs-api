import { Injectable } from '@nestjs/common';
import { RepositoryBase, RepositoryFactory } from '../../core/modules/database/factory';
import { ServiceBase } from '../../core/modules/database/service';
import { LoggingService } from '../../core/modules/logging';
import { CrawlDataHistorySchema, ICrawlDataHistoryDocument } from '../../documents/crawl-data-history';
import { HistorySchema, IHistoryDocument } from '../../documents/history';

@Injectable()
export default class ReportDataService extends ServiceBase {
    logger: any;
    historyRepository: RepositoryBase<IHistoryDocument>;
    crawlDataHistoryRepository: RepositoryBase<ICrawlDataHistoryDocument>;

    constructor(
        repositoryFactory: RepositoryFactory,
        loggingService: LoggingService,
        ) {
        super(repositoryFactory);
        this.logger = loggingService.createLogger('ReportDataService');
        this.resolveRepository();
    }

    private async resolveRepository() {
        this.historyRepository = await this.repositoryFactory.getRepository<IHistoryDocument>('history', HistorySchema);
        this.crawlDataHistoryRepository =
        await this.repositoryFactory.getRepository<ICrawlDataHistoryDocument>('crawl-data-history', CrawlDataHistorySchema);
    }

    async getReport(): Promise<IHistoryDocument[]> {
        return await this.historyRepository.findAll();
    }

    async getSyncHistory(): Promise<ICrawlDataHistoryDocument> {
        return await this.crawlDataHistoryRepository.model.findOne({}).sort({ time: -1 }).limit(1).exec() ;
    }
}