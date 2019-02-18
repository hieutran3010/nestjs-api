import { Injectable } from '@nestjs/common';
import * as bunyan from 'bunyan';
import { isNullOrEmptyOrUndefined } from '../../utils';
import { ConfigService } from '../configuration';
import { createLogger, createLogzioLogger } from './bunyan-logger-provider';

@Injectable()
export class LoggingService {
  private _logger: bunyan;
  constructor(private readonly configService: ConfigService) {}

  get logger() {
    if (isNullOrEmptyOrUndefined(this._logger)) {
      this._logger = this.createLogger();
    }
    return this._logger;
  }

  public createLogger(name: string = ''): any {
    if (name === '') {
      name = this.configService.logging.name;
    }

    let logger;
    if (this.configService.logging.loggerType === 1) {
      // logz.io
      logger = createLogzioLogger(this.configService.logging.logzIoApiToken, name);
    } else {
      logger = createLogger(
        name,
        this.configService.logging.path,
        this.configService.logging.rotatePeriod,
        this.configService.logging.rotateKeepingCount,
        this.configService.logging.level,
      );
    }

    return logger;
  }
}
