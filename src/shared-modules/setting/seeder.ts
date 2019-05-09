import { Injectable } from '@nestjs/common';
import { IDatabaseSeeder } from 'core/modules/database/contract/seeding';
import { RepositoryBase, RepositoryFactory } from 'core/modules/database/factory';
import { ISettingDocument, SettingSchema } from 'documents/setting';
import { SETTING_KEY } from './constant';

@Injectable()
export default class SettingSeeder implements IDatabaseSeeder {

    settingRepository: RepositoryBase<ISettingDocument>;
    constructor(private readonly repositoryFactory: RepositoryFactory) {
        this.resolveServices();
    }

    private async resolveServices() {
        this.settingRepository = await this.repositoryFactory.getRepository<ISettingDocument>('setting', SettingSchema);
    }

    async seed() {
        await this.settingRepository.create({key: SETTING_KEY.FTP_HOST, value: '139.180.209.240'});
        await this.settingRepository.create({key: SETTING_KEY.FTP_PORT, value: '21'});
        await this.settingRepository.create({key: SETTING_KEY.FTP_USER, value: 'vsftp'});
        await this.settingRepository.create({key: SETTING_KEY.FTP_PASS, value: 'NinhHoa@79'});
        await this.settingRepository.create({key: SETTING_KEY.RAW_DATA_PATH, value: 'test'});
    }

    getName(): string {
        return 'Setting';
    }
}