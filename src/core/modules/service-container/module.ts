import { Global, Module } from '@nestjs/common';
import ServiceLocator from './service-locator';

@Global()
@Module({
  providers: [ServiceLocator],
  exports: [ServiceLocator],
})
export class ServiceContainerModule {}
