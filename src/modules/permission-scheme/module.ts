import { Module, OnModuleInit } from '@nestjs/common';
import { SeedPriority } from '../../core/modules/database-seeder/contract';
import { PermissionModuleBase } from '../../core/permission/permission.module.base';
import { DatabaseSeedingService } from './../../core/modules/database-seeder/services/seed';
import { ControllerService } from './../../permission-controller/services/controller.service';
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
                controllerService: ControllerService) {
        super(controllerService, controllers);
    }

    onModuleInit() {
        this.seederService.register(SeedPriority.HIGHEST, this.schemeSeeder);
    }
}