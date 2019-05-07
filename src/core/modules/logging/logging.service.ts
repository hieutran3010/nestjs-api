import { Inject, Injectable } from '@nestjs/common';
import * as bunyan from 'bunyan';
import { isNullOrEmptyOrUndefined } from '../../utils';
import { createLogger, createLogzioLogger } from './bunyan-logger-provider';
import { ILoggingConfigProvider, ILogInfo, LoggingConfigToken } from './config';

@Injectable()
export class LoggingService {
  private _logger: bunyan;
  private _config: ILogInfo;

  constructor(@Inject(LoggingConfigToken) loggingConfig: ILoggingConfigProvider) {
     this._config = loggingConfig.getConfig();
  }

  get logger() {
    if (isNullOrEmptyOrUndefined(this._logger)) {
      this._logger = this.createLogger();
    }
    return this._logger;
  }

  public createLogger(name: string = ''): any {
    if (name === '') {
      name = this._config.name;
    }

    let logger;
    if (this._config.loggerType === 1) {
      // logz.io
      logger = createLogzioLogger(this._config.logzIoApiToken, name);
    } else {
      logger = createLogger(
        name,
        this._config.path,
        this._config.rotatePeriod,
        this._config.rotateKeepingCount,
        this._config.level,
      );
    }

    return logger;
  }

  // public createLogger(name: string = ''): any {

  //   const logger = createLogger(
  //     'logger',
  //     './logs/app.log',
  //     1,
  //     1,
  //     'debug',
  //   );
  //   return logger;
  // }
}
