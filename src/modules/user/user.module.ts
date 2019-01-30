import { Module, OnModuleInit } from '@nestjs/common';
import { SeedPriority } from '../../core/modules/database-seeder/contract';
import { PermissionModuleBase } from '../../core/permission/permission.module.base';
import { DatabaseSeedingService } from './../../core/modules/database-seeder/services/seed';
import { ControllerService } from './../../permission-controller/services/controller.service';
import { controllers } from './controllers';
import { UserSeeder } from './migrations/user.seeder';
import { dataServices } from './services';

@Module({
  providers: [...dataServices],
  controllers: [...controllers],
  exports: [...dataServices],
})
export class UserModule extends PermissionModuleBase implements OnModuleInit {
  constructor(service: ControllerService, private seederService: DatabaseSeedingService, private userSeeder: UserSeeder) {
    super(service, controllers);
  }

  onModuleInit() {
    this.seederService.register(SeedPriority.MEDIUM, this.userSeeder);
  }
}
