import { Injectable } from '@nestjs/common';
import { LingualServiceUnavailableException } from 'core/exception/lingual-exceptions';
import { RepositoryBase, RepositoryFactory } from 'core/modules/database/factory';
import { ServiceBase } from 'core/modules/database/service';
import { LoggingService } from 'core/modules/logging';
import { ISettingDocument, SettingSchema } from 'documents/setting';
import { get, keyBy } from 'lodash';
import { SETTING_KEY } from './constant';

@Injectable()
export default class SettingDataService extends ServiceBase {
    logger: any;
    settingRepository: RepositoryBase<ISettingDocument>;
    constructor(
        repositoryFactory: RepositoryFactory,
        loggingService: LoggingService,
        ) {
        super(repositoryFactory);
        this.logger = loggingService.createLogger('ReportDataService');
        this.resolveRepository();
    }

    private async resolveRepository() {
        this.settingRepository = await this.repositoryFactory.getRepository<ISettingDocument>('setting', SettingSchema);
    }

    async getAll(): Promise<ISettingDocument[]> {
        return await this.settingRepository.findAll();
    }

    async update(setting: ISettingDocument) {
        return await this.settingRepository.update(setting._id, setting);
    }

    async testConnection() {
        const ftpSettingQuery = {
            key: {
                $regex: 'FTP_'
            }
        };
        const ftpSettings = await this.settingRepository.find(ftpSettingQuery);
        const ftpSetting = keyBy(ftpSettings, 'key');

        const jsFtp = require('jsftp');
        const ftp = new jsFtp({
            host: get(ftpSetting[SETTING_KEY.FTP_HOST], 'value'),
            port: +get(ftpSetting[SETTING_KEY.FTP_PORT], 'value'),
            user: get(ftpSetting[SETTING_KEY.FTP_USER], 'value'),
            pass: get(ftpSetting[SETTING_KEY.FTP_PASS], 'value'),
        });

        const locationData = await this.settingRepository.findOne({key: SETTING_KEY.RAW_DATA_PATH});
        const location = locationData.value;

        let wait = true;
        let isError = false;
        ftp.ls(`./${location}`, (err, res) => {
            if (err) {
                isError = true;
                console.log('here');
            }
            wait = false;
        });

        while (wait) { require('deasync').sleep(100); }

        if (isError) {
            throw new LingualServiceUnavailableException('Không thể kết nối FTP');
        }

        return 'Success';
    }
}