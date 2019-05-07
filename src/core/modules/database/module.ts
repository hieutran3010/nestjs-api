import { DynamicModule, Global, Module } from '@nestjs/common';
import { MongoDbConfigService } from './config';
import { RepositoryFactory } from './factory';
import { DatabaseMigrationService, DatabaseSeedingService } from './service';

@Global()
@Module({
    providers: [RepositoryFactory, DatabaseMigrationService, DatabaseSeedingService, MongoDbConfigService],
    exports: [RepositoryFactory, DatabaseMigrationService, DatabaseSeedingService, MongoDbConfigService],
})

export class DatabaseModule {
    static forRoot(configProviders: any[]): DynamicModule {
        return {
          module: DatabaseModule,
          providers: [...configProviders],
        };
      }
}