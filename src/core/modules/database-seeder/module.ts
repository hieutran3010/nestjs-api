import { Global, Module } from '@nestjs/common';
import { DatabaseSeedingService } from './services/seed';

@Global()
@Module({
    providers: [DatabaseSeedingService],
    exports: [DatabaseSeedingService]
})
export class DatabaseSeedingModule { }
