import { Global, Module } from '@nestjs/common';
import { DatabaseMigrationService } from './services/migration-service';

@Global()
@Module({
    providers: [DatabaseMigrationService],
    exports: [DatabaseMigrationService]
})
export class DatabaseMigrationModule { }
