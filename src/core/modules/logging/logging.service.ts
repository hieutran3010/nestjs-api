import { Injectable } from '@nestjs/common';
import * as bunyan from 'bunyan';
import { createLogger, createLogzioLogger } from '../../../fless-backend-core/logging';
import { isNullOrEmptyOrUndefined } from '../../utils';
import { ConfigService } from '../configuration/config.service';

@Injectable()
export class LoggingService {
  private _logger: bunyan;
  constructor(private readonly configService: ConfigService) {}

  get logger() {
    if (isNullOrEmptyOrUndefined(this._logger)) {
      this.createLogger();
    }
    return this._logger;
  }

  private createLogger() {
    if (this.configService.logging.loggerType === 1) {
      // logz.io
      this._logger = createLogzioLogger(this.configService.logging.logzIoApiToken, this.configService.logging.name);
    } else {
      this._logger = createLogger(
        this.configService.logging.name,
        this.configService.logging.path,
        this.configService.logging.rotatePeriod,
        this.configService.logging.rotateKeepingCount,
        this.configService.logging.level,
      );
    }
  }
}
