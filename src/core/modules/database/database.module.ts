import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '../../modules/configuration/config.module';
import { databaseProviders } from './database.providers';
import { RepositoryFactory } from './factory/repository.factory';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [RepositoryFactory, ...databaseProviders],
    exports: [RepositoryFactory, ...databaseProviders],
})

export class DatabaseModule { }