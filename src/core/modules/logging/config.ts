export interface ILogInfo {
    name: string;
    path: string;
    rotatePeriod: number;
    rotateKeepingCount: number;
    level: string;
    loggerType: number;
    logzIoApiToken: string;
}

export const LoggingConfigToken = '__LoggingConfigToken__';

export interface ILoggingConfigProvider {
    getConfig(): ILogInfo;
}