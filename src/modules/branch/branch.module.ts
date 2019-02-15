import { Module, OnModuleInit } from '@nestjs/common';
import { SeedPriority } from '../../core/modules/database/contract/seeding';
import { DatabaseSeedingService } from './../../core/modules/database/service';
import { controllers } from './controllers';
import { BranchSeeder } from './migrations/branch.seeder';
import { dataServices } from './services';

@Module({
    providers: [...dataServices],
    controllers: [...controllers],
    exports: [...dataServices],
})
export class BranchModule implements OnModuleInit {

    constructor(private seederService: DatabaseSeedingService, private branchSeeder: BranchSeeder) { }

    onModuleInit() {
        this.seederService.register(SeedPriority.HIGHEST, this.branchSeeder);
    }
}
