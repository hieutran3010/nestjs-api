import { Injectable } from '@nestjs/common';
import { descend, isNil, prop, sort } from 'ramda';
import { LoggingService } from '../../logging';
import { IDatabaseSeeder, seedConst, SeederCollection, SeedPriority } from '../contract/seeding';

@Injectable()
export class DatabaseSeedingService {
    private logger: any;
    private seeds: SeederCollection;

    constructor(loggingService: LoggingService) {
        this.seeds = [];
        this.logger = loggingService.createLogger('DatabaseSeedingService');
    }

    register(priority: SeedPriority, seed: IDatabaseSeeder) {
        this.seeds.push({ priority, value: seed });
    }

    async seed() {
        this.logger.info('migration' + this.seeds.length);
        const sortConditions = descend(prop(seedConst.Priority));
        const sortFunction = sort(sortConditions);
        const listSeed = sortFunction(this.seeds);
        listSeed.forEach(seeder => {
            let wait = true;
            this.logger.info(`Execute seed for document ${seeder[seedConst.Value].getName()}...`);
            seeder[seedConst.Value].seed().then(() => {
                wait = false;
            });

            while (wait) { require('deasync').sleep(100); }
            this.logger.info(`Execute seed for document ${seeder[seedConst.Value].getName()} DONE.`);
        });
    }

    async seedOne(document: string) {
        const seeder = this.seeds.find(s => s.value.getName() === document);
        if (!isNil(seeder)) {
            this.logger.info(`Execute seed for document ${seeder.value.getName()}...`);
            await seeder.value.seed();
            this.logger.info(`Execute seed for document ${seeder.value.getName()} DONE.`);
        }
    }
}
