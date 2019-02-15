import { Module, OnModuleInit } from '@nestjs/common';
import { PermissionControllerCollectService } from '../../app.service';
import { SeedPriority } from '../../core/modules/database-seeder/contract';
import { PermissionModuleBase } from '../../core/permission';
import { DatabaseSeedingService } from './../../core/modules/database-seeder/services/seed';
import { controllers } from './controllers';
import { PermissionSchemeSeeder } from './migrations/permission-scheme.seeder';
import { PermissionSchemaService } from './services/permission-schema.service';

@Module({
    controllers: [...controllers],
    providers: [PermissionSchemaService, PermissionSchemeSeeder]
})

export class PermissionSchemeModule extends PermissionModuleBase implements OnModuleInit {

    constructor(private seederService: DatabaseSeedingService,
                private schemeSeeder: PermissionSchemeSeeder,
                controllerService: PermissionControllerCollectService) {
        super(controllerService, controllers);
    }

    onModuleInit() {
        this.seederService.register(SeedPriority.HIGHEST, this.schemeSeeder);
    }
}