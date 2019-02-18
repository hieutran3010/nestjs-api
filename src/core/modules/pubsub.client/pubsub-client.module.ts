import { Global, Module } from '@nestjs/common';
import { PubSubConfigService } from './config';
import { factoryProvider } from './core/factory';
import { PubSubParsingService } from './parser';

@Global()
@Module({
    providers: [
        factoryProvider,
        PubSubConfigService,
        PubSubParsingService,
    ],
    exports: [
        factoryProvider,
        PubSubConfigService,
        PubSubParsingService
    ]
})

export class PubSubClientModule {
}
