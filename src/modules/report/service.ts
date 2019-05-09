import { Injectable } from '@nestjs/common';
import { RepositoryBase, RepositoryFactory } from 'core/modules/database/factory';
import { ServiceBase } from 'core/modules/database/service';
import { LoggingService } from 'core/modules/logging';
import { HistorySchema, IHistoryDocument } from 'documents/history';
@Injectable()
export default class ReportDataService extends ServiceBase {
    logger: any;
    historyRepository: RepositoryBase<IHistoryDocument>;

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
    }

    async getReport(): Promise<IHistoryDocument[]> {
        return await this.historyRepository.findAll();
    }
}