import { Injectable } from '@nestjs/common';
import { descend, isNil, prop, sort } from 'ramda';
import { LoggingService } from '../../logging';
import { IDatabaseMigration, MigrationCollection, migrationConst, MigrationPriority } from '../contract/migration';

@Injectable()
export class DatabaseMigrationService {
    private migrations: MigrationCollection;

    constructor(private loggingService: LoggingService) {
        this.migrations = [];
    }

    register(priority: MigrationPriority, seed: IDatabaseMigration) {
        this.migrations.push({ priority, value: seed });
    }

    async migrate() {
        this.loggingService.logger.info('migration' + this.migrations.length);
        const sortConditions = descend(prop(migrationConst.Priority));
        const sortFunction = sort(sortConditions);
        const listMigration = sortFunction(this.migrations);
        listMigration.forEach(seeder => {
            let wait = true;
            this.loggingService.logger.info(`Execute migrate for migration ${seeder[migrationConst.Value].getName()}...`);
            seeder[migrationConst.Value].seed().then(() => {
                wait = false;
            });

            while (wait) { require('deasync').sleep(100); }
            this.loggingService.logger.info(`Execute migrate for migration ${seeder[migrationConst.Value].getName()} DONE.`);
        });
    }

    async migrateOne(migrationName: string) {
        const migrator = this.migrations.find(s => s.value.getName() === migrationName);
        if (!isNil(migrator)) {
            this.loggingService.logger.info(`Execute migrate for migration ${migrator.value.getName()}...`);
            await migrator.value.migrate();
            this.loggingService.logger.info(`Execute migrate for migration ${migrator.value.getName()} DONE.`);
        }
    }
}
