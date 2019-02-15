import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '../configuration';
import { RepositoryFactory } from './factory';
import { mongoDbConnectionProviders } from './providers';
import { DatabaseMigrationService, DatabaseSeedingService } from './service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [RepositoryFactory, ...mongoDbConnectionProviders, DatabaseMigrationService, DatabaseSeedingService],
    exports: [RepositoryFactory, ...mongoDbConnectionProviders, DatabaseMigrationService, DatabaseSeedingService],
})

export class DatabaseModule { }