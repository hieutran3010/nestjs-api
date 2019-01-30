import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '../configuration/config.module';
import { LoggingService } from './logging.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
