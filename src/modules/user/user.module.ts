import { Module, OnModuleInit } from '@nestjs/common';
import { PermissionControllerCollectService } from '../../app.service';
import { SeedPriority } from '../../core/modules/database/contract/seeding';
import { PermissionModuleBase } from '../../core/permission';
import { DatabaseSeedingService } from './../../core/modules/database/service';
import { controllers } from './controllers';
import { UserSeeder } from './migrations/user.seeder';
import { dataServices } from './services';

@Module({
  providers: [...dataServices],
  controllers: [...controllers],
  exports: [...dataServices],
})
export class UserModule extends PermissionModuleBase implements OnModuleInit {
  constructor(service: PermissionControllerCollectService, private seederService: DatabaseSeedingService, private userSeeder: UserSeeder) {
    super(service, controllers);
  }

  onModuleInit() {
    this.seederService.register(SeedPriority.MEDIUM, this.userSeeder);
  }
}
