import { Injectable } from '@nestjs/common';
import { ConfigServiceBase, EnvConfig } from './core/modules/configuration';
import { DBConfigToken, IDBConfigProvider, IMongoDbConfig } from './core/modules/database/config';
import { ILoggingConfigProvider, ILogInfo, LoggingConfigToken } from './core/modules/logging/config';

export class AppConfigService extends ConfigServiceBase {

    constructor(configPath: string) {
        super(configPath);
    }

    protected validateInput(envConfig: EnvConfig): EnvConfig {
        // Override this function if you want to modify flow config validation
        return super.validateInput(envConfig);
    }

    protected getValidateDefinition(): any {
        // Override this function if you want to extend definition of config
        // Use Object.assign() to assign more config definition
        // Please read Joi (https://github.com/hapijs/joi) before extend config definition
        const baseConfig = super.getValidateDefinition();
        return baseConfig;
    }
}

@Injectable()
export class LoggingConfigProvider implements ILoggingConfigProvider {

    constructor(private readonly configService: AppConfigService) {}

    getConfig(): ILogInfo {
        const config: ILogInfo = {
            name: this.configService.logging.name,
            path: this.configService.logging.path,
            rotatePeriod: this.configService.logging.rotatePeriod,
            rotateKeepingCount: this.configService.logging.rotateKeepingCount,
            level: this.configService.logging.level,
            loggerType: this.configService.logging.loggerType,
            logzIoApiToken: this.configService.logging.logzIoApiToken,
        };

        return config;
    }
}

@Injectable()
export class DBConfigProvider implements IDBConfigProvider {
    constructor(private readonly configService: AppConfigService) {}
    getConfig(): IMongoDbConfig {
        const dbConfig: IMongoDbConfig = {
            dbServer: this.configService.dbConfig.server,
            dbName: this.configService.dbConfig.dbName
        };
        return dbConfig;
    }
}

export const loggingConfigProvider = {
    provide: LoggingConfigToken,
    useClass: LoggingConfigProvider,
};

export const dbConfigProvider = {
    provide: DBConfigToken,
    useClass: DBConfigProvider,
};