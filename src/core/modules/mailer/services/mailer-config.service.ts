import { Injectable } from '@nestjs/common';
import { LoadYamlConfigure } from '../../../ultilities/yaml-configure-loader';
import { MailerConfig } from '../config';

@Injectable()
export class MailerConfigurationService {
    private _config: MailerConfig;

    get config(): MailerConfig {
        return this._config;
    }

    set config(value: MailerConfig) {
        this._config = value;
    }

    public setConfig(configPath: string) {
        this.config = LoadYamlConfigure(MailerConfig, configPath);
    }
}