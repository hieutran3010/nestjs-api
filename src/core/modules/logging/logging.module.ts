import { DynamicModule, Global, Module } from '@nestjs/common';
import { ILoggingConfigProvider, LoggingConfigToken } from './config';
import { LoggingService } from './logging.service';

@Global()
@Module({
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {
  static forRoot(configProviders: any[]): DynamicModule {
    return {
      module: LoggingModule,
      providers: [...configProviders],
    };
  }
}